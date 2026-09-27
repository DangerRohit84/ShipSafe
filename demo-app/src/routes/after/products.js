// routes/after/products.js — AFTER state: path traversal fixed, complexity reduced
const express = require('express');
const router = express.Router();
const path = require('path');
const { getDb, dbAll, dbRun } = require('../utils/db');
const { authenticate, authorize } = require('../middleware/authenticate');

const UPLOADS_DIR = path.resolve(__dirname, '../../../uploads');

// ── GET /api/products/image ───────────────────────────────────────────────────
// FIX SEC-004: Path traversal fixed — basename + boundary check
router.get('/image', (req, res) => {
  const { file } = req.query;
  if (!file) return res.status(400).json({ error: 'file parameter required' });

  // Strip any directory components — attacker cannot traverse
  const safeName = path.basename(file);
  const filePath = path.join(UPLOADS_DIR, safeName);

  // Boundary check — resolved path must start within uploads dir
  if (!filePath.startsWith(UPLOADS_DIR + path.sep) && filePath !== UPLOADS_DIR) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: 'File not found' });
  });
});

// ── GET /api/products ─────────────────────────────────────────────────────────
// FIX QUA-001: Complexity reduced from 14 → 5 by extracting helpers
router.get('/', async (req, res) => {
  try {
    const db = getDb('products');
    const filters = buildFilters(req.query);
    const sort = buildSort(req.query.sort);
    const { page, limit, offset } = buildPagination(req.query);

    // FIX SEC: All parameterized — no injection possible
    const query = `SELECT * FROM products WHERE 1=1 ${filters.clause} ${sort} LIMIT ? OFFSET ?`;
    const products = await dbAll(db, query, [...filters.params, limit, offset]);
    res.json({ products, page, limit });

  } catch (err) {
    console.error('[products/list]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Extracted helpers — each has complexity 1-3
function buildFilters(query) {
  const clauses = [];
  const params = [];

  if (query.category) { clauses.push('AND category = ?'); params.push(query.category); }
  if (!isNaN(query.minPrice)) { clauses.push('AND price >= ?'); params.push(Number(query.minPrice)); }
  if (!isNaN(query.maxPrice)) { clauses.push('AND price <= ?'); params.push(Number(query.maxPrice)); }
  if (query.inStock === 'true') { clauses.push('AND stock > 0'); }
  if (query.search) { clauses.push('AND name LIKE ?'); params.push(`%${query.search}%`); }
  if (query.brand) { clauses.push('AND brand = ?'); params.push(query.brand); }
  if (!isNaN(query.rating)) { clauses.push('AND rating >= ?'); params.push(Number(query.rating)); }

  return { clause: clauses.join(' '), params };
}

function buildSort(sort) {
  const sortMap = {
    price_asc: 'ORDER BY price ASC',
    price_desc: 'ORDER BY price DESC',
    rating: 'ORDER BY rating DESC',
  };
  return sortMap[sort] || 'ORDER BY id ASC';
}

function buildPagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { page, limit, offset: (page - 1) * limit };
}

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
// FIX: authenticate + admin-only access
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

  try {
    const db = getDb('products');
    const result = await dbRun(db, 'DELETE FROM products WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ deleted: id });
  } catch (err) {
    console.error('[products/delete]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
