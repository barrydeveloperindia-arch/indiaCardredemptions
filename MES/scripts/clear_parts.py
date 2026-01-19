from sqlalchemy.orm import Session
from src.database.connection import SessionLocal
from src.database.models import Part

def clear_parts():
    db = SessionLocal()
    try:
        deleted = db.query(Part).delete()
        db.commit()
        print(f"Deleted {deleted} parts from catalog.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clear_parts()
