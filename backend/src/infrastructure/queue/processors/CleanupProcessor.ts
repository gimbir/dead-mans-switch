/**
 * Cleanup Processor
 *
 * Handles cleanup of old records from the database:
 * - Old check-in records (> 90 days)
 * - Old audit logs (> 180 days)
 * - Soft-deleted records (> 30 days)
 *
 * This processor runs daily to maintain database performance
 * and comply with data retention policies.
 */

import { Job } from 'bullmq';
import { PrismaClient } from '../../../generated/prisma/index.js';
import { logger } from '@config/logger.config.js';
import { Result } from '@shared/types/Result.js';

export interface CleanupJobData {
  checkInRetentionDays: number;
  auditLogRetentionDays: number;
  softDeleteRetentionDays: number;
  timestamp: Date;
}

export interface CleanupResult {
  checkInsDeleted: number;
  auditLogsDeleted: number;
  usersDeleted: number;
  switchesDeleted: number;
  messagesDeleted: number;
  totalDeleted: number;
  errors: string[];
}

export class CleanupProcessor {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Create the processor function for BullMQ worker
   */
  public createProcessor() {
    return async (job: Job<CleanupJobData>) => {
      await this.process(job.data);
    };
  }

  /**
   * Process the cleanup job
   */
  private async process(data: CleanupJobData): Promise<void> {
    const startTime = Date.now();
    const result: CleanupResult = {
      checkInsDeleted: 0,
      auditLogsDeleted: 0,
      usersDeleted: 0,
      switchesDeleted: 0,
      messagesDeleted: 0,
      totalDeleted: 0,
      errors: []
    };

    logger.info('Starting cleanup job', {
      checkInRetentionDays: data.checkInRetentionDays,
      auditLogRetentionDays: data.auditLogRetentionDays,
      softDeleteRetentionDays: data.softDeleteRetentionDays
    });

    try {
      // 1. Clean up old check-ins
      const checkInResult = await this.cleanupCheckIns(data.checkInRetentionDays);
      if (checkInResult.isSuccess) {
        result.checkInsDeleted = checkInResult.value;
        logger.info(`Deleted ${checkInResult.value} old check-in records`);
      } else {
        result.errors.push(`CheckIn cleanup failed: ${checkInResult.error}`);
      }

      // 2. Clean up old audit logs
      const auditLogResult = await this.cleanupAuditLogs(data.auditLogRetentionDays);
      if (auditLogResult.isSuccess) {
        result.auditLogsDeleted = auditLogResult.value;
        logger.info(`Deleted ${auditLogResult.value} old audit log records`);
      } else {
        result.errors.push(`AuditLog cleanup failed: ${auditLogResult.error}`);
      }

      // 3. Clean up soft-deleted users
      const userResult = await this.cleanupSoftDeletedUsers(data.softDeleteRetentionDays);
      if (userResult.isSuccess) {
        result.usersDeleted = userResult.value;
        logger.info(`Permanently deleted ${userResult.value} soft-deleted users`);
      } else {
        result.errors.push(`User cleanup failed: ${userResult.error}`);
      }

      // 4. Clean up soft-deleted switches
      const switchResult = await this.cleanupSoftDeletedSwitches(data.softDeleteRetentionDays);
      if (switchResult.isSuccess) {
        result.switchesDeleted = switchResult.value;
        logger.info(`Permanently deleted ${switchResult.value} soft-deleted switches`);
      } else {
        result.errors.push(`Switch cleanup failed: ${switchResult.error}`);
      }

      // 5. Clean up soft-deleted messages
      const messageResult = await this.cleanupSoftDeletedMessages(data.softDeleteRetentionDays);
      if (messageResult.isSuccess) {
        result.messagesDeleted = messageResult.value;
        logger.info(`Permanently deleted ${messageResult.value} soft-deleted messages`);
      } else {
        result.errors.push(`Message cleanup failed: ${messageResult.error}`);
      }

      // Calculate total
      result.totalDeleted =
        result.checkInsDeleted +
        result.auditLogsDeleted +
        result.usersDeleted +
        result.switchesDeleted +
        result.messagesDeleted;

      const duration = Date.now() - startTime;

      logger.info('Cleanup job completed', {
        duration,
        result,
        hasErrors: result.errors.length > 0
      });

      if (result.errors.length > 0) {
        logger.warn('Cleanup job completed with errors', { errors: result.errors });
      }

    } catch (error) {
      logger.error('Cleanup job failed', { error });
      throw error;
    }
  }

  /**
   * Clean up old check-in records
   */
  private async cleanupCheckIns(retentionDays: number): Promise<Result<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.checkIn.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      return Result.ok<number>(result.count);
    } catch (error) {
      logger.error('Failed to cleanup check-ins', { error });
      return Result.fail<number>(`Failed to cleanup check-ins: ${error}`);
    }
  }

  /**
   * Clean up old audit logs
   */
  private async cleanupAuditLogs(retentionDays: number): Promise<Result<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          }
        }
      });

      return Result.ok<number>(result.count);
    } catch (error) {
      logger.error('Failed to cleanup audit logs', { error });
      return Result.fail<number>(`Failed to cleanup audit logs: ${error}`);
    }
  }

  /**
   * Permanently delete soft-deleted users
   */
  private async cleanupSoftDeletedUsers(retentionDays: number): Promise<Result<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.user.deleteMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate
          }
        }
      });

      return Result.ok<number>(result.count);
    } catch (error) {
      logger.error('Failed to cleanup soft-deleted users', { error });
      return Result.fail<number>(`Failed to cleanup users: ${error}`);
    }
  }

  /**
   * Permanently delete soft-deleted switches
   */
  private async cleanupSoftDeletedSwitches(retentionDays: number): Promise<Result<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.switch.deleteMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate
          }
        }
      });

      return Result.ok<number>(result.count);
    } catch (error) {
      logger.error('Failed to cleanup soft-deleted switches', { error });
      return Result.fail<number>(`Failed to cleanup switches: ${error}`);
    }
  }

  /**
   * Permanently delete soft-deleted messages
   */
  private async cleanupSoftDeletedMessages(retentionDays: number): Promise<Result<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.prisma.message.deleteMany({
        where: {
          deletedAt: {
            not: null,
            lt: cutoffDate
          }
        }
      });

      return Result.ok<number>(result.count);
    } catch (error) {
      logger.error('Failed to cleanup soft-deleted messages', { error });
      return Result.fail<number>(`Failed to cleanup messages: ${error}`);
    }
  }
}