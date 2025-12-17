const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { QdrantClient } = require('@qdrant/js-client-rest');
const auth = require('./auth/better-auth-config.js');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Integrate better-auth API routes
app.use('/api/auth', (req, res, next) => {
  auth.handler(req, res, next);
});

// RAG Chat endpoint - authentication is optional
app.post('/chat', async (req, res) => {
  try {
    // Get session information from better-auth if available
    // We'll make a request to the better-auth get-session endpoint
    const sessionResponse = await fetch('http://localhost:3001/api/auth/get-session', {
      method: 'GET',
      headers: {
        ...req.headers,
        'content-type': 'application/json',
      },
      credentials: 'include'
    });
    const sessionData = await sessionResponse.json();
    const session = sessionData.session ? { user: sessionData.user } : null;

    const { message, userId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If authenticated, use the authenticated user's ID, otherwise use the provided userId or anonymous
    const effectiveUserId = session?.user ? session.user.id : (userId || 'anonymous');

    // Search in Qdrant vector database for relevant context
    let context = '';
    let sources = [];

    try {
      // Search in Qdrant for similar content based on the message
      // Note: This requires proper embedding generation which might need additional setup
      // For now, using a fallback approach that attempts semantic search
      // In a complete implementation, we would convert the message to an embedding vector first
      const searchResult = await qdrantClient.search('physical_ai_course', {
        vector: message, // This will need to be an actual embedding vector in production
        limit: 5,
        with_payload: true
      });

      if (searchResult && searchResult.length > 0) {
        context = searchResult.map(result => result.payload?.content || '').join('\n');
        sources = searchResult.map(result => ({
          title: result.payload?.title || 'Unknown',
          chapter: result.payload?.chapter || 'Unknown',
          section: result.payload?.section || 'Unknown'
        }));
      }
    } catch (searchError) {
      console.warn('Qdrant search failed, proceeding with general response:', searchError.message);
      // Continue with general response even if search fails
    }

    // Prepare the prompt with context if available
    let fullPrompt = message;
    if (context) {
      fullPrompt = `Context from the Physical AI & Humanoid Robotics course:\n${context}\n\nQuestion: ${message}\n\nPlease provide a helpful response based on the context, and cite relevant sources when possible.`;
    }

    // Use the Gemini model to generate response
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create a chat instance for conversation history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are an AI assistant for the Physical AI & Humanoid Robotics course. Provide helpful responses in Roman Urdu + English mix (Hinglish) as appropriate, and cite sources when referring to course content." }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I'm your AI assistant for the Physical AI & Humanoid Robotics course. I'll provide helpful responses and cite sources when referring to course content. Kaise madad kar sakta hun aapko?" }],
        },
      ],
    });

    const result = await chat.sendMessage(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Prepare response with sources if available
    const responsePayload = { text };
    if (sources && sources.length > 0) {
      responsePayload.sources = sources;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to get response from AI model' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});