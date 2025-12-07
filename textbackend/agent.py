from agents.orchestrator_agent import BookChatOrchestrator

orchestrator = BookChatOrchestrator()

async def ask_book(question: str, selected_text: str | None = None, user_id: str = "anon"):
    """
    Main entry point for asking questions to the book chatbot.
    Delegates the request to the BookChatOrchestrator.
    """
    return await orchestrator.execute(question, selected_text, user_id)
