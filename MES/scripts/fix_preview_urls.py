
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add src to path
sys.path.append(os.getcwd())

from src.database.models import Part
from src.database.connection import DATABASE_URL

# Connect to DB
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

def fix_preview_urls():
    print("Checking for missing preview URLs...")
    parts = db.query(Part).all()
    
    updated_count = 0
    
    for part in parts:
        # Normalize file path
        if not part.file_path:
            continue
            
        file_path = part.file_path.replace("\\", "/")
        
        # Determine expected SVG path
        # 1. Direct SVG (e.g. part.step -> part.step.svg)
        potential_svgs = [
            file_path + ".svg",
            os.path.splitext(file_path)[0] + ".stl.svg", # Converted STL
            os.path.splitext(file_path)[0] + ".svg"
        ]
        
        found_svg = None
        for svg_path in potential_svgs:
            # Check if file exists in local storage
            # Assuming script runs from root, and 'storage' is at ./storage
            if os.path.exists(svg_path):
                found_svg = svg_path
                break
                
        if found_svg:
            # Construct URL
            # The router expects /storage/...
            # file_path usually starts with "storage/..."
            
            # Ensure consistent URL format
            url_path = found_svg.replace("\\", "/")
            if not url_path.startswith("/"):
                url_path = "/" + url_path
                
            # If storage/ matches twice, fix it
            # But normally serving from root /storage
            
            # Check if we need to update
            if part.preview_url != url_path:
                print(f"Updating {part.name}: {part.preview_url} -> {url_path}")
                part.preview_url = url_path
                updated_count += 1
        else:
            # print(f"No SVG found for {part.name} ({file_path})")
            pass

    if updated_count > 0:
        db.commit()
        print(f"Successfully updated {updated_count} parts with preview URLs.")
    else:
        print("No updates needed.")

if __name__ == "__main__":
    fix_preview_urls()
