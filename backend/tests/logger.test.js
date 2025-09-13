/* eslint-env jest, node */
import { describe, test, expect } from '@jest/globals';
import logger from '../src/utils/logger.js';

describe('Logger Utils', () => {
  test('should have info method', () => {
    expect(typeof logger.info).toBe('function');
  });

  test('should have error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  test('should have warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  test('should have debug method', () => {
    expect(typeof logger.debug).toBe('function');
  });

  test('should log info message without throwing', () => {
    expect(() => {
      logger.info('Test info message');
    }).not.toThrow();
  });

  test('should log error message without throwing', () => {
    expect(() => {
      logger.error('Test error message');
    }).not.toThrow();
  });

  test('should log structured data', () => {
    expect(() => {
      logger.info('Test with data', { 
        userId: 'test123',
        action: 'login'
      });
    }).not.toThrow();
  });
});