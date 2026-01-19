from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from src.database.connection import get_db
from src.database.models import DispatchQueue, Machine, Order, User

router = APIRouter()

class JobStatusUpdate(BaseModel):
    status: str # RUNNING, COMPLETED, PAUSED
    notes: Optional[str] = None

class JobStepLog(BaseModel):
    step_description: str
    is_completed: bool

@router.get("/operator/{machine_id}/active-job")
def get_active_job(machine_id: str, db: Session = Depends(get_db)):
    """
    Get the job that an operator should be working on:
    1. Currently RUNNING job
    2. Next QUEUED job at the top of the schedule
    """
    # 1. Check for RUNNING
    running = db.query(DispatchQueue).filter(
        DispatchQueue.machine_id == machine_id,
        DispatchQueue.status == "RUNNING"
    ).first()
    
    if running:
        # Fetch part details from Order (simplified)
        part_name = "Unknown Part"
        material = "Unknown"
        if running.order and running.order.technical_requirements:
             reqs = running.order.technical_requirements
             part_name = reqs.get("filename", "Part")
             material = reqs.get("material", "Standard")

        return {
            "job_id": running.job_id,
            "status": "RUNNING",
            "part_name": part_name,
            "material": material,
            "order_id": running.order_id,
            "start_time": running.actual_start_time,
            "target_steps": 5 # Mock: In real PDF parsing, we'd have this
        }

    # 2. Check for QUEUED
    queued = db.query(DispatchQueue).filter(
        DispatchQueue.machine_id == machine_id,
        DispatchQueue.status == "PLANNED" # Use PLANNED as "Scheduled"
    ).order_by(DispatchQueue.planned_start_time).first()
    
    if queued:
         # Fetch part details
        part_name = "Unknown Part"
        material = "Unknown"
        if queued.order and queued.order.technical_requirements:
             reqs = queued.order.technical_requirements
             part_name = reqs.get("filename", "Part")
             material = reqs.get("material", "Standard")
             
        return {
            "job_id": queued.job_id,
            "status": "QUEUED",
             "part_name": part_name,
            "material": material,
            "order_id": queued.order_id,
            "planned_start": queued.planned_start_time,
             "target_steps": 5
        }

    return {"status": "NO_JOB", "message": "No jobs scheduled for this machine."}

@router.post("/jobs/{job_id}/status")
def update_job_status(job_id: str, update: JobStatusUpdate, db: Session = Depends(get_db)):
    job = db.query(DispatchQueue).filter(DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job.status = update.status
    
    if update.status == "RUNNING" and not job.actual_start_time:
        job.actual_start_time = datetime.utcnow()
        
    if update.status == "COMPLETED" and not job.actual_end_time:
        job.actual_end_time = datetime.utcnow()
        
    db.commit()
    return {"status": "success", "new_status": job.status}

@router.post("/jobs/{job_id}/step")
def update_job_step(job_id: str, step: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Engineer Agent: Shop Floor Tracking
    Updates the specific manufacturing step (e.g., WASHING, CURING).
    """
    job = db.query(DispatchQueue).filter(DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Update Step
    prev_step = job.current_step
    job.current_step = step
    
    # Log History
    history_entry = {
        "step": step,
        "from": prev_step,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Append to JSON list (handling potential None default)
    current_history = list(job.steps_history) if job.steps_history else []
    current_history.append(history_entry)
    job.steps_history = current_history
    
    # Auto-Update Overall Status
    if step == "PRINTING":
        job.status = "RUNNING"
        if not job.actual_start_time:
            job.actual_start_time = datetime.utcnow()
    elif step == "COMPLETED":
        job.status = "COMPLETED"
        if not job.actual_end_time:
            job.actual_end_time = datetime.utcnow()
            
    db.commit()
    return {
        "status": "success", 
        "current_step": job.current_step, 
        "job_status": job.status
    }
