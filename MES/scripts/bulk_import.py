import os
import requests
import mimetypes

# Configuration
DOWNLOADS_DIR = r"C:\Users\abrbh\Downloads"
API_URL = "http://localhost:8000/api/part-analysis/analyze"
EXTENSIONS = {'.stl', '.step', '.stp', '.obj', '.sldprt'}

import time

def wait_for_api():
    print("⏳ Waiting for API to be ready...")
    for _ in range(30):
        try:
            requests.get("http://localhost:8000/")
            print("✅ API is Online!")
            return True
        except requests.exceptions.ConnectionError:
            time.sleep(2)
            print(".", end="", flush=True)
    print("\n❌ API timed out.")
    return False

def bulk_import():
    if not wait_for_api():
        return

    print(f"🚀 Starting Bulk Import from {DOWNLOADS_DIR}")
    
    files_to_upload = []
    
    # 1. Scan Directory (Recursively)
    for root, dirs, files in os.walk(DOWNLOADS_DIR):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in EXTENSIONS:
                files_to_upload.append(os.path.join(root, file))
    
    print(f"found {len(files_to_upload)} valid CAD files.")
    
    # 2. Upload Loop
    success_count = 0
    fail_count = 0
    
    for i, file_path in enumerate(files_to_upload):
        filename = os.path.basename(file_path)
        print(f"[{i+1}/{len(files_to_upload)}] Uploading {filename}...", end=" ")
        
        try:
            with open(file_path, "rb") as f:
                # Prepare Multipart Upload
                files = {'file': (filename, f, 'application/octet-stream')}
                response = requests.post(API_URL, files=files)
                
            if response.status_code == 200:
                print("✅ Success")
                success_count += 1
                # Optional: Print Quote
                # res_json = response.json()
                # print(f"   -> Quote: {res_json.get('quote', {}).get('total_price')}")
            else:
                print(f"❌ Failed ({response.status_code})")
                fail_count += 1
        except Exception as e:
            print(f"❌ Error: {e}")
            fail_count += 1
            
    print("\n--- Import Summary ---")
    print(f"Total Processed: {len(files_to_upload)}")
    print(f"Successful:      {success_count}")
    print(f"Failed:          {fail_count}")

if __name__ == "__main__":
    # Check if requests is installed
    try:
        import requests
        bulk_import()
    except ImportError:
        print("❌ 'requests' library not found. Please run 'pip install requests' first.")
