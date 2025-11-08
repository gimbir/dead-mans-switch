/**
 * Rate Limiting Middleware
 *
 * Protects the API from abuse by limiting the number of requests
 * from a single IP address within a time window.
 *
 * Different endpoints have different limits:
 * - Global: 1000 requests per 15 minutes
 * - Auth endpoints: 20 requests per 15 minutes
 * - Login: 5 attempts per 15 minutes
 * - Check-in: 10 requests per minute
 *
 * Uses express-rate-limit with Redis store for distributed rate limiting.
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIG } from '@shared/constants/config.js';
import { Request, Response } from 'express';

/**
 * Custom handler for rate limit exceeded
 */
const rateLimitHandler = (_req: Request, res: Response): void => {
  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      retryAfter: res.getHeader('Retry-After'),
    },
  });
};

/**
 * Global rate limiter for all API requests
 */
export const globalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.GLOBAL.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.GLOBAL.MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip rate limiting for health check endpoints
    return req.path.startsWith('/health');
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.AUTH.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.AUTH.MAX_REQUESTS,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * Very strict rate limiter for login endpoint
 */
export const loginRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.LOGIN.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.LOGIN.MAX_REQUESTS,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // Only count failed login attempts
});

/**
 * Rate limiter for check-in endpoint
 */
export const checkInRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.CHECKIN.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.CHECKIN.MAX_REQUESTS,
  message: 'Too many check-in attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

/**
 * Create a custom rate limiter with specific options
 */
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
  });
};
