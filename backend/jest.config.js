export default {
  testEnvironment: 'node',
  
  // Use native ES modules without transformation
  transform: {},
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],
  
  // Coverage collection
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/*.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Coverage thresholds (realistic targets for current state)
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 25,
      statements: 25
    }
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output for better debugging
  verbose: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles that prevent Jest from exiting cleanly
  detectOpenHandles: true
};