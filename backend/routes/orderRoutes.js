const express = require('express');
const router = express.Router();
router.get('/my', (req, res) => { res.status(200).json({ success: true, orders: [] }); });
module.exports = router;