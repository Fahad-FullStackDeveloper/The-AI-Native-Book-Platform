# textbackend/skills/rag_skill.py
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient

from skills.base_skill import BaseSkill

load_dotenv()

class RagSearchSkill(BaseSkill):
    def __init__(self, name: str = "rag_search_skill"):
        super().__init__(name)
        try:
            self.qdrant = QdrantClient(
                url=os.getenv("QDRANT_URL"),
                api_key=os.getenv("QDRANT_API_KEY"),
            )
            print("Qdrant client connected successfully.")
        except Exception as e:
            print(f"Qdrant connection failed: {e}")
            self.qdrant = None

        # Initialize embedding model once
        try:
            from fastembed import TextEmbedding
            self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            print("FastEmbed model loaded: BAAI/bge-small-en-v1.5")
        except Exception as e:
            print(f"FastEmbed not available: {e}")
            self.embedding_model = None

    async def execute(self, query: str):
        if not self.qdrant:
            return "Book search system offline hai. Admin se keh do."

        if not self.embedding_model:
            return "Search embedding model load nahi hua."

        try:
            # Generate embedding
            embedding = list(self.embedding_model.embed([query]))[0]

            # Perform search
            results = self.qdrant.search(
                collection_name="ai_native_book",
                query_vector=embedding,
                limit=6,
                with_payload=True
            )

            if not results:
                return "Book mein iss topic pe kuch nahi mila."

            snippets = []
            for hit in results:
                payload = hit.payload or {}
                text = payload.get("text", "")[:800]
                metadata = payload.get("metadata", {})
                chapter = metadata.get("chapter", "Unknown")
                section = metadata.get("section", "Unknown")
                title = metadata.get("title", "No Title")

                citation = f"(Source: Chapter {chapter}"
                if section and section != "Unknown":
                    citation += f", Section {section}"
                if title and title != "Unknown":
                    citation += f" - {title}"
                citation += ")"

                snippets.append(f"{text}\n{citation}")

            return "\n\n".join(snippets)

        except Exception as e:
            print(f"RAG Search Error: {e}")
            return "Book search mein error aaya. Thodi der baad try karo."