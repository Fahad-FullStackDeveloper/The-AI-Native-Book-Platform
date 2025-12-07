# textbackend/agents/context_agent.py
from agents.base_agent import Agent
from skills.rag_skill import RagSearchSkill

class ContextAgent(Agent):
    def __init__(self):
        super().__init__("ContextAgent")
        self.add_skill("rag_search", RagSearchSkill().execute)

    async def get_context(self, question: str, selected_text: str | None = None):
        if selected_text and selected_text.strip():
            return f"USER HAS SELECTED THIS TEXT, ANSWER ONLY FROM THIS:\n---\n{selected_text.strip()}\n---"
        else:
            search_results = await self.skills["rag_search"](question)
            return f"SEARCHED CONTENT FROM THE BOOK:\n---\n{search_results}\n---"