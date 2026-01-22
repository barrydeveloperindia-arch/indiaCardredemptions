from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from src.database.connection import get_db, engine
from fastapi.middleware.gzip import GZipMiddleware
from src.database import models
from src.dispatch.agent import DispatchAgent
from src.shop_floor.service_instance import twin_service
from src.financials.invoicing.generator import InvoiceGenerator

# Auth Imports (FIXED)
from src.auth.router import router as auth_router
from src.auth.router import get_current_user
from src.inventory.router import router as inventory_router
from src.inventory.service import InventoryService
from src.part_analysis import router as part_analysis_router
from src.scheduling import router as scheduling_router
from src.shop_floor import router as shop_floor_router
from src.shop_floor.hp_router import router as hp_router
from src.shop_floor.dispatch_router import router as dispatch_router
from src.ai.router import router as ai_router

import os
import asyncio
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Englabs MES API", version="1.1.0")

# Mount Storage for Static Access (STL/Images)
STORAGE_DIR = "storage"
if not os.path.exists(STORAGE_DIR):
    try:
        os.makedirs(STORAGE_DIR, exist_ok=True)
        os.makedirs(os.path.join(STORAGE_DIR, "parts"), exist_ok=True)
    except Exception as e:
        print(f"Failed to create storage: {e}")

app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

# CORS (Allow Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Services (Singletons for this demo)
dispatch_agent = DispatchAgent()
# Moved twin_service to src.shop_floor.service_instance
invoice_generator = InvoiceGenerator()
inventory_service = InventoryService()

