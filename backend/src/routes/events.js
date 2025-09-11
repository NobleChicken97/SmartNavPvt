import express from 'express';
const router = express.Router();
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getRecommendedEvents,
  registerForEvent,
  unregisterFromEvent,
  getUpcomingEvents
} from '../controllers/eventController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { 
  validateEvent, 
  validateEventQuery, 
  validateObjectId 
} from '../middleware/validation.js';
import { writeLimiter } from '../middleware/rateLimiter.js';

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, validateEventQuery, getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', validateObjectId, getEvent);

// Private routes
router.use(authenticate);
router.get('/recommended', getRecommendedEvents);
router.post('/:id/register', validateObjectId, registerForEvent);
router.delete('/:id/register', validateObjectId, unregisterFromEvent);

// Admin only routes
router.use(authorize('admin'));
router.post('/', writeLimiter, validateEvent, createEvent);
router.put('/:id', writeLimiter, validateObjectId, validateEvent, updateEvent);
router.delete('/:id', writeLimiter, validateObjectId, deleteEvent);

export default router;
