import msal
import os
import json
import sys
import requests

# Configuration
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
TOKEN_PATH = "storage/outlook_token.json"
SCOPE = ["Mail.Read", "Mail.Read.Shared", "User.Read", "Offline_access"]

def device_flow_login():
    # Use PublicClient for Device Flow
    app = msal.PublicClientApplication(CLIENT_ID, authority=AUTHORITY)
    
    flow = app.initiate_device_flow(scopes=SCOPE)
    if "user_code" not in flow:
        print("Failed to create device flow. Ensure the App Registration enables Public Client flows.")
        print(flow)
        return

    print(flow["message"])
    sys.stdout.flush()

    # Manual Polling with Client Secret
    import time
    token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    data = {
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
        "client_id": CLIENT_ID,
        "client_secret": os.getenv("OUTLOOK_CLIENT_SECRET"),
        "device_code": flow["device_code"]
    }

    print("\nWaiting for sign-in...")
    while True:
        resp = requests.post(token_url, data=data)
        r_json = resp.json()

        if "access_token" in r_json:
            result = r_json
            break
        elif r_json.get("error") == "authorization_pending":
            time.sleep(5)
        else:
            print(f"Error: {r_json}")
            return

    if "access_token" in result:
        print("\nAuthentication successful!")
        # Wrapper for cache compatibility
        cache_data = {
            "access_token": result["access_token"],
            "refresh_token": result.get("refresh_token"),
            "id_token": result.get("id_token")
        }
        with open(TOKEN_PATH, "w") as f:
            json.dump(cache_data, f)
        print(f"Token saved to {TOKEN_PATH}")

if __name__ == "__main__":
    device_flow_login()
