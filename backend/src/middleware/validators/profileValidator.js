/**
 * profileValidator.js
 * Express-validator middleware for profile update and password change routes.
 *
 * validateProfileUpdate:
 *   - phone: optional, but if provided must be 10–15 digits (Sri Lankan mobile numbers)
 *   - delivery_address: optional, but if provided must not be empty
 *
 * validatePasswordChange:
 *   - current_password: required, non-empty
 *   - new_password: required, minimum 8 characters
 *   - confirm_password: required, must match new_password
 *
 * Used by: customerRoutes.js
 */

const { body, validationResult } = require('express-validator');

// ── Profile Update Validator ──────────────────────────────────────────────────
const validateProfileUpdate = [
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{10,15}$/)
    .withMessage('Phone number must be 10 to 15 digits with no spaces or dashes.'),

  body('delivery_address')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage('Delivery address cannot be blank if provided.')
    .isLength({ max: 500 })
    .withMessage('Delivery address must be 500 characters or fewer.'),

  // ── Error collector ────────────────────────────────────────────────────────
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

// ── Password Change Validator ─────────────────────────────────────────────────
const validatePasswordChange = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required.'),

  body('new_password')
    .notEmpty()
    .withMessage('New password is required.')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.')
    .custom((value, { req }) => {
      if (value === req.body.current_password) {
        throw new Error('New password must be different from the current password.');
      }
      return true;
    }),

  body('confirm_password')
    .notEmpty()
    .withMessage('Password confirmation is required.')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Passwords do not match. Please re-enter your new password.');
      }
      return true;
    }),

  // ── Error collector ────────────────────────────────────────────────────────
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateProfileUpdate, validatePasswordChange };