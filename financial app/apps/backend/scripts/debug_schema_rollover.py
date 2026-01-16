import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, inspect
from app.core.database import SyncSessionLocal, sync_engine

def check_schema():
    print("Checking Schema...")
    inspector = inspect(sync_engine)
    columns = inspector.get_columns('budgets')
    found = False
    for c in columns:
        print(f" - {c['name']} ({c['type']})")
        if c['name'] == 'is_rollover':
            found = True
            
    if found:
        print("SUCCESS: is_rollover column found.")
    else:
        print("FAILURE: is_rollover column MISSING.")

if __name__ == "__main__":
    check_schema()
