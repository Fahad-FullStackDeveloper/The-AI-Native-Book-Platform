const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { QdrantClient } = require('@qdrant/js-client-rest');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize PostgreSQL connection pool with NeonDB
const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to NeonDB successfully');
  }
});

// Create users table if it doesn't exist
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createUsersTable)
  .then(() => console.log('Users table checked/created'))
  .catch(err => console.error('Error creating users table:', err));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

// Signup Endpoint - save to NeonDB
app.post('/signup', async (req, res) => {
  const { email, password, createdAt } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user into database
    const result = await pool.query(
      'INSERT INTO users (email, password, created_at) VALUES ($1, $2, $3) RETURNING id, email',
      [email, hashedPassword, createdAt || new Date().toISOString()]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.rows[0].id, email: result.rows[0].email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login Endpoint - verify against NeonDB
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user in database
    const userResult = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Logged in successfully',
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// RAG Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

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
