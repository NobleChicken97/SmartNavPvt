/**
 * @fileoverview Enhanced input validation using Joi schema validation
 * Provides comprehensive validation schemas and middleware for all API endpoints
 * @version 2.0.0
 * @author Smart Navigator Team
 * @requires joi
 */

import Joi from 'joi';
import logger from '../utils/logger.js';

/**
 * Custom Joi extensions for specific validation needs
 */
const customJoi = Joi.extend({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.strongPassword': '{{#label}} must contain at least 8 characters with uppercase, lowercase, number, and special character'
  },
  rules: {
    strongPassword: {
      validate(value, helpers) {
        // Check for strong password: min 8 chars, upper, lower, number, special char
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!strongPasswordRegex.test(value) || value.length < 8) {
          return helpers.error('string.strongPassword');
        }
        return value;
      }
    }
  }
});

/**
 * Common validation schemas
 */
const commonSchemas = {
  objectId: Joi.string().hex().length(24).message('Invalid ID format'),
  email: Joi.string().email().lowercase().trim().max(100),
  password: customJoi.string().strongPassword().min(8).max(128),
  name: Joi.string().trim().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).message('Name must contain only letters and spaces'),
  coordinates: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required()
  }).required(),
  tags: Joi.array().items(Joi.string().trim().min(1).max(30)).max(10),
  role: Joi.string().valid('student', 'admin').default('student'),
  dateTime: Joi.date().iso().greater('now'),
  url: Joi.string().uri().max(500)
};

/**
 * Authentication validation schemas
 */
export const authSchemas = {
  register: Joi.object({
    name: commonSchemas.name.required(),
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    role: commonSchemas.role,
    interests: Joi.array().items(
      Joi.string().trim().min(1).max(50)
    ).max(10).optional(),
    acceptTerms: Joi.boolean().valid(true).required().messages({
      'any.only': 'You must accept the terms and conditions'
    })
  }),

  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required().min(1).max(128),
    rememberMe: Joi.boolean().default(false)
  }),

  updateProfile: Joi.object({
    name: commonSchemas.name,
    interests: Joi.array().items(
      Joi.string().trim().min(1).max(50)
    ).max(10),
    bio: Joi.string().trim().max(500).allow(''),
    avatar: commonSchemas.url
  }).min(1), // At least one field must be provided

  changePassword: Joi.object({
    currentPassword: Joi.string().required().min(1).max(128),
    newPassword: commonSchemas.password.required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({
      'any.only': 'Password confirmation must match new password'
    })
  })
};

/**
 * Location validation schemas
 */
export const locationSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(1000).allow(''),
    type: Joi.string().valid('building', 'room', 'poi', 'facility', 'parking', 'entrance').required(),
    coordinates: commonSchemas.coordinates,
    address: Joi.string().trim().max(200),
    floor: Joi.number().integer().min(-10).max(50),
    capacity: Joi.number().integer().min(1).max(10000),
    facilities: Joi.array().items(
      Joi.string().valid('wifi', 'projector', 'whiteboard', 'ac', 'parking', 'accessible', 'food', 'restroom')
    ).max(20),
    tags: commonSchemas.tags,
    images: Joi.array().items(commonSchemas.url).max(10),
    openingHours: Joi.object({
      monday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      tuesday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      wednesday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      thursday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      friday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      saturday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      sunday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('')
    }),
    isActive: Joi.boolean().default(true)
  }),

  update: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(1000).allow(''),
    type: Joi.string().valid('building', 'room', 'poi', 'facility', 'parking', 'entrance'),
    coordinates: commonSchemas.coordinates,
    address: Joi.string().trim().max(200),
    floor: Joi.number().integer().min(-10).max(50),
    capacity: Joi.number().integer().min(1).max(10000),
    facilities: Joi.array().items(
      Joi.string().valid('wifi', 'projector', 'whiteboard', 'ac', 'parking', 'accessible', 'food', 'restroom')
    ).max(20),
    tags: commonSchemas.tags,
    images: Joi.array().items(commonSchemas.url).max(10),
    openingHours: Joi.object({
      monday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      tuesday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      wednesday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      thursday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      friday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      saturday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(''),
      sunday: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).allow('')
    }),
    isActive: Joi.boolean()
  }).min(1), // At least one field must be provided

  query: Joi.object({
    search: Joi.string().trim().max(100),
    type: Joi.string().valid('building', 'room', 'poi', 'facility', 'parking', 'entrance'),
    tags: Joi.alternatives().try(
      Joi.string().trim().max(30),
      Joi.array().items(Joi.string().trim().max(30)).max(10)
    ),
    facilities: Joi.alternatives().try(
      Joi.string().valid('wifi', 'projector', 'whiteboard', 'ac', 'parking', 'accessible', 'food', 'restroom'),
      Joi.array().items(Joi.string().valid('wifi', 'projector', 'whiteboard', 'ac', 'parking', 'accessible', 'food', 'restroom')).max(10)
    ),
    floor: Joi.number().integer().min(-10).max(50),
    isActive: Joi.boolean(),
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'type', 'createdAt', 'updatedAt').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  })
};

