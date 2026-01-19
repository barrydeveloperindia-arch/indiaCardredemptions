from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import User
from src.auth.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("Admin user already exists.")
            return

        # Create Admin
        admin_user = User(
            username="admin",
            email="admin@englabs.io",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        print("✅ Admin user created successfully.")
        print("Username: admin")
        print("Password: admin123")
    except Exception as e:
        print(f"❌ Error seeding admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
