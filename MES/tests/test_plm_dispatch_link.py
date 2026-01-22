
import requests
import json
import os

API_BASE_URL = "http://localhost:8008"

# Use a real file for upload (create dummy if needed)
DUMMY_STL = "tests/test_part_link.stl"
with open(DUMMY_STL, "w") as f:
    f.write("solid cube\nendsolid cube") # Minimal invalid STL but file exists

def test_integration():
    print("--- Testing PLM -> Dispatch Link ---")
    
    # 1. Upload Part to PLM
    with open(DUMMY_STL, "rb") as f:
        files = {"file": (os.path.basename(DUMMY_STL), f, "application/octet-stream")}
        print(f"Uploading {DUMMY_STL}...")
        res = requests.post(f"{API_BASE_URL}/api/part-analysis/analyze", files=files)
        
    if res.status_code == 200:
        print("PASS: Part Analysis Successful.")
    else:
        print(f"FAIL: Analysis failed {res.status_code} {res.text}")
        return

    # 2. Check Dispatch Board
    print("Checking Dispatch Board for Planning Job...")
    res = requests.get(f"{API_BASE_URL}/api/dispatch/board")
    if res.status_code == 200:
        data = res.json()
        planning_col = data.get("planning", [])
        
        found = False
        for job in planning_col:
            # We look for the filename in the Job details (or linked Order)
            # The Board endpoint returns: { job_id, order_id, status, order: { cad_file_path, ... } }
            
            # Note: models.Order.cad_file_path stores the filename in my logic: `cad_file_path=final_part.name`
            
            job_file = job.get("order", {}).get("cad_file_path", "")
            if os.path.basename(DUMMY_STL) in job_file:
                print(f"PASS: Found Job {job['id']} in Planning Column for file {job_file}")
                found = True
                break
        
        if not found:
             print("FAIL: Did not find the new part in Dispatch Board.")
             print("Current Planning Jobs:", [j.get("order", {}).get("cad_file_path") for j in planning_col])
    else:
        print(f"FAIL: Could not fetch board {res.status_code}")

if __name__ == "__main__":
    test_integration()
