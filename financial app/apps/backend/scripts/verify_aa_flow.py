import sys
import os
import asyncio
import uuid
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SyncSessionLocal, sync_engine
from app.services.aa_service import AccountAggregatorService
from app.models import User, AAConsent, Account, Transaction, Base

def verify_aa_flow():
    # Ensure Tables
    Base.metadata.create_all(bind=sync_engine)
    
    db = SyncSessionLocal()
    print("--- Starting AA Flow Verification ---")
    
    # 1. Ensure a User Exists
    user = db.query(User).first()
    if not user:
        print("Creating seed user...")
        user = User(
            email="test_aa@example.com", 
            phone_number="9999999999", 
            password_hash="hashed", 
            full_name="AA Tester"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    print(f"User for Test: {user.email} ({user.user_id})")
    
    service = AccountAggregatorService(db)
    
    # 2. Create Consent
    print("\n[Step 1] Creating Consent...")
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
             loop = asyncio.new_event_loop()
             asyncio.set_event_loop(loop)
        
        consent_resp = loop.run_until_complete(service.create_consent(user.user_id, "9999999999"))
        print(f"Consent Created: {consent_resp}")
        handle = consent_resp["consent_handle"]
        
        # Verify DB
        consent_db = db.query(AAConsent).filter(AAConsent.consent_handle == handle).first()
        assert consent_db is not None
        assert consent_db.status == "PENDING"
        print("DB Record Verified (PENDING)")
        
        # 3. Check Status (and auto-activate MOCK)
        print("\n[Step 2] Checking Status...")
        resp = loop.run_until_complete(service.check_consent_status(handle))
        print(f"Consent Response: {resp}")
        status = resp["status"]
        assert status == "ACTIVE"
        
        # 4. Fetch Data
        print("\n[Step 3] Fetching Data...")
        sync_res = loop.run_until_complete(service.fetch_and_sync_data(consent_db.consent_id))
        print(f"Sync Result: {sync_res}")
        
        # 5. Verify Accounts & Transactions
        print("\n[Step 4] Verifying Data Persistence...")
        accounts = db.query(Account).filter(Account.institution_id == "SETU-FI").all()
        print(f"Accounts Found: {len(accounts)}")
        for acc in accounts:
            print(f" - {acc.institution_name} ({acc.masked_account_number}) : {acc.current_balance}")
            txns = db.query(Transaction).filter(Transaction.account_id == acc.account_id).all()
            print(f"   Transactions: {len(txns)}")
            for t in txns:
                print(f"    - {t.transaction_date.date()} | {t.amount} | {t.type} | {t.description}")
        
        assert len(accounts) >= 2 # HDFC and SBI
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup (Optional, but good for repeatability)
        # db.query(AAConsent).delete()
        # db.commit()
        db.close()

if __name__ == "__main__":
    verify_aa_flow()
