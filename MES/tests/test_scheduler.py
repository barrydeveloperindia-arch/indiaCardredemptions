
import sys
import os
import requests
import datetime
import random

# Add parent directory to path to import app modules if needed, 
# but we will use API calls to be cleaner and verify the actual running server.

API_URL = "http://localhost:8008/api"

def seed_scheduler_data():
    print("--- Seeding Scheduler Data ---")

    # 1. Create/Ensure Machines
    # We can't easily create machines via API (it's internal), so we assume they exist or use a python script with direct DB access.
    # Let's use direct DB access using your codebase's models to ensure robust testing.
    
    from src.database.connection import SessionLocal, engine
    from src.database import models
    
    db = SessionLocal()
    
    try:
        # Clear existing for clean test
        db.query(models.DispatchQueue).delete()
        db.query(models.Order).delete()
        db.query(models.Machine).delete()
        db.commit()
        
        # Create Machines
        machines = [
            models.Machine(machine_id="M-01", name="CNC Mill A", current_status="IDLE", capabilities={"materials": ["Aluminium"]}),
            models.Machine(machine_id="M-03", name="Printer X1", current_status="BUSY", capabilities={"materials": ["PLA"]}),
            models.Machine(machine_id="M-02", name="CNC Lathe B", current_status="IDLE", capabilities={"materials": ["Steel"]}),
        ]
        db.add_all(machines)
        db.commit()
        print("[SEED] Created 3 Machines (Sorted check: M-01, M-02, M-03)")

        # Create Orders
        orders = []
        for i in range(5):
            o = models.Order(
                customer_id=f"CUST-{i}",
                cad_file_path=f"storage/parts/Bracket_Sys_{i+1}.step",
                technical_requirements={"material": "Steel"},
                priority_level=1
            )
            orders.append(o)
        db.add_all(orders)
        db.commit()
        
        # Create Jobs
        # Job 1: Running on M-01
        j1 = models.DispatchQueue(
            order_id=orders[0].order_id,
            machine_id="M-01",
            status="RUNNING",
            planned_start_time=datetime.datetime.utcnow(),
            estimated_runtime_seconds=3600
        )
        # Job 2: Queued on M-01 (No start time)
        j2 = models.DispatchQueue(
            order_id=orders[1].order_id,
            machine_id="M-01",
            status="QUEUED",
            estimated_runtime_seconds=1800
        )
        # Job 3: Planned on M-02
        j3 = models.DispatchQueue(
            order_id=orders[2].order_id,
            machine_id="M-02",
            status="PLANNED",
            planned_start_time=datetime.datetime.utcnow() + datetime.timedelta(hours=2),
            estimated_runtime_seconds=7200
        )
        
        db.add_all([j1, j2, j3])
        db.commit()
        print("[SEED] Created Jobs linked to Orders.")
        
    except Exception as e:
        print(f"[ERROR] Seeding failed: {e}")
        db.rollback()
    finally:
        db.close()

def verify_endpoint():
    print("\n--- Verifying Endpoint /gantt ---")
    try:
        res = requests.get(f"http://localhost:8008/api/scheduling/gantt")
        if res.status_code != 200:
            print(f"[FAIL] API Error: {res.text}")
            return
            
        data = res.json()
        
        # 1. Verify Machine Sorting
        machines = data['machines']
        ids = [m['id'] for m in machines]
        print(f"[CHECK] Machine IDs: {ids}")
        if ids == sorted(ids):
            print("[PASS] Machines are sorted.")
        else:
            print("[FAIL] Machines are NOT sorted.")
            
        # 2. Verify Job Part Names
        jobs = data['jobs']
        print(f"[CHECK] Found {len(jobs)} jobs.")
        
        for job in jobs:
            print(f"  - Job {job['id'][:4]}: Status={job['status']}, Part={job['part_name']}, Color={job['color']}")
            
            if "Bracket_Sys" not in job['part_name']:
                print(f"[FAIL] Part Name incorrect. Got: {job['part_name']}")
            
            # 3. Verify Queued Job Visualization
            if job['status'] == 'QUEUED':
                if job['start_time']:
                    print(f"[PASS] Queued job has calculated start_time for visualization: {job['start_time']}")
                else:
                    print("[FAIL] Queued job missing start_time")

    except Exception as e:
        print(f"[ERROR] Request failed: {e}")

if __name__ == "__main__":
    seed_scheduler_data()
    verify_endpoint()
