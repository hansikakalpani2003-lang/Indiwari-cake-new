const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validators/authValidator');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.get('/me', verifyToken, me);

module.exports = router;