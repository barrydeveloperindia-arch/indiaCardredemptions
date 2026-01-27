from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict
from src.database.connection import get_db
# Import Base from connection to ensure it's the same base
# But we need to use the raw SQL or a new model definition.
# Let's use the models_metadata we just created but we need to make sure it's registered? 
# Using raw SQL for simplicity in this endpoint since we are not using Alembic properly here.
# Or better, just define the class locally or import it.
from src.database.models import Base, generate_uuid 
from sqlalchemy import Column, String, DateTime
from datetime import datetime

# Quick Model Def (Dynamic)
class SystemMetadata(Base):
    __tablename__ = "system_metadata"
    __table_args__ = {'extend_existing': True}
    
    metadata_id = Column(String, primary_key=True, default=generate_uuid)
    category = Column(String, nullable=False) # CLIENT, PROCESS, MATERIAL
    value = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

router = APIRouter(prefix="/api/metadata", tags=["System Metadata"])

class MetadataCreate(BaseModel):
    category: str
    value: str

@router.get("/")
def get_metadata(db: Session = Depends(get_db)):
    rows = db.query(SystemMetadata).all()
    
    result = {
        "clients": [],
        "processes": [],
        "materials": []
    }
    
    for r in rows:
        if r.category == "CLIENT":
            result["clients"].append(r.value)
        elif r.category == "PROCESS":
            result["processes"].append(r.value)
        elif r.category == "MATERIAL":
            result["materials"].append(r.value)
            
    return result

@router.post("/")
def add_metadata(dat: MetadataCreate, db: Session = Depends(get_db)):
    # Check duplicate
    exists = db.query(SystemMetadata).filter(
        SystemMetadata.category == dat.category,
        SystemMetadata.value == dat.value
    ).first()
    
    if exists:
        return {"message": "Already exists", "value": dat.value}
        
    new_item = SystemMetadata(
        category=dat.category,
        value=dat.value
    )
    db.add(new_item)
    db.commit()
    
    return {"status": "Added", "category": dat.category, "value": dat.value}
