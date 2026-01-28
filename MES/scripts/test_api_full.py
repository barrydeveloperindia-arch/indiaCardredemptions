import requests
import sys

BASE_URL = "http://localhost:8008/api"

def test_health():
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print("[PASS] Health Check")
        else:
            print(f"[FAIL] Health Check: {r.status_code}")
    except Exception as e:
        print(f"[FAIL] Health Check: {e}")

def test_parts():
    try:
        r = requests.get(f"{BASE_URL}/analysis/parts/?skip=0&limit=5")
        if r.status_code == 200:
            data = r.json()
            print(f"[PASS] Fetch Parts (Count: {len(data)})")
        else:
            print(f"[FAIL] Fetch Parts: {r.status_code}")
    except Exception as e:
        print(f"[FAIL] Fetch Parts: {e}")

if __name__ == "__main__":
    print(f"Testing API at {BASE_URL}...")
    test_health()
    test_parts()
