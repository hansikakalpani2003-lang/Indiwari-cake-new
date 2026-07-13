/**
 * customerService.js
 * All database operations for customer profile management and admin customer listing.
 *
 * Customer functions:
 *   - getProfile(userId)           → returns profile fields (no password_hash)
 *   - updateProfile(userId, data)  → updates phone and/or delivery_address
 *   - changePassword(userId, ...)  → bcrypt verify + hash + UPDATE
 *
 * Admin functions:
 *   - getAllCustomers()             → all customers with spend aggregates
 *   - getCustomerWithOrders(id)    → single customer profile + full order history
 *
 * Used by: customerController.js, adminController.js
 */

const db     = require('../config/db');
const bcrypt = require('bcryptjs');

// ── Get Profile ───────────────────────────────────────────────────────────────
/**
 * Returns the authenticated customer's profile fields.
 * Excludes password_hash and role for security.
 *
 * @param {number} userId
 * @returns {Promise<Object|null>}
 */
async function getProfile(userId) {
  const [rows] = await db.query(
    `SELECT id, name, email, phone, delivery_address, created_at
     FROM users
     WHERE id = ? AND role = 'customer'`,
    [userId]
  );
  return rows.length > 0 ? rows[0] : null;
}

// ── Update Profile ────────────────────────────────────────────────────────────
/**
 * Updates the customer's mutable profile fields.
 * Only phone and delivery_address can be changed.
 * Name and email are permanently fixed after registration.
 *
 * @param {number} userId
 * @param {{ phone?: string, delivery_address?: string }} data
 * @returns {Promise<Object>} - The updated profile
 */
async function updateProfile(userId, data) {
  const { phone, delivery_address } = data;

  // Build partial update — only include fields that were actually sent
  const fields = [];
  const params = [];

  if (phone !== undefined) {
    fields.push('phone = ?');
    params.push(phone || null);
  }

  if (delivery_address !== undefined) {
    fields.push('delivery_address = ?');
    params.push(delivery_address || null);
  }

  if (fields.length === 0) {
    // Nothing to update — return existing profile
    return getProfile(userId);
  }

  params.push(userId);

  await db.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    params
  );

  return getProfile(userId);
}

// ── Change Password ───────────────────────────────────────────────────────────
/**
 * Verifies the customer's current password, then hashes and saves the new one.
 *
 * @param {number} userId
 * @param {string} currentPassword  - The plain-text current password to verify
 * @param {string} newPassword      - The new plain-text password to hash and save
 * @returns {Promise<void>}
 * @throws {{ statusCode: 401, message: string }} - If current password is wrong
 */
async function changePassword(userId, currentPassword, newPassword) {
  // Step 1: Fetch the stored password hash
  const [rows] = await db.query(
    `SELECT password_hash FROM users WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw { statusCode: 404, message: 'User not found.' };
  }

  const storedHash = rows[0].password_hash;

  // Step 2: Verify current password against stored hash
  const isMatch = await bcrypt.compare(currentPassword, storedHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Current password is incorrect. Please try again.' };
  }

  // Step 3: Hash the new password
  const newHash = await bcrypt.hash(newPassword, 12);

  // Step 4: Update the database
  await db.query(
    `UPDATE users SET password_hash = ? WHERE id = ?`,
    [newHash, userId]
  );
}

// ── Get All Customers (Admin) ─────────────────────────────────────────────────
/**
 * Returns all customer accounts with aggregated order statistics.
 * Used by the Admin Customers page to display the full customer table.
 *
 * Includes:
 *   - total_orders:   all orders placed by the customer (any status)
 *   - lifetime_spend: sum of total_amount for Delivered orders only
 *   - last_order_date: timestamp of their most recent order
 *
 * @param {{ search?: string }} filters
 * @returns {Promise<Array>}
 */
async function getAllCustomers(filters = {}) {
  const conditions = [`u.role = 'customer'`];
  const params     = [];

  if (filters.search) {
    conditions.push('(u.name LIKE ? OR u.email LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await db.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.phone,
       u.delivery_address,
       u.created_at,
       COUNT(o.id)                                                        AS total_orders,
       COALESCE(
         SUM(CASE WHEN o.status = 'Delivered' THEN o.total_amount ELSE 0 END),
         0
       )                                                                  AS lifetime_spend,
       MAX(o.created_at)                                                  AS last_order_date
     FROM users u
     LEFT JOIN orders o ON o.customer_id = u.id
     ${whereClause}
     GROUP BY u.id
     ORDER BY lifetime_spend DESC, u.name ASC`,
    params
  );

  return rows;
}

// ── Get Single Customer with Full Order History (Admin) ───────────────────────
/**
 * Returns a single customer's profile fields plus their complete order history,
 * ordered by most recent first. Used in the admin customer detail panel.
 *
 * @param {number} customerId
 * @returns {Promise<Object|null>}
 */
async function getCustomerWithOrders(customerId) {
  // Step 1: Profile
  const [userRows] = await db.query(
    `SELECT id, name, email, phone, delivery_address, created_at
     FROM users
     WHERE id = ? AND role = 'customer'`,
    [customerId]
  );

  if (userRows.length === 0) return null;

  const customer = userRows[0];

  // Step 2: Full order history
  const [orderRows] = await db.query(
    `SELECT
       o.id,
       o.order_reference,
       o.status,
       o.total_amount,
       o.delivery_date,
       o.delivery_address,
       o.created_at,
       o.qr_code_token,
       COUNT(oi.id) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.customer_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [customerId]
  );

  // Step 3: Summary statistics
  const [statsRows] = await db.query(
    `SELECT
       COUNT(*) AS total_orders,
       COALESCE(SUM(CASE WHEN status = 'Delivered' THEN total_amount ELSE 0 END), 0) AS lifetime_spend,
       COALESCE(SUM(CASE WHEN status = 'Pending'   THEN 1            ELSE 0 END), 0) AS pending_count,
       MAX(created_at) AS last_order_date
     FROM orders
     WHERE customer_id = ?`,
    [customerId]
  );

  return {
    ...customer,
    orders: orderRows,
    stats:  statsRows[0],
  };
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllCustomers,
  getCustomerWithOrders,
};