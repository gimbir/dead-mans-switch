/**
 * Forbidden Error
 *
 * Thrown when user lacks permission to access a resource.
 * HTTP Status: 403 Forbidden
 *
 * Difference from UnauthorizedError:
 * - 401 Unauthorized: User is not authenticated (not logged in)
 * - 403 Forbidden: User is authenticated but lacks permission
 *
 * Usage:
 * throw new ForbiddenError('You do not have permission to access this switch');
 * throw new ForbiddenError('Cannot modify another user\'s resource');
 */

import { AppError } from './AppError.js';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(message, 403, true, 'FORBIDDEN', details);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
