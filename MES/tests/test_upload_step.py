import requests
import os

def test_step_upload():
    url = "http://localhost:8008/api/part-analysis/analyze"
    filename = "test_part.step"
    
    # Create a dummy STEP file
    with open(filename, "w") as f:
        f.write("ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;\n")
        
    try:
        with open(filename, "rb") as f:
            files = {"file": (filename, f)}
            print(f"Uploading {filename}...")
            response = requests.post(url, files=files)
            
        if response.status_code == 200:
            print("Upload Successful!")
            data = response.json()
            print("Response:", data)
            
            # Verify file exists in storage
            expected_stl_path = os.path.join("storage", "parts", "test_part.stl")
            if os.path.exists(expected_stl_path):
                print(f"[PASS] Converted STL found at {expected_stl_path}")
                # Optional: Check content size > 0
                if os.path.getsize(expected_stl_path) > 0:
                     print("[PASS] Converted STL is not empty.")
                else:
                     print("[FAIL] Converted STL is empty.")
            else:
                print(f"[FAIL] Converted STL NOT found at {expected_stl_path}")
        else:
            print(f"Upload Failed: {response.status_code} - {response.text}")
            
    finally:
        # Cleanup
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_step_upload()
