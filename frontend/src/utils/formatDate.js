/**
 * formatDate
 * Formats a date string or Date object into a human-readable format.
 *
 * @param {string|Date} date
 * @param {object} options — Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';

  const defaultOptions = {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-LK', defaultOptions).format(new Date(date));
};

/**
 * formatDateTime
 * Formats a date + time (useful for status history timestamps).
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-LK', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

/**
 * isDateInFuture
 * Returns true if the given date is in the future (used for delivery date validation).
 *
 * @param {string|Date} date
 * @returns {boolean}
 */
export const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};