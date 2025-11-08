/**
 * Jest Test Setup
 *
 * Global setup for all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars!!';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/deadmansswitch_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.SMTP_HOST = 'smtp.mailtrap.io';
process.env.SMTP_PORT = '2525';
process.env.SMTP_USER = 'test';
process.env.SMTP_PASSWORD = 'test';
process.env.SMTP_FROM_EMAIL = 'test@example.com';
process.env.SMTP_FROM_NAME = 'Test System';

// Extend Jest timeout for integration tests
jest.setTimeout(30000);

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error and important logs
  error: console.error,
};
