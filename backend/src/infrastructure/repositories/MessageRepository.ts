/**
 * Message Repository Implementation
 *
 * Implements IMessageRepository using Prisma ORM.
 * Handles all Message entity persistence operations.
 *
 * Features:
 * - Prisma type-safe queries
 * - Entity mapping (Prisma ↔ Domain)
 * - Idempotency key support
 * - Delivery tracking with failure reason
 * - Soft delete support
 * - Optimistic locking with version field
 * - Error handling with Result pattern
 */

import { PrismaClient } from '@generated/prisma/index.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { Message, MessagePersistenceData } from '@domain/entities/Message.entity.js';
import { Result } from '@shared/types/Result.js';

export class MessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds a message by its unique ID
   */
  async findById(id: string): Promise<Result<Message | null>> {
    try {
      const messageData = await this.prisma.message.findUnique({
        where: { id },
      });

      if (!messageData) {
        return Result.ok(null);
      }

      return Message.fromPersistence(messageData);
    } catch (error) {
      return Result.fail<Message | null>(
        `Failed to find message by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds a message by its idempotency key
   */
  async findByIdempotencyKey(idempotencyKey: string): Promise<Result<Message | null>> {
    try {
      const messageData = await this.prisma.message.findUnique({
        where: { idempotencyKey },
      });

      if (!messageData) {
        return Result.ok(null);
      }

      return Message.fromPersistence(messageData);
    } catch (error) {
      return Result.fail<Message | null>(
        `Failed to find message by idempotency key: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds all messages for a specific switch
   */
  async findBySwitchId(
    switchId: string,
    includeDeleted: boolean = false
  ): Promise<Result<Message[]>> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          switchId,
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        orderBy: { createdAt: 'desc' },
      });

      const messageResults = messages.map((data: Record<string, unknown>) =>
        Message.fromPersistence(data)
      );

      const failedResult = messageResults.find((r: Result<Message>) => r.isFailure);
      if (failedResult) {
        return Result.fail<Message[]>(failedResult.error as string);
      }

      return Result.ok(messageResults.map((r: Result<Message>) => r.value));
    } catch (error) {
      return Result.fail<Message[]>(
        `Failed to find messages by switch ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds all unsent messages for a switch
   */
  async findUnsentBySwitchId(switchId: string): Promise<Result<Message[]>> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          switchId,
          isSent: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      const messageResults = messages.map((data: Record<string, unknown>) =>
        Message.fromPersistence(data)
      );

      const failedResult = messageResults.find((r: Result<Message>) => r.isFailure);
      if (failedResult) {
        return Result.fail<Message[]>(failedResult.error as string);
      }

      return Result.ok(messageResults.map((r: Result<Message>) => r.value));
    } catch (error) {
      return Result.fail<Message[]>(
        `Failed to find unsent messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds messages that failed delivery and are ready for retry
   */
  async findFailedMessagesForRetry(maxAttempts: number): Promise<Result<Message[]>> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          isSent: false,
          deliveryAttempts: {
            gte: 1,
            lt: maxAttempts,
          },
        },
        orderBy: { lastAttemptAt: 'asc' },
      });

      const messageResults = messages.map((data: Record<string, unknown>) =>
        Message.fromPersistence(data)
      );

      const failedResult = messageResults.find((r: Result<Message>) => r.isFailure);
      if (failedResult) {
        return Result.fail<Message[]>(failedResult.error as string);
      }

      return Result.ok(messageResults.map((r: Result<Message>) => r.value));
    } catch (error) {
      return Result.fail<Message[]>(
        `Failed to find failed messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds all messages with a specific sent status
   */
  async findBySentStatus(
    isSent: boolean,
    limit: number,
    offset: number
  ): Promise<Result<Message[]>> {
    try {
      const messages = await this.prisma.message.findMany({
        where: { isSent },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const messageResults = messages.map((data: Record<string, unknown>) =>
        Message.fromPersistence(data)
      );

      const failedResult = messageResults.find((r: Result<Message>) => r.isFailure);
      if (failedResult) {
        return Result.fail<Message[]>(failedResult.error as string);
      }

      return Result.ok(messageResults.map((r: Result<Message>) => r.value));
    } catch (error) {
      return Result.fail<Message[]>(
        `Failed to find messages by sent status: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Counts messages for a switch
   */
  async countBySwitchId(switchId: string, isSent?: boolean): Promise<Result<number>> {
    try {
      const count = await this.prisma.message.count({
        where: {
          switchId,
          ...(isSent !== undefined ? { isSent } : {}),
        },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail<number>(
        `Failed to count messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Saves a new message to the database
   */
  async save(message: Message): Promise<Result<Message>> {
    try {
      const persistenceData: MessagePersistenceData = message.toPersistence();

      const createdMessage = await this.prisma.message.create({
        data: {
          id: persistenceData.id,
          switchId: persistenceData.switchId,
          recipientEmail: persistenceData.recipientEmail,
          recipientName: persistenceData.recipientName,
          subject: persistenceData.subject,
          encryptedContent: persistenceData.encryptedContent,
          isSent: persistenceData.isSent,
          sentAt: persistenceData.sentAt,
          deliveryAttempts: persistenceData.deliveryAttempts,
          lastAttemptAt: persistenceData.lastAttemptAt,
          failureReason: persistenceData.failureReason,
          idempotencyKey: persistenceData.idempotencyKey,
          deletedAt: persistenceData.deletedAt,
          version: persistenceData.version,
          createdAt: persistenceData.createdAt,
          updatedAt: persistenceData.updatedAt,
        },
      });

      return Message.fromPersistence(createdMessage);
    } catch (error) {
      return Result.fail<Message>(
        `Failed to save message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates an existing message in the database
   * Uses optimistic locking via version field
   */
  async update(message: Message): Promise<Result<Message>> {
    try {
      const persistenceData: MessagePersistenceData = message.toPersistence();
      const currentVersion = persistenceData.version;

      // Optimistic locking: check version before update
      const updatedMessage = await this.prisma.message.updateMany({
        where: {
          id: persistenceData.id,
          version: currentVersion - 1, // Previous version
        },
        data: {
          recipientEmail: persistenceData.recipientEmail,
          recipientName: persistenceData.recipientName,
          subject: persistenceData.subject,
          encryptedContent: persistenceData.encryptedContent,
          isSent: persistenceData.isSent,
          sentAt: persistenceData.sentAt,
          deliveryAttempts: persistenceData.deliveryAttempts,
          lastAttemptAt: persistenceData.lastAttemptAt,
          failureReason: persistenceData.failureReason,
          deletedAt: persistenceData.deletedAt,
          version: currentVersion,
          updatedAt: new Date(),
        },
      });

      // If no rows updated, version conflict occurred
      if (updatedMessage.count === 0) {
        return Result.fail<Message>(
          'Optimistic locking failure: Message was modified by another process'
        );
      }

      // Fetch and return updated message
      const fetchedMessage = await this.prisma.message.findUnique({
        where: { id: persistenceData.id },
      });

      if (!fetchedMessage) {
        return Result.fail<Message>('Message not found after update');
      }

      return Message.fromPersistence(fetchedMessage);
    } catch (error) {
      return Result.fail<Message>(
        `Failed to update message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Deletes a message (soft delete)
   */
  async delete(id: string): Promise<Result<boolean>> {
    try {
      const result = await this.prisma.message.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return Result.ok(result.count > 0);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Permanently removes a message from the database
   */
  async permanentlyDelete(id: string): Promise<Result<boolean>> {
    try {
      await this.prisma.message.delete({
        where: { id },
      });

      return Result.ok(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return Result.ok(false);
      }

      return Result.fail<boolean>(
        `Failed to permanently delete message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds messages with pagination
   */
  async findAll(
    switchId: string | undefined,
    limit: number,
    offset: number,
    includeDeleted: boolean = false
  ): Promise<Result<Message[]>> {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          ...(switchId ? { switchId } : {}),
          ...(includeDeleted ? {} : { deletedAt: null }),
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const messageResults = messages.map((data: Record<string, unknown>) =>
        Message.fromPersistence(data)
      );

      const failedResult = messageResults.find((r: Result<Message>) => r.isFailure);
      if (failedResult) {
        return Result.fail<Message[]>(failedResult.error as string);
      }

      return Result.ok(messageResults.map((r: Result<Message>) => r.value));
    } catch (error) {
      return Result.fail<Message[]>(
        `Failed to find messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
