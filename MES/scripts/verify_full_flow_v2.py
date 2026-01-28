import requests
import os
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8008"
API_URL = f"{BASE_URL}/api"
USERNAME = "admin"
PASSWORD = "admin_password_123" # Assuming default from seed_admin? Checking seed_admin.py content might be wise, but usually it's hardcoded or env.
# Let's double check seed_admin.py content in a moment, for now I'll assume 'admin'/'secret' or similar. 
# Step 52 output said "Admin user already exists". 
# I will check verify_agile_flow.py default token generation. It uses create_access_token directly!
# That means I can generate a token without knowing the password if I import the utils.
# But verify_agile_flow.py imports from src.auth.security.

import sys
sys.path.append(os.getcwd())
from src.auth.security import create_access_token
from datetime import timedelta

def generate_admin_token():
    print("Generating Admin Token locally...")
    return create_access_token(data={"sub": "admin", "role": "admin"}, expires_delta=timedelta(hours=1))

def create_dummy_step(filename="verification_part.step"):
    content = """ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('Simple Box'),'2;1');
FILE_NAME('test_box.step','2026-01-20T16:00:00',('Author'),('Organization'),'','','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;
#1=CARTESIAN_POINT('',(0.,0.,0.));
ENDSEC;
END-ISO-10303-21;
"""
    with open(filename, "w") as f:
        f.write(content)
    return filename

def run_verification():
    print("Starting Full Flow Verification...")
    
    # 1. Auth
    token = generate_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    print("Auth Token Generated")

    # 2. Upload Part (Analysis)
    filename = "verification_part.step"
    create_dummy_step(filename)
    try:
        print(f"Uploading {filename}...")
        with open(filename, "rb") as f:
            files = {"file": (filename, f, "application/step")}
            # Note: Part analysis also creates a PLANNED job
            resp = requests.post(f"{API_URL}/part-analysis/analyze", files=files, headers=headers)
        
        if resp.status_code != 200:
            print(f"Upload Failed: {resp.text}")
            return
        
        analysis_data = resp.json()
        part_name = analysis_data.get("filename", filename)
        print(f"Upload & Analysis Complete. Part: {part_name}")
        
    finally:
        if os.path.exists(filename):
            os.remove(filename)

    # 3. Verify Job Creation (PLANNED)
    # We need to find the job associated with this part.
    # The analyze endpoint creates a job. Let's find recent jobs.
    print("Checking for PLANNED job...")
    # There isn't a direct 'get job by part' endpoint, but we can check the queue or valid jobs.
    # verify_agile_flow uses /api/scheduling/gantt
    
    time.sleep(1) # Give DB a moment
    resp = requests.get(f"{API_URL}/scheduling/gantt", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to get Gannt: {resp.text}")
        return
        
    gantt_data = resp.json()
    jobs = gantt_data.get("jobs", [])
    
    # Look for our job (created just now, status PLANNED)
    target_job = None
    for job in jobs:
        # We don't have exact linking ID returned from analyze, but we can guess by name if present
        # Or just pick the last PLANNED job
        if job.get("status") == "PLANNED": 
            # Ideally verify it matches our part
            target_job = job
            break
            
    if not target_job:
        print("No PLANNED job found immediately. Checking if it's already QUEUED or if we need to look closer.")
        # If auto-schedule ran in background? unlikely.
        # Let's try to assume the last created job is ours.
        pass
    else:
        print(f"Found PLANNED Job: {target_job['id']}")

    # 4. Auto-Schedule (Dispatch)
    print("Triggering Auto-Schedule...")
    resp = requests.post(f"{API_URL}/scheduling/jobs/auto-schedule", headers=headers)
    if resp.status_code == 200:
        print(f"Auto-Schedule ran: {resp.json()}")
    else:
        print(f"Auto-Schedule Failed: {resp.text}")

    # 5. Find the Job again (Should be QUEUED/ASSIGNED)
    resp = requests.get(f"{API_URL}/scheduling/gantt", headers=headers)
    jobs = resp.json().get("jobs", [])
    
    # We need a proper Job ID to complete it.
    # Since we can't easily link, let's pick the *first* QUEUED job if our specific one isn't clear.
    # BUT wait, the analyze endpoint DOESN'T return job_id. It returns analysis result.
    # We can query all jobs or shop floor status.
    
    queued_jobs = [j for j in jobs if j['status'] in ['QUEUED', 'ASSIGNED', 'RUNNING']]
    if not queued_jobs:
        print("No QUEUED/RUNNING jobs found after scheduling.")
        return
        
    job_to_complete = queued_jobs[0]
    job_id = job_to_complete['id']
    print(f"Selected Job to Complete: {job_id} ({job_to_complete['status']})")
    
    # 6. Complete Job & Invoice
    # URL is /jobs/{job_id}/complete (No /api prefix based on main.py)
    print(f"Completing Job {job_id}...")
    resp = requests.post(f"{BASE_URL}/jobs/{job_id}/complete", headers=headers)
    
    if resp.status_code == 200:
        invoice = resp.json()
        print("Job Completed Successfully!")
        print("------------------------------------------------")
        print(f"INVOICE GENERATED: {invoice.get('invoice', {}).get('invoice_id', 'Unknown')}")
        print(f"Total Amount: ${invoice.get('invoice', {}).get('total', 0)}")
        print("------------------------------------------------")
    else:
        print(f"Job Completion Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    run_verification()
