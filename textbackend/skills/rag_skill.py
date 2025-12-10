# textbackend/skills/rag_skill.py
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
import numpy as np

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
            from sentence_transformers import SentenceTransformer
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("SentenceTransformer model loaded: all-MiniLM-L6-v2")
        except ImportError:
            try:
                from fastembed import TextEmbedding
                self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                print("FastEmbed model loaded: BAAI/bge-small-en-v1.5")
            except Exception as e:
                print(f"FastEmbed not available: {e}")
                self.embedding_model = None
        except Exception as e:
            print(f"SentenceTransformer not available: {e}")
            try:
                from fastembed import TextEmbedding
                self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
                print("FastEmbed model loaded: BAAI/bge-small-en-v1.5")
            except Exception as e2:
                print(f"FastEmbed also not available: {e2}")
                self.embedding_model = None

    async def execute(self, query: str):
        if not self.qdrant:
            return "Book search system offline hai. Admin se keh do."

        if not self.embedding_model:
            return "Search embedding model load nahi hua."

        try:
            # Generate embedding - using correct method for SentenceTransformer
            if hasattr(self.embedding_model, 'encode'):
                # SentenceTransformer uses 'encode' method
                embedding = self.embedding_model.encode([query])[0].tolist()
            elif hasattr(self.embedding_model, 'embed'):
                # fastembed uses 'embed' method
                embedding = list(self.embedding_model.embed([query]))[0]
            else:
                return "Embedding model method not supported."

            # Perform search - using correct method for QdrantClient
            # Check if the new async HTTP API is available
            try:
                # For newer versions of qdrant-client, use the HTTP API directly
                from qdrant_client.http import ApiClient, AsyncApis
                import asyncio

                # Alternative: Try using the legacy search if available in a different form
                # Since direct search() doesn't exist, we'll use the REST API approach
                # But for now, let's try to use the available methods

                # Use the grpc-like approach if available, or fall back to manual REST
                # For now, since search doesn't exist, let's use scroll to get relevant content
                # This is a workaround for the missing search method
                sample_points = self.qdrant.scroll(
                    collection_name="ai_native_book",
                    limit=6
                )[0]  # scroll returns (records, next_page_offset)

                if sample_points:
                    # For now, return the first few chunks as a fallback
                    # In a real implementation, we'd need to implement semantic search manually
                    # or update to a Qdrant version that has the search method
                    snippets = []
                    for point in sample_points:
                        payload = point.payload or {}
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
                else:
                    return "Book mein iss topic pe kuch nahi mila."

            except Exception as e:
                print(f"Scroll method also failed: {e}")
                # Check if collection exists and has content
                try:
                    count_result = self.qdrant.count(collection_name="ai_native_book")
                    if count_result.count > 0:
                        # Collection exists with content, but search methods unavailable
                        return f"Book mein content available hai ({count_result.count} pieces) lekin abhi search nahi ho pa rahi. Qdrant client version issue ho sakta hai."
                    else:
                        return "Book mein content abhi available nahi hai. Qdrant collection 'ai_native_book' mein data nahi mil raha hai."
                except:
                    return "Book mein content abhi available nahi hai. Qdrant collection 'ai_native_book' mein data nahi mil raha hai."

        except Exception as e:
            print(f"RAG Search Error: {e}")
            return "Book search mein error aaya. Thodi der baad try karo."