/**
 * Base Domain Event Interface
 *
 * All domain events must implement this interface.
 * Domain Events represent something important that happened in the domain.
 *
 * Characteristics:
 * - Immutable (events represent past facts)
 * - Named in past tense (UserCreated, SwitchTriggered)
 * - Include timestamp and event ID
 * - Carry all relevant data about what happened
 *
 * Use Cases:
 * - Trigger side effects (send emails, log events, update analytics)
 * - Decouple modules (notification module doesn't depend on switch module)
 * - Enable event sourcing and audit trails
 * - Support eventual consistency
 */

export interface DomainEvent {
  /**
   * Unique identifier for this event instance
   */
  eventId: string;

  /**
   * Type of event (e.g., 'UserCreated', 'SwitchTriggered')
   */
  eventType: string;

  /**
   * When the event occurred
   */
  occurredAt: Date;

  /**
   * Aggregate ID (the entity that triggered this event)
   */
  aggregateId: string;

  /**
   * Version of the aggregate when event occurred
   * Useful for event ordering and consistency
   */
  aggregateVersion: number;
}

/**
 * Base class for creating domain events
 */
export abstract class BaseDomainEvent implements DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly aggregateVersion: number
  ) {
    this.eventId = this.generateEventId();
    this.occurredAt = new Date();
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
