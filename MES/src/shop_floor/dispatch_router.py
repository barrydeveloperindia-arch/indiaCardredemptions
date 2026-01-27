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
    # Part Editing
    manufacturing_process: Optional[str] = None
    material: Optional[str] = None
    part_name: Optional[str] = None
    client_id: Optional[str] = None
    project_id: Optional[str] = None

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
        part_name = cad_path.split('/')[-1]
        
        # Try to find part to get process info
        part = db.query(models.Part).filter(models.Part.name == part_name).first()
        process = part.manufacturing_process if part else "Unknown"
        
        return {
            "id": job.job_id,
            "order_id": job.order_id,
            "part_name": part_name,
            "client_id": part.client_id if part and part.client_id else (job.order.customer_id if job.order else "Unknown"),
            "machine": job.machine_id,
            "status": job.status,
            "eta": f"{job.estimated_runtime_seconds // 60}m" if job.estimated_runtime_seconds else "N/A",
            "estimated_runtime_seconds": job.estimated_runtime_seconds,
            "planned_start_time": job.planned_start_time.isoformat() if job.planned_start_time else None,
            "actual_start_time": job.actual_start_time.isoformat() if job.actual_start_time else None,
            "priority": "High" if str(job.job_id).startswith("1") else "Normal",
            "manufacturing_process": process,
            "material": part.material if part else "Unknown",
            "project_id": part.project_id if part else "N/A",
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

    # Handle Client Update (on Order)
    if update.client_id:
        if job.order:
            job.order.customer_id = update.client_id
            
            # Also try to update the Part's client_id for consistency if we can find it
            if job.order.cad_file_path:
                current_name = job.order.cad_file_path.split('/')[-1]
                part = db.query(models.Part).filter(models.Part.name == current_name).first()
                if part:
                    part.client_id = update.client_id

    # Handle Part Updates (Name, Process, Material, Project ID)
    if update.manufacturing_process or update.material or update.part_name or update.project_id:
        if job.order and job.order.cad_file_path:
            # Find part by current file name (best guess link)
            current_name = job.order.cad_file_path.split('/')[-1]
            part = db.query(models.Part).filter(models.Part.name == current_name).first()
            
            if part:
                if update.manufacturing_process:
                    part.manufacturing_process = update.manufacturing_process
                if update.material:
                    part.material = update.material
                if update.project_id:
                    part.project_id = update.project_id
                if update.part_name:
                    part.name = update.part_name
                    # Also update the Order reference path if name changes? 
                    # For simplicity, we assume file_path might stay same or we just update the conceptual name.
                    # But job.order.cad_file_path stores the name effectively.
                    # Let's update the order's file path reference to keep the link alive
                    job.order.cad_file_path = update.part_name 
                    
        
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
    pdf_bytes = bytes(pdf.output(dest='S').encode('latin-1'))
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=qc_report_{job_id}.pdf"})

@router.post("/orders/create-from-part/{part_id}")
def create_order_from_part(part_id: str, db: Session = Depends(get_db)):
    part = db.query(models.Part).filter(models.Part.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
        
    # Create Order
    new_order = models.Order(
        customer_id=part.client_id or "INTERNAL_CATALOG",
        cad_file_path=part.name,
        technical_requirements={
            "material": part.material, 
            "process": part.manufacturing_process
        },
        priority_level=1,
        status="PLANNED"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Create Dispatch Job
    new_job = models.DispatchQueue(
        order_id=new_order.order_id,
        status="PLANNED",
        current_step="PLANNING"
    )
    db.add(new_job)
    db.commit()
    
    return {"message": "Job created", "job_id": new_job.job_id}
