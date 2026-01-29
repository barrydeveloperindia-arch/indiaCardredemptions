import msal
import os
import json
import requests

# Configuration
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
# For App-Only, scope is always .default
SCOPE = ["https://graph.microsoft.com/.default"]

def check_app_access():
    app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    
    result = app.acquire_token_for_client(scopes=SCOPE)
    
    if "access_token" in result:
        print("Obtained App-Only Token.")
        token = result["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try Access Enquiries Sent Items
        account = "enquiries@englabs.co.uk"
        url = f"https://graph.microsoft.com/v1.0/users/{account}/mailFolders/sentitems/messages?$top=5&$select=subject,toRecipients,receivedDateTime"
        
        print(f"Testing access to {account} Sent Items...")
        resp = requests.get(url, headers=headers)
        
        if resp.status_code == 200:
            print("SUCCESS! Access Granted.")
            msgs = resp.json().get("value", [])
            for m in msgs:
                to = [t['emailAddress']['address'] for t in m['toRecipients']]
                print(f" - Sent To: {to} | Sub: {m['subject']}")
        else:
            print(f"Failed: {resp.status_code} {resp.text}")
            
    else:
        print(f"Auth Failed: {result.get('error_description')}")

if __name__ == "__main__":
    check_app_access()
