/**
 * qrRoutes.js
 * Routes for the public QR code order display.
 *
 * Mounted at the root level in app.js:
 *   app.use('/order', cors({ origin: '*' }), qrRoutes);
 *
 * This route is intentionally unauthenticated and open to all origins,
 * because QR codes are scanned by devices that do not have login sessions.
 */

const express       = require('express');
const router        = express.Router();
const qrController  = require('../controllers/qrController');

// GET /order/:token — public, no auth
router.get('/:token', qrController.publicOrderPage);

module.exports = router;