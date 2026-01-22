import requests
import os
import time

# Configuration
API_URL = "http://localhost:8008"
TEST_FILE_NAME = "test_persistence_cube.stl"

def create_dummy_stl(filename):
    with open(filename, "w") as f:
        f.write("solid cube\n")
        f.write("facet normal 0 0 0\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\n")
        f.write("endsolid cube\n")
    return filename

def test_upload_persistence():
    print(f"Creating test file: {TEST_FILE_NAME}")
    create_dummy_stl(TEST_FILE_NAME)
    
    try:
        # 1. Upload File
        print(f"\n[1] Uploading {TEST_FILE_NAME} to {API_URL}/api/part-analysis/analyze...")
        with open(TEST_FILE_NAME, "rb") as f:
            files = {"file": (TEST_FILE_NAME, f)}
            res = requests.post(f"{API_URL}/api/part-analysis/analyze", files=files)
        
        if res.status_code != 200:
            print(f"FAIL: Upload failed with {res.status_code}: {res.text}")
            return
            
        print("PASS: Upload successful. Response:")
        print(res.json())
        
        # 2. Check Persistence (List Parts)
        print(f"\n[2] Checking Catalog at {API_URL}/api/part-analysis/parts...")
        time.sleep(1) # Give DB a moment
        res_list = requests.get(f"{API_URL}/api/part-analysis/parts")
        
        if res_list.status_code != 200:
            print(f"FAIL: List parts failed with {res_list.status_code}")
            return
            
        parts = res_list.json()
        print(f"Catalog contains {len(parts)} parts.")
        
        found = False
        for p in parts:
            if p["name"] == TEST_FILE_NAME:
                found = True
                print("\n[VERIFIED] Found uploaded part in catalog:")
                print(p)
                if not p.get("measurements"):
                    print("WARNING: Measurements field is empty!")
                else:
                    print("Measurements:", p.get("measurements"))
                break
        
        if not found:
            print("FAIL: Uploaded part NOT found in catalog list.")
        else:
            print("PASS: Persistence verified.")
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if os.path.exists(TEST_FILE_NAME):
            os.remove(TEST_FILE_NAME)

if __name__ == "__main__":
    test_upload_persistence()
