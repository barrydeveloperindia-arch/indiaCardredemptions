import requests
import os
import sys
import cadquery as cq

# Constants
API_URL = "http://localhost:8008/api"
BASE_URL = "http://localhost:8008"

def create_dummy_step(filename):
    """Creates a simple STEP file for testing."""
    path = os.path.abspath(filename)
    # create only if not exists to save time
    if not os.path.exists(path):
        print(f"[TEST] Creating dummy STEP at {path}")
        try:
             result = cq.Workplane("XY").box(10, 10, 10)
             cq.exporters.export(result, path)
        except Exception:
             # Fallback if CQ fails
             with open(path, "w") as f:
                 f.write("STEP FILE CONTENT MOCK")
    return path

def run_test():
    print("--- Starting Frontend Download Logic Test ---")
    
    # 1. Create a Test File
    dummy_file = "test_download_part.step"
    create_dummy_step(dummy_file)
    
    try:
        # 2. Upload File (Part Analysis)
        print("[TEST] Uploading part...")
        with open(dummy_file, 'rb') as f:
            files = {'file': (dummy_file, f)}
            res = requests.post(f"{API_URL}/part-analysis/analyze", files=files)
            if res.status_code != 200:
                print(f"[FAIL] Upload failed: {res.text}")
                return
            print("[TEST] Upload success.")

        # 3. Get Part ID
        print("[TEST] Fetching part ID...")
        res = requests.get(f"{API_URL}/part-analysis/parts")
        parts = res.json()
        target_part = next((p for p in parts if p['name'] == dummy_file), None)
        
        if not target_part:
            print("[FAIL] Could not find uploaded part in catalog.")
            return
            
        part_id = target_part['part_id']
        print(f"[TEST] Found Part ID: {part_id}")
        
        # 4. Generate Drawing
        print("[TEST] Requesting Drawing Generation...")
        res = requests.post(f"{API_URL}/part-analysis/generate-drawing/{part_id}")
        if res.status_code != 200:
             print(f"[FAIL] Generation failed: {res.text}")
             return
        
        data = res.json()
        if 'pdf_url' not in data:
            print(f"[FAIL] No pdf_url in response: {data}")
            return
            
        pdf_relative_url = data['pdf_url']
        full_pdf_url = f"{BASE_URL}{pdf_relative_url}"
        print(f"[TEST] PDF URL: {full_pdf_url}")
        
        # 5. Verify CORS & Content
        print("[TEST] Verifying CORS & Content...")
        headers = {'Origin': 'http://localhost:5173'}
        res = requests.get(full_pdf_url, headers=headers)
        
        if res.status_code == 200:
            print(f"[PASS] File is accessible (200 OK). Size: {len(res.content)} bytes")
            
            # Check CORS
            cors = res.headers.get('Access-Control-Allow-Origin')
            print(f"[TEST] CORS Header: {cors}")
            if cors == '*' or cors == 'http://localhost:5173':
                print("[PASS] CORS is configured correctly.")
            else:
                print(f"[FAIL] Missing or invalid CORS header: {cors}")

            # Check Type
            ct = res.headers.get('Content-Type', '')
            print(f"[TEST] Content-Type: {ct}")
            if 'application/pdf' in ct:
                print("[PASS] Correct Content-Type.")
            else:
                 print("[WARN] Content-Type is not PDF.")
            
        else:
            print(f"[FAIL] Failed to fetch PDF: {res.status_code}")
            
    except Exception as e:
        print(f"[ERROR] {e}")
    finally:
        if os.path.exists(dummy_file):
            try:
                os.remove(dummy_file)
            except:
                pass

if __name__ == "__main__":
    run_test()
