
import requests
import json
import uuid

API_BASE_URL = "http://localhost:8008"

def test_invoicing():
    print("--- Testing Financials & Invoicing ---")
    
    # 1. Use the JOB-QC-TEST we seeded earlier, or create new.
    # The seeded job (JOB-QC-TEST) status is "COMPLETED", so calling complete again might just re-invoice or fail depending on logic?
    # Logic: if job.status != "COMPLETED" ... else it skips runtime setting.
    # But it always generates invoice.
    
    job_id = "JOB-QC-TEST" 
    # Ensure it exists (it should from previous steps)
    
    print(f"Triggering Invoice for {job_id}...")
    try:
        res = requests.post(f"{API_BASE_URL}/jobs/{job_id}/complete")
        if res.status_code == 200:
            data = res.json()
            inv = data["invoice"]
            print(f"PASS: Invoice Generated: {inv['invoice_number']}")
            print(f"Total: {inv['total']} {inv['currency']}")
            print(f"ERP Ref: {inv.get('erp_reference', 'N/A')}")
            
            # Verify inventory update message
            # But the endpoint response schema changed?
            # return {"status": "Job Completed", "invoice": invoice_data}
            
            if inv['total'] > 0:
                 print("PASS: Total amount is positive (Real Calculation Likely)")
            else:
                 print("WARNING: Total amount is 0 (Check measurements/rates)")
                 
        else:
            print(f"FAIL: {res.status_code}")
            print(res.text)
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_invoicing()
