/**
 * Error Handler Middleware
 *
 * Global error handling middleware for Express application.
 * Catches all errors thrown in the application and returns consistent error responses.
 *
 * This middleware should be registered LAST in the middleware chain,
 * after all routes and other middleware.
 *
 * Features:
 * - Consistent error response format
 * - Environment-specific error details (stack traces in development)
 * - HTTP status code mapping
 * - Error logging
 * - Special handling for common error types
 *
 * Usage:
 * app.use(errorHandler);  // Register last!
 */

import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '@config/env.config.js';

/**
 * Custom error interface with additional properties
 */
interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export function errorHandler(
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 Internal Server Error
  const statusCode = error.statusCode ?? 500;
  const message = error.message || 'Internal server error';

  // Log error details
  console.error('❌ Error occurred:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    code: error.code,
  });

  // Base error response
  const errorResponse: {
    success: boolean;
    error: string;
    code?: string;
    stack?: string;
  } = {
    success: false,
    error: message,
  };

  // Add error code if available (conditionally)
  if (error.code !== undefined) {
    errorResponse.code = error.code;
  }

  // Include stack trace in development
  if (isDevelopment() && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Not Found (404) handler
 * Catches all requests to undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND',
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 *
 * Usage:
 * router.get('/example', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create operational error
 * Used for expected errors that should be returned to the client
 */
export class OperationalError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean = true;

  constructor(message: string, statusCode: number = 400, code?: string) {
    super(message);
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    this.name = 'OperationalError';

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP error classes for common status codes
 */
export class BadRequestError extends OperationalError {
  constructor(message: string = 'Bad Request', code?: string) {
    super(message, 400, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends OperationalError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends OperationalError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends OperationalError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends OperationalError {
  constructor(message: string = 'Conflict', code?: string) {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends OperationalError {
  constructor(message: string = 'Validation failed', code?: string) {
    super(message, 422, code);
    this.name = 'ValidationError';
  }
}

export class TooManyRequestsError extends OperationalError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends OperationalError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, 500, code);
    this.name = 'InternalServerError';
  }
}

export class ServiceUnavailableError extends OperationalError {
  constructor(message: string = 'Service unavailable', code?: string) {
    super(message, 503, code);
    this.name = 'ServiceUnavailableError';
  }
}
