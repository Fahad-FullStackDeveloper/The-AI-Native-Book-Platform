from agents.base_agent import OrchestratorAgent
from agents.context_agent import ContextAgent
from agents.answering_agent import AnsweringAgent
from agents.memory_agent import MemoryAgent

class BookChatOrchestrator(OrchestratorAgent):
    def __init__(self):
        super().__init__("BookChatOrchestrator")
        self.add_sub_agent("context_agent", ContextAgent())
        self.add_sub_agent("answering_agent", AnsweringAgent())
        self.add_sub_agent("memory_agent", MemoryAgent())

    async def execute(self, question: str, selected_text: str | None = None, user_id: str = "anon"):
        try:
            # 1. Get Context from ContextAgent
            context = await self.sub_agents["context_agent"].get_context(question, selected_text)

            # 2. Generate Answer from AnsweringAgent
            ai_reply = await self.sub_agents["answering_agent"].generate_answer(context, question)

            # 3. Save Chat History via MemoryAgent
            await self.sub_agents["memory_agent"].save_conversation(user_id, question, ai_reply)

            return ai_reply
        except Exception as e:
            print(f"Error in BookChatOrchestrator execution: {e}")
            return "Sorry, BookChatOrchestrator ko task pura karne mein thodi mushkil ho rahi hai."
