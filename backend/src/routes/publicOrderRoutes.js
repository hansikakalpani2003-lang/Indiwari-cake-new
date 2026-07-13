const express = require('express');
const router = express.Router();

// Public order එකක් create කරන route එක (login නැතුව access කරන්න පුළුවන් customers ට)
router.post('/', (req, res) => {
  res.json({ message: 'Public order route working' });
});

module.exports = router;