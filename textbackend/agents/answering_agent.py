# textbackend/agents/answering_agent.py
from agents.base_agent import Agent
from skills.llm_skill import LLMSkill

class AnsweringAgent(Agent):
    def __init__(self):
        super().__init__("AnsweringAgent")
        self.add_skill("generate_llm_response", LLMSkill().execute)

    async def generate_answer(self, context: str, question: str):
        system_prompt = """You are BookGuide, a super friendly and expert assistant for the book "The AI Native Book".

IMPORTANT RULES:
- Agar context mein "USER HAS SELECTED THIS TEXT" likha hai to sirf ussi text se jawab do.
- Warna book ke search results use karo.
- Jawab Hinglish mein do (Roman Urdu + English mix), bilkul dost jaisa.
- Har important baat ke baad citation do like: (Source: Chapter 5, Section 2)
- Agar jawab nahi pata to sach bol do: "Sorry yaar, yeh book mein nahi hai is waqt."

Be fun, clear, and accurate!"""

        try:
            reply = await self.skills["generate_llm_response"](
                system_prompt, context, question
            )
            return reply
        except Exception as e:
            print(f"Error in AnsweringAgent: {e}")
            return "Sorry bhai, AI thoda down hai. 2 minute baad try karna!"