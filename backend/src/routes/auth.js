import express from 'express';
const router = express.Router();
import {
  register,
  login,
  logout,
  getMe,
  getCSRFToken
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

// Public routes
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Private routes
router.use(authenticate);
router.post('/logout', logout);
router.get('/me', getMe);
router.get('/csrf-token', getCSRFToken);

export default router;
