from src.database.connection import SessionLocal
from src.database.models import User
from src.auth.security import get_password_hash

def seed_users():
    db = SessionLocal()
    
    # 1. Admin User
    admin_user = db.query(User).filter(User.username == "admin").first()
    if not admin_user:
        print("Creating admin user...")
        admin = User(
            username="admin",
            email="admin@englabs.com",
            hashed_password=get_password_hash("admin"),
            role="admin"
        )
        db.add(admin)
    else:
        print("Admin user already exists.")
        
    # 2. Operator User
    op_user = db.query(User).filter(User.username == "operator").first()
    if not op_user:
        print("Creating operator user...")
        op = User(
            username="operator",
            email="operator@englabs.com",
            hashed_password=get_password_hash("operator"),
            role="operator"
        )
        db.add(op)
    else:
        print("Operator user already exists.")

    db.commit()
    db.close()
    print("User seeding complete.")

if __name__ == "__main__":
    seed_users()
