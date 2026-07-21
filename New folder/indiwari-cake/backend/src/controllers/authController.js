const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register — customer self-registration
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, delivery_address } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required.');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters.');
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone, delivery_address)
     VALUES (?, ?, ?, 'customer', ?, ?)`,
    [name, email, passwordHash, phone || null, delivery_address || null]
  );

  const user = { id: result.insertId, name, email, role: 'customer' };
  const token = signToken(user);

  res.status(201).json({ success: true, token, user });
});

// POST /api/auth/login — works for both customer and admin accounts
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required.');
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = signToken(user);

  res.json({
    success: true,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me — return the logged-in user's profile
const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, phone, delivery_address, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'User not found.');
  }
  res.json({ success: true, user: rows[0] });
});

module.exports = { register, login, me };
