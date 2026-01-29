import os
import sys

# Ensure src is importable (running from /app/src or /app)
sys.path.append(os.getcwd())

from src.database.connection import SessionLocal
from src.database.models import Part
from src.part_analysis.conversion_worker import ConversionWorker

def generate_missing():
    db = SessionLocal()
    # Filter for parts with no preview
    parts = db.query(Part).filter(Part.preview_url == None).all()
    import random
    random.shuffle(parts)
    print(f"Found {len(parts)} parts missing previews. Shuffled processing order.", flush=True)
    
    count = 0
    # Process a large batch to cover remaining items
    BATCH_SIZE = 5000
    
    for p in parts[:BATCH_SIZE]: 
        if not p.file_path: continue
        
        fpath = p.file_path.replace("\\", "/")
        
        # Ensure path is relative to /app if it starts with storage/
        # os.path.exists checks CWD (/app) + path.
        if not os.path.exists(fpath):
            print(f"Skipping {p.name}: File not found at {fpath}")
            continue
            
        print(f"Generating for {p.name}...")
        thumb = None
        try:
            lower = fpath.lower()
            if lower.endswith(".stl"):
                thumb = ConversionWorker.generate_thumbnail_stl(fpath)
            elif lower.endswith(('.step', '.stp', '.sldprt')):
                thumb = ConversionWorker.generate_thumbnail(fpath)
                
            if thumb:
                # Ensure URL format
                # thumb is likely "storage/parts/foo.svg"
                url_path = thumb.replace("\\", "/")
                if not url_path.startswith("/"):
                    url_path = "/" + url_path
                    
                p.preview_url = url_path
                count += 1
                print(f"Success -> {url_path}")
                # Commit incrementally to save progress
                db.commit() 
            else:
                print(f"Generation returned None for {p.name}")
                
        except Exception as e:
            print(f"Error processing {p.name}: {e}")

    print(f"Batch complete. generated {count} thumbnails.")

if __name__ == "__main__":
    generate_missing()
