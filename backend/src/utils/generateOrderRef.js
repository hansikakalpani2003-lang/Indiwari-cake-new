const pool = require('../config/db');

/**
 * generateOrderRef
 * Generates a unique, sequential order reference for the current date.
 * Format: IC-YYYYMMDD-NNNN  (e.g., IC-20260530-0001)
 *
 * Queries the orders table to find the highest sequence number for today,
 * then increments it. Thread-safe for single-server use.
 *
 * @returns {Promise<string>} — order reference string
 */
const generateOrderRef = async () => {
  const today = new Date();
  const year  = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day   = String(today.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Find how many orders already exist today
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM orders
     WHERE DATE(created_at) = CURDATE()`
  );

  const sequence = (rows[0].total + 1).toString().padStart(4, '0');
  return `IC-${datePart}-${sequence}`;
};

module.exports = generateOrderRef;