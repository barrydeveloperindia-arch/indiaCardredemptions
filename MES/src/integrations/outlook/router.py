from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
import msal
import os
import logging
from src.database.connection import get_db
from sqlalchemy.orm import Session
from src.database.models import User # Phase 6: Store tokens against user?

router = APIRouter()
logger = logging.getLogger("uvicorn")

# Configuration (To be filled by Environment or User Input)
CLIENT_ID = os.getenv("OUTLOOK_CLIENT_ID", "4319b490-cfd2-4cc9-8c62-f70533da0d15")
CLIENT_SECRET = os.getenv("OUTLOOK_CLIENT_SECRET", "L1w8Q~pHua7eZXKQQqRz6CDAtLiBV024XKfKrdrV")
TENANT_ID = os.getenv("OUTLOOK_TENANT_ID", "5a5b6ab0-e571-4785-a84b-28b2817d55fb") # Or specific tenant
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
REDIRECT_PATH = "/api/integrations/outlook/callback"
SCOPE = ["Mail.Read", "User.Read", "Offline_access"]

def _build_msal_app(cache=None):
    return msal.ConfidentialClientApplication(
        CLIENT_ID, 
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET, 
        token_cache=cache
    )

@router.get("/login")
def login(request: Request):
    """Initiates the OAuth Flow."""
    # Logic to build absolute URI for redirect
    # Need to handle localhost vs production URL
    redirect_uri = str(request.url_for("authorized")).replace("http://0.0.0.0:8000", "http://localhost:8008") 
    # Hardcoded localhost fix for Docker interaction
    
    auth_url = _build_msal_app().get_authorization_request_url(
        SCOPE,
        redirect_uri=redirect_uri
    )
    return RedirectResponse(auth_url)

@router.get("/callback", name="authorized")
def authorized(code: str, request: Request, db: Session = Depends(get_db)):
    """Handles the callback from Microsoft."""
    redirect_uri = str(request.url_for("authorized")).replace("http://0.0.0.0:8000", "http://localhost:8008")
    
    result = _build_msal_app().acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,
        redirect_uri=redirect_uri
    )
    
    if "error" in result:
        logger.error(f"Outlook Auth Error: {result}")
        return {"error": result.get("error"), "desc": result.get("error_description")}
        
    # Success! We have access_token and refresh_token
    import json
    token_path = "storage/outlook_token.json"
    with open(token_path, "w") as f:
        json.dump(result, f)
    
    logger.info(f"Outlook Token saved to {token_path}")
    return {
        "status": "SUCCESS", 
        "user": result.get("id_token_claims"),
        "message": "Integration linked. Token saved securely."
    }
