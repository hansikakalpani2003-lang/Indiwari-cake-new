'use strict';

const express = require('express');
const controller = require('../controllers/deliveryController');
const { verifyDeliveryToken } = require('../middleware/deliveryAuthMiddleware');

const router = express.Router();
router.post('/login', controller.login);
router.use(verifyDeliveryToken);
router.get('/me', controller.me);
router.get('/available-orders', controller.availableOrders);
router.get('/my-deliveries', controller.myDeliveries);
router.get('/history', controller.history);
router.patch('/orders/:id/accept', controller.acceptOrder);
router.patch('/orders/:id/deliver', controller.markDelivered);

module.exports = router;
