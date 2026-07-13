/**
 * menuValidator.js
 * Input validation rules for menu item create and update operations.
 * Uses express-validator.
 */

const { body, validationResult } = require('express-validator');

// ── Create Menu Item ─────────────────────────────────────────────────────────

const validateCreateMenuItem = [
  body('name')
    .trim()
    .notEmpty().withMessage('Item name is required.')
    .isLength({ max: 150 }).withMessage('Item name must be 150 characters or fewer.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be 500 characters or fewer.'),

  body('base_price')
    .notEmpty().withMessage('Base price is required.')
    .isFloat({ min: 0.01 }).withMessage('Base price must be a positive number.'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.')
    .isIn(['Birthday', 'Wedding', 'Custom', 'Cupcakes', 'Slices', 'Seasonal'])
    .withMessage('Category must be one of: Birthday, Wedding, Custom, Cupcakes, Slices, Seasonal.'),

  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be true or false.'),
];

// ── Update Menu Item ─────────────────────────────────────────────────────────

const validateUpdateMenuItem = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Item name cannot be empty.')
    .isLength({ max: 150 }).withMessage('Item name must be 150 characters or fewer.'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must be 500 characters or fewer.'),

  body('base_price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Base price must be a positive number.'),

  body('category')
    .optional()
    .trim()
    .isIn(['Birthday', 'Wedding', 'Custom', 'Cupcakes', 'Slices', 'Seasonal'])
    .withMessage('Category must be one of: Birthday, Wedding, Custom, Cupcakes, Slices, Seasonal.'),

  body('is_available')
    .optional()
    .isBoolean().withMessage('is_available must be true or false.'),
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

module.exports = {
  validateCreateMenuItem,
  validateUpdateMenuItem,
  handleValidationErrors,
};