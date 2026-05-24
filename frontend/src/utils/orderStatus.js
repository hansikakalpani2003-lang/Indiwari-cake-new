/**
 * ORDER STATUS DEFINITIONS
 * Used for progress bar colouring, badge styling, and email triggers.
 */

export const ORDER_STATUSES = {
  PENDING:          'Pending',
  CONFIRMED:        'Confirmed',
  BEING_PREPARED:   'Being Prepared',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED:        'Delivered',
};

// Display order (for progress bar)
export const STATUS_SEQUENCE = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.BEING_PREPARED,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
  ORDER_STATUSES.DELIVERED,
];

// Tailwind background + text colour classes per status
export const STATUS_COLOURS = {
  [ORDER_STATUSES.PENDING]:          { bg: 'bg-yellow-100',  text: 'text-yellow-800',  dot: 'bg-yellow-400'  },
  [ORDER_STATUSES.CONFIRMED]:        { bg: 'bg-blue-100',    text: 'text-blue-800',    dot: 'bg-blue-500'    },
  [ORDER_STATUSES.BEING_PREPARED]:   { bg: 'bg-purple-100',  text: 'text-purple-800',  dot: 'bg-purple-500'  },
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: { bg: 'bg-orange-100',  text: 'text-orange-800',  dot: 'bg-orange-500'  },
  [ORDER_STATUSES.DELIVERED]:        { bg: 'bg-green-100',   text: 'text-green-800',   dot: 'bg-green-500'   },
};

// Emoji icons for status (used in email templates and public order page)
export const STATUS_ICONS = {
  [ORDER_STATUSES.PENDING]:          '⏳',
  [ORDER_STATUSES.CONFIRMED]:        '✅',
  [ORDER_STATUSES.BEING_PREPARED]:   '👩‍🍳',
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: '🚚',
  [ORDER_STATUSES.DELIVERED]:        '🎂',
};

/**
 * getStatusIndex
 * Returns the 0-based index of a status in the sequence (for progress bar).
 */
export const getStatusIndex = (status) => STATUS_SEQUENCE.indexOf(status);

/**
 * isStatusComplete
 * Returns true if the given status has been reached/passed for an order at currentStatus.
 */
export const isStatusComplete = (status, currentStatus) => {
  return getStatusIndex(currentStatus) >= getStatusIndex(status);
};