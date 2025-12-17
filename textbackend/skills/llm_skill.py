# textbackend/skills/llm_skill.py
import os
from dotenv import load_dotenv
import google.generativeai as genai
from openai import OpenAI

from skills.base_skill import BaseSkill

load_dotenv()

class LLMSkill(BaseSkill):
    def __init__(self, name: str = "llm_skill"):
        super().__init__(name)

        # Initialize both APIs - try Gemini first, but also set up OpenAI as fallback
        self.api_type = "gemini"
        self.default_model = "gemini-2.5-flash"
        self.model = None
        self.client = None

        # Store all available Gemini API keys
        self.gemini_keys = [
            os.getenv("GEMINI_KEY"),
            os.getenv("GEMINI_KEY_2"),
            os.getenv("GEMINI_KEY_3")
        ]
        # Filter out None values
        self.gemini_keys = [key for key in self.gemini_keys if key is not None and key.strip() != ""]

        # Try to initialize Gemini with first available key
        if self.gemini_keys:
            try:
                genai.configure(api_key=self.gemini_keys[0])
                self.model = genai.GenerativeModel(self.default_model)
                self.current_gemini_key_idx = 0
                print("Gemini API configured successfully with first key")
            except Exception as e:
                print(f"Error configuring Gemini in LLMSkill: {e}")
                self.current_gemini_key_idx = -1
        else:
            print("No Gemini API keys found")
            self.current_gemini_key_idx = -1

        # Also try to initialize OpenAI as fallback for quota issues
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and openai_key.strip() != "":
            try:
                self.client = OpenAI(api_key=openai_key)
                print("OpenAI API configured successfully as fallback")
                # Only change the primary API type if Gemini failed completely
                if self.current_gemini_key_idx == -1:
                    self.api_type = "openai"
                    self.default_model = "gpt-3.5-turbo"
            except Exception as e2:
                print(f"Error configuring OpenAI in LLMSkill: {e2}")
                self.client = None
        else:
            print("No OpenAI API key found, skipping OpenAI fallback setup")
            self.client = None

    async def execute(self, system_prompt: str, context: str, question: str, model_name: str | None = None):
        if not self.model and not self.client:
            return "Sorry, AI model load nahi ho raha. Admin se keh do fix karein."

        # First try with current Gemini key
        if self.api_type == "gemini" and self.current_gemini_key_idx != -1:
            try:
                # Use current Gemini API key
                current_key = self.gemini_keys[self.current_gemini_key_idx]
                genai.configure(api_key=current_key)

                model_to_use = genai.GenerativeModel(self.default_model)
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
                print(f"LLM Error in LLMSkill with current key: {e}")
                # If it's a quota error, try rotating to next key
                if "quota" in str(e).lower() or "rate limit" in str(e).lower() or "429" in str(e):
                    # Try other available Gemini keys
                    for idx in range(len(self.gemini_keys)):
                        if idx != self.current_gemini_key_idx:
                            try:
                                genai.configure(api_key=self.gemini_keys[idx])
                                model_to_use = genai.GenerativeModel(self.default_model)

                                response = model_to_use.generate_content(
                                    [system_prompt, context, f"Question: {question}"],
                                    generation_config=genai.types.GenerationConfig(
                                        temperature=0.3,
                                        top_p=0.8,
                                        max_output_tokens=1500
                                    )
                                )
                                self.current_gemini_key_idx = idx  # Switch to working key
                                print(f"Switched to Gemini key #{idx+1}")
                                return response.text.strip()
                            except Exception as retry_error:
                                print(f"Retry with Gemini key #{idx+1} also failed: {retry_error}")
                                continue

                    # If all Gemini keys failed, try OpenAI as fallback
                    if self.client:
                        print("All Gemini keys exhausted, switching to OpenAI fallback")
                        try:
                            model_to_use = model_name if model_name else self.default_model
                            response = self.client.chat.completions.create(
                                model=model_to_use,
                                messages=[
                                    {"role": "system", "content": system_prompt},
                                    {"role": "user", "content": f"{context}\n\nQuestion: {question}"}
                                ],
                                temperature=0.3,
                                max_tokens=1500,
                                top_p=0.8
                            )
                            return response.choices[0].message.content.strip()
                        except Exception as openai_error:
                            print(f"OpenAI fallback also failed: {openai_error}")
                            return "Sorry, AI thodi der mein wapas aa raha hai. Thodi der baad try karo."

                return "Sorry, AI thodi der mein wapas aa raha hai. Thodi der baad try karo."
        else:
            # Use OpenAI as primary
            try:
                model_to_use = model_name if model_name else self.default_model
                response = self.client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"{context}\n\nQuestion: {question}"}
                    ],
                    temperature=0.3,
                    max_tokens=1500,
                    top_p=0.8
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"LLM Error in LLMSkill: {e}")
                return "Sorry, AI thodi der mein wapas aa raha hai. Thodi der baad try karo."