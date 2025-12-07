# textbackend/skills/llm_skill.py
import os
from dotenv import load_dotenv
import google.generativeai as genai

from skills.base_skill import BaseSkill

load_dotenv()

class LLMSkill(BaseSkill):
    def __init__(self, name: str = "llm_skill"):
        super().__init__(name)
        self.default_model = "gemini-1.5-flash-latest"  # CORRECT & WORKING in 2025

        try:
            genai.configure(api_key=os.getenv("GEMINI_KEY"))
            self.model = genai.GenerativeModel(self.default_model)
        except Exception as e:
            print(f"Error configuring Gemini in LLMSkill: {e}")
            self.model = None

    async def execute(self, system_prompt: str, context: str, question: str, model_name: str | None = None):
        if not self.model:
            return "Sorry, AI model load nahi ho raha. Admin se keh do fix karein."

        try:
            model_to_use = self.model
            if model_name and model_name != self.default_model:
                model_to_use = genai.GenerativeModel(model_name)

            response = model_to_use.generate_content(
                [system_prompt, context, f"Question: {question}"],
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    top_p=0.8,
                    max_output_tokens=1500
                )
            )
            return response.text.strip()

        except Exception as e:
            print(f"Gemini Error in LLMSkill: {e}")
            return "Sorry, AI thodi der mein wapas aa raha hai. Thodi der baad try karo."