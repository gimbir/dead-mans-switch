/**
 * Domain Events Export
 */

export type { DomainEvent } from './DomainEvent.js';
export { BaseDomainEvent } from './DomainEvent.js';

// User Events
export {
  UserCreatedEvent,
  UserVerifiedEvent,
  UserPasswordChangedEvent,
  UserDeletedEvent,
} from './UserEvents.js';

// Switch Events
export {
  SwitchCreatedEvent,
  SwitchTriggeredEvent,
  SwitchPausedEvent,
  SwitchActivatedEvent,
  SwitchConfigurationUpdatedEvent,
  SwitchDeletedEvent,
  SwitchApproachingDueEvent,
} from './SwitchEvents.js';

// CheckIn Events
export { CheckInPerformedEvent, SuspiciousCheckInDetectedEvent } from './CheckInEvents.js';

// Message Events
export {
  MessageCreatedEvent,
  MessageSentEvent,
  MessageDeliveryFailedEvent,
  MessageUpdatedEvent,
  MessageDeletedEvent,
} from './MessageEvents.js';
