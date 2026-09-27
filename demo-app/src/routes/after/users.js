// routes/after/users.js — AFTER state: all ShipSafe fixes applied
// Compare with routes/users.js (BEFORE) to see exactly what changed
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb, dbGet, dbRun, dbAll } = require('../utils/db');
const { authenticate, authorize } = require('../middleware/authenticate');
const { requireFields, requireLength, isValidEmail } = require('../utils/validate');

// FIX-002 APPLIED: Secret from environment variable, not hardcoded string
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// ── POST /api/users/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  // FIX: Input validation before any DB access
  const check = requireFields(req.body, 'username', 'password');
  if (!check.valid) return res.status(400).json({ error: check.error });

  try {
    const db = getDb('users');

    // FIX SEC-001: Parameterized query — SQL injection impossible
    const user = await dbGet(db, 'SELECT * FROM users WHERE username = ?', [req.body.username]);

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // FIX: Compare with bcrypt hash, not plain text
    const passwordMatch = await bcrypt.compare(req.body.password, user.password_hash);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // FIX SEC-006: JWT now expires in 1 hour, algorithm explicit
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    // FIX: Never return password hash or full user object
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });

  } catch (err) {
    // FIX QUA-003: Generic error — no internal details leaked to client
    console.error('[users/login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/users/all ────────────────────────────────────────────────────────
// FIX SEC: authenticate + authorize('admin') protects this route
router.get('/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    const db = getDb('users');
    // FIX: Never return password hashes; add pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const users = await dbAll(
      db,
      'SELECT id, username, email, role, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
    res.json({ users, page, limit });

  } catch (err) {
    console.error('[users/all]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/users/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  // FIX: Validate all required fields
  const fieldCheck = requireFields(req.body, 'username', 'email', 'password');
  if (!fieldCheck.valid) return res.status(400).json({ error: fieldCheck.error });

  const usernameCheck = requireLength(req.body.username, 'username', 3, 50);
  if (!usernameCheck.valid) return res.status(400).json({ error: usernameCheck.error });

  const passwordCheck = requireLength(req.body.password, 'password', 8, 128);
  if (!passwordCheck.valid) return res.status(400).json({ error: passwordCheck.error });

  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const db = getDb('users');

    // Check for duplicate username
    const existing = await dbGet(db, 'SELECT id FROM users WHERE username = ? OR email = ?', [
      req.body.username, req.body.email
    ]);
    if (existing) return res.status(409).json({ error: 'Username or email already exists' });

    // FIX: Hash password with bcrypt before storing — NEVER plain text
    const password_hash = await bcrypt.hash(req.body.password, 12);

    // FIX: Parameterized query
    const result = await dbRun(
      db,
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [req.body.username, req.body.email, password_hash]
    );

    res.status(201).json({ id: result.lastID, username: req.body.username, email: req.body.email });

  } catch (err) {
    console.error('[users/register]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
