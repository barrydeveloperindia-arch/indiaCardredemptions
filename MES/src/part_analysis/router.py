from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.models import Part, Order, DispatchQueue
from src.database import models
from .service import PartAnalysisService
from .drawing_service import DrawingService
from .storage_manager import StorageManager
import os
import logging
from fastapi.concurrency import run_in_threadpool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/api/part-analysis", tags=["Part Analysis (PLM)"])

@router.get("/ping")
def ping_pong():
    logger.info("PING HIT")
    return {"status": "pong"}

@router.get("/db-ping")
def db_ping(db: Session = Depends(get_db)):
    logger.info("DB PING HIT")
    return {"status": "db-ok"}

@router.get("/parts")
def get_all_parts(db: Session = Depends(get_db)):
    try:
        parts = db.query(Part).all()
        logger.info(f"[DEBUG] Fetched {len(parts)} parts")
        
        # Manual serialization for safety
        results = []
        for p in parts:
             results.append({
                 "part_id": p.part_id,
                 "name": p.name,
                 "preview_url": p.preview_url,
                 "file_path": p.file_path,
                 "material": p.material,
                 "manufacturing_process": p.manufacturing_process,
                 "estimated_cost": p.estimated_cost,
                 "measurements": p.measurements,
                 "technical_score": p.technical_score,
                 "economic_action": p.economic_action,
                 "project_id": p.project_id
             })
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ... (omitting lines for brevity)



from fastapi import Form

@router.post("/analyze")
async def analyze_part(
    file: UploadFile = File(...), 
    project_id: str = Form(None), 
    source_path: str = Form(None),
    manufacturing_process: str = Form("MJF"),
    material: str = Form("PLA"),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(('.stl', '.step', '.stp', '.obj', '.sldprt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: STL, STEP, OBJ, SLDPRT.")
    
    try:
        # Analyze (Offload blocking CAD work to threadpool)
        analysis_result = await run_in_threadpool(PartAnalysisService.analyze_file, file.filename, file.file)
        
        # Check if part exists
        existing = db.query(Part).filter(Part.name == file.filename).first()
        
        technical_score = analysis_result.get("technical_score", 0.0)
        economic_action = analysis_result.get("economic_data", {}).get("action", "Evaluate")
        measurements = {
            "volume_cm3": analysis_result.get("volume_cm3"),
            "bounding_box": analysis_result.get("bounding_box"),
            "poly_count": analysis_result.get("poly_count"),
            "surface_area_cm2": analysis_result.get("raw_geometry", {}).get("surface_area_cm2", 0.0)
        }
        
        if existing:
            # Update existing record
            existing.estimated_cost = analysis_result.get("quote", {}).get("total_price", 0.0)
            existing.technical_score = technical_score
            existing.economic_action = economic_action
            existing.measurements = measurements
            existing.manufacturing_process = manufacturing_process
            existing.material = material
            if project_id:
                existing.project_id = project_id
            if source_path:
                existing.source_path = source_path
                
            db.add(existing)
            db.commit()
            db.refresh(existing)
            final_part = existing
        else:
            # Persist to DB
            new_part = Part(
                name=file.filename,
                file_path=f"storage/parts/{file.filename}", 
                material=material, 
                manufacturing_process=manufacturing_process,
                estimated_cost=analysis_result.get("quote", {}).get("total_price", 0.0),
                preview_url=f"/storage/{analysis_result['thumbnail_path'].replace('storage/', '', 1)}" if analysis_result.get("thumbnail_path") else "https://placehold.co/400x300?text=Part+Preview", 
                technical_score=technical_score,
                economic_action=economic_action,
                measurements=measurements,
                project_id=project_id,
                source_path=source_path
            )
            db.add(new_part)
            db.commit()
            db.refresh(new_part)
            final_part = new_part

        # PLM -> Dispatch Integration
        existing_job = db.query(DispatchQueue).join(models.Order).filter(
            models.Order.cad_file_path == final_part.name,
            DispatchQueue.status == "PLANNED"
        ).first()
        
        if not existing_job:
            # 1. Create Internal Order
            new_order = models.Order(
                customer_id="INTERNAL_PLM",
                cad_file_path=final_part.name,
                technical_requirements={"material": final_part.material},
                priority_level=1,
                status="PLANNED"
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            
            # 2. Create Dispatch Job
            new_job = DispatchQueue(
                order_id=new_order.order_id,
                status="PLANNED",
                current_step="PLANNING"
            )
            db.add(new_job)
            db.commit()
        
        return analysis_result

    except Exception as e:
        logger.error(f"Analysis Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/parts/{part_id}")
def delete_part(part_id: str, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
        
    # Delete from disk
    if part.file_path:
        StorageManager.delete_file(part.file_path)
        
    # Delete from DB
    db.delete(part)
    db.commit()
    
    return {"status": "DELETED", "part_id": part_id}

@router.post("/generate-drawing/{part_id}")
async def generate_drawing(part_id: str, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
        
    try:
        # Run drawing generation in threadpool to avoid blocking
        result = await run_in_threadpool(
            DrawingService.generate_technical_drawing, 
            part.file_path
        )
        return result
    except Exception as e:
        logger.error(f"Drawing Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
