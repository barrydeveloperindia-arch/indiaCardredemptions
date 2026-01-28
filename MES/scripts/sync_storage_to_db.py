import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add parent dir to path to import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.database.connection import SessionLocal
from src.database import models

STORAGE_PARTS_DIR = "/app/storage/parts"  # Docker path

def sync_storage():
    print(f"--- Syncing Storage from {STORAGE_PARTS_DIR} to DB ---")
    if not os.path.exists(STORAGE_PARTS_DIR):
        print(f"Directory {STORAGE_PARTS_DIR} does not exist.")
        return

    db = SessionLocal()
    files = os.listdir(STORAGE_PARTS_DIR)
    print(f"Found {len(files)} files in storage.")

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
                status="pending_analysis"
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
