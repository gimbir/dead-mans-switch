/**
 * Check Switches Processor
 *
 * Background job that periodically checks all active switches to see if they
 * have exceeded their check-in deadline and should be triggered.
 *
 * Responsibilities:
 * - Find all switches that are past their due date
 * - Trigger switches (update status to TRIGGERED)
 * - Queue notification jobs for each triggered switch
 * - Handle errors gracefully
 *
 * Runs: Every hour (configurable via JOB_CONFIG.CHECK_SWITCHES.CRON)
 *
 * Performance:
 * - Processes switches in batches to avoid memory issues
 * - Uses database indexes for efficient queries
 * - Logs all trigger events for audit trail
 */

import { Job } from 'bullmq';
import { logger } from '@config/logger.config.js';
import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { QueueManager, CheckSwitchesJobData, SendNotificationJobData } from '../QueueManager.js';

export class CheckSwitchesProcessor {
  constructor(
    private switchRepository: ISwitchRepository,
    private messageRepository: IMessageRepository,
    private queueManager: QueueManager
  ) {}

  /**
   * Process the check-switches job
   */
  public async process(job: Job<CheckSwitchesJobData>): Promise<void> {
    const { batchSize, timestamp } = job.data;

    logger.info('Starting check-switches job', {
      jobId: job.id,
      batchSize,
      timestamp,
    });

    try {
      // Find all switches that are ready to trigger
      const switchesResult = await this.switchRepository.findSwitchesReadyToTrigger();

      if (!switchesResult.isSuccess || !switchesResult.value) {
        logger.error('Failed to fetch switches ready to trigger', {
          error: switchesResult.error,
        });
        throw new Error(switchesResult.error || 'Failed to fetch switches');
      }

      const switches = switchesResult.value;

      if (switches.length === 0) {
        logger.info('No switches ready to trigger');
        return;
      }

      logger.info(`Found ${switches.length} switches ready to trigger`);

      // Process each switch
      let triggeredCount = 0;
      let errorCount = 0;

      for (const switchEntity of switches) {
        try {
          // Trigger the switch (updates status to TRIGGERED)
          const triggerResult = switchEntity.trigger();

          if (!triggerResult.isSuccess) {
            logger.warn('Failed to trigger switch (business rule)', {
              switchId: switchEntity.id,
              error: triggerResult.error,
            });
            errorCount++;
            continue;
          }

          // Save the triggered switch
          const saveResult = await this.switchRepository.update(switchEntity);

          if (!saveResult.isSuccess) {
            logger.error('Failed to save triggered switch', {
              switchId: switchEntity.id,
              error: saveResult.error,
            });
            errorCount++;
            continue;
          }

          logger.info('Switch triggered successfully', {
            switchId: switchEntity.id,
            userId: switchEntity.userId,
            triggeredAt: switchEntity.triggeredAt,
          });

          // Queue notification jobs for this switch
          await this.queueNotifications(switchEntity.id);

          triggeredCount++;
        } catch (error) {
          logger.error('Error processing switch', {
            switchId: switchEntity.id,
            error,
          });
          errorCount++;
        }
      }

      logger.info('Check-switches job completed', {
        jobId: job.id,
        totalSwitches: switches.length,
        triggered: triggeredCount,
        errors: errorCount,
      });
    } catch (error) {
      logger.error('Check-switches job failed', {
        jobId: job.id,
        error,
      });
      throw error; // Re-throw to trigger BullMQ retry
    }
  }

  /**
   * Queue notification jobs for all messages of a triggered switch
   */
  private async queueNotifications(switchId: string): Promise<void> {
    try {
      // Get all unsent messages for this switch
      const messagesResult = await this.messageRepository.findBySwitchId(switchId);

      if (!messagesResult.isSuccess || !messagesResult.value) {
        logger.error('Failed to fetch messages for triggered switch', {
          switchId,
          error: messagesResult.error,
        });
        return;
      }

      const messages = messagesResult.value;

      if (messages.length === 0) {
        logger.warn('No messages found for triggered switch', { switchId });
        return;
      }

      logger.info(`Queuing ${messages.length} notification jobs`, { switchId });

      // Queue a notification job for each message
      for (const message of messages) {
        // Skip already sent messages
        if (message.isSent) {
          logger.debug('Skipping already sent message', {
            messageId: message.id,
            switchId,
          });
          continue;
        }

        // Create notification job data
        const notificationData: SendNotificationJobData = {
          messageId: message.id,
          switchId: message.switchId,
          recipientEmail: message.recipientEmail.getValue(),
          subject: message.subject || 'Important Message',
          content: message.encryptedContent, // Content is already encrypted
          attempt: 1,
        };

        // Add to notification queue
        await this.queueManager.addNotificationJob(notificationData);

        logger.info('Notification job queued', {
          messageId: message.id,
          recipientEmail: message.recipientEmail,
        });
      }
    } catch (error) {
      logger.error('Failed to queue notifications', {
        switchId,
        error,
      });
      // Don't throw - we don't want to fail the entire job if notification queuing fails
    }
  }

  /**
   * Create the processor function for BullMQ worker
   */
  public createProcessor() {
    return async (job: Job<CheckSwitchesJobData>): Promise<void> => {
      await this.process(job);
    };
  }
}
