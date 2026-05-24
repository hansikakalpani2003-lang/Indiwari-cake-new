/**
 * formatCurrency
 * Formats a number as Sri Lankan Rupees (LKR).
 *
 * @param {number} amount — amount in rupees
 * @returns {string} — e.g., "Rs. 2,500.00"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';

  return new Intl.NumberFormat('en-LK', {
    style:    'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * formatPrice
 * Shorter version — shows "Rs. 2,500" without decimal (for menu cards).
 *
 * @param {number} amount
 * @returns {string}
 */
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined) return '—';

  return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
};