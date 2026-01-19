import requests
import json
from datetime import datetime, timedelta
import sys
import os

# Add /app to sys.path to ensure we can import src
sys.path.append("/app")

try:
    from src.auth.security import create_access_token
except ImportError:
    # If running from inside src, try relative
    try:
        from auth.utils import create_access_token
    except ImportError:
        print("❌ Could not import create_access_token. Ensure this script is in src/")
        sys.exit(1)

BASE_URL = "http://localhost:8000"

def generate_token():
    print("🔑 Generating Admin Token...")
    access_token = create_access_token(
        data={"sub": "admin", "role": "admin"},
        expires_delta=timedelta(hours=1)
    )
    return access_token

def verify_agile_flow():
    token = generate_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Token: {token[:10]}...")

    # 1. Check Gantt Endpoint
    print("\n--- 1. Testing Gantt Endpoint ---")
    try:
        resp = requests.get(f"{BASE_URL}/api/scheduling/gantt", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            print(f"✅ Gantt Data OK. Found {len(data.get('machines', []))} machines and {len(data.get('jobs', []))} jobs.")
            machines = data.get('machines', [])
            if not machines:
                print("❌ No machines found. Seeding needed?")
                return
            target_machine_id = machines[0]['id']
        else:
            print(f"❌ Failed to fetch Gantt: {resp.status_code} - {resp.text}")
            return
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Failed to {BASE_URL}. Is server running?")
        return

    # 2. Check Digital Traveler (Active Job)
    print(f"\n--- 2. Testing active-job for {target_machine_id} ---")
    resp = requests.get(f"{BASE_URL}/api/shop-floor/operator/{target_machine_id}/active-job", headers=headers)
    if resp.status_code == 200:
        job_data = resp.json()
        print(f"✅ Active Job Endpoint OK. Status: {job_data.get('status')}")
        
        # If there's an active job, try to verify status transition
        if job_data.get('status') != "NO_JOB":
            job_id = job_data['job_id']
            print(f"   -> Found Job {job_id}. Attempting status update...")
            
            # Transition to RUNNING
            resp_update = requests.post(
                f"{BASE_URL}/api/shop-floor/jobs/{job_id}/status",
                json={"status": "RUNNING"},
                headers=headers
            )
            if resp_update.status_code == 200:
                print("✅ Job transitioned to RUNNING.")
            else:
                 print(f"❌ Failed transition: {resp_update.text}")
        else:
            print("   -> No active job to test transitions. (This is valid if queue is empty)")

    else:
        print(f"❌ Failed Active Job: {resp.status_code} - {resp.text}")

    # 3. Test Auto-Schedule
    print("\n--- 3. Testing Auto-Scheduler ---")
    resp = requests.post(f"{BASE_URL}/api/scheduling/jobs/auto-schedule", headers=headers)
    if resp.status_code == 200:
        print(f"✅ Auto-Schedule OK: {resp.json()}")
        
        # Verify persistence via Gantt
        requests.get(f"{BASE_URL}/api/scheduling/gantt", headers=headers)
    else:
        print(f"❌ Auto-Schedule Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    verify_agile_flow()
