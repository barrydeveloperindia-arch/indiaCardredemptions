
import os
import sys
import requests
import time
from pathlib import Path

# Config
API_URL = "http://localhost:8000/api/part-analysis/analyze"
EXTENSIONS = {".step", ".stp", ".sldprt", ".stl"}

def upload_folder(folder_path):
    folder = Path(folder_path)
    if not folder.exists():
        print(f"Error: Folder not found: {folder_path}")
        return

    print(f"--- Bulk Uploader ---")
    print(f"Target: {folder}")
    print(f"Extensions: {EXTENSIONS}")
    
    files = [f for f in folder.glob("**/*") if f.suffix.lower() in EXTENSIONS]
    print(f"Found {len(files)} files to upload.")
    
    success_count = 0
    fail_count = 0
    
    for i, file_path in enumerate(files):
        print(f"[{i+1}/{len(files)}] Uploading {file_path.name}...", end=" ", flush=True)
        
        # Metadata Extraction
        # Heuristic: Extract parent folder name as Project ID if it looks like a project code
        # User defined: "AEBOCODE" from path ".../AEBOCODE/..."
        # We can just take the parent folder name of the file, or walk up until we find a likely project ID.
        # Simple approach: Relative path from root folder
        
        project_id = file_path.parent.name
        # If file is nested deep, maybe take the top-level folder inside the target folder
        try:
            rel = file_path.relative_to(folder)
            if len(rel.parts) > 1:
                project_id = rel.parts[0] # The top-level folder name inside the scanned dir
            else:
                project_id = folder.name # The scanned dir itself
        except:
             project_id = folder.name

        try:
            with open(file_path, "rb") as f:
                # Send as form data
                response = requests.post(
                    API_URL, 
                    files={"file": f},
                    data={"project_id": project_id, "source_path": str(file_path)}
                )
                
            if response.status_code == 200:
                print("SUCCESS [OK]")
                success_count += 1
                # Optional: print volume to confirm analysis
                data = response.json()
                print(f"   -> Vol: {data.get('volume_cm3')} cm3, Cost: {data.get('quote', {}).get('total_price')}")
            else:
                print(f"FAILED [X] ({response.status_code})")
                print(f"   -> {response.text}")
                fail_count += 1
        except Exception as e:
            print(f"ERROR: {e}")
            fail_count += 1
            
        time.sleep(0.5) # Slight delay to avoid hammering server
        
    print("-" * 30)
    print(f"Completed. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python bulk_uploader_cli.py <folder_path>")
        print("Example: python bulk_uploader_cli.py \"C:/MyParts\"")
        
        # Hardcoded fallback for user convenience as requested
        default_path = r"C:\Users\pc\Englabs India Pvt Ltd\Enquiries manager - 2025 ENQUIRIES\ENQUIRIES 2025"
        print(f"No path argument provided. Using default: {default_path}")
        inp = input("Press Enter to proceed with default, or type path: ")
        if inp.strip():
            upload_folder(inp.strip())
        else:
            upload_folder(default_path)
    else:
        upload_folder(sys.argv[1])
