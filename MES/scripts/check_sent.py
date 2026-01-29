import msal
import os
import json
import requests
import sys

# Configuration
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET", "L1w8Q~pHua7eZXKQQqRz6CDAtLiBV024XKfKrdrV")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
TOKEN_PATH = "storage/outlook_token.json"
SCOPE = ["Mail.Read", "Mail.Read.Shared", "User.Read", "Offline_access"]

def get_token():
    if not os.path.exists(TOKEN_PATH):
        print("No token found.")
        return None
    with open(TOKEN_PATH, "r") as f:
        cache = json.load(f)
    
    app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    if "refresh_token" in cache:
        result = app.acquire_token_by_refresh_token(cache["refresh_token"], scopes=SCOPE)
        if "access_token" in result:
            return result["access_token"]
    return cache.get("access_token")

def scan_sent_items():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Target Folder: SentItems
    account = "enquiries@englabs.co.uk"
    url = f"https://graph.microsoft.com/v1.0/users/{account}/mailFolders/sentitems/messages?$top=10&$select=subject,receivedDateTime,toRecipients"
    
    print(f"Scanning Sent Items for {account}...")
    resp = requests.get(url, headers=headers)
    
    if resp.status_code == 200:
        messages = resp.json().get("value", [])
        print(f"Found {len(messages)} sent emails.")
        for msg in messages:
            recipients = [r['emailAddress']['address'] for r in msg['toRecipients']]
            print(f" - To: {recipients} | Sub: {msg['subject']}")
    else:
        print(f"Error {resp.status_code}: {resp.text}")

if __name__ == "__main__":
    scan_sent_items()
