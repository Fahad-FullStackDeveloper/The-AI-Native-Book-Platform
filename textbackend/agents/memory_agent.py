from agents.base_agent import Agent
from skills.chat_history_skill import ChatHistorySkill

class MemoryAgent(Agent):
    def __init__(self):
        super().__init__("MemoryAgent")
        self.add_skill("save_chat_history", ChatHistorySkill().execute)

    async def save_conversation(self, user_id, user_msg, ai_msg):
        try:
            await self.skills["save_chat_history"](user_id, user_msg, ai_msg)
        except Exception as e:
            print(f"Error in MemoryAgent saving conversation: {e}")
