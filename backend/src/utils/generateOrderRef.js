
const db = require('../config/db');

/**
 * @returns {Promise<string>} e.g. "IC-20260523-0042"
 */
async function generateOrderRef() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`; // e.g. "20260523"

  // Count how many orders have already been created today
  const [rows] = await db.query(
    `SELECT COUNT(*) AS today_count
     FROM orders
     WHERE DATE(created_at) = CURDATE()`
  );

  const sequence = (rows[0].today_count + 1); // next number
  const seqPart  = String(sequence).padStart(4, '0'); // e.g. "0042"

  return `IC-${datePart}-${seqPart}`;
}

module.exports = generateOrderRef;