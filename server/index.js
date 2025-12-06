const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg'); // Import Pool from pg

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// NeonDB connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Use this for NeonDB, or set up proper certificate verification
  },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Endpoint to save user data after authentication
app.post('/save-user', async (req, res) => {
  const { uid, email, displayName } = req.body;
  
  if (!uid || !email) {
    return res.status(400).json({ error: 'UID and email are required' });
  }

  try {
    const client = await pool.connect();
    // Ensure the users table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Upsert user data: insert if not exists, update if exists
    const result = await client.query(
      `INSERT INTO users (uid, email, display_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (uid) DO UPDATE SET email = $2, display_name = $3
       RETURNING *;`,
      [uid, email, displayName]
    );
    client.release();
    res.status(200).json({ message: 'User data saved successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error saving user data to NeonDB:', error);
    res.status(500).json({ error: 'Failed to save user data' });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from Gemini API' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
