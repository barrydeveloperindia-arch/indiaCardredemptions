from datetime import datetime, timedelta
from src.database.connection import SessionLocal
from src.database.models import Project, EmailMessage, DispatchQueue, Order, Machine
import uuid

def generate_uuid():
    return str(uuid.uuid4())

db = SessionLocal()

# 0. Create Contact
from src.database.models import Contact
contact_id = "Test Client"
contact = db.query(Contact).filter(Contact.contact_id == contact_id).first()
if not contact:
    contact = Contact(
        contact_id=contact_id,
        name="Test Client Corp",
        contact_type="CUSTOMER",
        email="test@example.com"
    )
    db.add(contact)
    db.commit()
    print("Created Contact")

# 1. Create/Update Project
eq_id = "EQ-TEST-MES"
project = db.query(Project).filter(Project.project_id == eq_id).first()
if not project:
    project = Project(
        project_id=eq_id,
        name="Test Sample for MES Production",
        customer_id="Test Client", # Changed from client_id
        status="ACTIVE",
        start_date=datetime.utcnow(),
        description="Test sample project from email integration.",
        po_number="PO-99999",
        po_value=5000.00
    )
    db.add(project)
    print(f"Created Project {eq_id}")
else:
    project.po_number = "PO-99999"
    project.po_value = 5000.00
    print(f"Updated Project {eq_id}")

db.commit()

# 2. Create Email Log
subject = "Test Sample for MES"
email = db.query(EmailMessage).filter(EmailMessage.subject == subject).first()
if not email:
    email = EmailMessage(
        id="TEST-MSG-ID-" + generate_uuid()[:8],
        subject=subject,
        sender_name="Test Client User",
        sender_email="test.client@example.com",
        received_at=datetime.utcnow(),
        body_preview="Please proceed with the test sample manufacturing for MES verification. Attached drawings.",
        has_attachments=True,
        intent="PO_Received",
        project_id=eq_id
    )
    db.add(email)
    print("Created Email Log")
else:
    print("Email Log already exists")

db.commit()

# 3. Create Machine (if none)
machine = db.query(Machine).first()
if not machine:
    machine = Machine(
        machine_id="MACH-001",
        name="CNC Mill 1",
        capabilities=["Milling"],
        current_status="IDLE" # Changed from status
    )
    db.add(machine)
    db.commit()
    print("Created Default Machine")

# 4. Create Order
order = db.query(Order).filter(Order.cad_file_path == "test_sample.step").first()
if not order:
    order = Order(
        order_id="ORD-" + generate_uuid()[:8],
        customer_id=contact_id, # Link to Contact
        priority_level=2,
        cad_file_path="test_sample.step",
        technical_requirements={"material": "Aluminium 6061"},
        status="PENDING"
    )
    db.add(order)
    db.commit()
    print("Created Order")

# 5. Create Agile Scheduler Job (DispatchQueue)
job = db.query(DispatchQueue).filter(DispatchQueue.order_id == order.order_id).first()
if not job:
    job = DispatchQueue(
        job_id="JOB-" + generate_uuid()[:8],
        order_id=order.order_id,
        machine_id=machine.machine_id,
        planned_start_time=datetime.utcnow() + timedelta(hours=2),
        estimated_runtime_seconds=3600,
        status="QUEUED"
    )
    db.add(job)
    print("Created Dispatch Job")
else:
    print("Dispatch Job already exists")

db.commit()
db.close()
