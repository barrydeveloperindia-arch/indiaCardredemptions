
import os
import sys
import re
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import shutil

# Add src to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.connection import get_db, Base, engine
from src.database.models import Part, Project, Contact, Invoice, Estimate
from src.database.models import generate_uuid

# Configuration
ONEDRIVE_ROOT = r"C:\Users\pc\Englabs India Pvt Ltd\Enquiries manager - 2025 ENQUIRIES"
ENQUIRIES_ROOT = os.path.join(ONEDRIVE_ROOT, "ENQUIRIES 2025")
COMMERCIAL_ROOT = os.path.join(ONEDRIVE_ROOT, r"FINANCE\SALES\2025")
MES_STORAGE_PARTS = os.path.abspath(os.path.join(os.path.dirname(__file__), "../storage/parts"))

# Regex Patterns
PROJECT_FOLDER_PATTERN = re.compile(r"(\d{2}-\d{2}-\d{4})\s+(EQ\d+)")
INVOICE_FILE_PATTERN = re.compile(r"INV[-_]?(\d+)", re.IGNORECASE)

class IngestionReport:
    def __init__(self):
        self.projects_found = 0
        self.clients_found = set()
        self.parts_found = 0
        self.invoices_found = 0
        self.matches_found = 0
        self.warnings = []

    def log(self, msg):
        print(f"[LOG] {msg}")
    
    def warn(self, msg):
        self.warnings.append(msg)
        print(f"[WARN] {msg}")

report = IngestionReport()

def normalize_client_name(name: str) -> str:
    """Normalize client names for matching."""
    clean = name.lower()
    clean = clean.replace("technologies", "").replace("pvt", "").replace("ltd", "").replace("private", "").replace("limited", "")
    return clean.strip()

def ensure_contact(db, name):
    """Get or create contact by name."""
    norm_name = name.strip()
    contact = db.query(Contact).filter(Contact.name == norm_name).first()
    if not contact:
        contact = Contact(name=norm_name, contact_type="CUSTOMER")
        db.add(contact)
        db.commit()
    return contact

def long_path(path):
    """Handle Windows long paths."""
    if os.name == 'nt':
        return "\\\\?\\" + os.path.abspath(path)
    return path

def scan_technical_projects(dry_run=True, db=None):
    """Pass 1: Scan ENQUIRIES 2025 for Projects and Parts."""
    report.log(f"Scanning Technical Projects in: {ENQUIRIES_ROOT}")
    
    if not os.path.exists(ENQUIRIES_ROOT):
        report.warn(f"Enquiries Root not found: {ENQUIRIES_ROOT}")
        return

    # Level 1: Clients
    for client_name in os.listdir(ENQUIRIES_ROOT):
        client_dir = os.path.join(ENQUIRIES_ROOT, client_name)
        if not os.path.isdir(client_dir):
            continue
            
        report.clients_found.add(client_name)
        
        # Level 2: Months (Skip or traverse?) - We can just walk the tree to find Project Folders
        for root, dirs, files in os.walk(client_dir):
            for dir_name in dirs:
                # Check if this is a Project Folder (Date + EQ)
                match = PROJECT_FOLDER_PATTERN.match(dir_name)
                if match:
                    date_str, project_code = match.groups()
                    try:
                        project_date = datetime.strptime(date_str, "%d-%m-%Y")
                    except ValueError:
                        continue # Skip invalid dates
                    
                    report.projects_found += 1
                    
                    # Logic for Dry Run vs Execute
                    if not dry_run and db:
                        # 1. Ensure Contact
                        contact = ensure_contact(db, client_name)
                        
                        # 2. Ensure Project
                        project = db.query(Project).filter(Project.project_id == project_code).first()
                        if not project:
                            project = Project(
                                project_id=project_code,
                                name=f"{client_name} - {date_str}",
                                start_date=project_date,
                                status="ACTIVE",
                                customer_id=contact.contact_id
                            )
                            db.add(project)
                            db.flush()
                        
                        # 3. Create Parts for Files
                        project_path = os.path.join(root, dir_name)
                        for p_root, _, p_files in os.walk(long_path(project_path)):
                            for file in p_files:
                                if file.lower().endswith(('.step', '.stp', '.stl', '.sldprt')):
                                    report.parts_found += 1
                                    
                                    # Copy to Storage
                                    safe_filename = f"{project_code}_{file}"
                                    dest_path = os.path.join(MES_STORAGE_PARTS, safe_filename)
                                    source_full_path = os.path.join(p_root, file)
                                    
                                    try:
                                        if not os.path.exists(dest_path):
                                            shutil.copy2(source_full_path, dest_path)
                                        
                                        # Create DB Record
                                        part = db.query(Part).filter(Part.name == file, Part.project_id == project.project_id).first()
                                        if not part:
                                            part = Part(
                                                name=file,
                                                project_id=project.project_id,
                                                client_id=contact.contact_id,
                                                file_path=f"storage/parts/{safe_filename}",
                                                source_path=source_full_path.replace("\\\\?\\", "") # Remove prefix for DB readability
                                            )
                                            db.add(part)
                                    except Exception as e:
                                        report.warn(f"Failed to process file {file}: {e}")
                                        continue
                        
                        # Commit every 5 projects so user sees progress
                        if report.projects_found % 5 == 0:
                            db.commit()
                            print(f"[PROGRESS] Committed {report.projects_found} projects...")
                    else:
                        # Dry Run counting
                        # Count potential parts lookup recursively
                        project_path = os.path.join(root, dir_name)
                        try:
                            count = 0
                            for p_root, _, p_files in os.walk(long_path(project_path)):
                                count += len([f for f in p_files if f.lower().endswith(('.step', '.stp', '.stl', '.sldprt'))])
                            report.parts_found += count
                        except:
                            pass
                        
                        print(f" [PROJ] Found {project_code} ({date_str}) for {client_name}")

    if not dry_run and db:
        db.commit()

