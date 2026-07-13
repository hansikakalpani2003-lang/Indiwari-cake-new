/**
 * roleMiddleware.js
 * Role-based access control (RBAC) guards.
 *
 * IMPORTANT: These must always be used AFTER verifyToken middleware,
 * because they rely on req.user being set.
 *
 * Usage:
 *   router.get('/admin/orders', verifyToken, requireAdmin, controller.handler)
 *   router.get('/my/orders',   verifyToken, requireCustomer, controller.handler)
 */

/**
 * requireAdmin
 * Only allows requests where the authenticated user has role 'admin'.
 * Returns 403 Forbidden otherwise.
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
};

/**
 * requireCustomer
 * Allows requests from both 'customer' and 'admin' role users.
 * Blocks any other role (e.g. unauthenticated — though verifyToken would catch that first).
 */
const requireCustomer = (req, res, next) => {
  if (!req.user || !['customer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      message: 'Access denied. Customer or Admin access required.',
    });
  }
  next();
};

module.exports = { requireAdmin, requireCustomer };