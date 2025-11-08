/**
 * Middleware Index
 *
 * Exports all middleware for easy import in the main application.
 *
 * Usage:
 * import { authenticate, errorHandler, corsMiddleware, ... } from '@presentation/http/middleware/index.js';
 */

// Authentication middleware
export {
  authenticate,
  optionalAuthenticate,
  requireEmailVerification,
  type AuthenticatedRequest,
} from './auth.middleware.js';

// Error handling middleware
export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  OperationalError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
} from './error.middleware.js';

// CORS middleware
export { corsMiddleware } from './cors.middleware.js';

// Logger middleware
export { requestLogger, errorLogger } from './logger.middleware.js';

// Validation middleware
export { validate, type ValidationSchema } from './validation.middleware.js';

// Rate limiting middleware
export {
  globalRateLimiter,
  authRateLimiter,
  loginRateLimiter,
  checkInRateLimiter,
  createRateLimiter,
} from './rateLimiter.middleware.js';
