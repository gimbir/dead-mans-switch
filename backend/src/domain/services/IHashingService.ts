/**
 * Hashing Service Interface
 *
 * Defines the contract for hashing and verifying passwords.
 * The actual implementation will be in the infrastructure layer.
 *
 * Security Requirements:
 * - Use strong hashing algorithms (bcrypt, argon2, etc.)
 * - Use appropriate work factors
 * - Resist timing attacks
 * - Never log or expose plain text passwords
 *
 * This is a Domain Service interface because:
 * - Password hashing is a core security concern
 * - The domain layer enforces that passwords must be hashed
 * - Implementation details (algorithm, salting) are infrastructure concern
 */

import { Password } from '@domain/value-objects/Password.vo.js';
import { Result } from '@shared/types/Result.js';

export interface IHashingService {
  /**
   * Hashes a plain text password
   * @param password Password value object
   * @returns Hashed password string
   */
  hashPassword(password: Password): Promise<Result<string>>;

  /**
   * Verifies a plain text password against a hash
   * @param plainPassword Plain text password to verify
   * @param hashedPassword Hashed password to compare against
   * @returns True if password matches
   */
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<Result<boolean>>;

  /**
   * Checks if a hash needs to be updated (rehashed)
   * Useful when changing work factors or algorithms
   * @param hashedPassword Hashed password to check
   * @returns True if hash should be updated
   */
  needsRehash(hashedPassword: string): Promise<boolean>;
}
