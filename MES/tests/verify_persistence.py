import sys
import os
import time

# Ensure we can import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, Column, Integer, String, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Force Postgres URL for this test
DB_URL = "postgresql://mes_admin:secure_password@localhost:5432/mes_db"
os.environ["DATABASE_URL"] = DB_URL

from src.database.connection import SessionLocal, engine, Base

# Dynamic Model for Test
class TestPersistence(Base):
    __tablename__ = "persistence_check"
    id = Column(Integer, primary_key=True, index=True)
    block_data = Column(String)

def seed():
    print(f"--- Seeding Data into {DB_URL} ---")
    # Create Table
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    # Check if data exists
    existing = db.query(TestPersistence).filter_by(block_data="Genesis Block").first()
    if existing:
        print("Data already exists (unexpected for fresh container).")
    else:
        new_item = TestPersistence(block_data="Genesis Block")
        db.add(new_item)
        db.commit()
        print("Inserted 'Genesis Block'.")
    db.close()

def verify():
    print(f"--- Verifying Data in {DB_URL} ---")
    db = SessionLocal()
    try:
        item = db.query(TestPersistence).filter_by(block_data="Genesis Block").first()
        if item:
            print("SUCCESS: 'Genesis Block' found!")
        else:
            print("FAILURE: Data lost!")
            sys.exit(1)
    except Exception as e:
        print(f"FAILURE: Database Error: {e}")
        sys.exit(1)
    db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        verify()
    else:
        seed()
