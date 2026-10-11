const express = require('express');
const cors = require('cors');
const { initDB } = require('../server/db');

const app = express();
app.use(cors());
app.use(express.json());

let initialized = false;
async function ensureDB() {
  if (!initialized) {
    await initDB();
    initialized = true;
  }
}

app.use(async (req, res, next) => {
  await ensureDB();
  next();
});

app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/portal', require('../server/routes/portal'));

app.get('/', (req, res) => {
  res.send('GDG Portal API is running on Vercel');
});

module.exports = app;
