// routes/users.js — BEFORE state: SQL injection + no input validation
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecret123'; // duplicated hardcoded secret

// CRITICAL: Raw SQL string concatenation — textbook SQL injection
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = new sqlite3.Database('./users.db');

  // ⚠️ SQL INJECTION: user input directly concatenated into query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    if (err) {
      // ⚠️ SECURITY: Exposes full error (stack trace) to client
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ⚠️ JWT never expires — no expiresIn
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user }); // ⚠️ Returns full user object including password hash
  });

  db.close();
});

// No authentication middleware on this admin route
router.get('/all', (req, res) => {
  const db = new sqlite3.Database('./users.db');
  // ⚠️ Returns ALL users with ALL fields — no pagination, no field filtering
  db.all('SELECT * FROM users', (err, rows) => {
    res.json(rows);
  });
  db.close();
});

// ⚠️ No input sanitization, no validation, no auth check
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const db = new sqlite3.Database('./users.db');

  // ⚠️ CRITICAL: Stores plain text password — no bcrypt
  const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;

  db.run(query, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, username, email });
  });

  db.close();
});

module.exports = router;
