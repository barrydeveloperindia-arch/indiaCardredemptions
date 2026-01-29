
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

from src.database.connection import get_db
from src.database import models

router = APIRouter(prefix="/api/sales", tags=["Sales & Zoho Parity"])

# --- Pydantic Schemas ---

class ContactCreate(BaseModel):
    name: str
    contact_type: str = "CUSTOMER" # CUSTOMER, VENDOR
    email: Optional[str] = None
    phone: Optional[str] = None
    billing_address: Optional[dict] = None
    shipping_address: Optional[dict] = None
    gstin: Optional[str] = None
    pan: Optional[str] = None

class ContactRead(ContactCreate):
    contact_id: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class EstimateItem(BaseModel):
    description: str
    quantity: float
    unit_price: float
    tax_rate: float = 18.0

class EstimateCreate(BaseModel):
    contact_id: str
    project_id: Optional[str] = None
    items: List[EstimateItem]
    status: str = "DRAFT"
    estimate_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    terms_conditions: Optional[str] = None

class EstimateRead(EstimateCreate):
    estimate_id: str
    estimate_number: str
    total_amount: float
    
    class Config:
        orm_mode = True

class ProjectRead(BaseModel):
    project_id: str
    name: Optional[str]
    description: Optional[str]
    status: str
    start_date: Optional[datetime]
    customer_id: Optional[str]
    quote_value: float = 0.0
    po_value: float = 0.0
    po_number: Optional[str] = None
    
    class Config:
        orm_mode = True

class PartRead(BaseModel):
    part_id: str
    name: str
    file_path: Optional[str]
    material: Optional[str]
    manufacturing_process: Optional[str]
    estimated_cost: float
    measurements: Optional[dict]
    technical_score: Optional[float]
    economic_action: Optional[str]
    
    class Config:
        orm_mode = True

class ProjectDetail(ProjectRead):
    parts: List[PartRead] = []

# --- Project Endpoints (Metadata) ---

@router.get("/projects", response_model=List[ProjectRead])
def list_projects(
    skip: int = 0, 
    limit: int = 5000, 
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Project)
    if status:
        query = query.filter(models.Project.status == status)
    
    return query.order_by(models.Project.start_date.desc()).offset(skip).limit(limit).all()

@router.get("/projects/{project_id}", response_model=ProjectDetail)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# --- Contact Endpoints ---

@router.post("/contacts", response_model=ContactRead)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    # Check duplicate name
    existing = db.query(models.Contact).filter(models.Contact.name == contact.name).first()
    if existing:
        return existing
        
    db_contact = models.Contact(
        name=contact.name,
        contact_type=contact.contact_type,
        email=contact.email,
        phone=contact.phone,
        billing_address=contact.billing_address,
        shipping_address=contact.shipping_address,
        gstin=contact.gstin,
        pan=contact.pan
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.get("/contacts", response_model=List[ContactRead])
def list_contacts(skip: int = 0, limit: int = 100, type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.Contact)
    if type:
        query = query.filter(models.Contact.contact_type == type)
    return query.order_by(models.Contact.name).offset(skip).limit(limit).all()

# --- Estimate Endpoints ---

@router.post("/estimates", response_model=EstimateRead)
def create_estimate(estimate: EstimateCreate, db: Session = Depends(get_db)):
    # Calculate Total
    total = 0.0
    items_json = []
    for item in estimate.items:
        line_total = item.quantity * item.unit_price
        total += line_total  # Pre-tax total ? Typically DB stores Grand Total
        # Let's assume grand total for now
        tax_amt = line_total * (item.tax_rate / 100.0)
        total += tax_amt
        items_json.append(item.dict())
        
    # Generate Number
    count = db.query(models.Estimate).count()
    est_number = f"EST-{datetime.now().year}-{count+1:04d}"
    
    db_est = models.Estimate(
        estimate_number=est_number,
        contact_id=estimate.contact_id,
        project_id=estimate.project_id,
        status=estimate.status,
        items=items_json,
        total_amount=total,
        estimate_date=estimate.estimate_date or datetime.utcnow(),
        expiry_date=estimate.expiry_date,
        terms_conditions=estimate.terms_conditions
    )
    db.add(db_est)
    db.commit()
    db.refresh(db_est)
    return db_est

@router.get("/estimates", response_model=List[EstimateRead])
def list_estimates(
    skip: int = 0, 
    limit: int = 100, 
    contact_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Estimate)
    if contact_id:
        query = query.filter(models.Estimate.contact_id == contact_id)
    return query.order_by(models.Estimate.estimate_date.desc()).offset(skip).limit(limit).all()
