const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  getCSRFToken
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Private routes
router.use(authenticate);
router.post('/logout', logout);
router.get('/me', getMe);
router.get('/csrf-token', getCSRFToken);

module.exports = router;
