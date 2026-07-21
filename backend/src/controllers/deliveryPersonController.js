'use strict';

const bcrypt = require('bcryptjs');
const db = require('../config/db');
const asyncWrapper = require('../utils/asyncWrapper');

const ALLOWED_ADMIN_STATUSES = ['Available', 'Inactive'];

const getAll = asyncWrapper(async (req, res) => {
  const [rows] = await db.query(`
    SELECT dp.id, dp.name, dp.email, dp.phone, dp.vehicle_type, dp.vehicle_number,
           dp.status, dp.last_login_at, dp.created_at, dp.updated_at,
           COUNT(CASE WHEN o.status = 'Delivered' THEN 1 END) AS completed_deliveries,
           COUNT(CASE WHEN o.status = 'Out for Delivery' THEN 1 END) AS active_deliveries
    FROM delivery_persons dp
    LEFT JOIN orders o ON o.delivery_person_id = dp.id
    GROUP BY dp.id
    ORDER BY dp.created_at DESC
  `);
  res.json({ deliveryPersons: rows });
});

const create = asyncWrapper(async (req, res) => {
  const { name, phone, email, password, vehicle_type, vehicle_number, status = 'Available' } = req.body;
  if (!name || !phone || !email || !password || !vehicle_type) {
    return res.status(400).json({ message: 'Name, phone, email, password and vehicle type are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
  }
  if (!ALLOWED_ADMIN_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Status must be Available or Inactive.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const [result] = await db.query(
      `INSERT INTO delivery_persons
       (name,email,phone,password_hash,vehicle_type,vehicle_number,status)
       VALUES (?,?,?,?,?,?,?)`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash, vehicle_type.trim(), vehicle_number?.trim() || null, status]
    );
    res.status(201).json({ message: 'Delivery person account created successfully.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That email address is already used by another delivery person.' });
    }
    throw err;
  }
});

const update = asyncWrapper(async (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, email, password, vehicle_type, vehicle_number, status } = req.body;
  const [[existing]] = await db.query('SELECT * FROM delivery_persons WHERE id = ?', [id]);
  if (!existing) return res.status(404).json({ message: 'Delivery person not found.' });

  if (existing.status === 'Delivering' && status && status !== 'Delivering') {
    return res.status(409).json({ message: 'This delivery person has an active delivery and cannot be made inactive.' });
  }
  if (status && !['Available', 'Inactive', 'Delivering'].includes(status)) {
    return res.status(400).json({ message: 'Invalid delivery person status.' });
  }

  const fields = [];
  const values = [];
  const add = (column, value) => { fields.push(`${column} = ?`); values.push(value); };
  if (name !== undefined) add('name', name.trim());
  if (phone !== undefined) add('phone', phone.trim());
  if (email !== undefined) add('email', email.trim().toLowerCase());
  if (vehicle_type !== undefined) add('vehicle_type', vehicle_type.trim());
  if (vehicle_number !== undefined) add('vehicle_number', vehicle_number.trim() || null);
  if (status !== undefined) add('status', status);
  if (password) {
    if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    add('password_hash', await bcrypt.hash(password, 12));
  }
  if (!fields.length) return res.status(400).json({ message: 'No changes were provided.' });

  values.push(id);
  try {
    await db.query(`UPDATE delivery_persons SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'Delivery person updated successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That email address is already used by another delivery person.' });
    }
    throw err;
  }
});

const remove = asyncWrapper(async (req, res) => {
  const id = Number(req.params.id);
  const [[person]] = await db.query('SELECT status FROM delivery_persons WHERE id = ?', [id]);
  if (!person) return res.status(404).json({ message: 'Delivery person not found.' });
  if (person.status === 'Delivering') {
    return res.status(409).json({ message: 'Complete the active delivery before deleting this account.' });
  }
  await db.query('DELETE FROM delivery_persons WHERE id = ?', [id]);
  res.json({ message: 'Delivery person deleted successfully.' });
});

module.exports = { getAll, create, update, remove };
