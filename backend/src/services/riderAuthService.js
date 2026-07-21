// backend/src/services/riderAuthService.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const RIDER_JWT_SECRET = process.env.RIDER_JWT_SECRET || process.env.JWT_SECRET;

async function login(phone, pin) {
  const [[rider]] = await pool.query(
    'SELECT id, name, phone, vehicle_number, pin_hash, status FROM delivery_riders WHERE phone = ?',
    [phone]
  );
  if (!rider) {
    const err = new Error('Invalid phone number or PIN.');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(pin, rider.pin_hash);
  if (!valid) {
    const err = new Error('Invalid phone number or PIN.');
    err.statusCode = 401;
    throw err;
  }

  if (rider.status === 'inactive') {
    const err = new Error('Your account is currently inactive. Please contact the admin.');
    err.statusCode = 403;
    throw err;
  }

  const token = jwt.sign({ riderId: rider.id, type: 'rider' }, RIDER_JWT_SECRET, { expiresIn: '12h' });

  return {
    token,
    rider: {
      id: rider.id,
      name: rider.name,
      phone: rider.phone,
      vehicle_number: rider.vehicle_number,
      status: rider.status,
    },
  };
}

module.exports = { login, RIDER_JWT_SECRET };
