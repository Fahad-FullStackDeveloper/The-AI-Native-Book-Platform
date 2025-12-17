const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});