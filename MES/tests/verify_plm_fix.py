import requests
import os

BASE_URL = "http://localhost:8008"
FILE_PATH = "tests/test_cube.stl"

def test_upload_and_verify():
    print("--- Testing PLM Analysis Upload ---")
    
    # 1. Upload
    with open(FILE_PATH, 'rb') as f:
        files = {'file': (os.path.basename(FILE_PATH), f, 'application/octet-stream')}
        data = {'manufacturing_process': 'SLA'}
        
        try:
            res = requests.post(f"{BASE_URL}/api/part-analysis/analyze", files=files, data=data)
            print(f"Upload Status: {res.status_code}")
            if res.status_code != 200:
                print(f"Upload Response: {res.text}")
                return
        except Exception as e:
            print(f"Upload Failed: {e}")
            return

    # 2. Verify in Catalog
    try:
        res = requests.get(f"{BASE_URL}/api/part-analysis/parts")
        parts = res.json()
        
        found = False
        for p in parts:
            if p['name'] == os.path.basename(FILE_PATH):
                print(f"Part Found: {p['name']}")
                print(f"Process: {p.get('manufacturing_process')}")
                if p.get('manufacturing_process') == 'SLA':
                    print("SUCCESS: Manufacturing Process Correct.")
                else:
                    print("FAIL: Manufacturing Process mismatch.")
                found = True
                break
        
        if not found:
            print("FAIL: Part not found in catalog after upload.")
            
    except Exception as e:
        print(f"Verification Failed: {e}")

if __name__ == "__main__":
    test_upload_and_verify()
