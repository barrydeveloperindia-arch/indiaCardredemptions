import os
import sys
from fastapi.testclient import TestClient

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.main import app

client = TestClient(app)

def test_workflow():
    print(">>> Starting Agile PLM Workflow Verification...")
    
    # 1. Create a dummy STL file
    filename = "test_gear_v2.stl"
    file_content = b"solid mock_stl\n facet normal 0 0 0\n outer loop\n vertex 0 0 0\n vertex 0 1 0\n vertex 1 1 0\n endloop\n endfacet\n endsolid mock_stl"
    
    files = {'file': (filename, file_content, 'application/octet-stream')}
    
    print(f"\n[Step 1] Uploading '{filename}' to /api/part-analysis/analyze...")
    response = client.post("/api/part-analysis/analyze", files=files)
    
    if response.status_code == 200:
        data = response.json()
        print("\n[SUCCESS] Pipeline Execution Complete!")
        print("-" * 50)
        print(f"File Stored At:   {data.get('storage_path')}")
        print(f"Status:           {data.get('status')}")
        print("-" * 50)
        
        geo = data.get('geometry', {})
        print(f"[Agent A] Geometry Engine:")
        print(f"  - Volume:       {geo.get('volume_cm3')} cm3")
        print(f"  - Surface Area: {geo.get('surface_area_cm2')} cm2")
        print(f"  - Bounding Box: {geo.get('bounding_box')}")
        
        qt = data.get('quote', {})
        print(f"\n[Agent C] Pricing Engine:")
        print(f"  - Total Price:  ${qt.get('total_price')}")
        print(f"  - Material Cost:${qt.get('breakdown', {}).get('material_cost')}")
        print(f"  - Runtime Est:  {qt.get('breakdown', {}).get('estimated_runtime_hours')} hours")
        print("-" * 50)
    else:
        print(f"\n[FAILED] Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    test_workflow()
