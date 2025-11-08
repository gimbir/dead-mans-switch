/**
 * Switch Monitoring Domain Service
 *
 * Coordinates the business logic for monitoring switches and triggering them.
 * This is a Domain Service because:
 * - It orchestrates multiple entities (Switch, Message, CheckIn)
 * - It doesn't naturally belong to a single entity
 * - It contains complex business rules
 *
 * Responsibilities:
 * - Check if switches should be triggered
 * - Calculate warning periods
 * - Determine switch health status
 */

import { Switch } from '@domain/entities/Switch.entity.js';
import { Result } from '@shared/types/Result.js';

export interface SwitchHealthStatus {
  isHealthy: boolean;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'TRIGGERED';
  hoursUntilDue: number | null;
  message: string;
}

export class SwitchMonitoringService {
  /**
   * Checks if a switch should be triggered
   * @param switchEntity Switch to check
   * @returns True if switch should be triggered
   */
  public shouldTrigger(switchEntity: Switch): boolean {
    return switchEntity.shouldTrigger();
  }

  /**
   * Checks if a switch is in warning period (approaching due date)
   * @param switchEntity Switch to check
   * @param warningHours Number of hours before due date to warn
   * @returns True if in warning period
   */
  public isInWarningPeriod(switchEntity: Switch, warningHours: number = 24): boolean {
    if (!switchEntity.isActive || switchEntity.status !== 'ACTIVE') {
      return false;
    }

    const timeUntilDue = switchEntity.getTimeUntilDue();
    if (timeUntilDue === null) {
      return false;
    }

    const warningThreshold = warningHours * 60 * 60 * 1000; // Convert to milliseconds
    return timeUntilDue > 0 && timeUntilDue <= warningThreshold;
  }

  /**
   * Gets the health status of a switch
   * @param switchEntity Switch to check
   * @param warningHours Number of hours before due date to show warning
   * @returns Health status information
   */
  public getHealthStatus(switchEntity: Switch, warningHours: number = 24): SwitchHealthStatus {
    // If switch is triggered
    if (switchEntity.status === 'TRIGGERED') {
      return {
        isHealthy: false,
        status: 'TRIGGERED',
        hoursUntilDue: null,
        message: 'Switch has been triggered',
      };
    }

    // If switch is not active
    if (!switchEntity.isActive || switchEntity.status === 'PAUSED') {
      return {
        isHealthy: true,
        status: 'OK',
        hoursUntilDue: null,
        message: 'Switch is paused',
      };
    }

    const timeUntilDue = switchEntity.getTimeUntilDue();
    if (timeUntilDue === null) {
      return {
        isHealthy: false,
        status: 'CRITICAL',
        hoursUntilDue: null,
        message: 'No check-in due date set',
      };
    }

    const hoursUntilDue = timeUntilDue / (60 * 60 * 1000);

    // If grace period expired
    if (switchEntity.isGracePeriodExpired()) {
      return {
        isHealthy: false,
        status: 'CRITICAL',
        hoursUntilDue,
        message: 'Grace period expired - switch should be triggered',
      };
    }

    // If past due but within grace period
    if (switchEntity.isPastDue()) {
      return {
        isHealthy: false,
        status: 'CRITICAL',
        hoursUntilDue,
        message: `Past due - ${this.formatHours(Math.abs(hoursUntilDue))} over due (grace period active)`,
      };
    }

    // If in warning period
    if (this.isInWarningPeriod(switchEntity, warningHours)) {
      return {
        isHealthy: true,
        status: 'WARNING',
        hoursUntilDue,
        message: `Check-in due in ${this.formatHours(hoursUntilDue)}`,
      };
    }

    // All good
    return {
      isHealthy: true,
      status: 'OK',
      hoursUntilDue,
      message: `Next check-in due in ${this.formatHours(hoursUntilDue)}`,
    };
  }

  /**
   * Calculates the urgency level of a switch (0-100)
   * Higher number means more urgent
   * @param switchEntity Switch to check
   * @returns Urgency level (0-100)
   */
  public calculateUrgency(switchEntity: Switch): number {
    if (switchEntity.status === 'TRIGGERED') {
      return 100;
    }

    if (!switchEntity.isActive || switchEntity.status === 'PAUSED') {
      return 0;
    }

    const timeUntilDue = switchEntity.getTimeUntilDue();
    if (timeUntilDue === null) {
      return 100;
    }

    // If grace period expired
    if (switchEntity.isGracePeriodExpired()) {
      return 100;
    }

    // If past due
    if (switchEntity.isPastDue()) {
      return 90;
    }

    // Calculate based on time remaining
    const totalInterval = switchEntity.checkInInterval.toMilliseconds();
    const timeRemaining = timeUntilDue;

    if (timeRemaining <= 0) {
      return 85;
    }

    // Calculate percentage remaining (inverted for urgency)
    const percentRemaining = (timeRemaining / totalInterval) * 100;
    const urgency = 100 - percentRemaining;

    return Math.max(0, Math.min(100, Math.round(urgency)));
  }

  /**
   * Validates if a check-in can be performed
   * @param switchEntity Switch to check
   * @returns Result with error message if check-in not allowed
   */
  public validateCheckIn(switchEntity: Switch): Result<void> {
    if (switchEntity.isDeleted()) {
      return Result.fail('Cannot check in to a deleted switch');
    }

    if (!switchEntity.canCheckIn()) {
      return Result.fail('Switch cannot accept check-ins in its current state');
    }

    return Result.ok();
  }

  /**
   * Formats hours into a human-readable string
   * @param hours Number of hours
   * @returns Formatted string (e.g., "2 days", "5 hours", "30 minutes")
   */
  private formatHours(hours: number): string {
    if (hours < 0) {
      return this.formatHours(Math.abs(hours));
    }

    if (hours >= 48) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }

    if (hours >= 2) {
      return `${Math.floor(hours)} hour${Math.floor(hours) > 1 ? 's' : ''}`;
    }

    const minutes = Math.floor(hours * 60);
    if (minutes <= 1) {
      return 'less than a minute';
    }

    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}
