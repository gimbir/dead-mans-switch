/**
 * Hashing Service Implementation
 *
 * Implements IHashingService using bcrypt for password hashing.
 * Provides secure password hashing with automatic salting.
 *
 * Security Features:
 * - bcrypt algorithm (Blowfish cipher-based)
 * - Automatic salt generation
 * - Configurable work factor (cost)
 * - Timing attack resistance
 * - Rehash detection for security updates
 *
 * Performance Notes:
 * - Higher cost factor = more secure but slower
 * - Current cost: 12 (recommended for 2024+)
 * - Async operations to prevent blocking
 *
 * Usage:
 * const passwordVO = Password.create('MySecureP@ss123').value;
 * const hashResult = await hashingService.hashPassword(passwordVO);
 * if (hashResult.isSuccess) {
 *   const hashedPassword = hashResult.value;
 *   // Store hashedPassword in database
 * }
 */

import bcrypt from 'bcrypt';
import { IHashingService } from '@domain/services/IHashingService.js';
import { Password } from '@domain/value-objects/Password.vo.js';
import { Result } from '@shared/types/Result.js';

export class HashingService implements IHashingService {
  /**
   * Work factor (cost) for bcrypt
   * Higher = more secure but slower
   * 12 is recommended for 2024+ (takes ~300ms on modern hardware)
   * Increase this value over time as hardware improves
   */
  private readonly SALT_ROUNDS = 12;

  /**
   * Minimum cost factor to consider a hash secure
   * Hashes below this should be rehashed
   */
  private readonly MIN_SECURE_ROUNDS = 10;

  /**
   * Hashes a plain text password using bcrypt
   */
  async hashPassword(password: Password): Promise<Result<string>> {
    try {
      // Get plain text value from Password value object
      const plainPassword = password.getValue();

      // Validate password length (bcrypt has 72 byte limit)
      if (plainPassword.length > 72) {
        return Result.fail<string>(
          'Password exceeds maximum length for bcrypt (72 characters)'
        );
      }

      // Hash with automatic salt generation
      const hashedPassword = await bcrypt.hash(plainPassword, this.SALT_ROUNDS);

      return Result.ok<string>(hashedPassword);
    } catch (error) {
      return Result.fail<string>(
        `Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verifies a plain text password against a bcrypt hash
   * Uses constant-time comparison to prevent timing attacks
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<Result<boolean>> {
    try {
      // Validate inputs
      if (!plainPassword || plainPassword.trim().length === 0) {
        return Result.fail<boolean>('Plain password cannot be empty');
      }

      if (!hashedPassword || hashedPassword.trim().length === 0) {
        return Result.fail<boolean>('Hashed password cannot be empty');
      }

      // Validate bcrypt hash format
      if (!this.isBcryptHash(hashedPassword)) {
        return Result.fail<boolean>('Invalid bcrypt hash format');
      }

      // Compare using bcrypt's constant-time comparison
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

      return Result.ok<boolean>(isMatch);
    } catch (error) {
      // Don't expose internal errors for security
      return Result.fail<boolean>('Password verification failed');
    }
  }

  /**
   * Checks if a hash needs to be updated (rehashed)
   * Returns true if:
   * - Cost factor is below minimum secure threshold
   * - Hash format is outdated
   * - Algorithm should be upgraded
   */
  async needsRehash(hashedPassword: string): Promise<boolean> {
    try {
      // Validate hash format
      if (!this.isBcryptHash(hashedPassword)) {
        return true; // Not a valid bcrypt hash, needs rehashing
      }

      // Extract cost factor from hash
      // bcrypt format: $2a$10$... or $2b$12$...
      const costMatch = hashedPassword.match(/^\$2[aby]\$(\d+)\$/);
      if (!costMatch || !costMatch[1]) {
        return true; // Invalid format
      }

      const currentCost = parseInt(costMatch[1], 10);

      // Check if cost is below minimum secure threshold
      if (currentCost < this.MIN_SECURE_ROUNDS) {
        return true;
      }

      // Check if we've increased our target salt rounds
      if (currentCost < this.SALT_ROUNDS) {
        return true;
      }

      return false;
    } catch (_error) {
      // If we can't determine, safer to require rehash
      return true;
    }
  }

  /**
   * Validates if a string is a valid bcrypt hash
   * bcrypt format: $2a$10$... or $2b$12$... or $2y$12$...
   */
  private isBcryptHash(hash: string): boolean {
    // bcrypt hashes are 60 characters long
    if (hash.length !== 60) {
      return false;
    }

    // Check format: $2a$, $2b$, or $2y$ followed by cost and salt
    const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
    return bcryptRegex.test(hash);
  }

  /**
   * Gets the current salt rounds configuration
   * Useful for monitoring and logging
   */
  public getSaltRounds(): number {
    return this.SALT_ROUNDS;
  }

  /**
   * Extracts cost factor from a bcrypt hash
   * Returns null if hash is invalid
   */
  public getCostFromHash(hash: string): number | null {
    try {
      if (!this.isBcryptHash(hash)) {
        return null;
      }

      const costMatch = hash.match(/^\$2[aby]\$(\d+)\$/);
      if (!costMatch || !costMatch[1]) {
        return null;
      }

      return parseInt(costMatch[1], 10);
    } catch (_error) {
      return null;
    }
  }
}
