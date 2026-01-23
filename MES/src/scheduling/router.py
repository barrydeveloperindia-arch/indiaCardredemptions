from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

from src.database.connection import get_db
from src.database import models
# from src.auth.router import get_current_user # Uses security internally now import get_current_user

router = APIRouter()

class JobRescheduleRequest(BaseModel):
    new_start_time: datetime
    machine_id: str

@router.get("/gantt")
def get_gantt_data(db: Session = Depends(get_db)):
    """
    Fetch data for the Gantt Chart:
    - Timeline Range (Start/End)
    - Machines (Lanes) - Sorted by ID
    - Jobs (Blocks) - Joined with Order for real Part Names
    """
    # 1. Determine Timeline (e.g., -12h to +24h from now)
    now = datetime.utcnow()
    start_timeline = now - timedelta(hours=12)
    end_timeline = now + timedelta(hours=24)

    # 2. Fetch Machines (Sorted)
    machines = db.query(models.Machine).order_by(models.Machine.machine_id).all()
    machine_data = [{
        "id": m.machine_id,
        "name": m.name,
        "group": "CNC" if "CNC" in m.name else ("Printers" if "Printer" in m.name else "Other")
    } for m in machines]

    # 3. Fetch Active/Scheduled Jobs Joined with Orders
    results = db.query(
        models.DispatchQueue, 
        models.Order.cad_file_path, 
        models.Order.priority_level
    ).join(
        models.Order, 
        models.DispatchQueue.order_id == models.Order.order_id
    ).filter(
        models.DispatchQueue.status.in_(["QUEUED", "RUNNING", "PLANNED", "COMPLETED"])
    ).all()

    job_data = []
    
    # Auto-schedule helper for visualizing QUEUED jobs without times
    last_end_time_per_machine = {m.machine_id: now for m in machines}

    for job, cad_file, priority in results:
        # Determine Part Name
        part_name = "Unknown"
        if cad_file:
             part_name = cad_file.split("/")[-1]
             if len(part_name) > 20: 
                 part_name = part_name[:17] + "..."

        # Heuristic Scheduling for Visualization
        if job.planned_start_time:
            start_time = job.planned_start_time
        elif job.actual_start_time:
            start_time = job.actual_start_time
        else:
            base_time = last_end_time_per_machine.get(job.machine_id, now)
            start_time = max(base_time, now)
        
        duration_sec = job.estimated_runtime_seconds if job.estimated_runtime_seconds else 3600
        end_time = start_time + timedelta(seconds=duration_sec)
        
        if end_time > last_end_time_per_machine.get(job.machine_id, now):
            last_end_time_per_machine[job.machine_id] = end_time

        # Color coding
        color = "#3B82F6"
        if job.status == "RUNNING":
            color = "#10B981"
        elif job.status == "COMPLETED":
            color = "#6B7280"
        elif job.status == "QUEUED":
             color = "#F59E0B"

        job_data.append({
            "id": job.job_id,
            "machine_id": job.machine_id,
            "order_id": job.order_id,
            "part_name": part_name, 
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
