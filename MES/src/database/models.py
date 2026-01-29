
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
    customer_id = Column(String, ForeignKey("contacts.contact_id"), nullable=True) # Linked to Contact
    priority_level = Column(Integer, default=1)
    cad_file_path = Column(String, nullable=False)
    technical_requirements = Column(JSON, nullable=False)
    status = Column(String, default="PENDING")
    received_at = Column(DateTime, default=datetime.utcnow)
    estimated_delivery = Column(DateTime)
    
    jobs = relationship("DispatchQueue", back_populates="order")
    invoices = relationship("Invoice", back_populates="order")
    customer = relationship("Contact", back_populates="orders")

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
    job_id = Column(String, ForeignKey("dispatch_queue.job_id"), nullable=True)
    order_id = Column(String, ForeignKey("orders.order_id"), nullable=True)
    contact_id = Column(String, ForeignKey("contacts.contact_id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=True)
    
    machine_runtime_cost = Column(DECIMAL(10, 2), nullable=False)
    material_cost = Column(DECIMAL(10, 2), nullable=False)
    labor_cost = Column(DECIMAL(10, 2), default=0.00) 
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    erp_reference_id = Column(String)
    
    job = relationship("DispatchQueue", back_populates="invoice")
    order = relationship("Order", back_populates="invoices")
    contact = relationship("Contact", back_populates="invoices_rel")
    project = relationship("Project", back_populates="invoices_rel")

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
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=True, index=True) # e.g. "AEBOCODE"
    client_id = Column(String, ForeignKey("contacts.contact_id"), nullable=True) 
    source_path = Column(String, nullable=True) # Original path on user disk

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship("Project", back_populates="parts")
    client = relationship("Contact")

# --- ZOHO BOOKS PARITY MODELS ---

class Contact(Base):
    """
    Represents a Customer or Vendor (Zoho 'Contacts').
    Replaces the simple 'client_id' string in many places.
    """
    __tablename__ = "contacts"
    
    contact_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, index=True) # e.g. "Aebocode Technologies"
    contact_type = Column(String, default="CUSTOMER") # CUSTOMER, VENDOR
    email = Column(String)
    phone = Column(String)
    
    # Address
    billing_address = Column(JSON)
    shipping_address = Column(JSON)
    
    # Financials
    currency_code = Column(String, default="INR")
    gstin = Column(String)
    pan = Column(String)
    
    # Portal
    portal_enabled = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="customer")
    estimates = relationship("Estimate", back_populates="contact")
    invoices_rel = relationship("Invoice", back_populates="contact")


class Project(Base):
    """
    Dedicated Project entity to store metadata (ingested from Folders).
    """
    __tablename__ = "projects"
    
    project_id = Column(String, primary_key=True) # Manual ID like "C4805", "P-101"
    name = Column(String)
    description = Column(String)
    status = Column(String, default="ACTIVE") # ACTIVE, ARCHIVED, COMPLETED
    
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
    # Financials (New 2026)
    quote_value = Column(Float, default=0.0)
    po_value = Column(Float, default=0.0)
    po_number = Column(String, nullable=True)
    
    # Linkage
    customer_id = Column(String, ForeignKey("contacts.contact_id"), nullable=True)
    
    parts = relationship("Part", back_populates="project")
    estimates = relationship("Estimate", back_populates="project")
    invoices_rel = relationship("Invoice", back_populates="project")


class Estimate(Base):
    """
    Represents a Quote/Proposal (Zoho 'Estimates').
    """
    __tablename__ = "estimates"
    
    estimate_id = Column(String, primary_key=True, default=generate_uuid)
    estimate_number = Column(String, unique=True) # e.g. "EST-001"
    contact_id = Column(String, ForeignKey("contacts.contact_id"))
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=True)
    
    status = Column(String, default="DRAFT") # DRAFT, SENT, ACCEPTED, INVOICED, DECLINED
    total_amount = Column(DECIMAL(15, 2), default=0.00)
    
    estimate_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime)
    
    items = Column(JSON) # Snapshot of line items
    terms_conditions = Column(String)
    
    contact = relationship("Contact", back_populates="estimates")
    project = relationship("Project", back_populates="estimates")


class Expense(Base):
    """
    Represents a Purchase/Expense (Zoho 'Expenses').
    """
    __tablename__ = "expenses"
    
    expense_id = Column(String, primary_key=True, default=generate_uuid)
    date = Column(DateTime, default=datetime.utcnow)
    category = Column(String) # Travel, Material, Meals
    amount = Column(DECIMAL(15, 2), nullable=False)
    description = Column(String)
    
    vendor_id = Column(String, ForeignKey("contacts.contact_id"), nullable=True)
    reference_number = Column(String) # Receipt #
    receipt_path = Column(String) # Path to uploaded receipt
    
    is_billable = Column(Boolean, default=False)
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=True)


class BankAccount(Base):
    """
    Represents a physical bank account for Reconciliation.
    """
    __tablename__ = "bank_accounts"
    
    account_id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String) # "HDFC Primary"
    account_number = Column(String)
    bank_name = Column(String)
    currency = Column(String, default="INR")
    current_balance = Column(DECIMAL(15, 2), default=0.00)


class BankTransaction(Base):
    """
    Raw transactions imported from Bank Statements (CSV/OFX).
    """
    __tablename__ = "bank_transactions"
    
    txn_id = Column(String, primary_key=True, default=generate_uuid)
    account_id = Column(String, ForeignKey("bank_accounts.account_id"))
    
    date = Column(DateTime)
    description = Column(String)
    amount = Column(DECIMAL(15, 2)) # +Deposit, -Withdrawal
    status = Column(String, default="UNCATEGORIZED") # UNCATEGORIZED, MATCHED
    
    # Matched against internal entity
    matched_entry_id = Column(String, nullable=True) # ID of Payment/Expense matches

class EmailMessage(Base):
    """
    Log of scanned emails from Outlook Intelligence.
    """
    __tablename__ = "email_messages"
    
    id = Column(String, primary_key=True) # Microsoft Graph ID
    subject = Column(String)
    sender_name = Column(String)
    sender_email = Column(String)
    received_at = Column(DateTime)
    body_preview = Column(String)
    has_attachments = Column(Boolean, default=False)
    
    # AI Analysis
    intent = Column(String) # Enquiry, PO, Payment, Other
    
    # Linkage
    project_id = Column(String, ForeignKey("projects.project_id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
