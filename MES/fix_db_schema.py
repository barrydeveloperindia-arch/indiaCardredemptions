import sqlite3

DB_PATH = "mes.db"

def patch_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    columns = [
        ("po_number", "TEXT"),
        ("po_value", "REAL"),
        ("quote_value", "REAL")
    ]
    
    print("Checking database columns...")
    cursor.execute("PRAGMA table_info(projects)")
    existing_cols = {row[1] for row in cursor.fetchall()}
    
    for col_name, col_type in columns:
        if col_name not in existing_cols:
            print(f"Adding missing column: {col_name} ({col_type})")
            try:
                cursor.execute(f"ALTER TABLE projects ADD COLUMN {col_name} {col_type}")
                print(f"Added {col_name}")
            except Exception as e:
                print(f"Failed to add {col_name}: {e}")
        else:
            print(f"ℹ️ Column {col_name} already exists.")
            
    conn.commit()
    conn.close()
    print("Database patch complete.")

if __name__ == "__main__":
    patch_db()
