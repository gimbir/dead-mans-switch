/**
 * Validation Error
 *
 * Thrown when request data fails validation.
 * HTTP Status: 400 Bad Request
 *
 * Usage:
 * throw new ValidationError('Invalid email format', { field: 'email' });
 */

import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, true, 'VALIDATION_ERROR', details);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
