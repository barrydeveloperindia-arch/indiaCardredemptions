from src.database.connection import SessionLocal
from src.database.models import User

def check_admin():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"✅ Found user: {user.username}, Role: {user.role}, Hash: {user.hashed_password[:10]}...")
        else:
            print("❌ Admin user NOT found!")
    except Exception as e:
        print(f"❌ Error querying DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin()
