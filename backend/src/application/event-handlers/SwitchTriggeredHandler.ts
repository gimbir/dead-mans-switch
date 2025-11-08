/**
 * Switch Triggered Event Handler
 *
 * Handles the SwitchTriggeredEvent by queuing notification jobs
 * for all messages associated with the triggered switch.
 *
 * This handler is called when:
 * - A switch is triggered (check-in deadline passed)
 * - Manual trigger by user (future feature)
 *
 * Responsibilities:
 * - Fetch all messages for the triggered switch
 * - Queue notification jobs for each message
 * - Log the event for audit trail
 * - Handle errors gracefully
 */

import { logger } from '@config/logger.config.js';
import { SwitchTriggeredEvent } from '@domain/events/SwitchEvents.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { QueueManager, SendNotificationJobData } from '@infrastructure/queue/QueueManager.js';

export class SwitchTriggeredHandler {
  constructor(
    private messageRepository: IMessageRepository,
    private queueManager: QueueManager
  ) {}

  /**
   * Handle the SwitchTriggeredEvent
   */
  public async handle(event: SwitchTriggeredEvent): Promise<void> {
    const switchId = event.aggregateId;

    logger.info('Handling SwitchTriggeredEvent', {
      eventId: event.eventId,
      switchId: switchId,
      triggeredAt: event.triggeredAt,
      reason: event.reason,
    });

    try {
      // Fetch all messages for the triggered switch
      const messagesResult = await this.messageRepository.findBySwitchId(switchId);

      if (!messagesResult.isSuccess || !messagesResult.value) {
        logger.error('Failed to fetch messages for triggered switch', {
          switchId: switchId,
          error: messagesResult.error,
        });
        return;
      }

      const messages = messagesResult.value;

      if (messages.length === 0) {
        logger.warn('No messages found for triggered switch', {
          switchId: switchId,
        });
        return;
      }

      logger.info(`Queuing ${messages.length} notification jobs for triggered switch`, {
        switchId: switchId,
      });

      // Queue a notification job for each message
      let queuedCount = 0;

      for (const message of messages) {
        // Skip already sent messages
        if (message.isSent) {
          logger.debug('Skipping already sent message', {
            messageId: message.id,
            switchId: switchId,
          });
          continue;
        }

        // Create notification job data
        const notificationData: SendNotificationJobData = {
          messageId: message.id,
          switchId: message.switchId,
          recipientEmail: message.recipientEmail.getValue(),
          subject: message.subject || 'Important Message from Dead Man\'s Switch',
          content: message.encryptedContent,
          attempt: 1,
        };

        // Add to notification queue
        await this.queueManager.addNotificationJob(notificationData);

        logger.info('Notification job queued', {
          messageId: message.id,
          recipientEmail: message.recipientEmail,
          switchId: switchId,
        });

        queuedCount++;
      }

      logger.info('SwitchTriggeredEvent handled successfully', {
        eventId: event.eventId,
        switchId: switchId,
        totalMessages: messages.length,
        queuedJobs: queuedCount,
      });
    } catch (error) {
      logger.error('Failed to handle SwitchTriggeredEvent', {
        eventId: event.eventId,
        switchId: switchId,
        error,
      });
      // Don't throw - we don't want to crash the application
      // The error is logged and can be investigated
    }
  }
}