def scan_commercial_records(dry_run=True, db=None):
    """Pass 2: Scan FINANCE/SALES for Invoices."""
    report.log(f"Scanning Commercial Records in: {COMMERCIAL_ROOT}")
    
    if not os.path.exists(COMMERCIAL_ROOT):
        report.warn(f"Commercial Root not found: {COMMERCIAL_ROOT}")
        return

    # Traverse Month -> Client -> Date
    for month in os.listdir(COMMERCIAL_ROOT):
        month_dir = os.path.join(COMMERCIAL_ROOT, month)
        if not os.path.isdir(month_dir): continue
        
        for client_name in os.listdir(month_dir):
            client_dir = os.path.join(month_dir, client_name)
            if not os.path.isdir(client_dir): continue
            
            for date_folder in os.listdir(client_dir):
                date_dir = os.path.join(client_dir, date_folder)
                if not os.path.isdir(date_dir): continue
                
                # We are at DATE level. Look for PDFs
                for file in os.listdir(date_dir):
                    if file.lower().endswith(".pdf") and "INV" in file.upper():
                        report.invoices_found += 1
                        
                        # Can we match this to a Technical Project?
                        # Heuristic: Match Client (Fuzzy) AND Date (Exact)
                        # In a real run, we would query the DB for Projects with start_date ~= invoice_date
                        
                        if dry_run:
                            print(f" [INV] Found {file} in {client_name} / {date_folder}")

def main():
    parser = argparse.ArgumentParser(description="Ingest Legacy Data from OneDrive")
    parser.add_argument("--execute", action="store_true", help="Run actual import (Default is Dry Run)")
    args = parser.parse_args()
    
    dry_run = not args.execute
    
    print(f"=== LEGACY DATA INGESTION (Mode: {'DRY RUN' if dry_run else 'EXECUTE'}) ===")
    
    if not dry_run:
        # Initialize DB
        if not os.path.exists(MES_STORAGE_PARTS):
            os.makedirs(MES_STORAGE_PARTS)
        Base.metadata.create_all(bind=engine)
        db = next(get_db())
    else:
        db = None
        
    try:
        scan_technical_projects(dry_run, db)
        print("-" * 30)
        scan_commercial_records(dry_run, db)
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
    finally:
        if db:
            db.close()
            
    print("\n=== REPORT ===")
    print(f"Projects Found: {report.projects_found}")
    print(f"Clients Found: {len(report.clients_found)}")
    print(f"Parts Found (Est): {report.parts_found}")
    print(f"Invoices Found: {report.invoices_found}")
    if report.warnings:
        print("\nWarnings:")
        for w in report.warnings:
            print(f"- {w}")

if __name__ == "__main__":
    main()
