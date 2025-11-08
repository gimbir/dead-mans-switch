/**
 * Notification Service Interface
 *
 * Defines the contract for sending notifications (email, SMS, etc.).
 * The actual implementation will be in the infrastructure layer.
 *
 * Notification Types:
 * - Email delivery of encrypted messages
 * - Check-in reminders
 * - Warning notifications
 * - System alerts
 *
 * This is a Domain Service interface because:
 * - Notifications are core to the domain (messages must be delivered)
 * - The domain layer needs to enforce delivery rules
 * - Implementation details (SMTP, Twilio, etc.) are infrastructure concern
 */

import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';

export interface EmailNotification {
  to: Email;
  recipientName: string;
  subject: string;
  content: string;
  isHtml?: boolean;
}

export interface CheckInReminderNotification {
  to: Email;
  userName: string;
  switchName: string;
  hoursUntilDue: number;
  checkInUrl: string;
}

export interface SwitchTriggeredNotification {
  to: Email;
  userName: string;
  switchName: string;
  triggeredAt: Date;
}

export interface INotificationService {
  /**
   * Sends an email notification
   * @param notification Email notification details
   * @returns True if sent successfully
   */
  sendEmail(notification: EmailNotification): Promise<Result<boolean>>;

  /**
   * Sends a check-in reminder notification
   * @param notification Reminder notification details
   * @returns True if sent successfully
   */
  sendCheckInReminder(notification: CheckInReminderNotification): Promise<Result<boolean>>;

  /**
   * Sends a notification when a switch is triggered
   * Used to notify the switch owner that their messages are being sent
   * @param notification Trigger notification details
   * @returns True if sent successfully
   */
  sendSwitchTriggered(notification: SwitchTriggeredNotification): Promise<Result<boolean>>;

  /**
   * Sends the encrypted message to a recipient
   * This is the core delivery mechanism when a switch triggers
   * @param recipientEmail Recipient email
   * @param recipientName Recipient name
   * @param subject Message subject
   * @param encryptedContent Encrypted message content
   * @param decryptionInstructions Instructions for decrypting
   * @returns True if sent successfully
   */
  sendEncryptedMessage(
    recipientEmail: Email,
    recipientName: string,
    subject: string,
    encryptedContent: string,
    decryptionInstructions: string
  ): Promise<Result<boolean>>;

  /**
   * Validates if an email address can receive notifications
   * @param email Email address to validate
   * @returns True if valid
   */
  canSendTo(email: Email): Promise<boolean>;
}
