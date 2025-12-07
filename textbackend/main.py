from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import agent
import database

app = FastAPI(
    title="AI Native Book Chatbot",
    description="Backend for 'The AI Native Book' interactive chatbot.",
    version="1.0.0"
)

# CORS middleware allows requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Pydantic model for the request body
class ChatRequest(BaseModel):
    question: str
    selectedText: str | None = None
    userId: str = "anonymous"

@app.on_event("startup")
async def startup_event():
    # This is a good place to run a health check on the database connection
    try:
        database.init_db()
    except Exception as e:
        print(f"Could not initialize database connection: {e}")

@app.post("/chat")
async def chat(req: ChatRequest):
    """
    Main endpoint to interact with the chatbot agent.
    Receives a question and optional selected text, returns an AI-generated reply.
    """
    if not req.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    try:
        reply = await agent.ask_book(
            question=req.question,
            selected_text=req.selectedText,
            user_id=req.userId
        )
        return {"reply": reply}
    except Exception as e:
        print(f"An error occurred in the chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred. Please try again later.")

@app.get("/")
async def root():
    """
    Root endpoint for health checks.
    """
    return {"message": "AI Native Book Chatbot is live and running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "BookGuide backend is running!"}
