import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure src is in path
sys.path.append(os.getcwd())

from src.database.models import Part
from src.database.connection import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def fix_data_paths():
    print("Starting comprehensive path fix for Parts...")
    parts = db.query(Part).all()
    print(f"Scanning {len(parts)} parts in DB.")
    
    updates = 0
    storage_prefix = "storage/parts/"
    
    # Index files in storage/parts for O(1) lookup
    print("Indexing storage/parts/...")
    file_map = {} 
    if os.path.exists("storage/parts"):
        for f in os.listdir("storage/parts"):
            file_map[f.lower()] = f"{storage_prefix}{f}"
            
    print(f"Indexed {len(file_map)} files.")
    
    for i, p in enumerate(parts):
        if i % 1000 == 0:
            print(f"Propagating fixes... {i}/{len(parts)}")

        if not p.file_path:
            continue
            
        # Get pure filename
        fname = os.path.basename(p.file_path.replace("\\", "/"))
        fname_lower = fname.lower()
        
        # 1. Fix File Path
        # If the file exists in storage/parts/ but p.file_path is just "foo.stp"
        # We update it to "storage/parts/foo.stp"
        if fname_lower in file_map:
             real_path = file_map[fname_lower]
             # If current path is different AND doesn't start with storage/
             if p.file_path != real_path and not p.file_path.replace("\\", "/").startswith("storage/"):
                 # print(f"Fixing path for {p.name}: {p.file_path} -> {real_path}")
                 p.file_path = real_path
                 updates += 1

        # 2. Fix Preview URL
        # Candidates for SVG
        candidates = [
            fname + ".svg",
            fname + ".stl.svg",
            fname + ".step.svg",
            fname + ".stp.svg",
            os.path.splitext(fname)[0] + ".svg",
            os.path.splitext(fname)[0] + ".stl.svg"
        ]
        
        found_url = None
        for c in candidates:
            if c.lower() in file_map:
                found_url = "/" + file_map[c.lower()]
                break
                
        if found_url:
            if p.preview_url != found_url:
                # print(f"Fixing preview for {p.name}: {found_url}")
                p.preview_url = found_url
                updates += 1
                
    db.commit()
    print(f"Done. Updated {updates} fields across database.")

if __name__ == "__main__":
    fix_data_paths()
