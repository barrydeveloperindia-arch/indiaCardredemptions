import requests
import urllib.parse

BASE_URL = "http://localhost:8008"

def check_url(path):
    # Simulate frontend encoding
    # Frontend logic: encodeURI(path)
    # But path here is relative like "storage/parts/..."
    # The frontend does `${API_BASE_URL}/${encodeURI(path)}`
    
    encoded_path = urllib.parse.quote(path) # quote encodes spaces to %20
    # encodeURI in JS leaves slashes alone. quote does NOT.
    # user logic: encodeURI("storage/parts/foo.stl") -> "storage/parts/foo.stl" (spaces encoded)
    
    # Python's quote by default encodes '/' to %2F, which we don't want if we are simulating JS encodeURI behavior on the whole path
    encoded_path_js_style = urllib.parse.quote(path, safe='/()') 
    
    url = f"{BASE_URL}/{encoded_path_js_style}"
    print(f"Checking: {url}")
    try:
        r = requests.get(url, timeout=5)
        print(f"Status: {r.status_code}, Size: {len(r.content)} bytes")
        if r.status_code != 200:
            print(f"Failed Headers: {r.headers}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    # File we saw in the directory listing
    # "7- L D (20).stl"
    # "7- L D (20).step.svg"
    
    files = [
        "storage/parts/7- L D (20).stl",
        "storage/parts/7- L D (20).step.svg",
        "storage/parts/footrest.STL" # Case sensitive?
    ]
    
    for f in files:
        check_url(f)

if __name__ == "__main__":
    main()
