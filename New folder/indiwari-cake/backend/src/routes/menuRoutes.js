const express = require('express');
const {
  listMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, listMenuItems);
router.get('/:id', getMenuItem);
router.post('/', verifyToken, requireAdmin, createMenuItem);
router.put('/:id', verifyToken, requireAdmin, updateMenuItem);
router.delete('/:id', verifyToken, requireAdmin, deleteMenuItem);

module.exports = router;
