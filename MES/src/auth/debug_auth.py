from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import User
from src.auth.security import verify_password, get_password_hash

def debug_auth():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            print("❌ Admin user NOT FOUND in database.")
            return

        print(f"✅ User found: {user.username}")
        print(f"Stored Hash: {user.hashed_password}")
        
        # Test Verify
        is_valid = verify_password("admin123", user.hashed_password)
        if is_valid:
            print("✅ Password 'admin123' VERIFIED successfully.")
        else:
            print("❌ Password 'admin123' FAILED verification.")
            
            # Try re-hashing
            new_hash = get_password_hash("admin123")
            print(f"New Hash generation test: {new_hash}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_auth()
