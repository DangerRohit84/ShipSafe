// middleware/authenticate.js
// JWT authentication middleware used by protected routes in the BEFORE/AFTER demo
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

/**
 * authenticate — verifies the Bearer token in Authorization header.
 * Used in the AFTER state to protect /api/users/all and /api/orders/:id
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * authorize — checks role after authenticate().
 * Usage: router.get('/all', authenticate, authorize('admin'), handler)
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
