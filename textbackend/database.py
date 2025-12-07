import os
from dotenv import load_dotenv
from psycopg2.pool import SimpleConnectionPool

load_dotenv()

# Ensure the environment variable is loaded
db_url = os.getenv("NEON_DB_URL")
if not db_url:
    raise ValueError("NEON_DB_URL environment variable not set.")

pool = SimpleConnectionPool(1, 20, db_url)

def init_db():
    conn = pool.getconn()
    try:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                user_id TEXT,
                user_message TEXT,
                ai_response TEXT,
                timestamp TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        conn.commit()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        pool.putconn(conn)

# Call initialization
if __name__ == '__main__':
    init_db()
