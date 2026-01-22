import requests
import time

def check_server():
    print("Prometheus-style Health Check...")
    
    # Check 0: Metadata
    try:
        r = requests.get("http://127.0.0.1:8008/openapi.json", timeout=5)
        if r.status_code == 200:
            data = r.json()
            title = data.get("info", {}).get("title", "Unknown")
            print(f"API Title: {title}")
            paths = data.get("paths", {}).keys()
            print(f"Part Routes: {[p for p in paths if 'part-analysis' in p]}")
    except Exception as e:
        print(f"Metadata Check Failed: {e}")

    # Check 1: Root Health
    try:
        t0 = time.time()
        r = requests.get("http://127.0.0.1:8008/api/health", timeout=10)
        print(f"Health Check: {r.status_code} ({time.time()-t0:.3f}s)")
    except Exception as e:
        print(f"Health Check FAILED: {e}")
        return False

    # Check 2: Parts Catalog
    try:
        print("Checking Catalog Endpoint...")
        
        # Ping
        t0 = time.time()
        r1 = requests.get("http://127.0.0.1:8008/api/part-analysis/ping", timeout=5)
        print(f"Ping Check: {r1.status_code} in {time.time()-t0:.3f}s")
        
        # Parts
        t0 = time.time()
        r = requests.get("http://127.0.0.1:8008/api/part-analysis/parts", timeout=5)
        print(f"Catalog Parts Check: {r.status_code} ({len(r.content)} bytes) in {time.time()-t0:.3f}s")
        
        if r.status_code == 200:
            print("Server is responsive.")
            print(f"Response: {r.text[:100]}")
            return True
        else:
            print(f"Catalog Error: {r.text}")
            return False
            
    except Exception as e:
        print(f"Catalog Check FAILED (Timeout/Hang): {e}")
        return False
        
    return False

if __name__ == "__main__":
    check_server()
