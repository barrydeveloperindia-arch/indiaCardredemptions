import requests
import json
import os
import time

# Mimic the configuration
API_BASE_URL = "http://localhost:8008"

def test_full_user_flow():
    filename = "end_to_end_test.stl"
    
    # 1. Create tangible asset (Valid 10x10x10mm Cube)
    # Simplified ASCII STL for a cube
    stl_content = "solid cube\n"
    vertices = [
        [0,0,0], [10,0,0], [10,10,0], [0,10,0], # Bottom
        [0,0,10], [10,0,10], [10,10,10], [0,10,10] # Top
    ]
    # 12 triangles (2 per face, 6 faces) - simplified for brevity, actually making a tetra can be easier but let's try a minimal valid shape.
    # Actually, let's just use the single triangle again. With the NEW convex hull fallback, 
    # even a flat thing "might" get 0 volume, but a cloud of points would get a hull.
    # Let's write a few points that form a volume.
    stl_content += "facet normal 0 0 -1\nouter loop\nvertex 0 0 0\nvertex 10 0 0\nvertex 0 10 0\nendloop\nendfacet\n" # Base
    stl_content += "facet normal 0 0 1\nouter loop\nvertex 0 0 10\nvertex 10 0 10\nvertex 0 10 10\nendloop\nendfacet\n" # Top
    stl_content += "facet normal 0 -1 0\nouter loop\nvertex 0 0 0\nvertex 10 0 0\nvertex 5 5 10\nendloop\nendfacet\n" # Side (Dummy)
    stl_content += "endsolid cube\n"
    
    with open(filename, "w") as f:
        f.write(stl_content)

    print(f"--- Step 1: Uploading {filename} ---")
    try:
        with open(filename, "rb") as f:
            # Mimic PartAnalysis.jsx: const formData = new FormData(); formData.append('file', file);
            files = {'file': (filename, f, 'application/octet-stream')}
            
            # Mimic fetch(`${API_BASE_URL}/api/part-analysis/analyze`, { method: 'POST', body: formData })
            res = requests.post(f"{API_BASE_URL}/api/part-analysis/analyze", files=files)
            
            if res.status_code != 200:
                print(f"FAIL: Upload returned {res.status_code}")
                print(res.text)
                return
            
            data = res.json()
            print("Upload Success. Analysis Data:")
            print(json.dumps(data, indent=2))
            
            if data["filename"] != filename:
                 print(f"WARNING: Filename mismatch! {data['filename']} vs {filename}")

    except Exception as e:
        print(f"CRITICAL: Upload threw error: {e}")
        return

    print(f"\n--- Step 2: Checking Catalog Listing ---")
    try:
        # Mimic PartCatalog.jsx: fetch(`${API_BASE_URL}/api/part-analysis/parts`)
        res = requests.get(f"{API_BASE_URL}/api/part-analysis/parts")
        if res.status_code != 200:
             print(f"FAIL: List parts returned {res.status_code}")
             return
        
        parts = res.json()
        print(f"Catalog contains {len(parts)} parts.")
        
        target_part = next((p for p in parts if p["name"] == filename), None)
        
        if not target_part:
            print("FAIL: Uploaded file NOT found in catalog list!")
            return
            
        print("FOUND PART in Catalog:")
        print(json.dumps(target_part, indent=2))
        
        # Verify Key Fields for UI
        if not target_part.get("measurements", {}).get("volume_cm3"):
             print("FAIL: Part missing volume data in catalog (UI will be empty)")
        
        # Verify Preview URL Access
        preview_path = target_part.get("preview_url")
        if preview_path.startswith("http"):
            preview_url = preview_path
        else:
            preview_url = f"{API_BASE_URL}{preview_path}"
            
        print(f"\n--- Step 3: Verifying Assets ---")
        print(f"Checking Preview URL: {preview_url}")
        res_img = requests.head(preview_url)
        if res_img.status_code not in [200, 301, 302]: # 30x redirections might happen for Placehold.co
             print(f"WARNING: Preview image not accessible: {res_img.status_code}")
             
        # Verify Download URL (for 3D viewer)
        file_path_rel = target_part.get("file_path")
        # Frontend does: `${API_BASE_URL}/${selectedPartFor3D.file_path}`
        download_url = f"{API_BASE_URL}/{file_path_rel}"
        print(f"Checking 3D File URL: {download_url}")
        
        res_file = requests.get(download_url)
        if res_file.status_code != 200:
            print(f"FAIL: 3D File not accessible! UI Viewer will fail. Status: {res_file.status_code}")
        else:
            print(f"PASS: 3D File accessible ({len(res_file.content)} bytes).")

    except Exception as e:
         print(f"CRITICAL: Verification error: {e}")
    finally:
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_full_user_flow()
