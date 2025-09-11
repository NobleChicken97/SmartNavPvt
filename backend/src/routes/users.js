import express from 'express';
const router = express.Router();
import {
  getProfile,
  updateProfile,
  getUserEvents,
  deleteAccount
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';
import { writeLimiter } from '../middleware/rateLimiter.js';

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', writeLimiter, validateProfileUpdate, updateProfile);
router.get('/events', getUserEvents);
router.delete('/profile', writeLimiter, deleteAccount);

export default router;
