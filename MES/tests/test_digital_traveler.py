
import requests
import os

API_BASE_URL = "http://localhost:8000"

def test_pdf_generation():
    print("--- Testing Digital Traveler (PDF Generation) ---")
    
    # Needs Auth
    token = ""
    try:
        session = requests.Session()
        res = session.post(f"{API_BASE_URL}/api/auth/token", data={"username":"admin", "password":"admin123"})
        if res.status_code == 200:
            token = res.json()["access_token"]
            session.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print("Login Failed")
            return
            
        # 1. Get a valid Job ID (Reuse logic or pick random)
        # For regression, we might assume seeded data or create new
        # Let's verify 'JOB-QC-TEST' exists? Or list all jobs
        
        # Simple way: Create an order that auto-dispatches to get a job
        order_payload = {
            "customer_id": "CUST-PDF",
            "cad_file_path": "storage/parts/pdf_test.stl",
            "technical_requirements": {"material": "PLA"},
            "priority": 1
        }
        res = session.post(f"{API_BASE_URL}/api/orders", json=order_payload)
        job_id = res.json().get("job_id")
        
        if not job_id:
            print("Could not create job for PDF test")
            return
            
        print(f"Generated Job: {job_id}")
        
        # 2. Call PDF Endpoint
        pdf_url = f"{API_BASE_URL}/api/reporting/jobs/{job_id}/traveler"
        print(f"Requesting PDF: {pdf_url}")
        res = session.get(pdf_url)
        
        if res.status_code == 200:
            content_type = res.headers.get("content-type")
            if "application/pdf" in content_type:
                # Save it to verify size > 0
                with open("tests/temp_output/traveler_test.pdf", "wb") as f:
                    f.write(res.content)
                size = os.path.getsize("tests/temp_output/traveler_test.pdf")
                print(f"PASS: PDF Generated ({size} bytes)")
            else:
                print(f"FAIL: Wrong Content-Type {content_type}")
        else:
            print(f"FAIL: {res.status_code}")
            print(res.text)
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    if not os.path.exists("tests/temp_output"):
        os.makedirs("tests/temp_output")
    test_pdf_generation()
