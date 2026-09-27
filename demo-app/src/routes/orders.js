// routes/orders.js — BEFORE state: broken auth + no validation
const express = require('express');
const router = express.Router();

// ⚠️ IDOR: Any user can see any order — no ownership validation
router.get('/:id', (req, res) => {
  const db = require('sqlite3').verbose();
  const database = new db.Database('./orders.db');
  database.get(`SELECT * FROM orders WHERE id = ${req.params.id}`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
  database.close();
});

// ⚠️ No amount validation — negative amounts accepted (free money exploit)
router.post('/', (req, res) => {
  const { userId, items, totalAmount } = req.body;

  // ⚠️ No check: totalAmount could be -999 or null
  // ⚠️ No stock check before creating order
  // ⚠️ No transaction — if halfway fails, data corrupts

  const db = require('sqlite3').verbose();
  const database = new db.Database('./orders.db');

  const query = `INSERT INTO orders (user_id, items, total_amount, status) 
                 VALUES ('${userId}', '${JSON.stringify(items)}', ${totalAmount}, 'pending')`;

  database.run(query, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ orderId: this.lastID, status: 'pending' });
  });

  database.close();
});

// Dead code — this function is never called anywhere
function calculateDiscount(price, discountCode) {
  if (discountCode === 'SAVE10') return price * 0.9;
  if (discountCode === 'SAVE20') return price * 0.8;
  if (discountCode === 'SAVE30') return price * 0.7;
  if (discountCode === 'SAVE40') return price * 0.6;
  if (discountCode === 'SAVE50') return price * 0.5;
  return price;
}

module.exports = router;
