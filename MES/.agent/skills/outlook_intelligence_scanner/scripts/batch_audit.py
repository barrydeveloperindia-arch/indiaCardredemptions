import sys
import os
import time

# Add root to python path
sys.path.append(os.getcwd())

from src.database.connection import SessionLocal
from src.database.models import Project
# Add current script directory to path for sibling imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scanner import search_emails

def run_batch_audit(limit=50):
    print(f"Starting Batch Audit for last {limit} projects...")
    
    db = SessionLocal()
    try:
        # Get latest projects regardless of PO status (Force Audit)
        projects = db.query(Project)\
            .order_by(Project.project_id.desc())\
            .limit(limit)\
            .all()
            
        print(f"Found {len(projects)} pending projects.")
        
        for p in projects:
            print(f"\nAudit: {p.project_id} ({p.name})")
            
            # Search Query: ID OR Customer Name (to catch emails that mention project but maybe typo ID)
            # Actually, let's stick to ID for precision first.
            query = f"{p.project_id}"
            
            # Clean Customer Name for search? 
            # customer = p.name.split('(')[-1].replace(')', '').strip()
            # if customer and customer != "Unknown":
            #    query += f" OR \"{customer}\""
            
            search_emails(query)
            
            # Rate limit compliance (Graph API is generous but let's be safe)
            time.sleep(1)
            
    finally:
        db.close()

if __name__ == "__main__":
    count = 50
    if len(sys.argv) > 1:
        count = int(sys.argv[1])
    run_batch_audit(count)
