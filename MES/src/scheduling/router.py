from fastapi import APIRouter
from .scheduler_engine import SchedulerEngine

router = APIRouter(prefix="/api/scheduling", tags=["Agile Scheduling"])

@router.get("/gantt")
async def get_gantt_chart():
    """
    Returns data formatted for the Frontend Gantt Chart component.
    Includes Machine lists and Job blocks with start/end times.
    """
    return SchedulerEngine.get_gantt_data()
