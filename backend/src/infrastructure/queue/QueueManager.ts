/**
 * Queue Manager
 *
 * Manages BullMQ queues and workers for background job processing.
 *
 * Features:
 * - Queue creation and management
 * - Worker registration
 * - Job scheduling (cron jobs)
 * - Graceful shutdown
 * - Error handling and logging
 *
 * Queues:
 * - check-switches: Monitors switches and triggers notifications
 * - send-notifications: Sends email/SMS notifications
 * - send-reminders: Sends check-in reminder emails
 *
 * Usage:
 * const queueManager = QueueManager.getInstance();
 * await queueManager.initialize();
 * await queueManager.addCheckSwitchesJob();
 */

import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '@config/env.config.js';
import { logger } from '@config/logger.config.js';
import { JOB_CONFIG } from '@shared/constants/config.js';

/**
 * Job data types
 */
export interface CheckSwitchesJobData {
  batchSize: number;
  timestamp: Date;
}

export interface SendNotificationJobData {
  messageId: string;
  switchId: string;
  recipientEmail: string;
  subject: string;
  content: string;
  attempt: number;
}

export interface SendReminderJobData {
  switchId: string;
  userId: string;
  switchName: string;
  nextCheckInDue: Date;
}

/**
 * Queue names
 */
export enum QueueName {
  CHECK_SWITCHES = 'check-switches',
  SEND_NOTIFICATIONS = 'send-notifications',
  SEND_REMINDERS = 'send-reminders',
  CLEANUP = 'cleanup',
}

/**
 * QueueManager - Singleton class for managing BullMQ queues
 */
export class QueueManager {
  private static instance: QueueManager;
  private connection: Redis;
  private queues: Map<QueueName, Queue> = new Map();
  private workers: Map<QueueName, Worker> = new Map();
  private initialized = false;

  private constructor() {
    // Create Redis connection for BullMQ
    const redisOptions: any = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };

    // Only add password if it's defined
    if (env.REDIS_PASSWORD) {
      redisOptions.password = env.REDIS_PASSWORD;
    }

    this.connection = new Redis(redisOptions);

    this.connection.on('error', (error) => {
      logger.error('Queue Redis connection error', { error });
    });

