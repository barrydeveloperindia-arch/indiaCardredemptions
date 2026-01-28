
from src.database.connection import SessionLocal
from src.database.models import User
from src.auth.security import get_password_hash

def seed_users():
    db = SessionLocal()
    
    users = [
        {"username": "admin", "password": "admin", "role": "admin"},
        {"username": "operator", "password": "operator", "role": "operator"},
        {"username": "engineer", "password": "engineer", "role": "engineer"},
    ]
    
    for u in users:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            user = User(
                username=u["username"],
                email=f"{u['username']}@example.com",
                hashed_password=get_password_hash(u["password"]),
                role=u["role"]
            )
            db.add(user)
            print(f"Created user: {u['username']}")
        else:
            print(f"User exists: {u['username']}")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_users()
