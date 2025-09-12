import jwt from 'jsonwebtoken';

/**
 * JWT utility functions for token generation and verification
 * @fileoverview Provides secure JWT token operations for authentication and CSRF protection
 */

/**
 * Generates a JSON Web Token for authentication
 * @param {Object} payload - The payload to encode in the token (typically user data)
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.role - User role (student, admin)
 * @returns {string} The signed JWT token
 * @throws {Error} When JWT_SECRET is not configured or invalid payload
 * @example
 * const token = generateToken({ id: '123', email: 'user@example.com', role: 'student' });
 */
const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload provided');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'smart-navigator',
    audience: 'smart-navigator-users'
  });
};

/**
 * Verifies and decodes a JSON Web Token
 * @param {string} token - The JWT token to verify
 * @returns {Object} The decoded payload from the token
 * @throws {jwt.JsonWebTokenError} When token is invalid, expired, or malformed
 * @throws {Error} When JWT_SECRET is not configured
 * @example
 * try {
 *   const decoded = verifyToken(authToken);
 *   console.log('User:', decoded.email);
 * } catch (error) {
 *   console.error('Invalid token:', error.message);
 * }
 */
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }
  
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'smart-navigator',
    audience: 'smart-navigator-users'
  });
};

/**
 * Generates a CSRF (Cross-Site Request Forgery) protection token
 * @returns {string} A signed JWT token for CSRF protection
 * @throws {Error} When JWT_SECRET is not configured
 * @example
 * const csrfToken = generateCSRFToken();
 * // Include in forms as hidden input or request headers
 */
const generateCSRFToken = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign({ 
    type: 'csrf',
    timestamp: Date.now()
  }, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'smart-navigator'
  });
};

/**
 * Verifies a CSRF token for authenticity and validity
 * @param {string} token - The CSRF token to verify
 * @returns {boolean} True if the token is valid, false otherwise
 * @example
 * if (verifyCSRFToken(req.headers['x-csrf-token'])) {
 *   // Process the request
 * } else {
 *   res.status(403).json({ error: 'Invalid CSRF token' });
 * }
 */
const verifyCSRFToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'smart-navigator'
    });
    
    return decoded.type === 'csrf' && decoded.timestamp;
  } catch {
    return false;
  }
};

export {
  generateToken,
  verifyToken,
  generateCSRFToken,
  verifyCSRFToken
};
