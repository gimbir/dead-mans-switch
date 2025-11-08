/**
 * User Domain Events
 *
 * Events related to User entity lifecycle and state changes.
 */

import { BaseDomainEvent } from './DomainEvent.js';

/**
 * Triggered when a new user is created
 * Use cases: Send welcome email, create analytics profile, log audit trail
 */
export class UserCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly email: string,
    public readonly name: string
  ) {
    super('UserCreated', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a user verifies their email
 * Use cases: Send confirmation email, enable full access, track conversion
 */
export class UserVerifiedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly email: string
  ) {
    super('UserVerified', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a user updates their password
 * Use cases: Send security alert email, invalidate sessions, log security event
 */
export class UserPasswordChangedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number
  ) {
    super('UserPasswordChanged', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a user is deleted
 * Use cases: Clean up related data, send goodbye email, log for compliance
 */
export class UserDeletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly email: string
  ) {
    super('UserDeleted', aggregateId, aggregateVersion);
  }
}