/**
 * Event validation schemas
 */
export const eventSchemas = {
  create: Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().max(2000).allow(''),
    category: Joi.string().valid('academic', 'cultural', 'sports', 'workshop', 'seminar', 'meeting', 'other').required(),
    dateTime: commonSchemas.dateTime.required(),
    endDateTime: Joi.date().iso().greater(Joi.ref('dateTime')),
    locationId: commonSchemas.objectId,
    externalLocation: Joi.string().trim().max(200),
    capacity: Joi.number().integer().min(1).max(50000),
    registrationRequired: Joi.boolean().default(false),
    registrationDeadline: Joi.date().iso().less(Joi.ref('dateTime')),
    tags: commonSchemas.tags,
    images: Joi.array().items(commonSchemas.url).max(10),
    organizer: Joi.object({
      name: Joi.string().trim().min(2).max(100).required(),
      email: commonSchemas.email.required(),
      phone: Joi.string().pattern(/^[+]?[1-9][\d\s\-()]{7,15}$/).message('Invalid phone number format'),
      organization: Joi.string().trim().max(100)
    }).required(),
    isPublic: Joi.boolean().default(true),
    requiresApproval: Joi.boolean().default(false)
  }).custom((value, helpers) => {
    // Ensure either locationId or externalLocation is provided
    if (!value.locationId && !value.externalLocation) {
      return helpers.error('custom.locationRequired');
    }
    if (value.locationId && value.externalLocation) {
      return helpers.error('custom.locationConflict');
    }
    return value;
  }).messages({
    'custom.locationRequired': 'Either locationId or externalLocation must be provided',
    'custom.locationConflict': 'Cannot provide both locationId and externalLocation'
  }),

  update: Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().trim().max(2000).allow(''),
    category: Joi.string().valid('academic', 'cultural', 'sports', 'workshop', 'seminar', 'meeting', 'other'),
    dateTime: commonSchemas.dateTime,
    endDateTime: Joi.date().iso().greater(Joi.ref('dateTime')),
    locationId: commonSchemas.objectId.allow(null),
    externalLocation: Joi.string().trim().max(200).allow(''),
    capacity: Joi.number().integer().min(1).max(50000),
    registrationRequired: Joi.boolean(),
    registrationDeadline: Joi.date().iso(),
    tags: commonSchemas.tags,
    images: Joi.array().items(commonSchemas.url).max(10),
    organizer: Joi.object({
      name: Joi.string().trim().min(2).max(100).required(),
      email: commonSchemas.email.required(),
      phone: Joi.string().pattern(/^[+]?[1-9][\d\s\-()]{7,15}$/).message('Invalid phone number format'),
      organization: Joi.string().trim().max(100)
    }),
    isPublic: Joi.boolean(),
    requiresApproval: Joi.boolean()
  }).min(1), // At least one field must be provided

  query: Joi.object({
    search: Joi.string().trim().max(100),
    category: Joi.string().valid('academic', 'cultural', 'sports', 'workshop', 'seminar', 'meeting', 'other'),
    tags: Joi.alternatives().try(
      Joi.string().trim().max(30),
      Joi.array().items(Joi.string().trim().max(30)).max(10)
    ),
    locationId: commonSchemas.objectId,
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso().greater(Joi.ref('dateFrom')),
    isPublic: Joi.boolean(),
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('title', 'dateTime', 'category', 'createdAt').default('dateTime'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  })
};

