import rateLimit from 'express-rate-limit';

/**
 * General rate limiting
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiting for authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (increased for development)
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

/**
 * Rate limiting for write operations (create, update, delete)
 */
const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 write requests per windowMs
  message: {
    success: false,
    message: 'Too many write operations from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiting for file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 upload requests per windowMs
  message: {
    success: false,
    message: 'Too many file uploads from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export {
  generalLimiter,
  authLimiter,
  writeLimiter,
  uploadLimiter
};
