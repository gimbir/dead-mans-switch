/**
 * Send Reminders Processor
 *
 * Background job that sends reminder emails to users whose switches are
 * approaching their check-in deadline.
 *
 * Responsibilities:
 * - Find switches approaching check-in deadline
 * - Send reminder emails to users
 * - Avoid sending duplicate reminders
 * - Handle errors gracefully
 *
 * Runs: Every 6 hours (configurable via JOB_CONFIG.SEND_REMINDERS.CRON)
 *
 * Reminder Threshold:
 * - Sends reminder when 90% of check-in interval has passed
 * - Example: For a 7-day interval, reminder sent after 6.3 days
 */

import { Job } from 'bullmq';
import { logger } from '@config/logger.config.js';
import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { INotificationService } from '@domain/services/INotificationService.js';
import { JOB_CONFIG } from '@shared/constants/config.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';

export class SendRemindersProcessor {
  constructor(
    private switchRepository: ISwitchRepository,
    private userRepository: IUserRepository,
    private notificationService: INotificationService,
    private cacheService: CacheService
  ) {}

  /**
   * Process the send-reminders job
   */
  public async process(job: Job<any>): Promise<void> {
    logger.info('Starting send-reminders job', {
      jobId: job.id,
      timestamp: new Date(),
    });

    try {
      // Find switches approaching their due date
      const switchesResult = await this.switchRepository.findSwitchesApproachingDue(
        JOB_CONFIG.SEND_REMINDERS.REMINDER_THRESHOLD
      );

      if (!switchesResult.isSuccess || !switchesResult.value) {
        logger.error('Failed to fetch switches approaching due', {
          error: switchesResult.error,
        });
        throw new Error(switchesResult.error || 'Failed to fetch switches');
      }

      const switches = switchesResult.value;

      if (switches.length === 0) {
        logger.info('No switches approaching due date');
        return;
      }

      logger.info(`Found ${switches.length} switches approaching due date`);

      // Process each switch
      let sentCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const switchEntity of switches) {
        try {
          // Check if reminder was already sent recently (avoid spam)
          const cacheKey = `reminder:sent:${switchEntity.id}`;
          const alreadySent = await this.cacheService.get<boolean>(cacheKey);

          if (alreadySent) {
            logger.debug('Reminder already sent recently, skipping', {
              switchId: switchEntity.id,
            });
            skippedCount++;
            continue;
          }

          // Fetch user details
          const userResult = await this.userRepository.findById(switchEntity.userId);

          if (!userResult.isSuccess || !userResult.value) {
            logger.error('User not found for switch', {
              switchId: switchEntity.id,
              userId: switchEntity.userId,
            });
            errorCount++;
            continue;
          }

          const user = userResult.value;

          // Calculate hours until due
          const now = new Date();
          const nextCheckIn = switchEntity.nextCheckInDue || new Date();
          const hoursUntilDue = Math.max(0, Math.floor((nextCheckIn.getTime() - now.getTime()) / (1000 * 60 * 60)));

          // Send reminder email
          const sendResult = await this.notificationService.sendCheckInReminder({
            to: user.email,
            userName: user.name,
            switchName: switchEntity.name,
            hoursUntilDue: hoursUntilDue,
            checkInUrl: `${process.env['APP_URL'] || 'http://localhost:3000'}/switches/${switchEntity.id}/checkin`
          });

          if (!sendResult.isSuccess) {
            logger.error('Failed to send reminder email', {
              switchId: switchEntity.id,
              userEmail: user.email,
              error: sendResult.error,
            });
            errorCount++;
            continue;
          }

          // Mark reminder as sent (cache for 12 hours to avoid duplicates)
          await this.cacheService.set(cacheKey, true, 12 * 3600); // 12 hours

          logger.info('Reminder sent successfully', {
            switchId: switchEntity.id,
            switchName: switchEntity.name,
            userEmail: user.email,
            nextCheckInDue: switchEntity.nextCheckInDue,
          });

          sentCount++;
        } catch (error) {
          logger.error('Error processing reminder', {
            switchId: switchEntity.id,
            error,
          });
          errorCount++;
        }
      }

      logger.info('Send-reminders job completed', {
        jobId: job.id,
        totalSwitches: switches.length,
        sent: sentCount,
        skipped: skippedCount,
        errors: errorCount,
      });
    } catch (error) {
      logger.error('Send-reminders job failed', {
        jobId: job.id,
        error,
      });
      throw error; // Re-throw to trigger BullMQ retry
    }
  }

  /**
   * Create the processor function for BullMQ worker
   */
  public createProcessor() {
    return async (job: Job<any>): Promise<void> => {
      await this.process(job);
    };
  }
}
