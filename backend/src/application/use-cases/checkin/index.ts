/**
 * Check-In Use Cases Index
 *
 * Central export point for all check-in related use cases.
 *
 * Available Use Cases:
 * - PerformCheckInUseCase: Perform a check-in on a switch
 * - GetCheckInHistoryUseCase: Get paginated check-in history for a switch
 */

export * from './PerformCheckIn.usecase.js';
export * from './GetCheckInHistory.usecase.js';
