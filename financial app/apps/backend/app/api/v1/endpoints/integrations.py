from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.database import get_sync_db
from app.services.aa_service import AccountAggregatorService
from app.models import User
import uuid

router = APIRouter()

@router.post("/aa/consent")
async def create_consent(
    mobile_number: str = Body(..., embed=True), 
    db: Session = Depends(get_sync_db)
):
    """
    Init AA Consent Flow.
    """
    # 1. Get User (Assume Single User for now)
    user = db.query(User).first()
    if not user:
         raise HTTPException(status_code=400, detail="No user found in system. Please seed a user first.")
         
    service = AccountAggregatorService(db)
    
    try:
        result = await service.create_consent(user.user_id, mobile_number)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/aa/consent/{handle}/status")
async def check_consent_status(
    handle: str,
    db: Session = Depends(get_sync_db)
):
    """
    Check if consent is approved.
    """
    service = AccountAggregatorService(db)
    result = await service.check_consent_status(handle)
    
    if not result:
        raise HTTPException(status_code=404, detail="Consent handle not found")
        
    return result

@router.post("/aa/sync/{consent_id}")
async def sync_data(
    consent_id: str,
    db: Session = Depends(get_sync_db)
):
    """
    Trigger data fetch for a consent.
    """
    try:
        c_uuid = uuid.UUID(consent_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID")
        
    service = AccountAggregatorService(db)
    
    try:
        result = await service.fetch_and_sync_data(c_uuid)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
