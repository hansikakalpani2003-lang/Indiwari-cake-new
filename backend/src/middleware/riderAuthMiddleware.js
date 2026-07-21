// backend/src/middleware/riderAuthMiddleware.js
const jwt = require('jsonwebtoken');
const { RIDER_JWT_SECRET } = require('../services/riderAuthService');

const verifyRiderToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, RIDER_JWT_SECRET);
    if (decoded.type !== 'rider') {
      return res.status(401).json({ message: 'Invalid token type.' });
    }
    req.rider = { riderId: decoded.riderId };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyRiderToken };
