import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add parent dir to path to import src
# File is at /app/src/sync_storage.py. Parent of src is /app.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.database.connection import SessionLocal
from src.database import models

STORAGE_PARTS_DIR = "/app/storage/parts"  # Docker path

def sync_storage():
    print(f"--- Syncing Storage from {STORAGE_PARTS_DIR} to DB ---")
    if not os.path.exists(STORAGE_PARTS_DIR):
        print(f"Directory {STORAGE_PARTS_DIR} does not exist.")
        return

    db = SessionLocal()
    if os.path.exists(STORAGE_PARTS_DIR):
        files = os.listdir(STORAGE_PARTS_DIR)
        print(f"Found {len(files)} files in storage.")
    else:
        files = []

    count = 0
    for filename in files:
        if not (filename.lower().endswith('.stl') or filename.lower().endswith('.step') or filename.lower().endswith('.stp')):
            continue

        # Check if exists
        existing = db.query(models.Part).filter(models.Part.name == filename).first()
        if not existing:
            part = models.Part(
                part_id=str(uuid.uuid4()),
                name=filename,
                file_path=f"storage/parts/{filename}",
                material="Unknown",
                # status="pending_analysis", # Removed invalid field
                manufacturing_process="MJF",
                measurements={},
                source_path="storage_sync"
            )
            db.add(part)
            count += 1
            if count % 50 == 0:
                print(f"Added {count} parts...")
                db.commit()
    
    db.commit()
    print(f"Successfully added {count} new parts from storage to database.")
    db.close()

if __name__ == "__main__":
    sync_storage()
