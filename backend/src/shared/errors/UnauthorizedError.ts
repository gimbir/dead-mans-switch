/**
 * Unauthorized Error
 *
 * Thrown when authentication fails or token is invalid.
 * HTTP Status: 401 Unauthorized
 *
 * Usage:
 * throw new UnauthorizedError('Invalid token');
 * throw new UnauthorizedError('Invalid credentials');
 */

import { AppError } from './AppError.js';

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: unknown) {
    super(message, 401, true, 'UNAUTHORIZED', details);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
