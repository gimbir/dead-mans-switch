/**
 * CheckIn Repository Interface
 *
 * Defines the contract for CheckIn data access operations.
 *
 * Business Query Methods:
 * - Find check-in history for a switch
 * - Find recent check-ins
 * - Aggregate check-in statistics
 */

import { CheckIn } from '@domain/entities/CheckIn.entity.js';
import { Result } from '@shared/types/Result.js';

export interface ICheckInRepository {
  /**
   * Finds a check-in by its unique ID
   * @param id CheckIn ID
   * @returns CheckIn if found, null otherwise
   */
  findById(id: string): Promise<Result<CheckIn | null>>;

  /**
   * Finds all check-ins for a specific switch
   * Ordered by timestamp descending (most recent first)
   * @param switchId Switch ID
   * @param limit Number of check-ins to return
   * @param offset Number of check-ins to skip
   * @returns Array of check-ins
   */
  findBySwitchId(switchId: string, limit: number, offset: number): Promise<Result<CheckIn[]>>;

  /**
   * Finds the most recent check-in for a switch
   * @param switchId Switch ID
   * @returns Most recent check-in if found, null otherwise
   */
  findLatestBySwitchId(switchId: string): Promise<Result<CheckIn | null>>;

  /**
   * Finds check-ins for a switch within a date range
   * @param switchId Switch ID
   * @param startDate Start date (inclusive)
   * @param endDate End date (inclusive)
   * @returns Array of check-ins
   */
  findBySwitchIdAndDateRange(
    switchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<CheckIn[]>>;

  /**
   * Finds recent check-ins across all switches for a user
   * Used for activity dashboard
   * @param userId User ID
   * @param limit Number of check-ins to return
   * @returns Array of recent check-ins
   */
  findRecentByUserId(userId: string, limit: number): Promise<Result<CheckIn[]>>;

  /**
   * Counts total check-ins for a switch
   * @param switchId Switch ID
   * @returns Total count of check-ins
   */
  countBySwitchId(switchId: string): Promise<Result<number>>;

  /**
   * Counts check-ins for a switch within a date range
   * @param switchId Switch ID
   * @param startDate Start date (inclusive)
   * @param endDate End date (inclusive)
   * @returns Count of check-ins
   */
  countBySwitchIdAndDateRange(
    switchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number>>;

  /**
   * Finds check-ins with suspicious patterns
   * Used for security monitoring (multiple IPs, unusual times, etc.)
   * @param switchId Switch ID
   * @param daysBack Number of days to look back
   * @returns Array of potentially suspicious check-ins
   */
  findSuspiciousCheckIns(switchId: string, daysBack: number): Promise<Result<CheckIn[]>>;

  /**
   * Saves a new check-in to the database
   * @param checkIn CheckIn entity to save
   * @returns Saved check-in
   */
  save(checkIn: CheckIn): Promise<Result<CheckIn>>;

  /**
   * Updates an existing check-in in the database
   * Only notes field can be updated (historical records are immutable)
   * Uses optimistic locking via version field
   * @param checkIn CheckIn entity to update
   * @returns Updated check-in
   */
  update(checkIn: CheckIn): Promise<Result<CheckIn>>;

  /**
   * Deletes old check-ins for data retention compliance
   * Permanently removes check-ins older than specified days
   * @param olderThanDays Number of days
   * @returns Number of check-ins deleted
   */
  deleteOlderThan(olderThanDays: number): Promise<Result<number>>;

  /**
   * Finds all check-ins with pagination
   * @param switchId Switch ID (optional - finds all if not provided)
   * @param limit Number of check-ins to return
   * @param offset Number of check-ins to skip
   * @returns Array of check-ins
   */
  findAll(
    switchId: string | undefined,
    limit: number,
    offset: number
  ): Promise<Result<CheckIn[]>>;
}
