from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.models import Part
from .service import PartAnalysisService
import os

router = APIRouter(prefix="/api/part-analysis", tags=["Part Analysis (PLM)"])

@router.post("/analyze")
async def analyze_part(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(('.stl', '.step', '.stp', '.obj', '.sldprt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: STL, STEP, OBJ, SLDPRT.")
    
    # Analyze (Simulated)
    analysis_result = PartAnalysisService.analyze_file(file.filename, file.file)
    
    # Check if part exists
    existing = db.query(Part).filter(Part.name == file.filename).first()
    if existing:
        return analysis_result
        
    # Persist to DB
    new_part = Part(
        name=file.filename,
        file_path=f"storage/parts/{file.filename}", # Relative path for static mount
        material="PLA" if "Lighttrap" not in file.filename else "Resin", # Simple heuristic
        estimated_cost=analysis_result.get("quote", {}).get("total_price", 0.0),
        preview_url=f"/assets/parts/{file.filename}.png", # Mock preview
        
        # Phase 5: Suitability Persistence
        technical_score=analysis_result.get("technical_score", 0.0),
        economic_action=analysis_result.get("economic_data", {}).get("action", "Evaluate")
    )
    db.add(new_part)
    db.commit()
    
    return analysis_result

@router.get("/parts")
def get_all_parts(db: Session = Depends(get_db)):
    return db.query(Part).all()
