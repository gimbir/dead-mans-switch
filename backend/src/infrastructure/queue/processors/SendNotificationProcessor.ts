/**
 * Send Notification Processor
 *
 * Background job that sends email notifications for triggered switches.
 *
 * Responsibilities:
 * - Fetch message details from database
 * - Send email via EmailService
 * - Mark message as sent (with delivery tracking)
 * - Handle failures and retries
 * - Update delivery attempt count
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Delivery failure tracking
 * - Idempotency (won't send already sent messages)
 * - Detailed logging for audit trail
 */

import { Job } from 'bullmq';
import { logger } from '@config/logger.config.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { INotificationService } from '@domain/services/INotificationService.js';
import { SendNotificationJobData } from '../QueueManager.js';
import { MESSAGE_CONFIG } from '@shared/constants/config.js';
import { Email } from '@domain/value-objects/Email.vo.js';

export class SendNotificationProcessor {
  constructor(
    private messageRepository: IMessageRepository,
    private notificationService: INotificationService
  ) {}

  /**
   * Process the send-notification job
   */
  public async process(job: Job<SendNotificationJobData>): Promise<void> {
    const { messageId, recipientEmail, subject, content, attempt } = job.data;

    logger.info('Starting send-notification job', {
      jobId: job.id,
      messageId,
      recipientEmail,
      attempt,
    });

    try {
      // Fetch message from database to ensure it still needs to be sent
      const messageResult = await this.messageRepository.findById(messageId);

      if (!messageResult.isSuccess || !messageResult.value) {
        logger.error('Message not found', {
          messageId,
          error: messageResult.error,
        });
        // Don't retry if message doesn't exist
        return;
      }

      const message = messageResult.value;

      // Check if message was already sent (idempotency check)
      if (message.isSent) {
        logger.warn('Message already sent, skipping', {
          messageId,
          sentAt: message.sentAt,
        });
        return;
      }

      // Check if max delivery attempts reached
      if (message.deliveryAttempts >= MESSAGE_CONFIG.MAX_DELIVERY_ATTEMPTS) {
        logger.error('Max delivery attempts reached', {
          messageId,
          attempts: message.deliveryAttempts,
          maxAttempts: MESSAGE_CONFIG.MAX_DELIVERY_ATTEMPTS,
        });

        // Mark as failed
        message.recordDeliveryAttempt('Max delivery attempts exceeded');
        await this.messageRepository.update(message);
        return;
      }

      // Send the email
      // Note: In a real implementation, you would decrypt the content here
      // For now, we assume the EmailService handles encrypted content
      const emailResult = Email.create(recipientEmail);
      if (!emailResult.isSuccess) {
        logger.error('Invalid recipient email', {
          messageId,
          recipientEmail,
          error: emailResult.error
        });
        // Don't retry for invalid email
        return;
      }

      const sendResult = await this.notificationService.sendEmail({
        to: emailResult.value,
        recipientName: message.recipientName,
        subject: subject || message.subject || 'Important Message',
        content: content,
        isHtml: true
      });

      if (!sendResult.isSuccess) {
        // Record delivery failure
        const errorMessage = sendResult.error || 'Unknown error';
        message.recordDeliveryAttempt(errorMessage);

        const updateResult = await this.messageRepository.update(message);

        logger.error('Failed to send notification', {
          messageId,
          recipientEmail,
          attempt: message.deliveryAttempts,
          error: errorMessage,
          updateSuccess: updateResult.isSuccess,
        });

        // Throw error to trigger BullMQ retry
        throw new Error(`Failed to send email: ${errorMessage}`);
      }

      // Mark message as sent
      message.markAsSent();

      const updateResult = await this.messageRepository.update(message);

      if (!updateResult.isSuccess) {
        logger.error('Failed to update message after sending', {
          messageId,
          error: updateResult.error,
        });
        // Email was sent but we couldn't update the database
        // This is a critical issue - log it but don't retry
        return;
      }

      logger.info('Notification sent successfully', {
        jobId: job.id,
        messageId,
        recipientEmail,
        sentAt: message.sentAt,
      });
    } catch (error) {
      logger.error('Send-notification job failed', {
        jobId: job.id,
        messageId,
        recipientEmail,
        attempt,
        error,
      });
      throw error; // Re-throw to trigger BullMQ retry
    }
  }

  /**
   * Create the processor function for BullMQ worker
   */
  public createProcessor() {
    return async (job: Job<SendNotificationJobData>): Promise<void> => {
      await this.process(job);
    };
  }
}