    this.connection.on('connect', () => {
      logger.info('Queue Redis connected');
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  /**
   * Initialize all queues and workers
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('QueueManager already initialized');
      return;
    }

    logger.info('Initializing QueueManager...');

    try {
      // Create queues
      await this.createQueues();

      logger.info('QueueManager initialized successfully');
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize QueueManager', { error });
      throw error;
    }
  }

  /**
   * Create all queues
   */
  private async createQueues(): Promise<void> {
    const queueNames = Object.values(QueueName);

    for (const queueName of queueNames) {
      const queue = new Queue(queueName, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000, // 5 seconds
          },
          removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000, // Keep last 1000 completed jobs
          },
          removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
          },
        },
      });

      this.queues.set(queueName, queue);
      logger.info(`Queue created: ${queueName}`);
    }
  }


  /**
   * Register a worker for a queue
   */
  public registerWorker<T = any>(
    queueName: QueueName,
    processor: (job: Job<T>) => Promise<void>,
    concurrency: number = 1
  ): void {
    const worker = new Worker<T>(queueName, processor, {
      connection: this.connection,
      concurrency,
    });

    // Event: Job completed
    worker.on('completed', (job: Job<T>) => {
      logger.info(`Job completed: ${queueName}`, {
        jobId: job.id,
        data: job.data,
      });
    });

    // Event: Job failed
    worker.on('failed', (job: Job<T> | undefined, error: Error) => {
      logger.error(`Job failed: ${queueName}`, {
        jobId: job?.id,
        data: job?.data,
        error: error.message,
        stack: error.stack,
      });
    });

    // Event: Worker error
    worker.on('error', (error: Error) => {
      logger.error(`Worker error: ${queueName}`, {
        error: error.message,
        stack: error.stack,
      });
    });

    this.workers.set(queueName, worker);
    logger.info(`Worker registered: ${queueName} (concurrency: ${concurrency})`);
  }

  /**
   * Get a queue by name
   */
  public getQueue(queueName: QueueName): Queue {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    return queue;
  }

  /**
   * Add a job to the check-switches queue (repeatable)
   */
  public async addCheckSwitchesJob(): Promise<void> {
    const queue = this.getQueue(QueueName.CHECK_SWITCHES);

    await queue.add(
      JOB_CONFIG.CHECK_SWITCHES.NAME,
      {
        batchSize: JOB_CONFIG.CHECK_SWITCHES.BATCH_SIZE,
        timestamp: new Date(),
      } as CheckSwitchesJobData,
      {
        repeat: {
          pattern: JOB_CONFIG.CHECK_SWITCHES.CRON, // Every hour
        },
        jobId: 'check-switches-repeatable', // Prevent duplicates
      }
    );

    logger.info('Check switches job scheduled', {
      cron: JOB_CONFIG.CHECK_SWITCHES.CRON,
    });
  }

  /**
   * Add a job to the send-reminders queue (repeatable)
   */
  public async addSendRemindersJob(): Promise<void> {
    const queue = this.getQueue(QueueName.SEND_REMINDERS);

    await queue.add(
      JOB_CONFIG.SEND_REMINDERS.NAME,
      {
        timestamp: new Date(),
      },
      {
        repeat: {
          pattern: JOB_CONFIG.SEND_REMINDERS.CRON, // Every 6 hours
        },
        jobId: 'send-reminders-repeatable', // Prevent duplicates
      }
    );

    logger.info('Send reminders job scheduled', {
      cron: JOB_CONFIG.SEND_REMINDERS.CRON,
    });
  }

  /**
   * Add a notification job to the queue
   */
  public async addNotificationJob(data: SendNotificationJobData): Promise<void> {
    const queue = this.getQueue(QueueName.SEND_NOTIFICATIONS);

    await queue.add('send-notification', data, {
      attempts: JOB_CONFIG.SEND_NOTIFICATIONS.RETRY_ATTEMPTS,
      backoff: {
        type: 'exponential',
        delay: JOB_CONFIG.SEND_NOTIFICATIONS.RETRY_DELAY_MS,
      },
    });

    logger.info('Notification job added', {
      messageId: data.messageId,
      recipientEmail: data.recipientEmail,
    });
  }

  /**
   * Schedule cleanup job to run daily
   */
  public async addCleanupJob(): Promise<void> {
    const queue = this.getQueue(QueueName.CLEANUP);

    await queue.add(
      'cleanup',
      {
        checkInRetentionDays: 90,  // Keep check-ins for 90 days
        auditLogRetentionDays: 180, // Keep audit logs for 180 days
        softDeleteRetentionDays: 30, // Permanently delete soft-deleted records after 30 days
        timestamp: new Date(),
      },
      {
        repeat: {
          pattern: '0 2 * * *', // Run at 2 AM daily
        },
      }
    );

    logger.info('Cleanup job scheduled', {
      cron: '0 2 * * *',
      checkInRetentionDays: 90,
      auditLogRetentionDays: 180,
      softDeleteRetentionDays: 30
    });
  }

  /**
   * Gracefully shutdown all queues and workers
   */
  public async shutdown(): Promise<void> {
    logger.info('Shutting down QueueManager...');

    try {
      // Close all workers
      for (const [name, worker] of this.workers.entries()) {
        await worker.close();
        logger.info(`Worker closed: ${name}`);
      }

      // Close all queues
      for (const [name, queue] of this.queues.entries()) {
        await queue.close();
        logger.info(`Queue closed: ${name}`);
      }

      // Close Redis connection
      await this.connection.quit();
      logger.info('Queue Redis connection closed');

      this.initialized = false;
      logger.info('QueueManager shutdown complete');
    } catch (error) {
      logger.error('Error during QueueManager shutdown', { error });
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats(queueName: QueueName): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(queueName);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Remove all repeatable jobs (useful for testing/reset)
   */
  public async removeRepeatableJobs(): Promise<void> {
    for (const [name, queue] of this.queues.entries()) {
      const repeatableJobs = await queue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await queue.removeRepeatableByKey(job.key);
        logger.info(`Removed repeatable job from ${name}`, { jobKey: job.key });
      }
    }
  }
}
