from fastapi import APIRouter, UploadFile, File, HTTPException
from .service import PartAnalysisService

router = APIRouter(prefix="/api/part-analysis", tags=["Part Analysis (PLM)"])

@router.post("/analyze")
async def analyze_part(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.stl', '.step', '.stp', '.obj', '.sldprt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Allowed: STL, STEP, OBJ, SLDPRT.")
    
    # In a real app, we would save the file and process it.
    # Here we just use the filename to simulate analysis.
    result = PartAnalysisService.analyze_file(file.filename)
    
    return result
