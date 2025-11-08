/**
 * Switch Repository Interface
 *
 * Defines the contract for Switch data access operations.
 * This is the core repository of the application.
 *
 * Business Query Methods:
 * - Find switches that need monitoring (active, past due, etc.)
 * - Find switches by status
 * - Find switches approaching due date
 */

import { Switch, SwitchStatus } from '@domain/entities/Switch.entity.js';
import { Result } from '@shared/types/Result.js';

export interface ISwitchRepository {
  /**
   * Finds a switch by its unique ID
   * @param id Switch ID
   * @returns Switch if found, null otherwise
   */
  findById(id: string): Promise<Result<Switch | null>>;

  /**
   * Finds all switches belonging to a user
   * Excludes deleted switches by default
   * @param userId User ID
   * @param includeDeleted Whether to include soft-deleted switches
   * @returns Array of switches
   */
  findByUserId(userId: string, includeDeleted?: boolean): Promise<Result<Switch[]>>;

  /**
   * Finds switches by status
   * @param status Switch status
   * @param limit Number of switches to return
   * @param offset Number of switches to skip
   * @returns Array of switches
   */
  findByStatus(status: SwitchStatus, limit: number, offset: number): Promise<Result<Switch[]>>;

  /**
   * Finds all active switches that are past their due date (grace period expired)
   * These are switches that should be triggered
   * @returns Array of switches ready to trigger
   */
  findSwitchesReadyToTrigger(): Promise<Result<Switch[]>>;

  /**
   * Finds active switches approaching their due date (within warning period)
   * Useful for sending reminder notifications
   * @param hoursBeforeDue Number of hours before due date to check
   * @returns Array of switches approaching due date
   */
  findSwitchesApproachingDue(hoursBeforeDue: number): Promise<Result<Switch[]>>;

  /**
   * Finds all active switches for monitoring
   * Used by background jobs to check switch status
   * @returns Array of active switches
   */
  findActiveSwitches(): Promise<Result<Switch[]>>;

  /**
   * Checks if a user has reached their switch limit
   * @param userId User ID
   * @param maxSwitches Maximum number of switches allowed
   * @returns True if user has reached limit
   */
  hasReachedLimit(userId: string, maxSwitches: number): Promise<boolean>;

  /**
   * Saves a new switch to the database
   * @param switchEntity Switch entity to save
   * @returns Saved switch
   */
  save(switchEntity: Switch): Promise<Result<Switch>>;

  /**
   * Updates an existing switch in the database
   * Uses optimistic locking via version field
   * @param switchEntity Switch entity to update
   * @returns Updated switch
   */
  update(switchEntity: Switch): Promise<Result<Switch>>;

  /**
   * Deletes a switch (soft delete - sets deletedAt)
   * @param id Switch ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<Result<boolean>>;

  /**
   * Permanently removes a switch from the database (hard delete)
   * @param id Switch ID
   * @returns True if deleted, false if not found
   */
  permanentlyDelete(id: string): Promise<Result<boolean>>;

  /**
   * Counts switches by status for a user
   * @param userId User ID
   * @param status Switch status (optional - counts all if not provided)
   * @returns Count of switches
   */
  countByUserIdAndStatus(userId: string, status?: SwitchStatus): Promise<Result<number>>;

  /**
   * Finds switches with pagination
   * @param userId User ID (optional - finds all if not provided)
   * @param limit Number of switches to return
   * @param offset Number of switches to skip
   * @param includeDeleted Whether to include soft-deleted switches
   * @returns Array of switches
   */
  findAll(
    userId: string | undefined,
    limit: number,
    offset: number,
    includeDeleted?: boolean
  ): Promise<Result<Switch[]>>;
}
