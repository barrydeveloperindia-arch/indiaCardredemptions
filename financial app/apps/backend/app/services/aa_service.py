import httpx
import uuid
import os
import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.aa_consent import AAConsent
from app.models.account import Account
from app.models.transaction import Transaction
from jwcrypto import jwk, jwe

class AccountAggregatorService:
    # Production/Sandbox URLs
    BASE_URL = "https://fiu-sandbox.setu.co"
    
    def __init__(self, db: Session):
        self.db = db
        self.client_id = os.environ.get("SETU_CLIENT_ID")
        self.client_secret = os.environ.get("SETU_CLIENT_SECRET")
        self.private_key_pem = os.environ.get("SETU_PRIVATE_KEY")
        self.product_instance_id = os.environ.get("SETU_PRODUCT_INSTANCE_ID")

    async def create_consent(self, user_id: uuid.UUID, mobile_number: str):
        """
        Initiates a consent request with Setu. 
        """
        if not self.client_id or not self.client_secret:
            raise ValueError("AA Configuration Missing (CLIENT_ID/SECRET)")

        # Create Consent Payload
        payload = {
            "DataLife": {
                "Unit": "MONTH",
                "Value": 1
            },
            "DataConsumer": {
                "id": self.client_id
            },
            "Customer": {
                "id": f"{mobile_number}@setu-aa" 
            },
            "Purpose": {
                "code": "101",
                "refUri": "https://api.rebit.org.in/aa/purpose/101.xml",
                "text": "Wealth Management Service",
                "Category": {
                    "type": "string" 
                }
            },
            "fiTypes": ["DEPOSIT", "CREDIT_CARD"],
            "limit": 10000
        }

        async with httpx.AsyncClient() as client:
            # Note: real auth token generation might be needed if not using client_id/secret directly in headers
            # Setu Sandbox typically uses x-client-id and x-client-secret headers
            headers = {
                "x-client-id": self.client_id,
                "x-client-secret": self.client_secret,
                "Content-Type": "application/json"
            }
            if self.product_instance_id:
                headers["x-product-instance-id"] = self.product_instance_id

            response = await client.post(
                f"{self.BASE_URL}/consents", 
                json=payload, 
                headers=headers
            )
            
            if response.status_code != 201:
                raise Exception(f"AA Provider Error: {response.text}")

            data = response.json()
            consent_handle = data.get("id")
            url = data.get("url")

            # Create record
            new_consent = AAConsent(
                user_id=user_id,
                consent_handle=consent_handle,
                status="PENDING",
                valid_from=datetime.now(),
                valid_to=None
            )
            self.db.add(new_consent)
            self.db.commit()
            self.db.refresh(new_consent)
            
            return {
                "consent_handle": consent_handle,
                "redirect_url": url
            }

    async def check_consent_status(self, consent_handle: str):
        """
        Checks the status of the consent.
        """
        consent = self.db.query(AAConsent).filter(AAConsent.consent_handle == consent_handle).first()
        if not consent:
            return None

        async with httpx.AsyncClient() as client:
            headers = {
                "x-client-id": self.client_id,
                "x-client-secret": self.client_secret
            }
            if self.product_instance_id:
                headers["x-product-instance-id"] = self.product_instance_id

            response = await client.get(
                f"{self.BASE_URL}/consents/{consent_handle}",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                status = data.get("status") # ACTIVE, REJECTED, PENDING
                
                if status and status != consent.status:
                    consent.status = status
                    if status == "ACTIVE":
                        consent.consent_id = data.get("consentId") # Ensure we capture the specialized ID
                    self.db.commit()
            
        return {
            "status": consent.status,
            "consent_id": str(consent.consent_id) if consent.consent_id else None
        }

    async def fetch_and_sync_data(self, consent_id: uuid.UUID):
        """
        Fetches data for an ACTIVE consent, DECRYPTS it, and syncs to DB.
        """
        consent = self.db.query(AAConsent).filter(AAConsent.consent_id == consent_id).first()
        if not consent or consent.status != "ACTIVE":
            raise ValueError("Consent is not active")

        # 1. Create Data Session 
        async with httpx.AsyncClient() as client:
            headers = {
                "x-client-id": self.client_id,
                "x-client-secret": self.client_secret,
                "Content-Type": "application/json"
            }
            if self.product_instance_id:
                headers["x-product-instance-id"] = self.product_instance_id

            # Create Data Session
            session_payload = {
                "consentId": str(consent_id),
                "DataRange": {
                    "from": "2023-01-01T00:00:00Z", # Example range
                    "to": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
                },
                "format": "json"
            }
            
            res_session = await client.post(f"{self.BASE_URL}/fi/request", json=session_payload, headers=headers)
            if res_session.status_code != 201:
                 raise Exception(f"Failed to create session: {res_session.text}")
            
            session_id = res_session.json().get("sessionId")

            # Fetch Data
            res_fetch = await client.get(f"{self.BASE_URL}/fi/fetch/{session_id}", headers=headers)
            if res_fetch.status_code != 200:
                raise Exception(f"Failed to message data: {res_fetch.text}")

            fi_data_encrypted = res_fetch.json()
            
            # 2. Decrypt Data
            decrypted_data = self._decrypt_data(fi_data_encrypted)
            
            # 3. Process Data
            results = self._process_fi_data(consent.user_id, decrypted_data)
            return results

    def _decrypt_data(self, encrypted_payload: dict):
        """
        Decrypts JWE payload using the provided private KEY.
        """
        if not self.private_key_pem:
             raise ValueError("Missing SETU_PRIVATE_KEY for decryption")
             
        # Often the hierarchy is FI -> simple/structured string (JWE)
        # We assume 'FI' list contains the JWE token(s)
        # Note: Setu structure might vary slightly, treating as ReBIT standard JWE
        
        # Taking the first FI block for simplicity or iterating
        # Usually: payload['FI'] is a list.
        
        fi_list = encrypted_payload.get("FI", [])
        if not fi_list:
            raise ValueError("No FI data found in response")

        merged_data = {"Account": []}

        for fi_entry in fi_list:
             # The 'data' might be the JWE string
             # Or sometimes it's nested. Assuming standard Setu response:
             jwe_token = fi_entry.get("data", [])
             if isinstance(jwe_token, list):
                 jwe_token = jwe_token[0].get("encryptedFI") # Hypothetical path
             elif isinstance(jwe_token, str):
                 jwe_token = fi_entry.get("keyMaterial", {}).get("encryptedFI") # ReBIT structure can be complex
             
             # Fallback to direct 'encryptedFI' if structure matches
             jwe_token = fi_entry.get("encryptedFI")
             if not jwe_token:
                 # Try finding a string that looks like JWE in the entry
                 # For the purpose of this implementation, we assume the payload *is* the JWE or contains it clearly
                 pass

             # SIMPLIFICATION FOR IMPLEMENTATION: 
             # Setu often returns { "FI": [ { "keyMaterial": ..., "data": [ { "encryptedFI": "..." } ] } ] }
             try:
                 encrypted_fi = fi_entry["data"][0]["encryptedFI"]
                 
                 key = jwk.JWK.from_pem(self.private_key_pem.encode('utf-8'))
                 jwetoken = jwe.JWE()
                 jwetoken.deserialize(encrypted_fi, key=key)
                 payload = jwetoken.payload
                 
                 data_dict = json.loads(payload)
                 if "Account" in data_dict:
                     merged_data["Account"].extend(data_dict["Account"])
                     
             except Exception as e:
                 print(f"Decryption failed for an entry: {e}")
                 continue

        return merged_data

    def _process_fi_data(self, user_id: uuid.UUID, data: dict):
        """
        Parses FI data and updates Accounts/Transactions.
        """
        fetched_count = 0
        
        for account_info in data.get("Account", []):
            # 1. Find or Create Account
            masked_acc = account_info.get("MaskedAccNumber")
            inst_name = account_info.get("InstitutionName", "Unknown Bank")
            
            account = self.db.query(Account).filter(
                Account.masked_account_number == masked_acc,
                Account.institution_name == inst_name,
                Account.user_id == user_id
            ).first()
            
            if not account:
                account = Account(
                    user_id=user_id,
                    institution_id="SETU-FI-REAL", 
                    institution_name=inst_name,
                    account_type=account_info.get("Type", "SAVINGS"),
                    masked_account_number=masked_acc,
                    current_balance=float(account_info.get("CurrentBalance", 0)),
                    status="ACTIVE",
                    last_synced_at=datetime.now()
                )
                self.db.add(account)
                self.db.commit()
                self.db.refresh(account)
            else:
                account.current_balance = float(account_info.get("CurrentBalance", account.current_balance))
                account.last_synced_at = datetime.now()
                self.db.commit()
            
            # 2. Process Transactions
            txns = account_info.get("Transactions", {}).get("Transaction", [])
            for t_data in txns:
                txn_ref = t_data.get("TxnId")
                existing = self.db.query(Transaction).filter(
                    Transaction.reference_number == txn_ref,
                    Transaction.account_id == account.account_id
                ).first()
                
                if existing:
                    continue
                
                amount = float(t_data.get("Amount", 0))
                txn_type = t_data.get("Type", "DEBIT").upper()
                
                new_txn = Transaction(
                    account_id=account.account_id,
                    transaction_date=datetime.fromisoformat(t_data.get("ValueDate")),
                    amount=amount,
                    description=t_data.get("Narration", ""),
                    category="Uncategorized", 
                    type=txn_type,
                    reference_number=txn_ref,
                    narration=t_data.get("Narration", "")
                )
                self.db.add(new_txn)
                fetched_count += 1
                
        self.db.commit()
        return {"status": "success", "new_transactions": fetched_count}
