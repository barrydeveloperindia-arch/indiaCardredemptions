
from src.database.connection import SessionLocal
from src.database import models
import uuid

def seed_qc_job():
    db = SessionLocal()
    try:
        # Create Order first
        order = db.query(models.Order).filter(models.Order.order_id == "ORD-TEST").first()
        if not order:
            order = models.Order(
                order_id="ORD-TEST",
                customer_id="CUST-001",
                cad_file_path="storage/parts/test.stl",
                technical_requirements={}
            )
            db.add(order)
            db.commit()
            print("Seeded ORD-TEST")

        # Check if job exists
        job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == "JOB-QC-TEST").first()
        if not job:
            job = models.DispatchQueue(
                job_id="JOB-QC-TEST",
                order_id="ORD-TEST",
                machine_id="CNC-001",
                status="COMPLETED", # QC Ready
                estimated_runtime_seconds=3600
            )
            db.add(job)
            db.commit()
            print("Seeded JOB-QC-TEST")
        else:
            print("JOB-QC-TEST already exists")
    finally:
        db.close()

if __name__ == "__main__":
    seed_qc_job()
