import msal
import os
import json
import requests
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Project, EmailMessage, Machine, Order, DispatchQueue, Contact

# Configuration
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET", "L1w8Q~pHua7eZXKQQqRz6CDAtLiBV024XKfKrdrV")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
TOKEN_PATH = "storage/outlook_token.json"
SCOPE = ["Mail.Read", "Mail.Read.Shared", "User.Read", "Offline_access"]

TARGET_ACCOUNTS = ["me", "enquiries@englabs.co.uk", "mecheng2@englabs.co.uk", "admin1@englabs.co.uk"]

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

def update_db(eq_id, po_num=None, payment_ref=None, po_val=0.0):
    if not eq_id: return
    
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.project_id == eq_id).first()
        if project:
            updates = []
            if po_num:
                project.po_number = po_num
                updates.append(f"Linked PO {po_num}")
            if po_val and po_val > 0:
                project.po_value = po_val
                updates.append(f"Set Value {po_val}")
            if payment_ref:
                if payment_ref not in project.description:
                    project.description += f" [Payment: {payment_ref}]"
                    updates.append(f"Linked Payment {payment_ref}")
            if updates:
                db.commit()
                print(f"DB UPDATE: Project {eq_id} -> {', '.join(updates)}")
            else:
                print(f"Project {eq_id} already up to date.")
        else:
            print(f"Project {eq_id} not found in DB.")
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        db.close()

def search_emails(query, limit=25):
    token = get_valid_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    import google.generativeai as genai
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel('gemini-flash-latest')
    else:
        print("Warning: GEMINI_API_KEY not found.")
        model = None

    for account in TARGET_ACCOUNTS:
        endpoint = f"users/{account}/messages" if account != "me" else "me/messages"
        print(f"\nSearching {account} for: '{query}' (Limit: {limit})...")
        # Removed $orderby as it conflicts with $search in Graph API
        url = f"https://graph.microsoft.com/v1.0/{endpoint}?$search=\"{query}\"&$top={limit}&$select=subject,receivedDateTime,from,bodyPreview,hasAttachments,id"
        
        try:
            resp = requests.get(url, headers=headers)
            if resp.status_code != 200:
                print(f"Skipping {account}: {resp.status_code}")
                continue
                
            data = resp.json()
            messages = data.get("value", [])
            print(f"Found {len(messages)} emails in {account}.")

            for msg in messages:
                process_email(msg, headers, model)
                
        except Exception as e:
            print(f"Error scanning {account}: {e}")

def process_email(msg, headers, model):
    subject = msg['subject']
    sender = msg['from']['emailAddress'].get('name', 'Unknown')
    body = msg.get('bodyPreview', '')
    date = msg['receivedDateTime']
    
    att_names = []
    if msg.get('hasAttachments'):
        try:
            att_url = f"https://graph.microsoft.com/v1.0/me/messages/{msg['id']}/attachments"
            att_resp = requests.get(att_url, headers=headers)
            if att_resp.status_code == 200:
                atts = att_resp.json().get('value', [])
                att_names = [a['name'] for a in atts]
        except: pass
    
    print(f"--- Analyzing: {subject[:50]}... ---")
    
    if model:
        prompt = f"""
        Analyze this manufacturing email.
        Subject: {subject}
        Sender: {sender}
        Date: {date}
        BodySnippet: {body}
        
        Task:
        1. Classify Type: [Enquiry, Quote_Sent, PO_Received, Job_Request, Other]
        2. Extract IDs: EQxxxx, POxxxx.
        3. Intent.
        
        Output JSON: {{ "type": "...", "eq_id": "...", "intent": "..." }}
        """
        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '')
            try:
                analysis = json.loads(text)
            except:
                analysis = {"type": "Other"}
            
            eq_id = analysis.get('eq_id')
            
            # --- AUTO LOGIC ---
            db = SessionLocal()
            try:
                # If no ID, but it looks like a Requirement/Job
                triggers = ["requirement", "job", "enquiry", "sample", "test", "rfq", "project"]
                if not eq_id and any(t in subject.lower() for t in triggers):
                    new_eq_id = f"EQ-AUTO-{int(datetime.utcnow().timestamp())}"
                    print(f"🚀 Auto-Creating Project: {new_eq_id}")
                    
                    # Ensure Internal Contact
                    if not db.query(Contact).filter(Contact.contact_id == "Internal").first():
                        db.add(Contact(contact_id="Internal", name="Internal Request", email="internal@englabs.co.uk"))
                        db.commit()
                        
                    new_proj = Project(
                        project_id=new_eq_id,
                        name=subject[:100],
                        customer_id="Internal",
                        status="ACTIVE",
                        start_date=datetime.utcnow(),
                        description=f"From: {sender}\n{body[:200]}"
                    )
                    db.add(new_proj)
                    db.commit()
                    eq_id = new_eq_id
                    
                    # Create Dispatch Job
                    print(f"🚀 Auto-Creating Dispatch Job for {new_eq_id}...")
                    mach = db.query(Machine).first()
                    order = Order(
                        order_id=f"ORD-{new_eq_id}",
                        customer_id="Internal",
                        priority_level=1,
                        cad_file_path="manual_entry.stl",
                        technical_requirements={},
                        status="PENDING"
                    )
                    db.add(order)
                    db.commit()
                    
                    if mach:
                        job = DispatchQueue(
                            job_id=f"JOB-{new_eq_id}",
                            order_id=order.order_id,
                            machine_id=mach.machine_id,
                            planned_start_time=datetime.utcnow() + timedelta(hours=1),
                            estimated_runtime_seconds=3600,
                            status="QUEUED"
                        )
                        db.add(job)
                        db.commit()
                        print(f"✅ Created Job: JOB-{new_eq_id}")
            
                # Save Email
                try:
                    dt_str = date.replace('Z', '+00:00')
                    rec_dt = datetime.fromisoformat(dt_str)
                except:
                    rec_dt = datetime.utcnow()
                    
                email_entry = EmailMessage(
                    id=msg['id'],
                    subject=subject,
                    sender_name=sender,
                    sender_email=msg['from']['emailAddress'].get('address', ''),
                    received_at=rec_dt,
                    body_preview=body[:500],
                    has_attachments=bool(att_names),
                    intent=analysis.get('type'),
                    project_id=eq_id
                )
                db.merge(email_entry)
                db.commit()
                print("Saved Email Log.")
                
            except Exception as e:
                print(f"DB Ops Error: {e}")
            finally:
                db.close()
                
        except Exception as e:
            print(f"AI Error: {e}")
    print("")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query_arg = sys.argv[1]
        limit_arg = 25
        if len(sys.argv) > 2:
            limit_arg = int(sys.argv[2])
        search_emails(query_arg, limit=limit_arg)
    else:
        print("Usage: python scanner.py <search_term>")
