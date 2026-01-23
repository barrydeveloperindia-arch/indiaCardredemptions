
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON, DateTime, DECIMAL, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from datetime import datetime
import uuid
from .connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class Machine(Base):
    __tablename__ = "machines"
    
    machine_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    capabilities = Column(JSON, nullable=False)
    current_status = Column(String, default="IDLE")
    telemetry_topic = Column(String)
    location_coords = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    jobs = relationship("DispatchQueue", back_populates="machine")

class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(String, primary_key=True, default=generate_uuid)
    customer_id = Column(String, nullable=False)
    priority_level = Column(Integer, default=1)
    cad_file_path = Column(String, nullable=False)
    technical_requirements = Column(JSON, nullable=False)
    status = Column(String, default="PENDING")
    received_at = Column(DateTime, default=datetime.utcnow)
    estimated_delivery = Column(DateTime)
    
    jobs = relationship("DispatchQueue", back_populates="order")
    invoices = relationship("Invoice", back_populates="order")

class DispatchQueue(Base):
    __tablename__ = "dispatch_queue"
    
    job_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.order_id"))
    machine_id = Column(String, ForeignKey("machines.machine_id"))
    
    planned_start_time = Column(DateTime)
    estimated_runtime_seconds = Column(Integer)
    gcode_path = Column(String)
    nesting_coordinates = Column(JSON)
    
    actual_start_time = Column(DateTime)
    actual_end_time = Column(DateTime)
    actual_start_time = Column(DateTime)
    actual_end_time = Column(DateTime)
    status = Column(String, default="QUEUED")
    
    # Phase 5: Engineer Agent (Granular Steps)
    # Steps: PRINTING -> WASHING -> CURING -> QC -> COMPLETED
    current_step = Column(String, default="PENDING") 
    steps_history = Column(JSON, default=[]) # Log of timestamped transitions
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    order = relationship("Order", back_populates="jobs")
    machine = relationship("Machine", back_populates="jobs")
    invoice = relationship("Invoice", back_populates="job", uselist=False)

class Invoice(Base):
    __tablename__ = "invoices"
    
    invoice_id = Column(String, primary_key=True, default=generate_uuid)
    job_id = Column(String, ForeignKey("dispatch_queue.job_id"))
    order_id = Column(String, ForeignKey("orders.order_id"))
    
    machine_runtime_cost = Column(DECIMAL(10, 2), nullable=False)
    material_cost = Column(DECIMAL(10, 2), nullable=False)
    labor_cost = Column(DECIMAL(10, 2), default=0.00) 
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    erp_reference_id = Column(String)
    
    job = relationship("DispatchQueue", back_populates="invoice")
    order = relationship("Order", back_populates="invoices")

class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default='operator') 
    created_at = Column(DateTime, default=datetime.utcnow)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    
    item_id = Column(String, primary_key=True, index=True)
    name = Column(String)
    material_type = Column(String) # e.g., PLA, STEEL, COOLANT
    quantity_on_hand = Column(Float, default=0.0)
    unit_cost = Column(Float, default=0.0)
    unit = Column(String) # kg, L, pcs

class MaterialTransaction(Base):
    __tablename__ = "material_transactions"
    
    transaction_id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, ForeignKey("inventory_items.item_id"))
    job_id = Column(String, ForeignKey("dispatch_queue.job_id"), nullable=True)
    quantity_change = Column(Float) # Negative for usage, Positive for restock
    timestamp = Column(DateTime, default=datetime.utcnow)

class Account(Base):
    __tablename__ = "accounts"
    
    account_id = Column(String, primary_key=True, default=generate_uuid)
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    balance = Column(DECIMAL(15, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    journal_lines = relationship("JournalLine", back_populates="account")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    entry_id = Column(String, primary_key=True, default=generate_uuid)
    description = Column(String)
    reference_type = Column(String) # INVOICE, PAYMENT
    reference_id = Column(String)
    entry_date = Column(DateTime, default=datetime.utcnow)
    posted_by = Column(String, default='SYSTEM')
    
    lines = relationship("JournalLine", back_populates="entry")

class JournalLine(Base):
    __tablename__ = "journal_lines"
    
    line_id = Column(String, primary_key=True, default=generate_uuid)
    entry_id = Column(String, ForeignKey("journal_entries.entry_id"))
    account_id = Column(String, ForeignKey("accounts.account_id"))
    debit = Column(DECIMAL(15, 2), default=0.00)
    credit = Column(DECIMAL(15, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("Account", back_populates="journal_lines")

class Part(Base):
    __tablename__ = "parts"
    
    part_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    file_path = Column(String) # Path to stored STL/STEP
    material = Column(String, default="PLA")
    manufacturing_process = Column(String, default="MJF")
    estimated_cost = Column(Float, default=0.0)
    preview_url = Column(String, nullable=True)
    
    # Phase 5: Suitability Analysis
    technical_score = Column(Float, default=0.0)
    economic_action = Column(String, default="Evaluate") # "Print", "Mold"
    
    # Phase 2: Detailed Analysis
    measurements = Column(JSON, default={}) # Volume, BBox, Area
    
    # Metadata for Categorization
    project_id = Column(String, nullable=True, index=True) # e.g. "AEBOCODE"
    source_path = Column(String, nullable=True) # Original path on user disk

    created_at = Column(DateTime(timezone=True), server_default=func.now())
