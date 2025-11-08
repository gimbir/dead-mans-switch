/**
 * Message Domain Events
 *
 * Events related to Message entity lifecycle and delivery.
 */

import { BaseDomainEvent } from './DomainEvent.js';

/**
 * Triggered when a new message is created
 * Use cases: Log message creation, validate encryption, send confirmation
 */
export class MessageCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly recipientEmail: string,
    public readonly hasSubject: boolean
  ) {
    super('MessageCreated', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a message is successfully sent
 * Use cases: Mark as delivered, send confirmation to owner, log delivery, update analytics
 */
export class MessageSentEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly recipientEmail: string,
    public readonly sentAt: Date,
    public readonly deliveryAttempts: number
  ) {
    super('MessageSent', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when message delivery fails
 * Use cases: Schedule retry, send alert, log error, update analytics
 */
export class MessageDeliveryFailedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly recipientEmail: string,
    public readonly failureReason: string,
    public readonly deliveryAttempts: number,
    public readonly maxAttemptsReached: boolean
  ) {
    super('MessageDeliveryFailed', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when message content is updated
 * Use cases: Log change, send confirmation, validate encryption
 */
export class MessageUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly changes: {
      content?: boolean;
      subject?: boolean;
      recipient?: boolean;
    }
  ) {
    super('MessageUpdated', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a message is deleted
 * Use cases: Clean up encrypted content, log deletion, send confirmation
 */
export class MessageDeletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly wasSent: boolean
  ) {
    super('MessageDeleted', aggregateId, aggregateVersion);
  }
}
