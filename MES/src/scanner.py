import msal
import os
import json
import requests
import sys
from datetime import datetime
from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Project

# Configuration
# Env vars must be set. Defaults provided for context but should be loaded from env.
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
    
    app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    
    if "access_token" in token_cache:
        if "refresh_token" in token_cache:
            result = app.acquire_token_by_refresh_token(
                token_cache["refresh_token"], scopes=SCOPE
            )
            if "access_token" in result:
                with open(TOKEN_PATH, "w") as f:
                    json.dump(result, f)
                return result["access_token"]
        return token_cache["access_token"]
    return None

def update_db(eq_id, po_num=None, payment_ref=None):
    if not eq_id: return
    
    db = SessionLocal()
    try:
        # Try Regex/Partial Match
        project = db.query(Project).filter(Project.project_id.ilike(f"%{eq_id}%")).first()
        if project:
            updates = []
            if po_num:
                # Store PO in description or dedicated field
                # Assuming description update for now as schema might not have po_number
                if po_num not in project.description:
                    project.description += f" [PO: {po_num}]"
                    updates.append(f"Linked PO {po_num}")
            
            if payment_ref:
                if payment_ref not in project.description:
                    project.description += f" [Payment: {payment_ref}]"
                    updates.append(f"Linked Payment {payment_ref}")
                    
            if updates:
                db.commit()
                print(f"✅ DB UPDATE: Project {eq_id} -> {', '.join(updates)}")
            else:
                print(f"ℹ️ Project {eq_id} already up to date.")
        else:
            print(f"⚠️ Project {eq_id} not found in DB.")
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        db.close()

def search_emails(query):
    token = get_valid_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Searching Outlook for: '{query}'...")
    url = f"https://graph.microsoft.com/v1.0/me/messages?$search=\"{query}\"&$top=5&$select=subject,receivedDateTime,from,bodyPreview,hasAttachments,id"
    
    resp = requests.get(url, headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        messages = data.get("value", [])
        print(f"\nFound {len(messages)} emails. Analyzing with AI...\n")
        
        # Initialize Gemini
        import google.generativeai as genai
        GEMINI_KEY = os.getenv("GEMINI_API_KEY")
        if GEMINI_KEY:
            genai.configure(api_key=GEMINI_KEY)
            model = genai.GenerativeModel('gemini-flash-latest')
        else:
            print("Warning: GEMINI_API_KEY not found.")
            model = None

        session_eq_context = None

        for msg in messages:
            subject = msg['subject']
            sender = msg['from']['emailAddress']['name']
            body = msg.get('bodyPreview', '')
            date = msg['receivedDateTime']
            
            # Fetch Attachments
            att_names = []
            if msg.get('hasAttachments'):
                att_url = f"https://graph.microsoft.com/v1.0/me/messages/{msg['id']}/attachments"
                att_resp = requests.get(att_url, headers=headers)
                if att_resp.status_code == 200:
                    atts = att_resp.json().get('value', [])
                    att_names = [a['name'] for a in atts]
            
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
                2. Extract IDs: especially EQ numbers (e.g. EQxxxx).
                3. Customer Intent.
                
                Output JSON: {{ "type": "...", "eq_id": "...", "po_id": "...", "payment_id": "..." }}
                """
                try:
                    response = model.generate_content(prompt)
                    text = response.text.replace('```json', '').replace('```', '')
                    analysis = json.loads(text)
                    
                    eq_id = analysis.get('eq_id')
                    po_id = analysis.get('po_id')
                    pay_id = analysis.get('payment_id')
                    
                    # Context Carry Over
                    if eq_id and len(eq_id) > 2:
                        session_eq_context = eq_id
                    elif not eq_id and session_eq_context:
                        eq_id = session_eq_context # Use context
                    
                    print(f"TYPE: {analysis.get('type')}")
                    print(f"EQ:   {eq_id} (Context: {session_eq_context})")
                    print(f"PO:   {po_id}")
                    print(f"PAY:  {pay_id}")
                    
                    # Auto Link
                    if eq_id:
                         update_db(eq_id, po_id, pay_id)
                        
                except Exception as e:
                    print(f"AI Error: {e}")
            print("")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        search_emails(sys.argv[1])
    else:
        print("Usage: python scanner.py <search_term>")
