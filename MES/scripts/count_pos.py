from src.database.connection import SessionLocal
from src.database.models import Project, EmailMessage
from sqlalchemy import or_

db = SessionLocal()

# 1. Count Projects with linked POs
projects_with_po = db.query(Project).filter(Project.po_number.isnot(None), Project.po_number != "").all()
po_count_projects = len(projects_with_po)
total_value = sum(p.po_value for p in projects_with_po if p.po_value)

# 2. Count Emails classified as POs
po_emails = db.query(EmailMessage).filter(
    or_(EmailMessage.intent.ilike('%PO%'), EmailMessage.intent.ilike('%Purchase Order%'))
).all()
po_count_emails = len(po_emails)

print(f"--- PO Analysis Report ---")
print(f"Projects with Linked POs: {po_count_projects}")
print(f"Total PO Value (Linked):  {total_value:,.2f}")
print(f"Emails Classified as POs: {po_count_emails}")
print(f"\nRecent Linked POs:")
for p in sorted(projects_with_po, key=lambda x: x.start_date or x.created_at, reverse=True)[:10]:
    val = p.po_value if p.po_value else 0.0
    print(f" - {p.project_id}: {p.po_number} (Val: {val:,.2f})")

db.close()
