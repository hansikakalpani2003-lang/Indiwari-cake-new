'use strict';

const jwt = require('jsonwebtoken');

function verifyDeliveryToken(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Delivery person login is required.' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(
      token,
      process.env.DELIVERY_JWT_SECRET || process.env.JWT_SECRET
    );
    if (payload.type !== 'delivery_person' || !payload.deliveryPersonId) {
      return res.status(401).json({ message: 'Invalid delivery session.' });
    }
    req.deliveryPerson = { id: payload.deliveryPersonId };
    next();
  } catch {
    return res.status(401).json({ message: 'Delivery session expired. Please log in again.' });
  }
}

module.exports = { verifyDeliveryToken };
