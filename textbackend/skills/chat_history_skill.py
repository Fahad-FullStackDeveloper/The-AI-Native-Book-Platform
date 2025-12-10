import os
from dotenv import load_dotenv

from database import pool
from skills.base_skill import BaseSkill

load_dotenv()

class ChatHistorySkill(BaseSkill):
    def __init__(self, name: str = "chat_history_skill"):
        super().__init__(name)

    async def execute(self, user_id, user_msg, ai_msg):
        if not pool:
            print("Database pool not available, skipping chat history save.")
            return

        conn = None
        try:
            conn = pool.getconn()
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO chat_history (user_id, user_message, ai_response) VALUES (%s, %s, %s)",
                    (user_id, user_msg, ai_msg)
                )
            conn.commit()
            print(f"Chat history saved for user {user_id}")
        except Exception as e:
            print(f"Error saving chat history in ChatHistorySkill: {e}")
            if conn:
                conn.rollback()
        finally:
            if conn:
                pool.putconn(conn)
