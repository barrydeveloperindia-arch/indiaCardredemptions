
import requests
import json

try:
    resp = requests.get("http://localhost:8000/api/scheduling/gantt")
    print("Status Code:", resp.status_code)
    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
    except:
        print("Raw Text:", resp.text)
except Exception as e:
    print("Error:", e)
