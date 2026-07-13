const express = require('express');
const router = express.Router();
router.post('/register', (req, res) => { res.status(201).json({ success: true }); });
router.post('/login', (req, res) => { res.status(200).json({ success: true, token: 'dummy' }); });
router.get('/me', (req, res) => { res.status(200).json({ success: true }); });
module.exports = router;