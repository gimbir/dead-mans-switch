/**
 * Base Application Error Class
 *
 * All custom errors should extend this class.
 * Provides a consistent error structure across the application.
 *
 * Properties:
 * - message: Human-readable error message
 * - statusCode: HTTP status code
 * - isOperational: Whether this is an operational (expected) error
 * - code: Optional error code for client handling
 * - details: Optional additional error details
 */

import { env } from '@config/env.config.js';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: unknown
  ) {
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (code !== undefined) {
      this.code = code;
    }
    if (details !== undefined) {
      this.details = details;
    }

    // Set the prototype explicitly (for TypeScript)
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      ...(env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}
