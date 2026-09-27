// routes/after/orders.js — AFTER state: IDOR fixed, amount validation added
const express = require('express');
const router = express.Router();
const { getDb, dbGet, dbRun } = require('../utils/db');
const { authenticate } = require('../middleware/authenticate');
const { requireFields, requirePositiveNumber } = require('../utils/validate');

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
// FIX SEC-005: authenticate + ownership check (anti-IDOR)
router.get('/:id', authenticate, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid order ID' });

  try {
    const db = getDb('orders');

    // Parameterized query
    const order = await dbGet(db, 'SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // FIX SEC-005 IDOR: Verify requesting user owns this order
    if (order.user_id !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);

  } catch (err) {
    console.error('[orders/get]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/orders ──────────────────────────────────────────────────────────
// FIX: Input validation — negative amounts, missing fields, stock check
router.post('/', authenticate, async (req, res) => {
  // Validate required fields
  const fieldCheck = requireFields(req.body, 'items', 'totalAmount');
  if (!fieldCheck.valid) return res.status(400).json({ error: fieldCheck.error });

  // FIX: Validate totalAmount is positive — no free money exploit
  const amountCheck = requirePositiveNumber(req.body.totalAmount, 'totalAmount');
  if (!amountCheck.valid) return res.status(400).json({ error: amountCheck.error });

  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  try {
    const db = getDb('orders');

    // FIX: Use authenticated user ID from token — not user-supplied userId
    const result = await dbRun(
      db,
      'INSERT INTO orders (user_id, items, total_amount, status) VALUES (?, ?, ?, ?)',
      [req.user.userId, JSON.stringify(req.body.items), req.body.totalAmount, 'pending']
    );

    res.status(201).json({ orderId: result.lastID, status: 'pending' });

  } catch (err) {
    console.error('[orders/create]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
