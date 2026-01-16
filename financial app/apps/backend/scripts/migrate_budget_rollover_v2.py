import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import SyncSessionLocal
import traceback

def migrate_db():
    print("Migrating Database...")
    db = SyncSessionLocal()
    try:
        # Try to add column directly. 
        # If it exists, PG raises DuplicateColumn error.
        print("Attempting ALTER TABLE...")
        db.execute(text("ALTER TABLE budgets ADD COLUMN is_rollover BOOLEAN DEFAULT FALSE"))
        db.commit()
        print("Migration successful: Column added.")
            
    except Exception as e:
        print(f"Exception during migration: {e}")
        db.rollback()
        # Check if it was because it exists
        if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
            print("Column already exists (Ignored).")
        else:
            traceback.print_exc()
            
    finally:
        db.close()

if __name__ == "__main__":
    migrate_db()
