import psycopg2

DB_HOST = "localhost"
DB_NAME = "mes_db"
DB_USER = "mes_admin"
DB_PASS = "secure_password"
DB_PORT = "5432"

def create_email_table():
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

        # SQL to create table
        create_sql = """
        CREATE TABLE IF NOT EXISTS email_messages (
            id VARCHAR PRIMARY KEY,
            subject VARCHAR,
            sender_name VARCHAR,
            sender_email VARCHAR,
            received_at TIMESTAMP,
            body_preview VARCHAR,
            has_attachments BOOLEAN DEFAULT FALSE,
            intent VARCHAR,
            project_id VARCHAR REFERENCES projects(project_id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_sql)
        print("Table 'email_messages' created/verified.")
        conn.close()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_email_table()
