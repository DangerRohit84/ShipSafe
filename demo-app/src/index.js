// ============================================================
// ShipSafe Demo App — BEFORE state (intentionally vulnerable)
// This file contains real-world mistakes devs make before release
// ============================================================

const express = require('express');
const app = express();

// ISSUE: No rate limiting, no helmet, no CORS configuration
app.use(express.json());

// Hardcoded secret — CRITICAL security issue
const JWT_SECRET = 'supersecret123';

// DB password in plain code — CRITICAL
const DB_PASSWORD = 'admin@prod2024';

// Unused variable — dead code smell
const DEBUG_FLAG = true;

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Generic error handler — swallows all errors silently
app.use((err, req, res, next) => {
  // TODO: Add proper logging
  res.status(500).send('Something broke');
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DB Password: ${DB_PASSWORD}`);  // CRITICAL: logs secret to console
});

module.exports = { app, server };
