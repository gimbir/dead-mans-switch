/**
 * Message Repository Interface
 *
 * Defines the contract for Message data access operations.
 *
 * Business Query Methods:
 * - Find unsent messages
 * - Find messages by switch
 * - Find failed messages for retry
 */

import { Message } from '@domain/entities/Message.entity.js';
import { Result } from '@shared/types/Result.js';

export interface IMessageRepository {
  /**
   * Finds a message by its unique ID
   * @param id Message ID
   * @returns Message if found, null otherwise
   */
  findById(id: string): Promise<Result<Message | null>>;

  /**
   * Finds a message by its idempotency key
   * Used to prevent duplicate sends
   * @param idempotencyKey Idempotency key
   * @returns Message if found, null otherwise
   */
  findByIdempotencyKey(idempotencyKey: string): Promise<Result<Message | null>>;

  /**
   * Finds all messages for a specific switch
   * @param switchId Switch ID
   * @param includeDeleted Whether to include soft-deleted messages
   * @returns Array of messages
   */
  findBySwitchId(switchId: string, includeDeleted?: boolean): Promise<Result<Message[]>>;

  /**
   * Finds all unsent messages for a switch
   * Used when a switch triggers
   * @param switchId Switch ID
   * @returns Array of unsent messages
   */
  findUnsentBySwitchId(switchId: string): Promise<Result<Message[]>>;

  /**
   * Finds messages that failed delivery and are ready for retry
   * Excludes messages that exceeded max attempts
   * @param maxAttempts Maximum number of delivery attempts
   * @returns Array of messages ready for retry
   */
  findFailedMessagesForRetry(maxAttempts: number): Promise<Result<Message[]>>;

  /**
   * Finds all messages with a specific sent status
   * @param isSent Whether to find sent or unsent messages
   * @param limit Number of messages to return
   * @param offset Number of messages to skip
   * @returns Array of messages
   */
  findBySentStatus(isSent: boolean, limit: number, offset: number): Promise<Result<Message[]>>;

  /**
   * Counts messages for a switch
   * @param switchId Switch ID
   * @param isSent Filter by sent status (optional)
   * @returns Count of messages
   */
  countBySwitchId(switchId: string, isSent?: boolean): Promise<Result<number>>;

  /**
   * Saves a new message to the database
   * @param message Message entity to save
   * @returns Saved message
   */
  save(message: Message): Promise<Result<Message>>;

  /**
   * Updates an existing message in the database
   * Uses optimistic locking via version field
   * @param message Message entity to update
   * @returns Updated message
   */
  update(message: Message): Promise<Result<Message>>;

  /**
   * Deletes a message (soft delete - sets deletedAt)
   * @param id Message ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): Promise<Result<boolean>>;

  /**
   * Permanently removes a message from the database (hard delete)
   * @param id Message ID
   * @returns True if deleted, false if not found
   */
  permanentlyDelete(id: string): Promise<Result<boolean>>;

  /**
   * Finds messages with pagination
   * @param switchId Switch ID (optional - finds all if not provided)
   * @param limit Number of messages to return
   * @param offset Number of messages to skip
   * @param includeDeleted Whether to include soft-deleted messages
   * @returns Array of messages
   */
  findAll(
    switchId: string | undefined,
    limit: number,
    offset: number,
    includeDeleted?: boolean
  ): Promise<Result<Message[]>>;
}
