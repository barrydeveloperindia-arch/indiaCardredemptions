
import requests
import json
import os

URL = "http://localhost:8008/api/ai/ask"
PAYLOAD = {"message": "Hello Hinata", "provider": "gemini"}

try:
    print(f"Connecting to {URL}...")
    resp = requests.post(URL, json=PAYLOAD)
    print(f"Status: {resp.status_code}")
    print(f"Headers: {resp.headers}")
    print(f"Text: {resp.text}")
    
    try:
        data = resp.json()
        print(f"JSON: {data}")
    except:
        print("JSON Decode Failed")

except Exception as e:
    print(f"Request Failed: {e}")
