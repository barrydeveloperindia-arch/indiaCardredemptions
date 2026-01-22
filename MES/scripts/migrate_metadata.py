
import sys
from sqlalchemy import text
sys.path.append("/app")
from src.database.connection import engine

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE parts ADD COLUMN project_id VARCHAR;"))
            print("Added project_id column.")
        except Exception as e:
            print(f"project_id exists or error: {e}")
            
        try:
            conn.execute(text("ALTER TABLE parts ADD COLUMN source_path VARCHAR;"))
            print("Added source_path column.")
        except Exception as e:
            print(f"source_path exists or error: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate()
