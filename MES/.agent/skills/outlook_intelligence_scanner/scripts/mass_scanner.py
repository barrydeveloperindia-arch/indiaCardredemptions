import sys
import os
import time
import math

# Add root to python path to allow imports
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, "../../../../")) # Go up from .agent/skills/outlook.../scripts
sys.path.append(root_dir)

from src.database.connection import SessionLocal
from src.database.models import Contact

# Import the scanner function logic
# We need to add the script dir to path to import sibling 'scanner.py' via simple import if running from here
sys.path.append(current_dir)
try:
    from scanner import search_emails
except ImportError:
    # Try relative if failed (structurally tricky depending on run context)
    from .scanner import search_emails

def get_clients():
    db = SessionLocal()
    try:
        # Get all customers
        contacts = db.query(Contact).filter(Contact.contact_type == 'CUSTOMER').all()
        names = [c.name for c in contacts]
        return names
    finally:
        db.close()

def run_mass_scan():
    all_clients = get_clients()
    
    # Exclude already scanned
    exclusions = ["Hella", "Sonalika", "Henkel", "Hella India Lighting", "Hella India", "Sonalika Tractors", "Henkel Adhesives"]
    # Normalize for filtering
    targets = []
    for c in all_clients:
        is_excluded = False
        for ex in exclusions:
            if ex.lower() in c.lower():
                is_excluded = True
                break
        if not is_excluded:
            targets.append(c)
            
    # Remove duplicates
    targets = list(set(targets))
    
    print(f"Total Targets found: {len(targets)}")
    
    # Batch size 5
    batch_size = 5
    total_batches = math.ceil(len(targets) / batch_size)
    
    print(f"Starting Scan for {len(targets)} clients in {total_batches} batches...")
    
    for i in range(total_batches):
        batch = targets[i*batch_size : (i+1)*batch_size]
        print(f"\n--- Processing Batch {i+1}/{total_batches} ---")
        print(f"Clients: {', '.join(batch)}")
        
        for client in batch:
            try:
                print(f"Scanning: {client}")
                # Use limit=50 for standard historical check
                search_emails(client, limit=50)
                # Sleep briefly to avoid total rate limit hammer
                time.sleep(2) 
            except Exception as e:
                print(f"Error scanning {client}: {e}")
        
        print(f"--- Batch {i+1} Complete ---\n")
        # Sleep between batches
        time.sleep(5)

    print("✅ All Client Scans Finished.")

if __name__ == "__main__":
    run_mass_scan()
