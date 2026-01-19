import psycopg2
import sys

# Hardcoded from docker-compose.yml
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "mes_db"
DB_USER = "mes_admin"
DB_PASS = "secure_password"

def debug_connect():
    print(f"Attempting connect to {DB_NAME} as {DB_USER} on {DB_HOST}:{DB_PORT}...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        print("SUCCESS: Connected!")
        conn.close()
    except Exception as e:
        print(f"FAILURE: {e}")
        # Try default postgres/postgres
        print("\nRetrying with default USER='postgres' (no password)...")
        try:
             conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                dbname="postgres",
                user="postgres",
                password="secure_password"
            )
             print("SUCCESS: Connected as 'postgres'/'secure_password'!")
             conn.close()
        except Exception as e2:
             print(f"FAILURE (Default User): {e2}")

if __name__ == "__main__":
    debug_connect()
