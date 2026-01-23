from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Order, DispatchQueue, Machine
from datetime import datetime, timedelta
import random

def seed_scheduler():
    db = SessionLocal()
    print("Seeding Scheduler Data...")
    
    # 1. Ensure Machines Exist (in case seed_machines didn't run)
    # Note: We rely on seed_machines.py for this, but let's check one.
    cnc = db.query(Machine).filter(Machine.machine_id == "CNC-001").first()
    if not cnc:
        print("Warning: Machines not found. Please run seed_machines.py first.")
        # Minimal Fallback
        db.add(Machine(machine_id="CNC-001", name="Fallback CNC", capabilities={}))
        db.commit()

    # 2. Create Dummy Orders
    customers = ["Tesla", "SpaceX", "BostonDynamics"]
    parts = ["motor_mount.stl", "suspension_arm.step", "housing_v2.stl", "sensor_bracket.stl", "gear_set.stl"]
    
    orders = []
    for i in range(5):
        o = Order(
            customer_id=random.choice(customers),
            cad_file_path=f"storage/parts/{parts[i]}",
            technical_requirements={"material": "ALUMINUM" if i % 2 == 0 else "PLA"},
            priority_level=random.randint(1, 5)
        )
        db.add(o)
        orders.append(o)
    
    db.commit()
    
    # 3. Create Dispatch Jobs for Orders
    # Current time rounded to hour
    base_time = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    
    statuses = ["RUNNING", "QUEUED", "QUEUED", "PLANNED", "COMPLETED"]
    machine_ids = ["CNC-001", "CNC-HighPerf-05", "3D-Printer-02", "HP-MJF-4200-01", "CNC-001"]
    
    for i, order in enumerate(orders):
        # Stagger start times
        start_time = base_time + timedelta(hours=i*2)
        
        job = DispatchQueue(
            order_id=order.order_id,
            machine_id=machine_ids[i % len(machine_ids)],
            status=statuses[i],
            planned_start_time=start_time,
            estimated_runtime_seconds=3600 + (i * 1800), # 1h, 1.5h, 2h...
            current_step="PROCESSING"
        )
        
        if job.status == "RUNNING":
            job.actual_start_time = datetime.utcnow() - timedelta(minutes=30)
        elif job.status == "COMPLETED":
            job.actual_start_time = start_time
            job.actual_end_time = start_time + timedelta(seconds=job.estimated_runtime_seconds)
            
        db.add(job)
        
    db.commit()
    print(f"Seeded {len(orders)} Orders and Jobs.")
    db.close()

if __name__ == "__main__":
    seed_scheduler()
