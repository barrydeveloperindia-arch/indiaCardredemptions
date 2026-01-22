
import sys
import os
import uuid
from datetime import datetime, timedelta

# Add parent dir to path to import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.connection import SessionLocal
from src.database import models

def seed_data():
    db = SessionLocal()
    print("--- Seeding Dispatch Workflow Data ---")

    # 1. Ensure a Machine exists
    machine = db.query(models.Machine).first()
    if not machine:
        machine = models.Machine(
            machine_id="HP-4200-01",
            name="HP Jet Fusion 4200",
            capabilities={"technology": "MJF", "materials": ["PA12"]},
            current_status="IDLE"
        )
        db.add(machine)
        db.commit()
    
    print(f"Using Machine: {machine.machine_id}")

    # 2. Create Sample Orders & Jobs
    
    samples = [
        # Planning Column
        {"file": "bracket_v2.stl", "status": "PLANNED", "step": "PLANNING", "machine": None},
        {"file": "sensor_mount.step", "status": "PLANNED", "step": "PLANNING", "machine": None},
        {"file": "prototype_gear.obj", "status": "PLANNED", "step": "PLANNING", "machine": None},
        
        # Production Column
        {"file": "production_hinge.stl", "status": "QUEUED", "step": "PRINTING", "machine": machine.machine_id},
        {"file": "demo_housing.stl", "status": "RUNNING", "step": "PRINTING", "machine": machine.machine_id},
        
        # QC Column
        {"file": "finished_lever.stl", "status": "COMPLETED", "step": "QC_PENDING", "machine": machine.machine_id},
    ]

    for s in samples:
        # Create Order
        order_id = f"ORD-{uuid.uuid4().hex[:6].upper()}"
        order = models.Order(
            order_id=order_id,
            customer_id=f"CUST-{uuid.uuid4().hex[:4].upper()}",
            cad_file_path=f"storage/parts/{s['file']}",
            technical_requirements={"material": "PA12", "color": "Grey"},
            status=s["status"],
            priority_level=1
        )
        db.add(order)
        db.commit()

        # Create Job
        job_id = f"JOB-{uuid.uuid4().hex[:6].upper()}"
        job = models.DispatchQueue(
            job_id=job_id,
            order_id=order_id,
            machine_id=s["machine"],
            status=s["status"],
            current_step=s["step"],
            estimated_runtime_seconds=3600,
            planned_start_time=datetime.utcnow() + timedelta(hours=1)
        )
        
        # If running/completed, set actuals
        if s["status"] in ["RUNNING", "COMPLETED"]:
            job.actual_start_time = datetime.utcnow() - timedelta(minutes=45)
        if s["status"] == "COMPLETED":
            job.actual_end_time = datetime.utcnow()
            
        db.add(job)
        db.commit()
        print(f"Created {s['status']} Job: {job_id} ({s['file']})")

    print("--- Seeding Complete ---")
    db.close()

if __name__ == "__main__":
    seed_data()
