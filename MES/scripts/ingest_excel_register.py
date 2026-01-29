
import os
import sys
import pandas as pd
from datetime import datetime
import re

# Add src to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.connection import get_db, Base, engine
from src.database.models import Project, Contact
from sqlalchemy.orm import Session

REGISTER_PATH = r"C:\Users\pc\Englabs India Pvt Ltd\Enquiries manager - 2025 ENQUIRIES\ENQUIRIES REGISTER_SA UPDATED - 13-11.xlsx"

def normalize_status(status_str):
    if not isinstance(status_str, str):
        return "ACTIVE"
    s = status_str.upper().strip()
    if "CLOSE" in s or "CONTRACT" in s:
        return "COMPLETED"
    if "REGRET" in s or "LOST" in s:
        return "ARCHIVED"
    return "ACTIVE"

def ingest_master_list():
    print("=== READING MASTER REGISTER ===")
    try:
        df = pd.read_excel(REGISTER_PATH, sheet_name="MASTER LIST")
        print(f"Loaded {len(df)} rows from Excel.")
    except Exception as e:
        print(f"Failed to read Excel: {e}")
        return

    # Database Session
    db = next(get_db())

    # Cache for contacts to avoid repeated DB lookups
    contacts_cache = {}

    stats = {"projects": 0, "contacts": 0, "skipped": 0}

    for index, row in df.iterrows():
        try:
            # 1. Extract Key Fields
            eq_no = str(row.get('EQ NO', '')).strip()
            description = str(row.get('DESCRIPTION', '')).strip()
            client_name = str(row.get(' FROM', '')).strip()
            date_val = row.get('DATE')
            status_raw = str(row.get('STATUS', ''))
            
            # Validation
            if not eq_no or eq_no.lower() == 'nan' or not client_name or client_name.lower() == 'nan':
                stats['skipped'] += 1
                continue

            # Date Handling
            if isinstance(date_val, datetime):
                start_date = date_val
            elif isinstance(date_val, str):
                try:
                    start_date = datetime.strptime(date_val, "%Y-%m-%d")
                except:
                    pass
            
            # 1.1 Fix Future Dates (Data Entry Error: 2052 -> 2025)
            if start_date.year > datetime.now().year + 1:
                # Heuristic: If date is very far in future (e.g. 2052), assume typo for 2025
                if start_date.year == 2052:
                    start_date = start_date.replace(year=2025)
                else:
                    # Fallback for other errant dates
                    start_date = start_date.replace(year=datetime.now().year)
            
            # 2. Handle Contact (Client)
            if client_name not in contacts_cache:
                # Check DB
                contact = db.query(Contact).filter(Contact.name == client_name).first()
                if not contact:
                    contact = Contact(name=client_name, contact_type="CUSTOMER")
                    db.add(contact)
                    db.flush() # Get ID
                    stats['contacts'] += 1
                    # print(f" [NEW CLIENT] {client_name}")
                contacts_cache[client_name] = contact.contact_id
            
            client_id = contacts_cache[client_name]

            # 3. Handle Project
            # Check if project exists
            project = db.query(Project).filter(Project.project_id == eq_no).first()
            if not project:
                project = Project(
                    project_id=eq_no,
                    name=description if description and description.lower() != 'nan' else eq_no,
                    start_date=start_date,
                    status=normalize_status(status_raw),
                    customer_id=client_id,
                    description=f"Imported from Master Register. Status: {status_raw}"
                )
                db.add(project)
                stats['projects'] += 1
                
                if stats['projects'] % 50 == 0:
                    print(f" [PROGRESS] Imported {stats['projects']} projects...")
                    db.commit() # Periodic commit

        except Exception as e:
            db.rollback()
            # print(f"Error processing row {index}: {e}")
            continue

    try:
        db.commit()
    except Exception as e:
        print(f"Final commit failed: {e}")
    print("\n=== IMPORT COMPLETE ===")
    print(f"Projects Created: {stats['projects']}")
    print(f"Contacts Created: {stats['contacts']}")

if __name__ == "__main__":
    ingest_master_list()
