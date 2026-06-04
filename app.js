const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Test route (to check if the server is running)
app.get('/', (req, res) => {
  res.send('API is running 🚀');
});

Example of an API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// Port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});