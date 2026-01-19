import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
TOKEN_FILE = "token.txt"

def get_token():
    try:
        with open(TOKEN_FILE, "r") as f:
            content = f.read().strip()
            # Extract plain token if wrapped
            if "__TOKEN_START__" in content:
                return content.split("__TOKEN_START__")[1].split("__TOKEN_END__")[0]
            return content
    except FileNotFoundError:
        print(f"❌ Token file {TOKEN_FILE} not found. Using admin:admin123 fallback might fail if auth required.")
        return None

def verify_agile_flow():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # 1. Check Gantt Endpoint
    print("\n--- 1. Testing Gantt Endpoint ---")
    resp = requests.get(f"{BASE_URL}/api/scheduling/gantt", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        print(f"✅ Gantt Data OK. Found {len(data['machines'])} machines and {len(data['jobs'])} jobs.")
        machines = data['machines']
        if not machines:
            print("❌ No machines found. Seeding needed?")
            return
        target_machine_id = machines[0]['id']
    else:
        print(f"❌ Failed to fetch Gantt: {resp.status_code} - {resp.text}")
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
    else:
        print(f"❌ Auto-Schedule Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    verify_agile_flow()
