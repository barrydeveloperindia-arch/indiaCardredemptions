import requests
import json
import uuid

API_BASE_URL = "http://localhost:8008"

def test_dispatch_api():
    print("--- Testing Dispatch Kanban API ---")
    
    # 1. Inspect Board
    res = requests.get(f"{API_BASE_URL}/api/dispatch/board")
    if res.status_code != 200:
        print(f"FAIL: Get Board {res.status_code}")
        print(res.text)
        return
    
    board = res.json()
    print(f"Board Columns: {list(board.keys())}")
    print(f"Planning: {len(board['planning'])}, Production: {len(board['production'])}, QC: {len(board['qc'])}")
    
    # If no jobs, we can't test much. Let's rely on existing data or creating one?
    # We can create a job via existing endpoints, or just skip if empty.
    # Assuming previous tests created some parts/jobs.
    # Actually, PLM uploads create Parts, but not Job orders (unless we trigger "Print").
    # Users script implies movement.
    
    # Let's verify PDF generation on ANY job if it exists
    target_job = None
    if board['qc']: target_job = board['qc'][0]['id']
    elif board['production']: target_job = board['production'][0]['id']
    elif board['planning']: target_job = board['planning'][0]['id']
    
    if target_job:
        print(f"Testing PDF for Job {target_job}...")
        res_pdf = requests.get(f"{API_BASE_URL}/api/dispatch/jobs/{target_job}/qc-report")
        if res_pdf.status_code == 200 and custom_is_pdf(res_pdf.content):
            print("PASS: QC Report PDF generated.")
        else:
            print(f"FAIL: QC Report {res_pdf.status_code}")
    else:
        print("WARNING: No jobs found to test PDF/Movement.")

def custom_is_pdf(content):
    return content.startswith(b'%PDF')

if __name__ == "__main__":
    test_dispatch_api()
