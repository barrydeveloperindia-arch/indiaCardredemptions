
import requests
import json
import uuid

# Use 127.0.0.1 and the internal port if inside the container?
# Or if running inside the container, we should point to localhost:8000 (uvicorn default)
# The container maps 8008:8000, so inside the container it is 8000.
API_BASE_URL = "http://localhost:8000"

def test_invoicing():
    print("--- Testing Financials & Invoicing ---")
    
    # Generate a random ID to ensure we don't hit "Already Completed" errors if re-running
    # Actually, we need a VALID job ID that exists in the DB.
    # Let's create a fresh order/job first.
    
    # 1. Create Order
    order_id = f"ORD-REGRESS-{uuid.uuid4().hex[:6]}"
    # We can't easily create via API here without Auth token now that we secured it?
    # Actually, verify_workflow.py usually handles the full chain.
    # For now, let's try to hit the endpoint assuming we have a job.
    
    # Or, let's use the seeds. 'JOB-QC-TEST' might not be ideal if it's already completed.
    
    # Let's try to list jobs to pick one.
    try:
        # Auth fix: we need a token now?
        # Creating a simplified test that assumes no auth for internal testing or uses a fixed token.
        # But 'test_financials.py' failed on connection, not auth.
        
        # Connection Refused on 8008 inside container means we should use 8000.
        pass
    except:
        pass

    # Let's rewrite the test to be robust:
    # 1. Login to get Token
    # 2. Create Order
    # 3. Dispatch (Simulate) or just Create Job directly in DB?
    # Better to use API.
    
    session = requests.Session()
    
    # Login
    print("Logging in...")
    try:
        res = session.post(f"{API_BASE_URL}/api/auth/token", data={"username":"admin", "password":"admin123"})
        if res.status_code == 200:
            token = res.json()["access_token"]
            session.headers.update({"Authorization": f"Bearer {token}"})
            print("Login Successful.")
        else:
            print("Login Failed. (If auth enabled)")
            # continue anyway if auth optional
    except Exception as e:
        print(f"Connection Error: {e}")
        return

    # Create Order
    order_payload = {
        "customer_id": "CUST-TEST",
        "cad_file_path": "storage/parts/test_cube.stl",
        "technical_requirements": {"material": "PLA"},
        "priority": 1
    }
    
    print("Creating Order...")
    res = session.post(f"{API_BASE_URL}/api/orders", json=order_payload)
    if res.status_code != 201:
        print(f"Order Creation Failed: {res.text}")
        return
        
    data = res.json()
    job_id = data.get("job_id")
    print(f"Order Created. Job ID: {job_id}")
    
    if not job_id or "FAILED" in job_id:
        print("Dispatch Failed, cannot test invoice.")
        return

    # Complete Job & Invoice
    print(f"Triggering Invoice for {job_id}...")
    res = session.post(f"{API_BASE_URL}/jobs/{job_id}/complete")
    
    if res.status_code == 200:
        data = res.json()
        inv = data.get("invoice")
        if inv:
             print(f"PASS: Invoice Generated: {inv.get('invoice_number')}")
             print(f"Total: {inv.get('total')}")
        else:
             print("FAIL: No invoice in response")
    else:
        print(f"FAIL: {res.status_code}")
        print(res.text)

if __name__ == "__main__":
    test_invoicing()
