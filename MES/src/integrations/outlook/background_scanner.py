import os
import json
import time
import requests
import msal
import sys
from datetime import datetime, timedelta
from database.connection import SessionLocal
from database.models import Project
import google.generativeai as genai

# Configuration
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET", "L1w8Q~pHua7eZXKQQqRz6CDAtLiBV024XKfKrdrV")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
TOKEN_PATH = "storage/outlook_token.json"
SCOPE = ["Mail.Read", "Mail.Read.Shared", "User.Read", "Offline_access"] # Added Shared scope attempt

TARGET_ACCOUNTS = ["me", "mecheng2@englabs.co.uk", "enquiries@englabs.co.uk", "admin1@englabs.co.uk"]
SCAN_INTERVAL = 15 # Seconds (Conservative) e.g. 4 per minute

def load_token():
    if not os.path.exists(TOKEN_PATH):
        print("Error: No token found.")
        return None
    with open(TOKEN_PATH, "r") as f:
        return json.load(f)

def get_token():
    cache = load_token()
    if not cache: return None
    
    app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    
    # Refresh logic
    if "refresh_token" in cache:
        result = app.acquire_token_by_refresh_token(cache["refresh_token"], scopes=SCOPE)
        if "access_token" in result:
            with open(TOKEN_PATH, "w") as f:
                json.dump(result, f)
            return result["access_token"]
    
    return cache.get("access_token")

def update_link(eq_id, po_num, payment_ref, source_email):
    db = SessionLocal()
    try:
        # Partial match
        project = db.query(Project).filter(Project.project_id.ilike(f"%{eq_id}%")).first()
        if project:
            updates = []
            if po_num and po_num not in str(project.description):
                project.description = (project.description or "") + f" [PO: {po_num}]"
                updates.append("PO")
            if payment_ref and payment_ref not in str(project.description):
                project.description = (project.description or "") + f" [PAY: {payment_ref}]"
                updates.append("Payment")
            
            if updates:
                db.commit()
                print(f"✅ LINKED: {eq_id} -> {updates} (Source: {source_email})")
                return True
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        db.close()
    return False

def analyze_email(msg, headers, model):
    subject = msg['subject']
    body = msg.get('bodyPreview', '')
    msg_id = msg['id']
    
    # Attachments
    att_names = []
    if msg.get('hasAttachments'):
        try:
            att_resp = requests.get(f"https://graph.microsoft.com/v1.0/me/messages/{msg_id}/attachments", headers=headers)
            if att_resp.status_code == 200:
                att_names = [a['name'] for a in att_resp.json().get('value', [])]
        except: pass

    # AI Prompt
    prompt = f"""
    Analyze email. Attachments: {att_names}
    Subject: {subject}
    Body: {body}
    
    Output JSON: {{ "eq_id": "EQxxxx...", "po_id": "...", "pay_id": "..." }}
    Only extract clear IDs. If none, return nulls.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '')
        data = json.loads(text)
        return data.get('eq_id'), data.get('po_id'), data.get('pay_id')
    except:
        return None, None, None

def run_scanner():
    print("🚀 Background Scanner Started...")
    
    # Init AI
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-flash-latest')

    while True:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        for account in TARGET_ACCOUNTS:
            endpoint = f"users/{account}/messages" if account != "me" else "me/messages"
            url = f"https://graph.microsoft.com/v1.0/{endpoint}?$top=5&$select=id,subject,bodyPreview,hasAttachments,receivedDateTime"
            
            try:
                print(f"Checking Inbox: {account}...")
                resp = requests.get(url, headers=headers)
                
                if resp.status_code == 403:
                    print(f"⛔ Access Denied for {account}. Check Admin Permissions.")
                    continue
                
                messages = resp.json().get('value', [])
                
                for msg in messages:
                    print(f"  > Scanning: {msg['subject'][:30]}...")
                    eq, po, pay = analyze_email(msg, headers, model)
                    
                    if eq:
                        print(f"    🎯 Found Match: {eq}")
                        update_link(eq, po, pay, account)
                    
                    time.sleep(SCAN_INTERVAL) # Rate Limit
                    
            except Exception as e:
                print(f"Error scanning {account}: {e}")
        
        print("💤 Resting for 5 minutes...")
        time.sleep(300)

if __name__ == "__main__":
    run_scanner()
