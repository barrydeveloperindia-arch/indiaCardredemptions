from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from src.database.connection import get_db, engine
from src.database import models
from src.dispatch.agent import DispatchAgent
from src.shop_floor.digital_twin.service import DigitalTwinService
from src.financials.invoicing.generator import InvoiceGenerator

# Auth Imports (FIXED)
from src.auth.router import router as auth_router
from src.auth.router import get_current_user
from src.inventory.router import router as inventory_router
from src.inventory.service import InventoryService
from src.part_analysis import router as part_analysis_router
from src.scheduling import router as scheduling_router
from src.shop_floor import router as shop_floor_router

import os
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Englabs MES API", version="1.1.0")

# Mount Storage for Static Access (STL/Images)
STORAGE_DIR = "/app/storage"
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
    allow_origins=["*"], # In prod strict origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services (Singletons for this demo)
dispatch_agent = DispatchAgent()
twin_service = DigitalTwinService()
invoice_generator = InvoiceGenerator()
inventory_service = InventoryService()

# Include Routers
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(part_analysis_router.router)
app.include_router(scheduling_router.router)
app.include_router(shop_floor_router.router, prefix="/api/shop-floor", tags=["Digital Traveler"])

# Startup Events
@app.on_event("startup")
def startup_event():
    # Pre-register mock machines to the Digital Twin
    twin_service.register_machine("CNC-001", "opc.tcp://mock-cnc-1:4840")
    twin_service.register_machine("CNC-HighPerf-05", "opc.tcp://mock-cnc-5:4840")
    twin_service.register_machine("3D-Printer-02", "opc.tcp://mock-printer:4840")

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

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "MES System Online", "auth_mode": "JWT"}

# Module A: Dispatching (PROTECTED)
@app.post("/orders", status_code=201)
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

# Module B: Shop Floor
@app.get("/shop-floor", response_model=List[Dict])
def get_shop_floor_status():
    return twin_service.get_shop_floor_status()

@app.get("/machines/{machine_id}")
def get_machine_details(machine_id: str):
    return twin_service.get_machine_status(machine_id)

class MachineCommand(BaseModel):
    command: str # START, STOP, ESTOP

@app.post("/machines/{machine_id}/control")
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
    # 1. Fetch Job
    job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # 2. Mock Runtime Mechanics
    job.status = "COMPLETED"
    job.actual_end_time = datetime.utcnow()
    db.commit()
    
    # 3. Generate Invoice
    context = {
        "job_id": job.job_id,
        "order_id": job.order_id,
        "customer_id": "CUST-DEFAULT",
        "machine_id": job.machine_id,
        "material": "PLA",
        "runtime_minutes": 120,
        "material_usage": 0.3
    }
    
    invoice_data = invoice_generator.generate_invoice_for_job(context)

    # 4. Decrement Inventory (NEW)
    try:
        # Assuming "PLA" exists as an item_id. In a real app, we'd lookup by material type.
        inventory_service.update_stock(db, item_id="PLA", quantity_change=-0.3, job_id=job_id)
        print(f"Inventory: Decremented 0.3 PLA for Job {job_id}")
    except ValueError as e:
        print(f"Inventory Warning: Could not decrement stock: {e}")
    
    # 5. Save Invoice to DB
    db_inv = models.Invoice(
        invoice_id=invoice_data["invoice_id"],
        job_id=job_id,
        order_id=job.order_id,
        machine_runtime_cost=100.0,
        material_cost=50.0,
        total_amount=invoice_data["total"],
        erp_reference_id=invoice_data["erp_reference"]
    )
    db.add(db_inv)
    db.commit()
    
    return {"status": "Job Completed", "invoice": invoice_data, "inventory_update": "Attempted"}
