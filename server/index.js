const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

async function startServer() {
  await initDB();

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/portal', require('./routes/portal'));

  app.get('/', (req, res) => {
    res.send('GDG Portal API is running successfully (Master PRD v3.0 - SQLite)');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SQLite Server running on port ${PORT}`);
  });
}

startServer().catch(err => console.error('Server start error:', err));
