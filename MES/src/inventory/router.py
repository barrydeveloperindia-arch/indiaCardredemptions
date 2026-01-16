from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from src.database.connection import get_db
from src.database import models
from src.auth.router import get_current_user
from src.inventory.service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory"])
inventory_service = InventoryService()

# --- Schemas ---
class InventoryItemCreate(BaseModel):
    item_id: str
    name: str
    material_type: str
    quantity_on_hand: float = 0.0
    unit_cost: float = 0.0
    unit: str

class InventoryItemResponse(InventoryItemCreate):
    class Config:
        orm_mode = True

class StockUpdate(BaseModel):
    quantity_change: float
    job_id: Optional[str] = None

# --- Endpoints ---

@router.get("/", response_model=List[InventoryItemResponse])
def get_inventory(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return inventory_service.get_all_items(db)

@router.post("/", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: InventoryItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role not in ["admin", "accountant"]:
        raise HTTPException(status_code=403, detail="Not authorized to create items")
    
    # Check if exists
    if inventory_service.get_item(db, item.item_id):
        raise HTTPException(status_code=400, detail="Item already exists")
    
    return inventory_service.create_item(db, item.dict())

@router.post("/{item_id}/transaction", response_model=InventoryItemResponse)
def update_stock(
    item_id: str, 
    update: StockUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    try:
        updated_item = inventory_service.update_stock(db, item_id, update.quantity_change, update.job_id)
        return updated_item
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
