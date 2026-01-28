
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.models import Part
from src.part_analysis.conversion_worker import ConversionWorker
from src.database.connection import DATABASE_URL

# Setup DB Connection
# DATABASE_URL = "postgresql://postgres:password@localhost:5432/mes" # Local
# But inside Docker it is different. We will run this script INSIDE Docker or using Local mapping if port is open.
# The user usually runs scripts relative to project root.
# If I run from host, I need 'localhost' port.
# If I run inside docker, I can use internal.

def generate_missing_previews():
    # Detect environment
    db_url = DATABASE_URL
    if "db" in db_url: # basic check if it's internal docker dns
        # If running from host, we might need to change to localhost if port 5432 is exposed
        # But DATABASE_URL in src/database/connection.py might probably use env var.
        pass

    engine = create_engine(db_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    parts = db.query(Part).all()
    print(f"Checking {len(parts)} parts for missing previews...")

    for part in parts:
        # Generate for all STLs to update style
        needs_update = True
        # if not part.preview_url or "placehold.co" in part.preview_url:
        #    needs_update = True
        
        if needs_update and part.file_path:
            # Determine target STL path
            # If part is STL, use it. If not (e.g. SLDPRT), check if there is a converted file.
            # ConversionWorker usually saves it as {filename}.stl (append) or replace extension?
            # ConversionWorker.convert_to_stl logic: base + ".stl"
            
            original_path = part.file_path
            
            # Resolve absolute path for inspection
            real_path = original_path
            if not os.path.exists(real_path):
                if os.path.exists(f"/app/{real_path}"):
                    real_path = f"/app/{real_path}"
                elif os.path.exists(os.path.join(os.getcwd(), real_path)):
                     real_path = os.path.join(os.getcwd(), real_path)
            
            # Priority 1: Check for existing SVG (Original STEP/CAD preview)
            # ConversionWorker generates 'file.step.svg' (appended), not 'file.svg' (replaced)
            svg_candidates = [
                real_path + ".svg",                      # e.g. part.step.svg
                os.path.splitext(real_path)[0] + ".svg"  # e.g. part.svg (legacy?)
            ]
            
            restored_svg = False
            for svg_candidate in svg_candidates:
                if os.path.exists(svg_candidate):
                     # Found the original SVG! Restore it.
                     web_path = svg_candidate
                     if web_path.startswith("/app/"):
                        web_path = web_path.replace("/app/", "/")
                     elif "storage/" in web_path:
                        idx = web_path.find("storage/")
                        web_path = "/" + web_path[idx:]
                     
                     print(f"Restoring refined CAD preview for {part.name} -> {web_path}")
                     part.preview_url = web_path
                     db.add(part)
                     db.commit()
                     restored_svg = True
                     break
            
            if restored_svg:
                continue

            # Priority 2: Generate STL Preview (Only if no SVG exists)
            # Identify the STL to generate/use thumbnail from
            target_stl_path = None
            if real_path.lower().endswith('.stl'):
                target_stl_path = real_path
            else:
                # Check for derived STL
                base, ext = os.path.splitext(real_path)
                candidate = base + ".stl"
                if os.path.exists(candidate):
                    target_stl_path = candidate

            if target_stl_path and os.path.exists(target_stl_path):
                print(f"Generating fallback preview for {part.name} using {target_stl_path}...")
                
                thumb_path = ConversionWorker.generate_thumbnail_stl(target_stl_path)
                if thumb_path:
                    # thumb_path will be e.g. /app/storage/parts/foo.stl.png
                    
                    # Normalize thumb_path to web static url
                    web_path = thumb_path
                    if web_path.startswith("/app/"):
                        web_path = web_path.replace("/app/", "/")
                    elif "storage/" in web_path:
                        # Find where storage starts
                        idx = web_path.find("storage/")
                        web_path = "/" + web_path[idx:]
                    
                    part.preview_url = web_path
                    db.add(part)
                    db.commit()
                    print(f"Updated {part.name} -> {web_path}")
                else:
                    print(f"Failed to generate for {target_stl_path}")
            else:
                print(f"No STL found for {part.name} ({real_path})")

    print("Done.")

if __name__ == "__main__":
    generate_missing_previews()
