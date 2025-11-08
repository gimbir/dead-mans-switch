/**
 * Conflict Error
 *
 * Thrown when a request conflicts with existing data.
 * HTTP Status: 409 Conflict
 *
 * Common use cases:
 * - Duplicate email during registration
 * - Optimistic locking version mismatch
 * - Resource already exists
 *
 * Usage:
 * throw new ConflictError('Email already exists');
 * throw new ConflictError('Version mismatch - resource was modified', { currentVersion: 2 });
 */

import { AppError } from './AppError.js';

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', details?: unknown) {
    super(message, 409, true, 'CONFLICT', details);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
