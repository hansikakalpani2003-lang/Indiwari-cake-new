/**
 * customerController.js
 * Route handlers for customer-facing profile and password management endpoints.
 *
 * All routes require a valid JWT (verifyToken middleware).
 * userId is extracted from req.user.userId (set by verifyToken).
 *
 * Handlers:
 *   - getProfile         GET  /api/customers/profile
 *   - updateProfile      PATCH /api/customers/profile
 *   - changePassword     PATCH /api/customers/password
 *
 * Used by: customerRoutes.js
 */

const asyncWrapper      = require('../utils/asyncWrapper');
const customerService   = require('../services/customerService');

// ── GET /api/customers/profile ────────────────────────────────────────────────
/**
 * Returns the authenticated customer's profile fields.
 * Response: { id, name, email, phone, delivery_address, created_at }
 */
const getProfile = asyncWrapper(async (req, res) => {
  const userId  = req.user.userId;
  const profile = await customerService.getProfile(userId);

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found.' });
  }

  res.json(profile);
});

// ── PATCH /api/customers/profile ──────────────────────────────────────────────
/**
 * Updates the customer's phone number and/or delivery address.
 * Body: { phone?, delivery_address? }
 * Response: { message, profile }
 */
const updateProfile = asyncWrapper(async (req, res) => {
  const userId  = req.user.userId;
  const { phone, delivery_address } = req.body;

  const updatedProfile = await customerService.updateProfile(userId, {
    phone,
    delivery_address,
  });

  res.json({
    message: 'Profile updated successfully.',
    profile: updatedProfile,
  });
});

// ── PATCH /api/customers/password ─────────────────────────────────────────────
/**
 * Changes the customer's password after verifying the current one.
 * Body: { current_password, new_password, confirm_password }
 * Response: { message }
 * Throws 401 if current_password is wrong.
 */
const changePassword = asyncWrapper(async (req, res) => {
  const userId = req.user.userId;
  const { current_password, new_password } = req.body;

  try {
    await customerService.changePassword(userId, current_password, new_password);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    throw err;
  }

  res.json({ message: 'Password changed successfully. Please log in again.' });
});

module.exports = { getProfile, updateProfile, changePassword };