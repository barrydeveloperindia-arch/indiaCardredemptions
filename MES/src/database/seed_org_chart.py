from src.database.connection import SessionLocal
from src.database.models import User
from src.auth.security import get_password_hash

def seed_org_chart():
    db = SessionLocal()
    
    # Organization Chart Mapping
    # Format: (Username, Full Name, Role, Password)
    # Using simple passwords for initial setup
    users_to_seed = [
        ("bharat", "Bharat Anand", "admin", "bharat123"),       # Founder
        ("salil", "Salil Anand", "admin", "salil123"),          # Founder
        ("shreeya", "Shreeya", "admin", "shreeya123"),          # Founder
        ("gaurav", "Gaurav", "operations", "gaurav123"),        # Operations & Purchase
        ("mecheng1", "Mechanical Engineer 1", "engineer", "mech1"), # Engineering
        ("mecheng2", "Mechanical Engineer 2", "engineer", "mech2"), # Engineering
        ("enquiries", "Enquiries Team", "sales", "enq123"),     # Enquiries
        ("admin1", "Admin One", "admin", "admin123"),           # Admin
        ("marketing", "Marketing Team", "viewer", "market123")  # Marketing
    ]

    print("Seeding Organization Chart Users...")
    
    for username, fullname, role, password in users_to_seed:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"Creating user: {username} ({role})")
            new_user = User(
                username=username,
                # Simple email generation
                email=f"{username}@englabs.com", 
                hashed_password=get_password_hash(password),
                role=role
            )
            db.add(new_user)
        else:
            print(f"User {username} already exists. Updating role/password if needed (Skipping for now).")
            # Optional: Update role if it changed?
            # user.role = role
            # user.hashed_password = get_password_hash(password)

    db.commit()
    db.close()
    print("Organization Chart Seeding Complete.")

if __name__ == "__main__":
    seed_org_chart()
