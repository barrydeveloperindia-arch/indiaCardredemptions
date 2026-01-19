import os
import time
import psycopg2
from urllib.parse import urlparse

def wait_for_postgres():
    """
    Waits for the Postgres database to become available.
    """
    db_url = os.getenv("DATABASE_URL", "postgresql://mes_admin:secure_password@localhost:5432/mes_db")
    
    # Parse URL if needed, or just use psycopg2 to connect directly
    # For simplicity, we'll try to connect using the DSN
    
    if db_url.startswith("sqlite"):
        print(f"Database is SQLite ({db_url}). Skipping connection wait.")
        return

    print(f"Waiting for database at {db_url}...")
    
    retries = 30
    while retries > 0:
        try:
            conn = psycopg2.connect(db_url)
            conn.close()
            print("Database is ready!")
            return
        except psycopg2.OperationalError as e:
            print(f"Database unavailable, waiting 1 second... ({e})")
            retries -= 1
            time.sleep(1)
            
    raise Exception("Could not connect to database after 30 seconds.")

if __name__ == "__main__":
    wait_for_postgres()
