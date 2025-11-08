/**
 * Not Found Error
 *
 * Thrown when a requested resource is not found.
 * HTTP Status: 404 Not Found
 *
 * Usage:
 * throw new NotFoundError('User not found');
 * throw new NotFoundError('Switch not found', { switchId: 'abc123' });
 */

import { AppError } from './AppError.js';

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, true, 'NOT_FOUND', details);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
