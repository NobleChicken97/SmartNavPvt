const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getUserEvents,
  deleteAccount
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');
const { writeLimiter } = require('../middleware/rateLimiter');

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', writeLimiter, validateProfileUpdate, updateProfile);
router.get('/events', getUserEvents);
router.delete('/profile', writeLimiter, deleteAccount);

module.exports = router;
