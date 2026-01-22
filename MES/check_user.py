from src.database.connection import SessionLocal
from src.database.models import User

db = SessionLocal()
users = db.query(User).all()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"Username: {u.username}, Role: {u.role}, Email: {u.email}")
db.close()
