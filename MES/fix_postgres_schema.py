import os
import psycopg2

# Connect to Postgres (exposed on localhost:5432)
DB_HOST = "localhost"
DB_NAME = "mes_db"
DB_USER = "mes_admin"
DB_PASS = "secure_password"
DB_PORT = "5432"

def patch_db_postgres():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()
        print("Connected to PostgreSQL.")

        columns = [
            ("po_number", "TEXT"),
            ("po_value", "REAL"),
            ("quote_value", "REAL")
        ]

        # Check existing columns
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='projects';")
        existing_cols = {row[0] for row in cursor.fetchall()}

        for col_name, col_type in columns:
            if col_name not in existing_cols:
                print(f"Adding column: {col_name} ({col_type})")
                try:
                    # Postgres syntax: ALTER TABLE projects ADD COLUMN name type;
                    cursor.execute(f"ALTER TABLE projects ADD COLUMN {col_name} {col_type}")
                    print(f"Added {col_name}")
                except Exception as e:
                    print(f"Failed to add {col_name}: {e}")
            else:
                print(f"Column {col_name} exists.")

        conn.close()
        print("Patch Complete.")

    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    patch_db_postgres()
