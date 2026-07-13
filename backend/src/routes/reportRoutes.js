const express = require('express');
const router = express.Router();

// තාවකාලික test route
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reports route working!' });
});

module.exports = router;