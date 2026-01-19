import requests
import io

def test_analyze_part():
    url = "http://localhost:8000/api/part-analysis/analyze"
    
    # Create a dummy STL file content
    dummy_stl_content = b"solid cube\nendsolid cube"
    
    files = {
        'file': ('test_cube.stl', io.BytesIO(dummy_stl_content), 'model/stl')
    }
    
    print(f"Testing POST {url}...")
    try:
        response = requests.post(url, files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("\n[SUCCESS] Analysis Complete")
            print(f"Status: {data.get('status')}")
            print(f"Printability Score: {data.get('printability_score')}")
            print(f"Volume: {data.get('volume_cm3')} cm3")
            print(f"Material: {data.get('material_suggestion')}")
            print(f"Quote: {data.get('quote', {}).get('total_price')} USD")
        else:
            print(f"\n[FAILURE] Status Code: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")

if __name__ == "__main__":
    test_analyze_part()
