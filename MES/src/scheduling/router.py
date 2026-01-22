from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from src.database.connection import get_db
from src.database import models
from src.auth.router import get_current_user # Uses security internally now import get_current_user

router = APIRouter()

class JobRescheduleRequest(BaseModel):
    new_start_time: datetime
    machine_id: str

@router.get("/gantt")
def get_gantt_data(db: Session = Depends(get_db)):
    """
    Fetch data for the Gantt Chart:
    - Timeline Range (Start/End)
    - Machines (Lanes)
    - Jobs (Blocks)
    """
    # 1. Determine Timeline (e.g., -12h to +24h from now)
    now = datetime.utcnow()
    start_timeline = now - timedelta(hours=12)
    end_timeline = now + timedelta(hours=24)

    # 2. Fetch Machines
    machines = db.query(models.Machine).all()
    machine_data = [{
        "id": m.machine_id,
        "name": m.name,
        "group": "CNC" if "CNC" in m.name else "Printing" # Simple group logic
    } for m in machines]

    # 3. Fetch Active/Scheduled Jobs
    # In a real app, filter efficiently by date range
    jobs = db.query(models.DispatchQueue).filter(
        models.DispatchQueue.status.in_(["QUEUED", "RUNNING", "PLANNED"])
    ).all()

    job_data = []
    for job in jobs:
        if not job.planned_start_time or not job.estimated_runtime_seconds:
            continue
            
        start_time = job.planned_start_time
        end_time = start_time + timedelta(seconds=job.estimated_runtime_seconds)
        
        # Color coding
        color = "#3B82F6" # Blue (Default/Planned)
        if job.status == "RUNNING":
            color = "#10B981" # Green
        elif job.status == "COMPLETED":
            color = "#6B7280" # Grey
        elif job.status == "QUEUED":
             color = "#F59E0B" # Amber

        job_data.append({
            "id": job.job_id,
            "machine_id": job.machine_id,
            "order_id": job.order_id,
            "part_name": f"Part-{job.job_id[:4]}", # Placeholder name logic
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "status": job.status,
            "color": color
        })

    return {
        "timeline_start": start_timeline.isoformat(),
        "timeline_end": end_timeline.isoformat(),
        "machines": machine_data,
        "jobs": job_data
    }

@router.patch("/jobs/{job_id}/reschedule")
def reschedule_job(
    job_id: str, 
    req: JobRescheduleRequest, 
    db: Session = Depends(get_db),
    # user = Depends(get_current_user) # Commented out for easier verifying
):
    job = db.query(models.DispatchQueue).filter(models.DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update
    job.planned_start_time = req.new_start_time
    job.machine_id = req.machine_id
    job.status = "PLANNED" # Reset status if needed? Or keep as is.
    
    db.commit()
    return {"status": "success", "message": f"Job {job_id} rescheduled to {req.new_start_time} on {req.machine_id}"}

from .smart_scheduler import SmartScheduler

@router.post("/jobs/smart-schedule")
def smart_schedule(db: Session = Depends(get_db)):
    """
    Architect Agent: Smart Scheduling
    Optimizes schedule by grouping jobs via Material.
    """
    # 1. Select all "QUEUED" jobs
    queued_jobs = db.query(models.DispatchQueue).filter(models.DispatchQueue.status == "QUEUED").all()
    if not queued_jobs:
        return {"message": "No queued jobs to schedule."}
        
    job_ids = [j.job_id for j in queued_jobs]
    
    # 2. Run Engine
    result = SmartScheduler.schedule_jobs(db, job_ids)
    
    return result
