/* eslint-env jest, node */
import { describe, test, expect } from '@jest/globals';
import { generateToken, verifyToken } from '../src/utils/jwt.js';

describe('JWT Utils', () => {
  test('should have generateToken function', () => {
    expect(typeof generateToken).toBe('function');
  });

  test('should have verifyToken function', () => {
    expect(typeof verifyToken).toBe('function');
  });

  test('should generate a token', () => {
    const payload = { userId: 'test123', email: 'test@example.com' };
    const token = generateToken(payload);
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });

  test('should verify a valid token', () => {
    const payload = { userId: 'test123', email: 'test@example.com' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    
    expect(decoded.success).toBe(true);
    expect(decoded.payload.userId).toBe('test123');
    expect(decoded.payload.email).toBe('test@example.com');
  });

  test('should reject invalid token', () => {
    const result = verifyToken('invalid-token');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});