import { jest } from '@jest/globals';

// Global test setup
globalThis.console = {
  ...console,
  // Suppress console.log during tests but keep errors
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error
};

// Set longer timeout for database operations
jest.setTimeout(10000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.MONGODB_URI = 'mongodb://root:example@localhost:27017/smart-navigator-test?authSource=admin';

// Global test utilities
globalThis.testUtils = {
  // Helper to create mock request objects
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  }),
  
  // Helper to create mock response objects
  mockResponse: () => {
    const res = {};
    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);
    res.send = jest.fn(() => res);
    res.cookie = jest.fn(() => res);
    res.clearCookie = jest.fn(() => res);
    return res;
  },
  
  // Helper to create mock next function
  mockNext: () => jest.fn()
};