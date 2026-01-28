
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from src.database.connection import get_db
from src.database.models import DispatchQueue, Order
from src.reporting.pdf_generator import JobSheetGenerator
import os

router = APIRouter(prefix="/reporting", tags=["Reporting", "3YOURMIND Features"])

pdf_engine = JobSheetGenerator()

@router.get("/jobs/{job_id}/traveler")
def download_job_traveler(job_id: str, db: Session = Depends(get_db)):
    """
    Generates and returns a PDF Job Traveler (3YOURMIND style)
    with QR Code and Specs.
    """
    
    # 1. Fetch Job
    job = db.query(DispatchQueue).filter(DispatchQueue.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # 2. Fetch Order Data
    order = db.query(Order).filter(Order.order_id == job.order_id).first()
    
    # 3. Construct Data Dict
    job_data = {
        "job_id": job.job_id,
        "order_id": job.order_id,
        "machine_id": job.machine_id,
        "status": job.status,
        "priority_level": order.priority_level if order else 1,
        "customer_id": order.customer_id if order else "Unknown",
        "cad_file_path": order.cad_file_path if order else "",
        "technical_requirements": order.technical_requirements if order else {}
    }
    
    # 4. Generate PDF
    try:
        pdf_path = pdf_engine.generate_pdf(job_data)
        
        # 5. Return File
        filename = os.path.basename(pdf_path)
        return FileResponse(pdf_path, media_type="application/pdf", filename=filename)
        
    except Exception as e:
        print(f"PDF Gen Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
