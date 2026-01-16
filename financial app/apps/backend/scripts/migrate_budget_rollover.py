import sys
import os
# Fix path (apps/backend)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import SyncSessionLocal as SessionLocal

def migrate_db():
    print("Migrating Database...")
    db = SessionLocal()
    try:
        # Check if column exists
        try:
            db.execute(text("SELECT is_rollover FROM budgets LIMIT 1"))
            print("Column 'is_rollover' already exists.")
        except Exception:
            print("Adding 'is_rollover' column to budgets table...")
            db.execute(text("ALTER TABLE budgets ADD COLUMN is_rollover BOOLEAN DEFAULT FALSE"))
            db.commit()
            print("Migration successful.")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_db()
