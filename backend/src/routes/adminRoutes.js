const express = require('express');
const router  = express.Router();

const { verifyToken }  = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const adminController  = require('../controllers/adminController');
const reportController = require('../controllers/reportController');
const menuController   = require('../controllers/menuController');
const qrController     = require('../controllers/qrController');
const deliveryPersonController = require('../controllers/deliveryPersonController');
const upload           = require('../middleware/uploadMiddleware');

router.use(verifyToken, requireAdmin);

router.get   ('/menu',                menuController.getAllAdmin);
router.post  ('/menu',                upload.single('image'), menuController.create);
router.patch ('/menu/:id',            upload.single('image'), menuController.update);
router.patch ('/menu/:id/toggle',     menuController.toggleAvailability);
router.delete('/menu/:id',            menuController.remove);

router.get('/reports/summary',        reportController.getDashboardSummary);
router.get('/reports/daily',          reportController.getDailySummary);
router.get('/reports/bestsellers',    reportController.getBestSellers);

router.get   ('/orders',              adminController.getAllOrders);
router.get   ('/orders/:id',          adminController.getAdminOrderDetail);
router.patch ('/orders/:id/status',   adminController.updateOrderStatus);
router.patch ('/orders/:id/regenerate-qr', qrController.regenerateQR);

router.get('/customers',              adminController.getAllCustomers);
router.get('/customers/:id',          adminController.getCustomerDetail);

router.get   ('/delivery-persons',      deliveryPersonController.getAll);
router.post  ('/delivery-persons',      deliveryPersonController.create);
router.put   ('/delivery-persons/:id',  deliveryPersonController.update);
router.delete('/delivery-persons/:id',  deliveryPersonController.remove);

module.exports = router;