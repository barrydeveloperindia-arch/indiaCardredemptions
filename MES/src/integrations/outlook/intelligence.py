import msal
import os
import json
import requests
import sys
from datetime import datetime

# Configuration
# CLIENT_ID/SECRET must match router.py or env
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET", "L1w8Q~pHua7eZXKQQqRz6CDAtLiBV024XKfKrdrV")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
TOKEN_PATH = "storage/outlook_token.json"
SCOPE = ["Mail.Read", "User.Read", "Offline_access"]

def load_token():
    if not os.path.exists(TOKEN_PATH):
        print("Error: No token found. Please login via /api/integrations/outlook/login")
        return None
    
    with open(TOKEN_PATH, "r") as f:
        cache = json.load(f)
        
    return cache

def get_valid_access_token():
    token_cache = load_token()
    if not token_cache:
        sys.exit(1)
        
    # Rehydrate MSAL App
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )
    
    # Check if we can acquire silent?
    # msal acquire_token_by_authorization_code returns a dict with 'refresh_token' usually.
    # But checking cache properly requires SerializableTokenCache. 
    # Since we just dumped the RESULT dict, we have 'access_token' and 'refresh_token' (maybe).
    
    # If the file contains the raw result dict from acquire_token_by_authorization_code:
    if "access_token" in token_cache:
        # Check expiry? TODO.
        # Let's try to use refresh token if present
        if "refresh_token" in token_cache:
            result = app.acquire_token_by_refresh_token(
                token_cache["refresh_token"],
                scopes=SCOPE
            )
            if "access_token" in result:
                # Update cache
                with open(TOKEN_PATH, "w") as f:
                    json.dump(result, f)
                return result["access_token"]
        
        # Fallback: Just return current access token (might be expired if > 1 hour)
        return token_cache["access_token"]
        
    print("Invalid token format.")
    return None

def search_emails(query):
    token = get_valid_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Graph API Search
    print(f"Searching Outlook for: '{query}'...")
    url = f"https://graph.microsoft.com/v1.0/me/messages?$search=\"{query}\"&$top=5&$select=subject,receivedDateTime,from,bodyPreview,hasAttachments"
    
    resp = requests.get(url, headers=headers)
    
    # ... (previous code)
    
    if resp.status_code == 200:
        data = resp.json()
        messages = data.get("value", [])
        print(f"\nFound {len(messages)} emails. Analyzing with AI...\n")
        
        # Initialize Gemini
        import google.generativeai as genai
        GEMINI_KEY = os.getenv("GEMINI_API_KEY") # Ensure this is set in env
        if GEMINI_KEY:
            genai.configure(api_key=GEMINI_KEY)
            model = genai.GenerativeModel('gemini-flash-latest')
        else:
            print("Warning: GEMINI_API_KEY not found. Skipping AI analysis.")
            model = None

        for msg in messages:
            subject = msg['subject']
            sender = msg['from']['emailAddress']['name']
            body = msg.get('bodyPreview', '') # Or prefer 'body.content' if available
            date = msg['receivedDateTime']
            
            # Fetch Attachments if needed
            att_names = []
            if msg.get('hasAttachments'):
                att_url = f"https://graph.microsoft.com/v1.0/me/messages/{msg['id']}/attachments"
                att_resp = requests.get(att_url, headers=headers)
                if att_resp.status_code == 200:
                    atts = att_resp.json().get('value', [])
                    att_names = [a['name'] for a in atts]
                print(f"  Attachments: {att_names}")
            
            print(f"--- Analyzing: {subject[:50]}... ---")
            
            if model:
                prompt = f"""
                Analyze this manufacturing email and its attachments.
                Subject: {subject}
                Sender: {sender}
                Date: {date}
                BodySnippet: {body}
                AttachmentFilenames: {att_names}
                
                Task:
                1. Classify Type.
                2. Extract IDs: especially from Attachment Filenames (e.g. EQxxxx, QTxxxx, POxxxx).
                3. Customer Intent.
                
                Output JSON: {{ "type": "...", "ids": [...], "intent": "..." }}
                """
                try:
                    response = model.generate_content(prompt)
                    # Clean markdown if present
                    text = response.text.replace('```json', '').replace('```', '')
                    import json
                    analysis = json.loads(text)
                    print(f"TYPE:   {analysis.get('type')}")
                    print(f"IDS:    {analysis.get('ids')}")
                    print(f"INTENT: {analysis.get('intent')}\n")
                except Exception as e:
                    print(f"AI Error: {e}")
            else:
                print(f"Skipping AI (No Key). Preview: {body[:100]}")

    else:
        print(f"Error {resp.status_code}: {resp.text}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        search_emails(sys.argv[1])
    else:
        print("Usage: python intelligence.py <search_term>")
