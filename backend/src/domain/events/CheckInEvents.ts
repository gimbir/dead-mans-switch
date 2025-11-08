/**
 * CheckIn Domain Events
 *
 * Events related to CheckIn entity lifecycle.
 */

import { BaseDomainEvent } from './DomainEvent.js';

/**
 * Triggered when a user performs a check-in
 * Use cases: Reset switch timer, send confirmation, log activity, update analytics
 */
export class CheckInPerformedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly userId: string,
    public readonly timestamp: Date,
    public readonly nextCheckInDue: Date,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null
  ) {
    super('CheckInPerformed', aggregateId, aggregateVersion);
  }
}

/**
 * Triggered when suspicious check-in pattern is detected
 * Use cases: Send security alert, log security event, require additional verification
 */
export class SuspiciousCheckInDetectedEvent extends BaseDomainEvent {
  constructor(
    aggregateId: string,
    aggregateVersion: number,
    public readonly switchId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly ipAddress: string | null
  ) {
    super('SuspiciousCheckInDetected', aggregateId, aggregateVersion);
  }
}
