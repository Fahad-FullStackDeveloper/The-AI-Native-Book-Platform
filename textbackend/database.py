import os
from dotenv import load_dotenv
from psycopg2 import pool
import psycopg2
import time

load_dotenv()

# Ensure the environment variable is loaded
db_url = os.getenv("NEON_DB_URL")
if not db_url:
    raise ValueError("NEON_DB_URL environment variable not set.")

# Create connection pool with better error handling
pool = None
try:
    pool = psycopg2.pool.SimpleConnectionPool(1, 20, db_url)
    print("Database connection pool created successfully.")
except Exception as e:
    print(f"Error creating database connection pool: {e}")
    pool = None

def init_db():
    if not pool:
        print("Database pool not available, skipping initialization.")
        return

    conn = None
    try:
        conn = pool.getconn()
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
        if conn:
            conn.rollback()
    finally:
        if conn:
            pool.putconn(conn)

# Call initialization
if __name__ == '__main__':
    init_db()
