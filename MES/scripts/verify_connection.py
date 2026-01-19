import psycopg2
import sys
import os

url = os.getenv("DATABASE_URL", "postgresql://mes_admin:secure_password@127.0.0.1:5432/mes_db")
print(f"Connecting to {url}...")
try:
    conn = psycopg2.connect(url)
    conn.close()
    print("SUCCESS: Connected to database.")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)
