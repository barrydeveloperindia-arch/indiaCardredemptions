from sqlalchemy.orm import Session
from src.database.models import Machine, DispatchQueue, Part
from datetime import datetime, timedelta
from typing import List, Dict, Any

class SmartScheduler:
    """
    Architect Agent Logic:
    Optimizes the production schedule by grouping jobs with similar materials
    to minimize changeover time and assigning them to capable machines.
    """

    @staticmethod
    def schedule_jobs(db: Session, job_ids: List[str]) -> Dict[str, Any]:
        """
        Auto-schedules the provided list of Job IDs.
        Strategy:
        1. Fetch all jobs and their associated parts.
        2. Group by Material (PLA, Resin, etc.).
        3. Match Groups to Machines with corresponding capabilities.
        4. update Job start_times sequentially.
        """
        
        # 1. Fetch Jobs
        jobs = db.query(DispatchQueue).filter(DispatchQueue.job_id.in_(job_ids)).all()
        if not jobs:
            return {"error": "No jobs found"}

        # 2. Fetch Machines
        machines = db.query(Machine).all()
        
        # Helper: Find capable machine for material
        def find_machine_for_material(material: str) -> Machine:
            for machine in machines:
                # Assuming capabilities is a list like ["PLA", "ABS"] or dict
                caps = machine.capabilities
                if isinstance(caps, list) and material in caps:
                    return machine
                if isinstance(caps, dict) and material in caps.get("materials", []):
                    return machine
            return None

        scheduled_count = 0
        schedule_log = []

        # Sort jobs by material to group them (Minimize changeover)
        # We need to access the Part material. 
        # Assuming Job -> Order -> ... wait, Job doesn't link to Part directly easily in current schema?
        # Standard MES: Job is for a Part. 
        # In our schema: Job -> Order. Order -> technical_requirements?
        # Let's assume queue items are already created and we are just assigning times/machines.
        # We might need to inspect the Order to get the material.
        
        # Grouping
        grouped_jobs = {} # { "PLA": [job1, job2], "Resin": [job3] }
        
        for job in jobs:
            # Resolving material from Order (or Part if linked)
            # For this MVP, we'll try to deduce from the job/order data or fallback to 'PLA'
            material = "PLA"
            if job.order and job.order.technical_requirements:
                material = job.order.technical_requirements.get("material", "PLA")
            
            if material not in grouped_jobs:
                grouped_jobs[material] = []
            grouped_jobs[material].append(job)

        # Scheduling
        current_time = datetime.utcnow()
        # Add a buffer for "now"
        current_time += timedelta(minutes=10)

        for material, batch in grouped_jobs.items():
            target_machine = find_machine_for_material(material)
            
            if not target_machine:
                schedule_log.append(f"Skipped batch {material}: No capable machine found.")
                continue
                
            schedule_log.append(f"Scheduling {len(batch)} {material} jobs on {target_machine.name}")
            
            # Find the end time of the last scheduled job on this machine to stack them
            last_job = db.query(DispatchQueue).filter(
                DispatchQueue.machine_id == target_machine.machine_id
            ).order_by(DispatchQueue.planned_start_time.desc()).first()
            
            start_cursor = current_time
            if last_job and last_job.planned_start_time:
                # If machine is busy, start after the last job + 5 min changeover
                end_time = last_job.planned_start_time + timedelta(seconds=last_job.estimated_runtime_seconds or 3600)
                if end_time > start_cursor:
                    start_cursor = end_time + timedelta(minutes=5)

            for job in batch:
                job.machine_id = target_machine.machine_id
                job.planned_start_time = start_cursor
                job.status = "QUEUED" # Ensure it's queued
                
                # Approximate runtime if missing (e.g., 1 hour)
                runtime = job.estimated_runtime_seconds or 3600
                
                # Move cursor for next job
                start_cursor += timedelta(seconds=runtime)
                
                scheduled_count += 1
        
        db.commit()
        
        return {
            "scheduled": scheduled_count,
            "log": schedule_log
        }
