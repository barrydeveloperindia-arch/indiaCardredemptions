import requests
import time
from typing import List

API_BASE_URL = "http://localhost:8008/api"

def get_all_parts() -> List[dict]:
    """Fetches all parts from the catalog."""
    try:
        response = requests.get(f"{API_BASE_URL}/analysis/parts")
        if response.status_code == 200:
            return response.json()
        print(f"Error fetching parts: {response.status_code}")
        return []
    except Exception as e:
        print(f"Connection Failed: {e}")
        return []

def generate_drawing(part_id: str, part_name: str):
    """Triggers drawing generation for a single part."""
    print(f"Generating drawing for: {part_name} ({part_id})")
    try:
        # According to router.py, the endpoint is POST /generate-drawing/{part_id}
        # Note: The router prefix is /api/analysis
        url = f"{API_BASE_URL}/analysis/generate-drawing/{part_id}"
        start_time = time.time()
        response = requests.post(url)
        
        duration = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            pdf_url = result.get("pdf_url")
            print(f"  [SUCCESS] Generated in {duration:.2f}s. PDF: {pdf_url}")
        else:
            print(f"  [FAILED] Status: {response.status_code}. Details: {response.text}")
            
    except Exception as e:
        print(f"  [ERROR] Request failed: {e}")

def main():
    print("=== Bulk 2D Drawing Generator ===")
    parts = get_all_parts()
    
    if not parts:
        print("No parts found or API unavailable.")
        return

    print(f"Found {len(parts)} parts to process.")
    
    success_count = 0
    
    for i, part in enumerate(parts):
        print(f"\nProcessing {i+1}/{len(parts)}...")
        generate_drawing(part['part_id'], part['name'])
        # Small delay to apply backpressure if needed (though API is threaded now)
        time.sleep(0.5)

    print("\n=== Bulk Generation Complete ===")

if __name__ == "__main__":
    main()
