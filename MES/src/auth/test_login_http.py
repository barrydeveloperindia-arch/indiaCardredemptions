import requests

def test_http_login():
    url = "http://127.0.0.1:8000/auth/token"
    payload = {
        "username": "admin",
        "password": "admin123"
    }
    # OAuth2PasswordRequestForm expects form data
    try:
        response = requests.post(url, data=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ HTTP Login Successful!")
        else:
            print("❌ HTTP Login Failed.")
            
    except Exception as e:
        print(f"Error connecting: {e}")

if __name__ == "__main__":
    test_http_login()
