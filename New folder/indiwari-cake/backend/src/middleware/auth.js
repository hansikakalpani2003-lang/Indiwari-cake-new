const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Reads "Authorization: Bearer <token>", verifies it, and attaches the
// decoded payload ({ id, role, email }) to req.user.
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please log in.'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    next(new ApiError(401, 'Invalid or expired session. Please log in again.'));
  }
}

// Use after verifyToken to restrict a route to admins only.
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required.'));
  }
  next();
}

// Like verifyToken but never rejects — used on public routes that behave
// slightly differently when the caller happens to be logged in (e.g. the
// menu listing showing unavailable items to an admin).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Ignore invalid/expired tokens on optional routes — just treat as anonymous.
  }
  next();
}

module.exports = { verifyToken, requireAdmin, optionalAuth };