# Include Routers with standardized prefix
app.include_router(auth_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(part_analysis_router.router)
app.include_router(scheduling_router.router, prefix="/api/scheduling")
app.include_router(shop_floor_router.router, prefix="/api/shop-floor", tags=["Digital Traveler"])
app.include_router(hp_router, prefix="/api")
app.include_router(dispatch_router, prefix="/api/dispatch", tags=["Dispatch Board"])
app.include_router(ai_router, prefix="/api")

# Ensure Tables Exist
models.Base.metadata.create_all(bind=engine)

# Startup Events
@app.on_event("startup")
async def startup_event():
    # Pre-register mock machines to the Digital Twin
    twin_service.register_machine("CNC-001", "opc.tcp://mock-cnc-1:4840")
    twin_service.register_machine("CNC-HighPerf-05", "opc.tcp://mock-cnc-5:4840")
    twin_service.register_machine("3D-Printer-02", "opc.tcp://mock-printer:4840")
    twin_service.register_machine("HP-MJF-4200-01", "https://api.hp.com/3d/v1")
    
    # Start Background Telemetry Loop
    asyncio.create_task(telemetry_loop())

async def telemetry_loop():
    """Periodically refreshes the Digital Twin state."""
    while True:
        try:
            await twin_service.refresh_all_states()
            await asyncio.sleep(5) # Poll every 5 seconds
        except Exception as e:
            print(f"Telemetry Refresh Error: {e}")
            await asyncio.sleep(10)

# --- Pydantic Schemas ---
class OrderCreate(BaseModel):
    customer_id: str
    cad_file_path: str
    technical_requirements: Dict[str, Any]
    priority: int = 1

class MachineStatus(BaseModel):
    machine_id: str
    status: str
    temperature: float = 0.0

# --- Endpoints (Internal API) ---

@app.get("/api/health")
def health_check():
    return {"status": "MES System Online", "auth_mode": "JWT"}

# Module A: Dispatching (PROTECTED)
@app.post("/api/orders", status_code=201)
def create_order(
    order: OrderCreate, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    print(f"User {current_user.username} (Role: {current_user.role}) dispatching order.")
    # 1. Persist Order to DB
    db_order = models.Order(
        customer_id=order.customer_id,
        cad_file_path=order.cad_file_path,
        technical_requirements=order.technical_requirements,
        priority_level=order.priority
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    # 2. Trigger Dispatch Logic (Async)
    order_dict = {
        "order_id": db_order.order_id,
        "cad_file_path": db_order.cad_file_path,
        "technical_requirements": db_order.technical_requirements
    }
    
    # Updated: Pass DB for capability check
    job_id, assigned_machine_id = dispatch_agent.dispatch_order(order_dict, db)
    
    # Update DB with Job
    if job_id and "FAILED" not in job_id:
        new_job = models.DispatchQueue(
            job_id=job_id,
            order_id=db_order.order_id,
            machine_id=assigned_machine_id,
            status="QUEUED"
        )
        db.add(new_job)
        db.commit()
        return {"order_id": db_order.order_id, "status": "DISPATCHED", "job_id": job_id, "machine": assigned_machine_id}
    else:
        return {"order_id": db_order.order_id, "status": "FAILED_NO_CAPABILITY"}

@app.get("/api/shop-floor-summary")
def get_shop_floor_status():
    return twin_service.get_shop_floor_status()

@app.get("/api/machines/{machine_id}")
def get_machine_details(machine_id: str):
    return twin_service.get_machine_status(machine_id)

class MachineCommand(BaseModel):
    command: str # START, STOP, ESTOP

@app.post("/api/machines/{machine_id}/control")
async def control_machine(
    machine_id: str, 
    cmd: MachineCommand, 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role not in ["admin", "operator"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    print(f"User {current_user.username} sent {cmd.command} to {machine_id}")
    success = await twin_service.execute_command(machine_id, cmd.command)
    
    if success:
        return {"status": "Command Sent", "machine_id": machine_id}
    else:
        raise HTTPException(status_code=500, detail="Hardware Connection Failed")


# Module C: Financials
@app.post("/jobs/{job_id}/complete")
def complete_job_and_invoice(job_id: str, db: Session = Depends(get_db)):
    # 1. Fetch Job with relationships
    job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 2. Mock Runtime Mechanics (if not set by machine)
    if job.status != "COMPLETED":
        job.status = "COMPLETED"
        job.actual_end_time = datetime.utcnow()
        if not job.actual_start_time:
            # Assume started 1 hour ago if not tracked
            job.actual_start_time = datetime.utcnow() - timedelta(hours=1)
    db.commit()

    # 3. Fetch Part Data for Volume/Material
    # Join Order -> Part (via file path matching or we need direct link)
    # Ideally Order should link to Part ID. For now, let's use part name heuristic from file path
    # OR better: add part_id to Order.
    # FALLBACK: Use Estimated Runtime as proxy for "Size" if Part DB link is weak.
    
    # Let's try to find the part by filename from order
    order = db.query(models.Order).filter(models.Order.order_id == job.order_id).first()
    part_vol = 100.0 # Default fallback
    if order:
        filename = os.path.basename(order.cad_file_path)
        part = db.query(models.Part).filter(models.Part.name == filename).first()
        if part and part.measurements and "volume_cm3" in part.measurements:
            part_vol = part.measurements["volume_cm3"]

    # Calculate Runtime
    runtime_min = 60
    if job.actual_start_time and job.actual_end_time:
        delta = job.actual_end_time - job.actual_start_time
        runtime_min = delta.total_seconds() / 60
    
    # 4. Generate Invoice
    context = {
        "job_id": job.job_id,
        "order_id": job.order_id,
        "customer_id": getattr(order, "customer_id", "CUST-DEFAULT"),
        "machine_id": job.machine_id,
        "material": "PLA", # TODO: Get from Order Requirements
        "runtime_minutes": runtime_min,
        "material_usage": part_vol * 1.24 # Volume * Density (PLA)
    }
    
    invoice_data = invoice_generator.generate_invoice_for_job(context)

    # 5. Decrement Inventory
    try:
        inventory_service.update_stock(db, item_id="PLA", quantity_change=-(context["material_usage"]/1000.0), job_id=job_id) # usage in kg
    except ValueError as e:
        print(f"Inventory Warning: {e}")
    
    # 6. Save Invoice to DB
    # We need to extract the breakdown from invoice_data or recalculate for DB columns
    # invoice_data returns 'total', but check generator implementation.
    # Generator uses CostingEngine.
    
    db_inv = models.Invoice(
        invoice_id=invoice_data["invoice_id"],
        job_id=job_id,
        order_id=job.order_id,
        machine_runtime_cost=0.0, # detailed breakdown not in invoice_data yet
        material_cost=0.0,
        total_amount=invoice_data["total"],
        erp_reference_id=invoice_data["erp_reference"]
    )
    db.add(db_inv)
    db.commit()
    
    return {"status": "Job Completed", "invoice": invoice_data}
