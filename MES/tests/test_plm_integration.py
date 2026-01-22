import requests
import os
import sys

# Define base URL
BASE_URL = "http://127.0.0.1:8008"

def create_dummy_stl(filename="test_part_integration.stl"):
    """Creates a minimal valid binary STL file."""
    # 80 bytes header + 4 bytes triangle count (0)
    with open(filename, "wb") as f:
        f.write(b'\0' * 80) # Header
        f.write((0).to_bytes(4, byteorder='little')) # 0 triangles
    return filename

def test_integration():
    filename = "test_part_integration.stl"
    create_dummy_stl(filename)
    
    try:
        print(f"[TEST] Uploading {filename} to PLM...")
        with open(filename, "rb") as f:
            files = {"file": (filename, f)}
            response = requests.post(f"{BASE_URL}/api/part-analysis/analyze", files=files)
        
        if response.status_code != 200:
            print(f"[FAIL] Upload failed with status {response.status_code}: {response.text}")
            return
            
        print("[PASS] Upload successful. Analysis received.")
        data = response.json()
        print(f"       Volume: {data.get('volume_cm3')}")
        print(f"       Status: {data.get('status')}")
        
        # Step 2: Check Catalog
        print("\n[TEST] Checking Part Catalog availability...")
        response = requests.get(f"{BASE_URL}/api/part-analysis/parts")
        
        if response.status_code != 200:
            print(f"[FAIL] Failed to fetch catalog: {response.status_code}")
            return
            
        parts = response.json()
        found = False
        for part in parts:
            if part['name'] == filename:
                found = True
                print(f"[PASS] Found {filename} in Catalog!")
                print(f"       Details: Material={part.get('material')}, Cost={part.get('estimated_cost')}")
                if 'measurements' in part:
                     print(f"       Measurements stored: {part['measurements']}")
                else:
                     print("       [WARN] Measurements column not returned in list (might need schema update or is hidden)")
                break
        
        if not found:
            print(f"[FAIL] {filename} was NOT found in the catalog list.")
            print(f"       Current catalog has {len(parts)} items.")

    except Exception as e:
        print(f"[ERROR] Test failed with exception: {e}")
    finally:
        # Cleanup
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_integration()
