// routes/products.js — BEFORE state: path traversal + no auth
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// ⚠️ PATH TRAVERSAL: user controls filename directly
router.get('/image', (req, res) => {
  const fileName = req.query.file;
  // Attacker can request: /api/products/image?file=../../etc/passwd
  const filePath = path.join(__dirname, '../uploads/', fileName);
  res.sendFile(filePath);
});

// Overly complex function — cyclomatic complexity 14 (threshold: 10)
router.get('/', (req, res) => {
  const db = require('sqlite3').verbose();
  const database = new db.Database('./products.db');
  const { category, minPrice, maxPrice, inStock, sort, page, limit, search, brand, rating } = req.query;

  let query = 'SELECT * FROM products WHERE 1=1';

  if (category) {
    query += ` AND category = '${category}'`; // ⚠️ SQL injection again
  }
  if (minPrice) {
    if (!isNaN(minPrice)) {
      query += ` AND price >= ${minPrice}`;
    }
  }
  if (maxPrice) {
    if (!isNaN(maxPrice)) {
      query += ` AND price <= ${maxPrice}`;
    }
  }
  if (inStock === 'true') {
    query += ' AND stock > 0';
  }
  if (search) {
    query += ` AND name LIKE '%${search}%'`; // ⚠️ SQL injection
  }
  if (brand) {
    query += ` AND brand = '${brand}'`; // ⚠️ SQL injection
  }
  if (rating) {
    if (!isNaN(rating)) {
      query += ` AND rating >= ${rating}`;
    }
  }
  if (sort === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else if (sort === 'rating') {
    query += ' ORDER BY rating DESC';
  }

  database.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message }); // ⚠️ Exposes DB errors
    } else {
      res.json(rows);
    }
  });
  database.close();
});

// ⚠️ No ownership check — any user can delete any product
router.delete('/:id', (req, res) => {
  const db = require('sqlite3').verbose();
  const database = new db.Database('./products.db');
  database.run(`DELETE FROM products WHERE id = ${req.params.id}`, (err) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json({ deleted: req.params.id });
  });
  database.close();
});

module.exports = router;
