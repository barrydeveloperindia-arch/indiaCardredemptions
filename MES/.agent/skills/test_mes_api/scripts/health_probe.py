import requests
import json
import sys

BASE_URL = "http://localhost:8008"

def check(endpoint, name):
    print(f"[*] Checking {name} ({endpoint})...", end=" ")
    try:
        resp = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                print(f"    --> Data Count: {len(data)} items")
            elif isinstance(data, dict):
                 print(f"    --> Keys: {list(data.keys())}")
        else:
            print(f"    --> Error: {resp.text[:100]}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    print(f"Testing Connectivity to {BASE_URL}")
    check("/api/dispatch/board", "Dispatch Board")
    check("/api/sales/projects?limit=10", "Financial Ledger (Projects)")
    check("/api/metadata/", "Metadata")
    # check("/docs", "API Docs")
