
import requests
import os

URL = "http://converter:5000/convert"
dummy_path = "test_connectivity.sldprt"
with open(dummy_path, "w") as f:
    f.write("test content")

print(f"Testing connection to {URL}...")
try:
    files = {'file': (dummy_path, open(dummy_path, 'rb'))}
    resp = requests.post(URL, files=files, timeout=5)
    
    print(f"Status Code: {resp.status_code}")
    print(f"Body: {resp.text[:200]}")
    
    if resp.status_code == 200:
        print("SUCCESS: Service is alive (200 OK)")
    elif resp.status_code == 500:
        print("SUCCESS: Service is reachable (500 Internal Error as expected for dummy file)")
    else:
        print(f"FAILURE status {resp.status_code}")

except Exception as e:
    print(f"CONNECTION FAILURE: {e}")
