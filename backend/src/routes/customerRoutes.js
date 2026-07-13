/**
 * customerRoutes.js
 * Routes for authenticated customer profile management.
 *
 * All routes require a valid JWT via verifyToken middleware.
 *
 * Routes:
 *   GET   /api/customers/profile   → customerController.getProfile
 *   PATCH /api/customers/profile   → [validate] → customerController.updateProfile
 *   PATCH /api/customers/password  → [validate] → customerController.changePassword
 *
 * Mounted in app.js as: app.use('/api/customers', customerRoutes)
 */

const express            = require('express');
const router             = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');   // ✅ Destructure කරන්න
const customerController = require('../controllers/customerController');
const {
  validateProfileUpdate,
  validatePasswordChange,
} = require('../middleware/validators/profileValidator');

// GET   /api/customers/profile
router.get(
  '/profile',
  verifyToken,
  customerController.getProfile
);

// PATCH /api/customers/profile
router.patch(
  '/profile',
  verifyToken,
  validateProfileUpdate,
  customerController.updateProfile
);

// PATCH /api/customers/password
router.patch(
  '/password',
  verifyToken,
  validatePasswordChange,
  customerController.changePassword
);

module.exports = router;