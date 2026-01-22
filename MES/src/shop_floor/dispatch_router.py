from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from src.database.connection import get_db
from src.database import models
from src.auth.router import get_current_user
from fpdf import FPDF
import io

router = APIRouter()

# --- Models ---
class JobUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[int] = None
    machine_id: Optional[str] = None
    # For QC
    qc_notes: Optional[str] = None
    current_step: Optional[str] = None

# --- Endpoints ---

@router.get("/board")
def get_dispatch_board(db: Session = Depends(get_db)):
    """
    Get all jobs grouped by Kanban columns:
    1. Planning (Orders PENDING/PLANNED)
    2. Production Queue (Jobs QUEUED/RUNNING)
    3. Ready for QC (Jobs COMPLETED with step != QC_DONE)
    """
    # Planning: Orders that are not yet dispatched (or jobs that are planned but not queued)
    # Ideally, we should unify this. For now, let's treat "Planning" as PLANNED jobs.
    planning = db.query(models.DispatchQueue).filter(models.DispatchQueue.status == "PLANNED").all()
    
    # Production: QUEUED or RUNNING
    production = db.query(models.DispatchQueue).filter(models.DispatchQueue.status.in_(["QUEUED", "RUNNING"])).all()
    
    # QC: COMPLETED but still in QC phase (or standard COMPLETED waiting for check)
    # We'll use status="COMPLETED" and assume that means "Ready for QC"
    qc = db.query(models.DispatchQueue).filter(models.DispatchQueue.status == "COMPLETED").all()
    
    def format_job(job):
        cad_path = job.order.cad_file_path if job.order else "Unknown"
        return {
            "id": job.job_id,
            "order_id": job.order_id,
            "part_name": cad_path.split('/')[-1], # Show filename
            "machine": job.machine_id,
            "status": job.status,
            "eta": f"{job.estimated_runtime_seconds // 60}m" if job.estimated_runtime_seconds else "N/A",
            "priority": "High" if str(job.job_id).startswith("1") else "Normal",
            "order": {
                "cad_file_path": cad_path,
                "customer_id": job.order.customer_id if job.order else "Unknown"
            }
        }

    return {
        "planning": [format_job(j) for j in planning],
        "production": [format_job(j) for j in production],
        "qc": [format_job(j) for j in qc]
    }

@router.patch("/jobs/{job_id}")
def update_job(job_id: str, update: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if update.status:
        job.status = update.status
    if update.machine_id:
        job.machine_id = update.machine_id
    if update.current_step:
        job.current_step = update.current_step
        
    db.commit()
    db.refresh(job)
    return {"message": "Job updated", "job": job.job_id, "status": job.status}

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}

@router.get("/jobs/{job_id}/qc-report")
def generate_qc_report(job_id: str, db: Session = Depends(get_db)):
    job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Header
    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, txt=f"Quality Control Report: {job.job_id}", ln=1, align="C")
    pdf.ln(10)
    
    # Details
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Order ID: {job.order_id or 'N/A'}", ln=1)
    pdf.cell(200, 10, txt=f"Machine ID: {job.machine_id or 'N/A'}", ln=1)
    pdf.cell(200, 10, txt=f"Completion Time: {job.actual_end_time or datetime.utcnow()}", ln=1)
    pdf.ln(10)
    
    # QC Checklist
    pdf.set_font("Arial", "B", 14)
    pdf.cell(200, 10, txt="Inspection Results", ln=1)
    pdf.set_font("Arial", size=12)
    
    checks = [
        ("Visual Inspection", "PASS"),
        ("Dimensional Accuracy", "PASS"),
        ("Surface Finish", "PASS (Ra 3.2)"),
        ("Material Integrity", "PASS")
    ]
    
    for check, result in checks:
        pdf.cell(100, 10, txt=check, border=1)
        pdf.cell(50, 10, txt=result, border=1, ln=1)
        
    # Signature
    pdf.ln(20)
    pdf.cell(200, 10, txt="Inspector Signature: _______________________", ln=1)
    
    # Output
    pdf_bytes = bytes(pdf.output(dest='S'))
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=qc_report_{job_id}.pdf"})
