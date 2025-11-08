/**
 * Password Value Object
 *
 * Represents a password with strength validation.
 * This Value Object does NOT store the hashed password - only validates plain text.
 * The actual hashing should be done in the infrastructure layer (HashingService).
 *
 * Password Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (optional for basic strength)
 *
 * @example
 * const password = Password.create('MySecureP@ss123');
 * if (password.isSuccess) {
 *   const strength = password.value.getStrength();
 *   console.log(strength); // 'STRONG'
 * }
 */

import { Result } from '@shared/types/Result.js';

export enum PasswordStrength {
  WEAK = 'WEAK',
  MEDIUM = 'MEDIUM',
  STRONG = 'STRONG',
  VERY_STRONG = 'VERY_STRONG',
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

export class Password {
  private readonly value: string;
  private readonly strength: PasswordStrength;

  private constructor(password: string, strength: PasswordStrength) {
    this.value = password;
    this.strength = strength;
  }

  /**
   * Factory method to create a Password value object
   * Validates password strength before creating
   */
  public static create(password: string, requireStrong: boolean = false): Result<Password> {
    if (!password || password.trim().length === 0) {
      return Result.fail<Password>('Password cannot be empty');
    }

    const validation = this.validate(password);

    if (!validation.isValid) {
      return Result.fail<Password>(validation.errors.join(', '));
    }

    if (requireStrong && validation.strength === PasswordStrength.WEAK) {
      return Result.fail<Password>('Password is too weak. Please use a stronger password.');
    }

    return Result.ok<Password>(new Password(password, validation.strength));
  }

  /**
   * Validates password and returns detailed result
   */
  public static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength = PasswordStrength.WEAK;

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check maximum length (prevent DoS attacks on bcrypt)
    if (password.length > 72) {
      errors.push('Password must not exceed 72 characters');
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for numbers
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Calculate strength
    if (errors.length === 0) {
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      const hasMultipleNumbers = (password.match(/[0-9]/g) || []).length >= 2;
      const hasMultipleSpecialChars =
        (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2;
      const isLongEnough = password.length >= 12;

      if (hasSpecialChar && hasMultipleNumbers && isLongEnough && hasMultipleSpecialChars) {
        strength = PasswordStrength.VERY_STRONG;
      } else if (hasSpecialChar && hasMultipleNumbers && isLongEnough) {
        strength = PasswordStrength.STRONG;
      } else if (hasSpecialChar || isLongEnough) {
        strength = PasswordStrength.MEDIUM;
      } else {
        strength = PasswordStrength.WEAK;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Gets the password value (plain text)
   * NOTE: This should only be used for hashing, never for storage or logging!
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Gets the password strength
   */
  public getStrength(): PasswordStrength {
    return this.strength;
  }

  /**
   * Checks if password is strong enough
   */
  public isStrong(): boolean {
    return (
      this.strength === PasswordStrength.STRONG || this.strength === PasswordStrength.VERY_STRONG
    );
  }

  /**
   * Returns a safe string representation (hides actual password)
   */
  public toString(): string {
    return '***PROTECTED***';
  }

  /**
   * Checks if two passwords are equal
   * NOTE: This compares plain text passwords, use with caution!
   */
  public equals(other: Password): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }
}
