/**
 * TimeInterval Value Object
 *
 * Represents a time interval in days.
 * Used for check-in intervals and grace periods in the Switch entity.
 *
 * Business Rules:
 * - Minimum interval: 1 day
 * - Maximum interval: 365 days (1 year)
 * - Grace period cannot exceed the check-in interval
 *
 * @example
 * const interval = TimeInterval.create(7); // 7 days
 * if (interval.isSuccess) {
 *   console.log(interval.value.toDays()); // 7
 *   console.log(interval.value.toHours()); // 168
 * }
 */

import { Result } from '@shared/types/Result.js';

export class TimeInterval {
  private readonly days: number;

  private constructor(days: number) {
    this.days = days;
  }

  /**
   * Factory method to create a TimeInterval value object
   * Validates the interval before creating
   */
  public static create(days: number): Result<TimeInterval> {
    if (!Number.isInteger(days)) {
      return Result.fail<TimeInterval>('Time interval must be a whole number of days');
    }

    if (days < 1) {
      return Result.fail<TimeInterval>('Time interval must be at least 1 day');
    }

    if (days > 365) {
      return Result.fail<TimeInterval>('Time interval cannot exceed 365 days (1 year)');
    }

    return Result.ok<TimeInterval>(new TimeInterval(days));
  }

  /**
   * Creates a TimeInterval from hours
   */
  public static fromHours(hours: number): Result<TimeInterval> {
    const days = Math.floor(hours / 24);
    return this.create(days);
  }

  /**
   * Creates a TimeInterval from minutes
   */
  public static fromMinutes(minutes: number): Result<TimeInterval> {
    const days = Math.floor(minutes / (24 * 60));
    return this.create(days);
  }

  /**
   * Gets the interval in days
   */
  public toDays(): number {
    return this.days;
  }

  /**
   * Gets the interval in hours
   */
  public toHours(): number {
    return this.days * 24;
  }

  /**
   * Gets the interval in minutes
   */
  public toMinutes(): number {
    return this.days * 24 * 60;
  }

  /**
   * Gets the interval in milliseconds
   */
  public toMilliseconds(): number {
    return this.days * 24 * 60 * 60 * 1000;
  }

  /**
   * Adds days to the current interval
   * Returns a new TimeInterval (immutable)
   */
  public add(days: number): Result<TimeInterval> {
    return TimeInterval.create(this.days + days);
  }

  /**
   * Subtracts days from the current interval
   * Returns a new TimeInterval (immutable)
   */
  public subtract(days: number): Result<TimeInterval> {
    return TimeInterval.create(this.days - days);
  }

  /**
   * Checks if this interval is longer than another
   */
  public isLongerThan(other: TimeInterval): boolean {
    return this.days > other.days;
  }

  /**
   * Checks if this interval is shorter than another
   */
  public isShorterThan(other: TimeInterval): boolean {
    return this.days < other.days;
  }

  /**
   * Checks if two intervals are equal
   */
  public equals(other: TimeInterval): boolean {
    if (!other) {
      return false;
    }
    return this.days === other.days;
  }

  /**
   * Calculates the next date based on a starting date
   * @param from Starting date
   * @returns Date after the interval
   */
  public addToDate(from: Date): Date {
    const result = new Date(from);
    result.setDate(result.getDate() + this.days);
    return result;
  }

  /**
   * Calculates how many days between two dates
   * @param from Start date
   * @param to End date
   * @returns TimeInterval result
   */
  public static daysBetween(from: Date, to: Date): Result<TimeInterval> {
    const diffMs = to.getTime() - from.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return TimeInterval.create(Math.abs(diffDays));
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    if (this.days === 1) {
      return '1 day';
    }
    if (this.days === 7) {
      return '1 week';
    }
    if (this.days === 30) {
      return '1 month';
    }
    if (this.days % 7 === 0) {
      return `${this.days / 7} weeks`;
    }
    return `${this.days} days`;
  }
}
