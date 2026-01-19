from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

class SchedulerEngine:
    @staticmethod
    def get_gantt_data() -> Dict[str, Any]:
        """
        Generates mock Gantt chart data for the visual scheduler.
        """
        machines = [
            {"id": "m1", "name": "Prusa MK3S - 01", "group": "FDM Farm"},
            {"id": "m2", "name": "Prusa MK3S - 02", "group": "FDM Farm"},
            {"id": "m3", "name": "Bambu Lab X1C", "group": "High Speed"},
            {"id": "m4", "name": "Formlabs 3L", "group": "SLA Resin"},
        ]
        
        jobs = []
        now = datetime.now()
        base_time = now.replace(minute=0, second=0, microsecond=0)
        
        for machine in machines:
            # Create 1-3 jobs per machine
            num_jobs = random.randint(1, 3)
            current_start = base_time - timedelta(hours=random.randint(0, 4))
            
            for i in range(num_jobs):
                duration_hours = random.randint(2, 8)
                end_time = current_start + timedelta(hours=duration_hours)
                
                status = "COMPLETED" if end_time < now else ("RUNNING" if current_start < now else "PLANNED")
                
                jobs.append({
                    "id": f"job-{machine['id']}-{i}",
                    "machine_id": machine["id"],
                    "order_id": f"ORD-{random.randint(1000, 9999)}",
                    "part_name": f"Part_{random.choice(['Gear', 'Bracket', 'Housing', 'Prototype'])}",
                    "start_time": current_start.isoformat(),
                    "end_time": end_time.isoformat(),
                    "status": status,
                    "color": "#008A45" if status == "COMPLETED" else ("#0056D2" if status == "RUNNING" else "#9AA0A6")
                })
                
                # Gap between jobs
                current_start = end_time + timedelta(minutes=random.randint(30, 120))
                
        return {
            "machines": machines,
            "jobs": jobs,
            "timeline_start": (now - timedelta(hours=12)).isoformat(),
            "timeline_end": (now + timedelta(hours=24)).isoformat()
        }
