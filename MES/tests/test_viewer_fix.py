import requests
import os
import sys
import time

BASE_URL = "http://localhost:8008/api/part-analysis"
STORAGE_URL = "http://localhost:8008/storage/parts"

def create_dummy_step(filename="test_part.step"):
    with open(filename, "w") as f:
        f.write("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;")
    return filename

def test_viewer_flow():
    # 1. Create a dummy STEP file
    filename = "test_part.step"
    create_dummy_step(filename)
    
    try:
        print(f"Uploading {filename}...")
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "application/step")}
            response = requests.post(f"{BASE_URL}/analyze", files=files)
        
        if response.status_code != 200:
            print(f"Failed to upload part: {response.text}")
            sys.exit(1)
            
        print("Upload successful. Backend should have triggered conversion.")
        
        # 2. Check if the converted STL exists
        stl_filename = filename.replace(".step", ".stl")
        stl_url = f"{STORAGE_URL}/{stl_filename}"
        
        print(f"Checking for converted file at: {stl_url}")
        
        # Retry a few times as conversion might be async (though simulated sync in this codebase)
        found = False
        for _ in range(3):
            res = requests.head(stl_url)
            if res.status_code == 200:
                found = True
                break
            time.sleep(1)
            
        if not found:
            print("Error: Converted STL file not found on server.")
            sys.exit(1)
            
        print("Success: Converted STL is accessible.")
        
        # Clean up
        print("Cleaning up...")
        # Get ID to delete
        parts = requests.get(f"{BASE_URL}/parts").json()
        target = next((p for p in parts if p["name"] == filename), None)
        if target:
            requests.delete(f"{BASE_URL}/parts/{target['part_id']}")
            
    finally:
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_viewer_flow()
