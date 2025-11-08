/**
 * Message Domain Entity
 *
 * Represents an encrypted message to be delivered when a switch triggers.
 * Each message contains encrypted content and recipient information.
 *
 * Business Rules:
 * - Message content must be encrypted (stored as encrypted string)
 * - Must have at least one recipient
 * - Delivery attempts are tracked and limited (max 5 attempts)
 * - Idempotency key prevents duplicate sends
 * - Once sent successfully, message cannot be modified
 * - Subject line is optional but recommended
 * - Messages can be soft deleted
 *
 * @example
 * const messageOrError = Message.create({
 *   switchId: 'switch_123',
 *   recipientEmail: Email.create('recipient@example.com').value,
 *   recipientName: 'John Doe',
 *   encryptedContent: 'encrypted_base64_string',
 *   subject: 'Important Message'
 * });
 */

import { z } from 'zod';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';

/**
 * Zod schema for validating persistence data
 */
const MessagePersistenceSchema = z.object({
  id: z.string().min(1),
  switchId: z.string().min(1),
  recipientEmail: z.email(),
  recipientName: z.string().min(1),
  subject: z.string().nullable(),
  encryptedContent: z.string().min(10),
  isSent: z.boolean(),
  sentAt: z.date().nullable(),
  deliveryAttempts: z.number().int().nonnegative().max(10),
  lastAttemptAt: z.date().nullable(),
  failureReason: z.string().nullable(),
  idempotencyKey: z.string().min(1),
  deletedAt: z.date().nullable(),
  version: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface MessageProps {
  switchId: string;
  recipientEmail: Email;
  recipientName: string;
  subject: string | null;
  encryptedContent: string;
  isSent?: boolean;
  sentAt?: Date | null;
  deliveryAttempts?: number;
  lastAttemptAt?: Date | null;
  failureReason?: string | null;
  idempotencyKey?: string;
  deletedAt?: Date | null;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateMessageProps {
  id?: string;
  switchId: string;
  recipientEmail: Email;
  recipientName: string;
  subject?: string | undefined;
  encryptedContent: string;
}

export class Message {
  private readonly _id: string;
  private _props: MessageProps;

  private constructor(id: string, props: MessageProps) {
    this._id = id;
    this._props = {
      ...props,
      isSent: props.isSent ?? false,
      sentAt: props.sentAt ?? null,
      deliveryAttempts: props.deliveryAttempts ?? 0,
      lastAttemptAt: props.lastAttemptAt ?? null,
      failureReason: props.failureReason ?? null,
      idempotencyKey: props.idempotencyKey ?? Message.generateIdempotencyKey(id),
      deletedAt: props.deletedAt ?? null,
      version: props.version ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  /**
   * Factory method to create a new Message
   */
  public static create(props: CreateMessageProps, id?: string): Result<Message> {
    // Validate switch ID
    if (!props.switchId || props.switchId.trim().length === 0) {
      return Result.fail<Message>('Switch ID is required');
    }

    // Validate recipient name
    if (!props.recipientName || props.recipientName.trim().length === 0) {
      return Result.fail<Message>('Recipient name cannot be empty');
    }

    if (props.recipientName.trim().length < 2) {
      return Result.fail<Message>('Recipient name must be at least 2 characters');
    }

    if (props.recipientName.trim().length > 100) {
      return Result.fail<Message>('Recipient name cannot exceed 100 characters');
    }

    // Validate subject if provided
    if (props.subject && props.subject.length > 200) {
      return Result.fail<Message>('Subject cannot exceed 200 characters');
    }

    // Validate encrypted content
    if (!props.encryptedContent || props.encryptedContent.trim().length === 0) {
      return Result.fail<Message>('Encrypted content cannot be empty');
    }

    // Basic validation that content appears to be encrypted/encoded
    if (props.encryptedContent.length < 10) {
      return Result.fail<Message>('Encrypted content appears to be too short');
    }

    const messageId = id ?? this.generateId();

    return Result.ok<Message>(
      new Message(messageId, {
        switchId: props.switchId,
        recipientEmail: props.recipientEmail,
        recipientName: props.recipientName.trim(),
        subject: props.subject?.trim() ?? null,
        encryptedContent: props.encryptedContent,
        isSent: false,
        deliveryAttempts: 0,
      })
    );
  }

  private static generateId(): string {
    return `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateIdempotencyKey(messageId: string): string {
    return `idempotency_${messageId}_${Date.now()}`;
  }

  // ==================== Getters ====================

  public get id(): string {
    return this._id;
  }

  public get switchId(): string {
    return this._props.switchId;
  }

  public get recipientEmail(): Email {
    return this._props.recipientEmail;
  }

  public get recipientName(): string {
    return this._props.recipientName;
  }

  public get subject(): string | null {
    return this._props.subject ?? null;
  }

  public get encryptedContent(): string {
    return this._props.encryptedContent;
  }

  public get isSent(): boolean {
    return this._props.isSent ?? false;
  }

  public get sentAt(): Date | null {
    return this._props.sentAt ?? null;
  }

  public get deliveryAttempts(): number {
    return this._props.deliveryAttempts ?? 0;
  }

  public get lastAttemptAt(): Date | null {
    return this._props.lastAttemptAt ?? null;
  }

  public get failureReason(): string | null {
    return this._props.failureReason ?? null;
  }

  public get idempotencyKey(): string {
    return this._props.idempotencyKey ?? '';
  }

  public get deletedAt(): Date | null {
    return this._props.deletedAt ?? null;
  }

  public get version(): number {
    return this._props.version ?? 0;
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  // ==================== Business Logic Methods ====================

  /**
   * Checks if the message is deleted
   */
  public isDeleted(): boolean {
    return this._props.deletedAt !== null && this._props.deletedAt !== undefined;
  }

  /**
   * Checks if the message can be sent
   */
  public canBeSent(): boolean {
    const MAX_DELIVERY_ATTEMPTS = 5;
    return (
      !this._props.isSent &&
      !this.isDeleted() &&
      (this._props.deliveryAttempts ?? 0) < MAX_DELIVERY_ATTEMPTS
    );
  }

  /**
   * Checks if max delivery attempts reached
   */
  public hasExceededMaxAttempts(): boolean {
    const MAX_DELIVERY_ATTEMPTS = 5;
    return (this._props.deliveryAttempts ?? 0) >= MAX_DELIVERY_ATTEMPTS;
  }

  /**
   * Records a delivery attempt (for idempotent retry logic)
   */
  public recordDeliveryAttempt(failureReason?: string): Result<void> {
    if (this._props.isSent) {
      return Result.fail<void>('Message has already been sent successfully');
    }

    if (this.isDeleted()) {
      return Result.fail<void>('Cannot attempt delivery on deleted message');
    }

    const now = new Date();
    this._props.deliveryAttempts = (this._props.deliveryAttempts ?? 0) + 1;
    this._props.lastAttemptAt = now;
    this._props.failureReason = failureReason ?? null;
    this._props.updatedAt = now;
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Marks the message as successfully sent
   */
  public markAsSent(): Result<void> {
    if (this._props.isSent) {
      return Result.fail<void>('Message has already been marked as sent');
    }

    if (this.isDeleted()) {
      return Result.fail<void>('Cannot mark deleted message as sent');
    }

    const now = new Date();
    this._props.isSent = true;
    this._props.sentAt = now;
    this._props.failureReason = null; // Clear any previous failure reason
    this._props.updatedAt = now;
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Updates message recipient information
   * Can only update if message hasn't been sent yet
   */
  public updateRecipient(recipientEmail?: Email, recipientName?: string): Result<void> {
    if (this._props.isSent) {
      return Result.fail<void>('Cannot update recipient after message has been sent');
    }

    if (recipientName !== undefined) {
      if (!recipientName || recipientName.trim().length === 0) {
        return Result.fail<void>('Recipient name cannot be empty');
      }
      if (recipientName.trim().length < 2 || recipientName.trim().length > 100) {
        return Result.fail<void>('Recipient name must be between 2-100 characters');
      }
      this._props.recipientName = recipientName.trim();
    }

    if (recipientEmail !== undefined) {
      this._props.recipientEmail = recipientEmail;
    }

    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Updates message content and subject
   * Can only update if message hasn't been sent yet
   */
  public updateContent(encryptedContent?: string, subject?: string): Result<void> {
    if (this._props.isSent) {
      return Result.fail<void>('Cannot update content after message has been sent');
    }

    if (encryptedContent !== undefined) {
      if (!encryptedContent || encryptedContent.trim().length === 0) {
        return Result.fail<void>('Encrypted content cannot be empty');
      }
      if (encryptedContent.length < 10) {
        return Result.fail<void>('Encrypted content appears to be too short');
      }
      this._props.encryptedContent = encryptedContent;
    }

    if (subject !== undefined) {
      if (subject && subject.length > 200) {
        return Result.fail<void>('Subject cannot exceed 200 characters');
      }
      this._props.subject = subject?.trim() ?? null;
    }

    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Soft deletes the message
   */
  public delete(): void {
    this._props.deletedAt = new Date();
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Returns a plain object representation (for database persistence)
   */
  public toPersistence(): Record<string, unknown> {
    return {
      id: this._id,
      switchId: this._props.switchId,
      recipientEmail: this._props.recipientEmail.getValue(),
      recipientName: this._props.recipientName,
      subject: this._props.subject,
      encryptedContent: this._props.encryptedContent,
      isSent: this._props.isSent,
      sentAt: this._props.sentAt,
      deliveryAttempts: this._props.deliveryAttempts,
      lastAttemptAt: this._props.lastAttemptAt,
      failureReason: this._props.failureReason,
      idempotencyKey: this._props.idempotencyKey,
      deletedAt: this._props.deletedAt,
      version: this._props.version,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
    };
  }

  /**
   * Creates a Message entity from persistence data
   * Validates data with Zod before creating entity
   */
  public static fromPersistence(data: Record<string, unknown>): Result<Message> {
    // Validate persistence data with Zod
    const validationResult = MessagePersistenceSchema.safeParse(data);

    if (!validationResult.success) {
      return Result.fail<Message>(
        `Invalid message persistence data: ${validationResult.error.issues.map((e: z.core.$ZodIssue) => e.message).join(', ')}`
      );
    }

    const validData = validationResult.data;

    // Create Email value object
    const emailOrError = Email.create(validData.recipientEmail);
    if (emailOrError.isFailure) {
      return Result.fail<Message>(emailOrError.error as string);
    }

    return Result.ok(
      new Message(validData.id, {
        switchId: validData.switchId,
        recipientEmail: emailOrError.value,
        recipientName: validData.recipientName,
        subject: validData.subject,
        encryptedContent: validData.encryptedContent,
        isSent: validData.isSent,
        sentAt: validData.sentAt,
        deliveryAttempts: validData.deliveryAttempts,
        lastAttemptAt: validData.lastAttemptAt,
        failureReason: validData.failureReason,
        idempotencyKey: validData.idempotencyKey,
        deletedAt: validData.deletedAt,
        version: validData.version,
        createdAt: validData.createdAt,
        updatedAt: validData.updatedAt,
      })
    );
  }
}
