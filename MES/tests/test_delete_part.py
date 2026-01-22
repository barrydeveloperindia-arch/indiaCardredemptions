import requests
import os
import sys

BASE_URL = "http://localhost:8008/api/part-analysis"

def create_dummy_stl(filename="test_delete_v1.stl"):
    with open(filename, "w") as f:
        f.write("solid dummy\nendsolid dummy")
    return filename

def test_delete_flow():
    # 1. Create a dummy part
    filename = "test_delete_v1.stl"
    create_dummy_stl(filename)
    
    try:
        print(f"Uploading {filename}...")
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "model/stl")}
            response = requests.post(f"{BASE_URL}/analyze", files=files)
        
        if response.status_code != 200:
            print(f"Failed to upload part: {response.text}")
            sys.exit(1)
            
        print("Upload successful.")
        
        # 2. Get the part ID from the list
        print("Fetching parts list...")
        response = requests.get(f"{BASE_URL}/parts")
        parts = response.json()
        
        target_part = next((p for p in parts if p["name"] == filename), None)
        
        if not target_part:
            print("Uploaded part not found in catalog.")
            sys.exit(1)
            
        part_id = target_part["part_id"]
        print(f"Found part_id: {part_id}")
        
        # 3. Delete the part
        print(f"Deleting part {part_id}...")
        response = requests.delete(f"{BASE_URL}/parts/{part_id}")
        
        if response.status_code != 200:
            print(f"Failed to delete part: {response.text}")
            sys.exit(1)
            
        print("Delete successful.")
        
        # 4. Verify it's gone
        print("Verifying deletion...")
        response = requests.get(f"{BASE_URL}/parts")
        parts = response.json()
        
        deleted_part = next((p for p in parts if p["part_id"] == part_id), None)
        
        if deleted_part:
            print("Error: Part still exists in catalog after deletion.")
            sys.exit(1)
            
        print("Verification passed: Part successfully deleted.")
        
    finally:
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_delete_flow()
