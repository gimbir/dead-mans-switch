/**
 * Check-In Missed Event Handler
 *
 * Handles scenarios where a user misses a check-in deadline.
 * This can be used for:
 * - Sending warning notifications
 * - Logging missed check-ins for analytics
 * - Triggering escalation workflows
 *
 * Note: This is a placeholder for future functionality.
 * Currently, the CheckSwitchesProcessor handles the actual triggering.
 *
 * Future enhancements:
 * - Send warning email before trigger
 * - SMS notifications
 * - Webhook callbacks
 * - Escalation to secondary contacts
 */

import { logger } from '@config/logger.config.js';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { INotificationService } from '@domain/services/INotificationService.js';

export interface CheckInMissedEventData {
  switchId: string;
  userId: string;
  switchName: string;
  nextCheckInDue: Date;
  gracePeriodRemaining: number; // in days
}

export class CheckInMissedHandler {
  constructor(
    private userRepository: IUserRepository,
    private switchRepository: ISwitchRepository,
    private notificationService: INotificationService
  ) {}

  /**
   * Handle a missed check-in event
   */
  public async handle(eventData: CheckInMissedEventData): Promise<void> {
    logger.info('Handling CheckInMissedEvent', {
      switchId: eventData.switchId,
      userId: eventData.userId,
      gracePeriodRemaining: eventData.gracePeriodRemaining,
    });

    try {
      // Fetch switch details to verify it's still active
      const switchResult = await this.switchRepository.findById(eventData.switchId);

      if (!switchResult.isSuccess || !switchResult.value) {
        logger.warn('Switch not found or deleted for missed check-in', {
          switchId: eventData.switchId,
        });
        return;
      }

      const switchEntity = switchResult.value;

      // Don't send notification if switch is not active
      if (!switchEntity.isActive || switchEntity.status !== 'ACTIVE') {
        logger.info('Skipping notification for inactive switch', {
          switchId: eventData.switchId,
          status: switchEntity.status,
        });
        return;
      }

      // Fetch user details
      const userResult = await this.userRepository.findById(eventData.userId);

      if (!userResult.isSuccess || !userResult.value) {
        logger.error('User not found for missed check-in', {
          userId: eventData.userId,
          switchId: eventData.switchId,
        });
        return;
      }

      const user = userResult.value;

      // Send warning notification
      const message = this.buildWarningMessage(
        eventData.switchName,
        eventData.nextCheckInDue,
        eventData.gracePeriodRemaining
      );

      const sendResult = await this.notificationService.sendEmail({
        to: user.email,
        recipientName: user.name,
        subject: '⚠️ Check-In Missed - Action Required',
        content: message,
        isHtml: true
      });

      if (!sendResult.isSuccess) {
        logger.error('Failed to send check-in missed notification', {
          userId: eventData.userId,
          switchId: eventData.switchId,
          error: sendResult.error,
        });
        return;
      }

      logger.info('Check-in missed notification sent successfully', {
        userId: eventData.userId,
        switchId: eventData.switchId,
        userEmail: user.email,
      });
    } catch (error) {
      logger.error('Failed to handle CheckInMissedEvent', {
        switchId: eventData.switchId,
        error,
      });
      // Don't throw - we don't want to crash the application
    }
  }

  /**
   * Build a warning message for missed check-in
   */
  private buildWarningMessage(
    switchName: string,
    dueDate: Date,
    gracePeriodDays: number
  ): string {
    const now = new Date();
    const hoursLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60));

    return `
      <h2>⚠️ Check-In Missed</h2>

      <p>You missed the check-in deadline for your Dead Man's Switch: <strong>${switchName}</strong></p>

      <p><strong>Details:</strong></p>
      <ul>
        <li>Due date: ${dueDate.toLocaleString()}</li>
        <li>Hours late: ${hoursLate} hours</li>
        <li>Grace period remaining: ${gracePeriodDays} days</li>
      </ul>

      ${
        gracePeriodDays > 0
          ? `
        <p style="color: orange;">
          <strong>⏰ You still have ${gracePeriodDays} days to check in before your switch is triggered!</strong>
        </p>

        <p>
          <a href="${process.env['APP_URL'] || 'http://localhost:3000'}/switches/${switchName}"
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Check In Now
          </a>
        </p>
      `
          : `
        <p style="color: red;">
          <strong>🚨 Your grace period has expired. Your switch will be triggered shortly.</strong>
        </p>
      `
      }

      <hr>
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from Dead Man's Switch.
        If you believe this is an error, please log in to your account and check your switch settings.
      </p>
    `;
  }
}
