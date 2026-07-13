/**
 * orderValidator.js
 * Input validation rules for order creation.
 * Uses express-validator.
 *
 * Validates:
 *   - items array: not empty, each has menu_item_id (int ≥ 1) and quantity (1–20)
 *   - delivery_address: required, non-empty string
 *   - delivery_date: required, valid ISO date, must be at least tomorrow
 *   - special_instructions: optional, max 500 chars
 */

const { body, validationResult } = require('express-validator');

// ── Helper: tomorrow's date at midnight ─────────────────────────────────────
function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

// ── Order Validator Rules ────────────────────────────────────────────────────
const validateOrder = [
  // items array
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item.'),

  body('items.*.menu_item_id')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid menu_item_id (positive integer).'),

  body('items.*.quantity')
    .isInt({ min: 1, max: 20 })
    .withMessage('Item quantity must be between 1 and 20.'),

  body('items.*.size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Size must be 50 characters or fewer.'),

  body('items.*.flavour')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Flavour must be 100 characters or fewer.'),

  body('items.*.decoration_note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Decoration note must be 200 characters or fewer.'),

  // delivery_address
  body('delivery_address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required.'),

  // delivery_date
  body('delivery_date')
    .notEmpty()
    .withMessage('Delivery date is required.')
    .isISO8601()
    .withMessage('Delivery date must be a valid date (YYYY-MM-DD).')
    .custom((value) => {
      const deliveryDate = new Date(value);
      deliveryDate.setHours(0, 0, 0, 0);
      if (deliveryDate < getTomorrow()) {
        throw new Error('Delivery date must be at least tomorrow. Same-day orders are not accepted.');
      }
      return true;
    }),

  // special_instructions
  body('special_instructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be 500 characters or fewer.'),
];

// ── Validation Error Handler ─────────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed.',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validateOrder, handleValidationErrors };