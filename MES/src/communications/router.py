from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.connection import get_db
from src.database.models import EmailMessage
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/communications",
    tags=["Communications"]
)

class EmailResponse(BaseModel):
    id: str
    subject: Optional[str]
    sender_name: Optional[str]
    sender_email: Optional[str]
    received_at: Optional[datetime]
    body_preview: Optional[str]
    has_attachments: bool
    intent: Optional[str]
    project_id: Optional[str]
    
    class Config:
        orm_mode = True

@router.get("/emails", response_model=List[EmailResponse])
def get_emails(
    project_id: Optional[str] = None,
    intent: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    q = db.query(EmailMessage)
    if project_id:
        q = q.filter(EmailMessage.project_id == project_id)
    if intent:
        q = q.filter(EmailMessage.intent == intent)
    
    return q.order_by(EmailMessage.received_at.desc()).limit(limit).all()

# --- Graph API Helper for Body Fetch ---
import msal
import os
import json
import requests

CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET", "L1w8Q~pHua7eZXKQQqRz6CDAtLiBV024XKfKrdrV")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb")
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
TOKEN_PATH = "storage/outlook_token.json"
SCOPE = ["Mail.Read", "Mail.Read.Shared", "User.Read", "Offline_access"]
TARGET_ACCOUNTS = ["me", "enquiries@englabs.co.uk", "mecheng2@englabs.co.uk", "admin1@englabs.co.uk"]

def get_graph_token():
    if not os.path.exists(TOKEN_PATH):
        raise HTTPException(status_code=401, detail="Outlook Integration not authenticated")
    
    with open(TOKEN_PATH, "r") as f:
        cache = json.load(f)
        
    app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    
    if "refresh_token" in cache:
        result = app.acquire_token_by_refresh_token(cache["refresh_token"], scopes=SCOPE)
        if "access_token" in result:
            # Update Cache
            with open(TOKEN_PATH, "w") as f:
                json.dump(result, f)
            return result["access_token"]
            
    if "access_token" in cache:
        return cache["access_token"]
        
    raise HTTPException(status_code=401, detail="Could not acquire token")

@router.get("/emails/{email_id}/body")
def get_email_body(email_id: str):
    try:
        token = get_graph_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        last_error = None
        
        # Iteratively check all mailboxes because we don't know who owns this ID
        for account in TARGET_ACCOUNTS:
            endpoint = f"users/{account}/messages" if account != "me" else "me/messages"
            url = f"https://graph.microsoft.com/v1.0/{endpoint}/{email_id}?$select=body,uniqueBody,hasAttachments"
            
            resp = requests.get(url, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "content": data.get("body", {}).get("content", ""),
                    "contentType": data.get("body", {}).get("contentType", "html"),
                    "uniqueBody": data.get("uniqueBody", {}).get("content", "")
                }
            elif resp.status_code == 404:
                continue # Try next account
            else:
                last_error = f"{account}: {resp.status_code} {resp.text}"
                print(f"Graph API Warn ({account}): {resp.status_code} {resp.text}")
                
        # If loop finishes without success
        raise HTTPException(status_code=404, detail=f"Email not found in any mailbox. Last Error: {last_error}")
            
    except Exception as e:
        print(f"Body Fetch Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
