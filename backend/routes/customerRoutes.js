const express = require('express');
const router = express.Router();
router.get('/profile', (req, res) => { res.status(200).json({ success: true, customer: { name: 'Test User', email: 'test@test.com' } }); });
module.exports = router;