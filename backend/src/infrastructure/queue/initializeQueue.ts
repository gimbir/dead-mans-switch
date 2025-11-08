/**
 * Initialize Queue System
 *
 * Sets up the BullMQ queue system with all processors and workers.
 *
 * This module:
 * - Creates the QueueManager singleton
 * - Registers all job processors
 * - Schedules repeatable jobs (cron)
 * - Provides graceful shutdown
 *
 * Usage:
 * import { initializeQueue, shutdownQueue } from '@infrastructure/queue/initializeQueue.js';
 * await initializeQueue(dependencies);
 * // ... application runs
 * await shutdownQueue();
 */

import { logger } from '@config/logger.config.js';
import { QueueManager, QueueName } from './QueueManager.js';
import {
  CheckSwitchesProcessor,
  SendNotificationProcessor,
  SendRemindersProcessor,
  CleanupProcessor,
} from './processors/index.js';
import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { INotificationService } from '@domain/services/INotificationService.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { JOB_CONFIG } from '@shared/constants/config.js';

/**
 * Dependencies required for queue initialization
 */
export interface QueueDependencies {
  switchRepository: ISwitchRepository;
  messageRepository: IMessageRepository;
  userRepository: IUserRepository;
  notificationService: INotificationService;
  cacheService: CacheService;
}

let queueManager: QueueManager | null = null;

/**
 * Initialize the queue system
 */
export async function initializeQueue(dependencies: QueueDependencies): Promise<void> {
  logger.info('Initializing queue system...');

  try {
    // Get QueueManager singleton
    queueManager = QueueManager.getInstance();

    // Initialize queues and schedulers
    await queueManager.initialize();

    // ===== Register Check Switches Processor =====
    const checkSwitchesProcessor = new CheckSwitchesProcessor(
      dependencies.switchRepository,
      dependencies.messageRepository,
      queueManager
    );

    queueManager.registerWorker(
      QueueName.CHECK_SWITCHES,
      checkSwitchesProcessor.createProcessor(),
      1 // Process one batch at a time
    );

    // ===== Register Send Notification Processor =====
    const sendNotificationProcessor = new SendNotificationProcessor(
      dependencies.messageRepository,
      dependencies.notificationService
    );

    queueManager.registerWorker(
      QueueName.SEND_NOTIFICATIONS,
      sendNotificationProcessor.createProcessor(),
      JOB_CONFIG.SEND_NOTIFICATIONS.CONCURRENCY // Process multiple notifications concurrently
    );

    // ===== Register Send Reminders Processor =====
    const sendRemindersProcessor = new SendRemindersProcessor(
      dependencies.switchRepository,
      dependencies.userRepository,
      dependencies.notificationService,
      dependencies.cacheService
    );

    queueManager.registerWorker(
      QueueName.SEND_REMINDERS,
      sendRemindersProcessor.createProcessor(),
      1 // Process one batch at a time
    );

    // ===== Register Cleanup Processor =====
    const cleanupProcessor = new CleanupProcessor();

    queueManager.registerWorker(
      QueueName.CLEANUP,
      cleanupProcessor.createProcessor(),
      1 // Process one cleanup job at a time
    );

    // ===== Schedule Repeatable Jobs =====

    // Schedule check-switches job (runs every hour)
    await queueManager.addCheckSwitchesJob();
    logger.info('Check-switches job scheduled', {
      cron: JOB_CONFIG.CHECK_SWITCHES.CRON,
    });

    // Schedule send-reminders job (runs every 6 hours)
    await queueManager.addSendRemindersJob();
    logger.info('Send-reminders job scheduled', {
      cron: JOB_CONFIG.SEND_REMINDERS.CRON,
    });

    // Schedule cleanup job (runs daily at 2 AM)
    await queueManager.addCleanupJob();
    logger.info('Cleanup job scheduled', {
      cron: '0 2 * * *',
    });

    logger.info('✅ Queue system initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize queue system', { error });
    throw error;
  }
}

/**
 * Shutdown the queue system gracefully
 */
export async function shutdownQueue(): Promise<void> {
  if (!queueManager) {
    logger.warn('Queue system not initialized, nothing to shutdown');
    return;
  }

  logger.info('Shutting down queue system...');

  try {
    await queueManager.shutdown();
    queueManager = null;
    logger.info('✅ Queue system shutdown complete');
  } catch (error) {
    logger.error('❌ Error during queue system shutdown', { error });
    throw error;
  }
}

/**
 * Get the QueueManager instance (for testing/debugging)
 */
export function getQueueManager(): QueueManager | null {
  return queueManager;
}
