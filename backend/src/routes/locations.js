import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getNearbyLocations,
  importLocations
} from '../controllers/locationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validateLocation, 
  validateLocationQuery, 
  validateObjectId 
} from '../middleware/validation.js';
import { writeLimiter, uploadLimiter } from '../middleware/rateLimiter.js';

// Configure multer for CSV uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', validateLocationQuery, getLocations);
router.get('/nearby', validateLocationQuery, getNearbyLocations);
router.get('/:id', validateObjectId, getLocation);

// Admin only routes
router.use(authenticate);
router.use(authorize('admin'));

router.post('/', writeLimiter, validateLocation, createLocation);
router.put('/:id', writeLimiter, validateObjectId, validateLocation, updateLocation);
router.delete('/:id', writeLimiter, validateObjectId, deleteLocation);
router.post('/import', uploadLimiter, upload.single('csv'), importLocations);

export default router;
