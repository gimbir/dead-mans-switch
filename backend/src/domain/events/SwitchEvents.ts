/**
 * Switch Domain Events
 *
 * Events related to Switch entity lifecycle and state changes.
 * These are the most critical events in the application.
 */

import { BaseDomainEvent } from './DomainEvent.js';
import { SwitchStatus } from '@domain/entities/Switch.entity.js';

/**
 * Triggered when a new switch is created
 * Use cases: Send confirmation email, log analytics, setup monitoring
 */
export class SwitchCreatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly name: string,
    public readonly checkInIntervalDays: number
  ) {
    super('SwitchCreated', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a switch is triggered (CRITICAL EVENT!)
 * Use cases: Send encrypted messages, notify owner, log security event, update analytics
 */
export class SwitchTriggeredEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly switchName: string,
    public readonly triggeredAt: Date,
    public readonly lastCheckIn: Date | null,
    public readonly reason?: string
  ) {
    super('SwitchTriggered', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a switch is paused
 * Use cases: Stop monitoring, send confirmation email, log state change
 */
export class SwitchPausedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly switchName: string
  ) {
    super('SwitchPaused', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a switch is activated/resumed
 * Use cases: Resume monitoring, send confirmation email, log state change
 */
export class SwitchActivatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly switchName: string,
    public readonly nextCheckInDue: Date | null
  ) {
    super('SwitchActivated', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when switch configuration is updated
 * Use cases: Recalculate monitoring schedule, send confirmation, log change
 */
export class SwitchConfigurationUpdatedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly switchName: string,
    public readonly changes: {
      name?: boolean;
      checkInInterval?: boolean;
      gracePeriod?: boolean;
    }
  ) {
    super('SwitchConfigurationUpdated', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a switch is deleted
 * Use cases: Clean up messages, stop monitoring, send confirmation, log audit
 */
export class SwitchDeletedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly switchName: string,
    public readonly status: SwitchStatus
  ) {
    super('SwitchDeleted', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when a switch is approaching its due date (warning)
 * Use cases: Send reminder email, show notification, log warning
 */
export class SwitchApproachingDueEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly userId: string,
    public readonly switchName: string,
    public readonly hoursUntilDue: number,
    public readonly nextCheckInDue: Date
  ) {
    super('SwitchApproachingDue', aggregateId, aggregateVersion);
  }
}