/**
 * User management validation schemas
 */
export const userSchemas = {
  query: Joi.object({
    search: Joi.string().trim().max(100),
    role: commonSchemas.role,
    isEmailVerified: Joi.boolean(),
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('name', 'email', 'role', 'createdAt', 'updatedAt').default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }),

  updateUser: Joi.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    role: commonSchemas.role,
    isEmailVerified: Joi.boolean(),
    interests: Joi.array().items(
      Joi.string().trim().min(1).max(50)
    ).max(10),
    bio: Joi.string().trim().max(500).allow(''),
    avatar: commonSchemas.url
  }).min(1) // At least one field must be provided
};

/**
 * Parameter validation schemas
 */
export const paramSchemas = {
  id: Joi.object({
    id: commonSchemas.objectId.required()
  })
};

/**
 * Create validation middleware for different parts of the request
 * @param {Object} schemas - Object containing validation schemas for different parts
 * @param {Object} schemas.body - Schema for request body
 * @param {Object} schemas.query - Schema for query parameters
 * @param {Object} schemas.params - Schema for URL parameters
 * @param {Object} options - Validation options
 * @returns {Function} Express middleware function
 */
export const validate = (schemas, options = {}) => {
  const defaultOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    convert: true
  };

  const validationOptions = { ...defaultOptions, ...options };

  return async (req, res, next) => {
    const validationLogger = logger.child({ 
      component: 'validation', 
      endpoint: `${req.method} ${req.path}`,
      ip: req.ip 
    });

    try {
      // Validate different parts of the request
      const validationPromises = [];

      if (schemas.params) {
        validationPromises.push(
          schemas.params.validateAsync(req.params, validationOptions)
            .then(value => { req.params = value; })
        );
      }

      if (schemas.query) {
        validationPromises.push(
          schemas.query.validateAsync(req.query, validationOptions)
            .then(value => { req.query = value; })
        );
      }

      if (schemas.body) {
        validationPromises.push(
          schemas.body.validateAsync(req.body, validationOptions)
            .then(value => { req.body = value; })
        );
      }

      // Wait for all validations to complete
      await Promise.all(validationPromises);

      validationLogger.debug('Request validation successful', {
        hasBody: !!schemas.body,
        hasQuery: !!schemas.query,
        hasParams: !!schemas.params
      });

      next();

    } catch (error) {
      validationLogger.warn('Request validation failed', {
        error: error.message,
        details: error.details?.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }))
      });

      return res.status(400).json({
        success: false,
        message: 'Request validation failed',
        errors: error.details?.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
          value: detail.context?.value
        })) || [{ message: error.message }]
      });
    }
  };
};

/**
 * Pre-built validation middleware for common use cases
 */
export const validators = {
  // Authentication
  validateRegister: validate({ body: authSchemas.register }),
  validateLogin: validate({ body: authSchemas.login }),
  validateUpdateProfile: validate({ body: authSchemas.updateProfile }),
  validateChangePassword: validate({ body: authSchemas.changePassword }),

  // Locations
  validateCreateLocation: validate({ body: locationSchemas.create }),
  validateUpdateLocation: validate({ 
    params: paramSchemas.id, 
    body: locationSchemas.update 
  }),
  validateLocationQuery: validate({ query: locationSchemas.query }),
  validateLocationParams: validate({ params: paramSchemas.id }),

  // Events
  validateCreateEvent: validate({ body: eventSchemas.create }),
  validateUpdateEvent: validate({ 
    params: paramSchemas.id, 
    body: eventSchemas.update 
  }),
  validateEventQuery: validate({ query: eventSchemas.query }),
  validateEventParams: validate({ params: paramSchemas.id }),

  // Users
  validateUserQuery: validate({ query: userSchemas.query }),
  validateUpdateUser: validate({ 
    params: paramSchemas.id, 
    body: userSchemas.updateUser 
  }),
  validateUserParams: validate({ params: paramSchemas.id }),

  // Common
  validateIdParam: validate({ params: paramSchemas.id })
};

export default validators;
