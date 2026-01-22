
from src.database.connection import SessionLocal
from src.database.models import DispatchQueue

db = SessionLocal()
count = db.query(DispatchQueue).count()
print(f"Total Jobs in DB: {count}")
jobs = db.query(DispatchQueue).all()
for j in jobs:
    print(f"Job: {j.job_id}, Status: {j.status}, Mach: {j.machine_id}, Start: {j.planned_start_time}, Est: {j.estimated_runtime_seconds}")

from src.database.models import Machine
print("\n--- Machines ---")
machines = db.query(Machine).all()
for m in machines:
    print(f"Machine: {m.machine_id}, Name: {m.name}")
db.close()
