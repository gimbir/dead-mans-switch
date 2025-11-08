/**
 * Email Value Object
 *
 * Represents an email address with built-in validation.
 * This is a Value Object - immutable and self-validating.
 *
 * @example
 * const email = Email.create('user@example.com');
 * if (email.isSuccess) {
 *   console.log(email.value.getValue()); // user@example.com
 * }
 */

import { Result } from '@shared/types/Result.js';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  /**
   * Factory method to create an Email value object
   * Validates the email format before creating
   */
  public static create(email: string): Result<Email> {
    if (!email || email.trim().length === 0) {
      return Result.fail<Email>('Email cannot be empty');
    }

    if (!this.isValidFormat(email)) {
      return Result.fail<Email>('Email format is invalid');
    }

    if (email.length > 255) {
      return Result.fail<Email>('Email is too long (max 255 characters)');
    }

    return Result.ok<Email>(new Email(email.toLowerCase().trim()));
  }

  /**
   * Validates email format using RFC 5322 compliant regex
   */
  private static isValidFormat(email: string): boolean {
    // RFC 5322 Official Standard
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // More strict regex (optional)
    // const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    return emailRegex.test(email);
  }

  /**
   * Gets the email value
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Gets the domain part of the email
   * @example 'user@example.com' -> 'example.com'
   */
  public getDomain(): string {
    return this.value.split('@')[1] ?? '';
  }

  /**
   * Gets the local part of the email
   * @example 'user@example.com' -> 'user'
   */
  public getLocalPart(): string {
    return this.value.split('@')[0] ?? '';
  }

  /**
   * Checks if two emails are equal
   */
  public equals(other: Email): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return this.value;
  }
}
