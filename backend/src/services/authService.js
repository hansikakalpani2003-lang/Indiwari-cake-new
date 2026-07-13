const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const registerCustomer = async (name, email, password, phone, address) => {
  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) { const err = new Error('Email already exists.'); err.statusCode = 409; throw err; }
  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password_hash, phone, delivery_address, role) VALUES (?, ?, ?, ?, ?, 'customer')`,
    [name, email, passwordHash, phone || null, address || null]
  );
  const token = jwt.sign({ userId: result.insertId, role: 'customer', name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: result.insertId, name, email, role: 'customer' } };
};

const loginUser = async (email, password) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) { const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err; }
  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) { const err = new Error('Invalid email or password.'); err.statusCode = 401; throw err; }
  const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, delivery_address: user.delivery_address } };
};

const getCurrentUser = async (userId) => {
  const [rows] = await pool.execute('SELECT id, name, email, role, phone, delivery_address, created_at FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) { const err = new Error('User not found.'); err.statusCode = 404; throw err; }
  return rows[0];
};

module.exports = { registerCustomer, loginUser, getCurrentUser };