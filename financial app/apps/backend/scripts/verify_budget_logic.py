import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SyncSessionLocal
from app.models import Budget, Transaction
from app.api.v1.endpoints.budgets import get_budget_progress, get_safe_to_spend
import datetime
import uuid

def test_budget_logic():
    db = SyncSessionLocal()
    try:
        print("Setting up Test Data...")
        # Clean up existing test data
        db.query(Transaction).filter(Transaction.category == "TEST_ROLLOVER").delete()
        db.query(Budget).filter(Budget.category == "TEST_ROLLOVER").delete()
        db.commit()

        # Dates
        today = datetime.date.today()
        current_month = today.strftime("%Y-%m")
        # Prev month logic
        first = today.replace(day=1)
        prev_month = (first - datetime.timedelta(days=1)).strftime("%Y-%m")
        prev_date_obj = (first - datetime.timedelta(days=15)) # mid prev month
        
        # 1. Create Budget for Prev Month (Limit 1000)
        b_prev = Budget(
            category="TEST_ROLLOVER",
            month=prev_month,
            limit_amount=1000.0,
            is_rollover=True
        )
        db.add(b_prev)
        
        # 2. Spend 400 in Prev Month (Leftover 600)
        t_prev = Transaction(
            transaction_id=uuid.uuid4(),
            transaction_date=prev_date_obj,
            amount=-400.0,
            type="DEBIT",
            category="TEST_ROLLOVER",
            description="Test Spend Prev",
            currency="INR"
        )
        db.add(t_prev)
        
        # 3. Create Budget for Current Month (Limit 500, Rollover=True)
        b_curr = Budget(
            category="TEST_ROLLOVER",
            month=current_month,
            limit_amount=500.0,
            is_rollover=True
        )
        db.add(b_curr)
        db.commit()
        db.close()
        
        # New session for verification to ensure clean state
        db = SyncSessionLocal()
        
        # DEBUG CHECK
        print("DEBUG CHECK: Fetching budgets...")
        check = db.query(Budget).filter(Budget.category == "TEST_ROLLOVER").all()
        for b in check:
            print(f"FOUND: {b.category}, Month={b.month}, Rollover={b.is_rollover}")
            
        print(f"Prev Budget: 1000, Spend: 400. Leftover should be 600.")
        print(f"Curr Budget: 500. Total Limit should be 500 + 600 = 1100.")
        
        print(f"Curr Budget: 500. Total Limit should be 500 + 600 = 1100.")
        
        # Verify
        import traceback
        try:
            progress = get_budget_progress(current_month, db)
            target = next((p for p in progress if p['category'] == "TEST_ROLLOVER"), None)
            
            if target:
                print(f"Result: Limit={target['limit']}, RolloverAdd={target['rollover_added']}")
                if target['limit'] == 1100.0 and target['rollover_added'] == 600.0:
                    print("SUCCESS: Rollover calculation correct.")
                else:
                    print(f"FAILURE: Calculation mismatch. Got {target['limit']}")
            else:
                print("FAILURE: Budget not found in result list.")
        except Exception:
            traceback.print_exc()
            
        # Test Safe To Spend
            
        # Test Safe To Spend
        print("\nTesting Safe To Spend...")
        safe = get_safe_to_spend(db)
        print(f"Daily Limit: {safe['daily_limit']}")
        print(f"Remaining: {safe['remaining']}")
        
    finally:
        # Cleanup
        db.query(Transaction).filter(Transaction.category == "TEST_ROLLOVER").delete()
        db.query(Budget).filter(Budget.category == "TEST_ROLLOVER").delete()
        db.commit()
        db.close()

if __name__ == "__main__":
    test_budget_logic()
