/**
 * User Repository Interface
 *
 * Defines the contract for User data access operations.
 * The actual implementation will be in the infrastructure layer.
 *
 * This follows the Repository Pattern from DDD:
 * - Provides a collection-like interface for entities
 * - Abstracts database technology (Prisma in our case)
 * - Allows easy mocking for unit tests
 */

import { User } from '@domain/entities/User.entity.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';

export interface IUserRepository {
  /**
   * Finds a user by their unique ID
   * @param id User ID
   * @returns User if found, null otherwise
   */
  findById(id: string): Promise<Result<User | null>>;

  /**
   * Finds a user by their email address
   * @param email User email
   * @returns User if found, null otherwise
   */
  findByEmail(email: Email): Promise<Result<User | null>>;

  /**
   * Finds a user by their verification token
   * @param token Verification token
   * @returns User if found, null otherwise
   */
  findByVerificationToken(token: string): Promise<Result<User | null>>;

  /**
   * Finds a user by their refresh token
   * @param token Refresh token
   * @returns User if found, null otherwise
   */
  findByRefreshToken(token: string): Promise<Result<User | null>>;

  /**
   * Finds a user by their password reset token
   * @param token Password reset token
   * @returns User if found, null otherwise
   */
  findByPasswordResetToken(token: string): Promise<Result<User | null>>;

  /**
   * Checks if a user with the given email exists
   * @param email Email to check
   * @returns True if exists, false otherwise
   */
  existsByEmail(email: Email): Promise<boolean>;

  /**
   * Saves a new user to the database
   * @param user User entity to save
   * @returns Saved user
   */
  save(user: User): Promise<Result<User>>;

  /**
   * Updates an existing user in the database
   * Uses optimistic locking via version field
   * @param user User entity to update
   * @returns Updated user
   */
  update(user: User): Promise<Result<User>>;

  /**
   * Deletes a user (soft delete - sets deletedAt)
   * @param id User ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<Result<boolean>>;

  /**
   * Permanently removes a user from the database (hard delete)
   * Should only be used for GDPR compliance or admin operations
   * @param id User ID
   * @returns True if deleted, false if not found
   */
  permanentlyDelete(id: string): Promise<Result<boolean>>;

  /**
   * Finds all users (with pagination)
   * Excludes deleted users by default
   * @param limit Number of users to return
   * @param offset Number of users to skip
   * @param includeDeleted Whether to include soft-deleted users
   * @returns Array of users
   */
  findAll(limit: number, offset: number, includeDeleted?: boolean): Promise<Result<User[]>>;

  /**
   * Counts total number of users
   * @param includeDeleted Whether to include soft-deleted users
   * @returns Total count
   */
  count(includeDeleted?: boolean): Promise<Result<number>>;
}
