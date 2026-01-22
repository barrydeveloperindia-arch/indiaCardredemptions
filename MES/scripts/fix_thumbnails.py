
import sys
import os

sys.path.append("/app")
from src.database.connection import SessionLocal
from src.database.models import Part

def fix_preview_urls():
    db = SessionLocal()
    parts = db.query(Part).all()
    
    count = 0
    for part in parts:
        if part.preview_url and "/storage/storage/" in part.preview_url:
            print(f"Fixing {part.name}: {part.preview_url}")
            part.preview_url = part.preview_url.replace("/storage/storage/", "/storage/")
            count += 1
            
    db.commit()
    print(f"Fixed {count} parts.")

if __name__ == "__main__":
    fix_preview_urls()
