from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
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

router = APIRouter()

@router.get("/ping")
def ping_pong():
    logger.info("PING HIT")
    return {"status": "pong"}

@router.get("/db-ping")
def db_ping(db: Session = Depends(get_db)):
    logger.info("DB PING HIT")
    return {"status": "db-ok"}

from typing import Optional
from sqlalchemy import or_

@router.get("/admin/thumbnail-status")
def get_thumbnail_status(db: Session = Depends(get_db)):
    """Returns the progress of thumbnail generation."""
    total = db.query(Part).count() or 1
    done = db.query(Part).filter(Part.preview_url != None).count()
    return {"total": total, "done": done, "progress": round((done / total) * 100, 1)}

@router.get("/admin/fix-paths")
def fix_paths_endpoint(db: Session = Depends(get_db)):
    """Admin endpoint to bulk fix file paths and preview URLs."""
    logger.info("Starting Path Fix...")
    parts = db.query(Part).all()
    updates = 0
    storage_prefix = "storage/parts/"
    
    # Index files
    file_map = {}
    scan_dir = "storage/parts"
    if os.path.exists(scan_dir):
        for f in os.listdir(scan_dir):
            file_map[f.lower()] = f"{storage_prefix}{f}"
    
    logger.info(f"Indexed {len(file_map)} files from {scan_dir}")
    
    for p in parts:
        if not p.file_path: continue
        
        fname = os.path.basename(p.file_path.replace("\\", "/"))
        fname_lower = fname.lower()
        
        # 1. Fix Path
        if fname_lower in file_map:
             real_path = file_map[fname_lower]
             if p.file_path != real_path and not p.file_path.replace("\\", "/").startswith("storage/"):
                 p.file_path = real_path
                 updates += 1

        # 2. Fix Preview
        candidates = [
            fname + ".svg", fname + ".stl.svg", fname + ".step.svg", 
            fname + ".stp.svg", os.path.splitext(fname)[0] + ".svg",
             os.path.splitext(fname)[0] + ".stl.svg"
        ]
        
        found_url = None
        for c in candidates:
            if c.lower() in file_map:
                found_url = "/" + file_map[c.lower()]
                break
                
        if found_url and p.preview_url != found_url:
            p.preview_url = found_url
            updates += 1
            
    db.commit()
    logger.info(f"Path Fix Complete: {updates} updates")
    return {"status": "success", "updates": updates, "total_parts": len(parts)}

@router.get("/parts")
def get_all_parts(
    skip: int = 0, 
    limit: int = 50, 
    search: Optional[str] = None,
    process: Optional[str] = None,
    client: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Part)
        
        if search:
            search_fmt = f"%{search}%"
            query = query.filter(or_(Part.name.ilike(search_fmt), Part.project_id.ilike(search_fmt)))
            
        if process and process != "All":
             query = query.filter(Part.manufacturing_process == process)

        if client and client != "All":
             query = query.filter(Part.client_id == client)

        # Apply default sort (Newest first)
        if hasattr(Part, 'created_at'):
             query = query.order_by(Part.created_at.desc(), Part.part_id.asc())
             
        parts = query.offset(skip).limit(limit).all()
        logger.info(f"[DEBUG] Fetched {len(parts)} parts (skip={skip}, limit={limit})")
        
        results = []
        for p in parts:
             # Logic to prefer STL for viewing if original is complex CAD
             # Normalize separators for Linux (Docker) compatibility
             if p.file_path:
                 p.file_path = p.file_path.replace("\\", "/")
             
             # Optimistically assume STL exists if it's a known CAD format to avoid I/O bottlenecks in loop
             viewable_path = p.file_path
             if p.file_path and p.file_path.lower().endswith(('.step', '.stp', '.sldprt')):
                 # In production, we assume conversion happened. 
                 # Checking os.path.exists for every item in list is too slow on Docker volumes.
                 viewable_path = os.path.splitext(p.file_path)[0] + ".stl"
                     
             results.append({
                 "part_id": p.part_id,
                 "name": p.name,
                 "preview_url": p.preview_url,
                 "file_path": viewable_path, # Return STL if available
                 "original_file_path": p.file_path, # Keep original for reference
                 "material": p.material,
                 "manufacturing_process": p.manufacturing_process,
                 "estimated_cost": p.estimated_cost,
                 "measurements": p.measurements,
                 "technical_score": p.technical_score,
                 "economic_action": p.economic_action,
                 "project_id": p.project_id,
                 "client_id": p.client_id
             })
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"[ERROR] {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/parts/{part_id}")
def get_part(part_id: str, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
        
    # Logic to prefer STL for viewing if original is complex CAD
    viewable_path = part.file_path
    if part.file_path and not part.file_path.lower().endswith('.stl'):
         # Check if converted STL exists
         potential_stl = os.path.splitext(part.file_path)[0] + ".stl"
         exists = os.path.exists(potential_stl)
         if exists:
             viewable_path = potential_stl

    return {
         "part_id": part.part_id,
         "name": part.name,
         "preview_url": part.preview_url,
         "file_path": viewable_path, # Return STL if available
         "original_file_path": part.file_path,
         "material": part.material,
         "manufacturing_process": part.manufacturing_process,
         "estimated_cost": part.estimated_cost,
         "measurements": part.measurements,
         "technical_score": part.technical_score,
         "economic_action": part.economic_action,
         "project_id": part.project_id,
         "client_id": part.client_id
    }

from pydantic import BaseModel
from typing import Optional

class PartUpdate(BaseModel):
    name: Optional[str] = None
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    manufacturing_process: Optional[str] = None
    material: Optional[str] = None

@router.patch("/parts/{part_id}")
def update_part(part_id: str, update: PartUpdate, db: Session = Depends(get_db)):
    part = db.query(Part).filter(Part.part_id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    if update.name:
        part.name = update.name
    if update.client_id:
        part.client_id = update.client_id
    if update.project_id:
        part.project_id = update.project_id
    if update.manufacturing_process:
        part.manufacturing_process = update.manufacturing_process
    if update.material:
        part.material = update.material
    
    db.commit()
    db.refresh(part)
    return part

# ... (omitting lines for brevity)



from fastapi import Form

@router.post("/analyze")
async def analyze_part(
    file: UploadFile = File(...), 
    project_id: str = Form(None), 
    client_id: str = Form(None),
    source_path: str = Form(None),
    manufacturing_process: str = Form("MJF"),
    material: str = Form("PLA"),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    if not background_tasks:
        # Fallback if not injected (shouldn't happen with FastAPI)
        pass
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
            if client_id:
                existing.client_id = client_id
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
                client_id=client_id,
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
        
        if final_part and background_tasks:
            # Auto-generate 2D Drawing in Background
            logger.info(f"Triggering auto-drawing generation for {final_part.name}")
            background_tasks.add_task(DrawingService.generate_technical_drawing, final_part.file_path)

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
