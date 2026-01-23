from src.database.connection import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE parts ADD COLUMN manufacturing_process VARCHAR"))
            conn.commit()
            print("Added manufacturing_process column.")
        except Exception as e:
            print(f"Column likely exists or error: {e}")

if __name__ == "__main__":
    migrate()
