
const STATUS_ORDER = [
  'Pending',
  'Confirmed',
  'Being Prepared',
  'Out for Delivery',
  'Delivered',
];

/**
 
 *
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
const isValidTransition = (currentStatus, newStatus) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex     = STATUS_ORDER.indexOf(newStatus);

  if (currentIndex === -1 || newIndex === -1) return false;   // unknown status
  if (newIndex <= currentIndex) return false;                  // backward move
  return true;
};

/**
 
 *
 * @param {string} currentStatus
 * @returns {string|null}
 */
const getNextStatus = (currentStatus) => {
  const idx = STATUS_ORDER.indexOf(currentStatus);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
};

module.exports = { STATUS_ORDER, isValidTransition, getNextStatus };