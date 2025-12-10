import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';
import ReactMarkdown from 'react-markdown';

const API_URL = "http://localhost:8001/chat";

interface Message {
  text: string;
  sender: 'user' | 'bot' | 'loading';
}

// Simple hash function for a user ID
const getUserId = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem('book_user_id')) {
      localStorage.setItem('book_user_id', `web_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
    return localStorage.getItem('book_user_id');
  }
  return 'anonymous';
};

const BookChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! I'm BookGuide. Ask me anything about The AI Native Book." }
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage, { sender: 'loading', text: '...' }]);
    setInput('');
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          selectedText: null, // This can be enhanced later to get selected text
          userId: getUserId(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = { sender: 'bot', text: data.reply };
      
      setMessages(prev => [...prev.filter(m => m.sender !== 'loading'), botMessage]);

    } catch (err) {
      console.error("API Call Failed:", err);
      const errorMessage = `Failed to connect to the BookGuide. Please ensure the backend server is running. Error: ${err.message}`;
      setError(errorMessage);
      setMessages(prev => prev.filter(m => m.sender !== 'loading'));
    }
  };
  
  const ChatIcon = () => (
    <svg className={styles.fabIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg className={styles.closeIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  );


  return (
    <div className={styles.chatbotContainer}>
      <div className={`${styles.chatWindow} ${!isOpen ? styles.hidden : ''}`}>
        <div className={styles.header}>
          BookGuide
          <button onClick={() => setIsOpen(false)} className={styles.closeButton} aria-label="Close Chat">
            <CloseIcon />
          </button>
        </div>
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
              {msg.sender === 'bot' && <div className={styles.avatar}>B</div>}
              <div className={styles.messageContent}>
                {msg.sender === 'loading' ? (
                  <div className={styles.typingIndicator}><span></span><span></span><span></span></div>
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>
              {msg.sender === 'user' && <div className={styles.avatar}>U</div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <input
            type="text"
            className={styles.textInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            aria-label="Chat input"
          />
          <button type="submit" className={styles.sendButton} disabled={!input.trim()} aria-label="Send Message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </form>
      </div>
      <div className={styles.fab} onClick={() => setIsOpen(!isOpen)} role="button" aria-label="Toggle Chat">
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </div>
    </div>
  );
};

export default BookChatbot;
