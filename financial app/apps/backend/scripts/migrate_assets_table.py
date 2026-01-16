import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import SyncSessionLocal

def migrate_db():
    print("Migrating Database: Creating 'assets' table...")
    db = SyncSessionLocal()
    try:
        # Check if table exists
        check = db.execute(text("SELECT to_regclass('public.assets')")).scalar()
        if check:
            print("Table 'assets' already exists.")
        else:
            print("Creating 'assets' table...")
            # Note: We rely on standard PG/SQLAlchemy types. FK to users might fail if users table doesn't exist? 
            # It should exist.
            db.execute(text("""
                CREATE TABLE assets (
                    asset_id UUID PRIMARY KEY,
                    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    current_value FLOAT DEFAULT 0.0,
                    last_updated TIMESTAMPTZ DEFAULT now(),
                    created_at TIMESTAMPTZ DEFAULT now()
                )
            """))
            db.commit()
            print("Migration successful: Table created.")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Migration failed: {e}")
        db.rollback()
            
    finally:
        db.close()

if __name__ == "__main__":
    migrate_db()
