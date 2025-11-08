/**
 * CheckIn Repository Implementation
 *
 * Implements ICheckInRepository using Prisma ORM.
 * Handles all CheckIn entity persistence operations.
 *
 * Features:
 * - Historical check-in tracking
 * - Security metadata (IP, user agent, location)
 * - Date range queries
 * - Activity monitoring
 * - Optimistic locking with version field
 * - Error handling with Result pattern
 */

import { PrismaClient } from '@generated/prisma/index.js';
import { ICheckInRepository } from '@domain/repositories/ICheckInRepository.js';
import { CheckIn } from '@domain/entities/CheckIn.entity.js';
import { Result } from '@shared/types/Result.js';

export class CheckInRepository implements ICheckInRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds a check-in by its unique ID
   */
  async findById(id: string): Promise<Result<CheckIn | null>> {
    try {
      const checkInData = await this.prisma.checkIn.findUnique({
        where: { id },
      });

      if (!checkInData) {
        return Result.ok(null);
      }

      return CheckIn.fromPersistence(checkInData);
    } catch (error) {
      return Result.fail<CheckIn | null>(
        `Failed to find check-in by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds all check-ins for a specific switch
   */
  async findBySwitchId(
    switchId: string,
    limit: number,
    offset: number
  ): Promise<Result<CheckIn[]>> {
    try {
      const checkIns = await this.prisma.checkIn.findMany({
        where: { switchId },
        take: limit,
        skip: offset,
        orderBy: { timestamp: 'desc' },
      });

      const checkInResults = checkIns.map((data) =>
        CheckIn.fromPersistence(data)
      );

      const failedResult = checkInResults.find((r) => r.isFailure);
      if (failedResult) {
        return Result.fail<CheckIn[]>(failedResult.error as string);
      }

      return Result.ok(checkInResults.map((r) => r.value));
    } catch (error) {
      return Result.fail<CheckIn[]>(
        `Failed to find check-ins by switch ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds the most recent check-in for a switch
   */
  async findLatestBySwitchId(switchId: string): Promise<Result<CheckIn | null>> {
    try {
      const checkInData = await this.prisma.checkIn.findFirst({
        where: { switchId },
        orderBy: { timestamp: 'desc' },
      });

      if (!checkInData) {
        return Result.ok(null);
      }

      return CheckIn.fromPersistence(checkInData);
    } catch (error) {
      return Result.fail<CheckIn | null>(
        `Failed to find latest check-in: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds check-ins for a switch within a date range
   */
  async findBySwitchIdAndDateRange(
    switchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<CheckIn[]>> {
    try {
      const checkIns = await this.prisma.checkIn.findMany({
        where: {
          switchId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { timestamp: 'desc' },
      });

      const checkInResults = checkIns.map((data) =>
        CheckIn.fromPersistence(data)
      );

      const failedResult = checkInResults.find((r) => r.isFailure);
      if (failedResult) {
        return Result.fail<CheckIn[]>(failedResult.error as string);
      }

      return Result.ok(checkInResults.map((r) => r.value));
    } catch (error) {
      return Result.fail<CheckIn[]>(
        `Failed to find check-ins by date range: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds recent check-ins across all switches for a user
   */
  async findRecentByUserId(userId: string, limit: number): Promise<Result<CheckIn[]>> {
    try {
      const checkIns = await this.prisma.checkIn.findMany({
        where: {
          switch: {
            userId,
          },
        },
        take: limit,
        orderBy: { timestamp: 'desc' },
      });

      const checkInResults = checkIns.map((data) =>
        CheckIn.fromPersistence(data)
      );

      const failedResult = checkInResults.find((r) => r.isFailure);
      if (failedResult) {
        return Result.fail<CheckIn[]>(failedResult.error as string);
      }

      return Result.ok(checkInResults.map((r) => r.value));
    } catch (error) {
      return Result.fail<CheckIn[]>(
        `Failed to find recent check-ins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Counts total check-ins for a switch
   */
  async countBySwitchId(switchId: string): Promise<Result<number>> {
    try {
      const count = await this.prisma.checkIn.count({
        where: { switchId },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail<number>(
        `Failed to count check-ins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Counts check-ins for a switch within a date range
   */
  async countBySwitchIdAndDateRange(
    switchId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Result<number>> {
    try {
      const count = await this.prisma.checkIn.count({
        where: {
          switchId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail<number>(
        `Failed to count check-ins by date range: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds check-ins with suspicious patterns
   * Currently simplified - finds check-ins with multiple different IPs
   */
  async findSuspiciousCheckIns(switchId: string, daysBack: number): Promise<Result<CheckIn[]>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Find all check-ins in the time range
      const checkIns = await this.prisma.checkIn.findMany({
        where: {
          switchId,
          timestamp: {
            gte: startDate,
          },
        },
        orderBy: { timestamp: 'desc' },
      });

      // TODO: Implement actual suspicious pattern detection
      // For now, just return all check-ins with different IPs
      const ipSet = new Set<string>();
      const suspiciousCheckIns = checkIns.filter((checkIn) => {
        const ip = checkIn.ipAddress;
        if (ip && ipSet.has(ip)) {
          return true; // Duplicate IP found
        } else if (ip) {
          ipSet.add(ip);
        }
        return false;
      });

      const checkInResults = suspiciousCheckIns.map((data) =>
        CheckIn.fromPersistence(data)
      );

      const failedResult = checkInResults.find((r) => r.isFailure);
      if (failedResult) {
        return Result.fail<CheckIn[]>(failedResult.error as string);
      }

      return Result.ok(checkInResults.map((r) => r.value));
    } catch (error) {
      return Result.fail<CheckIn[]>(
        `Failed to find suspicious check-ins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Saves a new check-in to the database
   */
  async save(checkIn: CheckIn): Promise<Result<CheckIn>> {
    try {
      const persistenceData = checkIn.toPersistence();

      const createdCheckIn = await this.prisma.checkIn.create({
        data: {
          id: persistenceData['id'] as string,
          switchId: persistenceData['switchId'] as string,
          timestamp: persistenceData['timestamp'] as Date,
          ipAddress: persistenceData['ipAddress'] as string | null,
          userAgent: persistenceData['userAgent'] as string | null,
          location: persistenceData['location'] as string | null,
          notes: persistenceData['notes'] as string | null,
          version: persistenceData['version'] as number,
          createdAt: persistenceData['createdAt'] as Date,
          updatedAt: persistenceData['updatedAt'] as Date,
        },
      });

      return CheckIn.fromPersistence(createdCheckIn);
    } catch (error) {
      return Result.fail<CheckIn>(
        `Failed to save check-in: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates an existing check-in in the database
   * Only notes field can be updated (historical records are immutable)
   * Uses optimistic locking via version field
   */
  async update(checkIn: CheckIn): Promise<Result<CheckIn>> {
    try {
      const persistenceData = checkIn.toPersistence();
      const currentVersion = persistenceData['version'] as number;

      // Optimistic locking: check version before update
      const updatedCheckIn = await this.prisma.checkIn.updateMany({
        where: {
          id: persistenceData['id'] as string,
          version: currentVersion - 1, // Previous version
        },
        data: {
          notes: persistenceData['notes'] as string | null,
          version: currentVersion,
          updatedAt: new Date(),
        },
      });

      // If no rows updated, version conflict occurred
      if (updatedCheckIn.count === 0) {
        return Result.fail<CheckIn>(
          'Optimistic locking failure: CheckIn was modified by another process'
        );
      }

      // Fetch and return updated check-in
      const fetchedCheckIn = await this.prisma.checkIn.findUnique({
        where: { id: persistenceData['id'] as string },
      });

      if (!fetchedCheckIn) {
        return Result.fail<CheckIn>('CheckIn not found after update');
      }

      return CheckIn.fromPersistence(fetchedCheckIn);
    } catch (error) {
      return Result.fail<CheckIn>(
        `Failed to update check-in: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Deletes old check-ins for data retention compliance
   */
  async deleteOlderThan(olderThanDays: number): Promise<Result<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.prisma.checkIn.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      return Result.ok(result.count);
    } catch (error) {
      return Result.fail<number>(
        `Failed to delete old check-ins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds all check-ins with pagination
   */
  async findAll(
    switchId: string | undefined,
    limit: number,
    offset: number
  ): Promise<Result<CheckIn[]>> {
    try {
      const checkIns = await this.prisma.checkIn.findMany({
        where: switchId ? { switchId } : {},
        take: limit,
        skip: offset,
        orderBy: { timestamp: 'desc' },
      });

      const checkInResults = checkIns.map((data) =>
        CheckIn.fromPersistence(data)
      );

      const failedResult = checkInResults.find((r) => r.isFailure);
      if (failedResult) {
        return Result.fail<CheckIn[]>(failedResult.error as string);
      }

      return Result.ok(checkInResults.map((r) => r.value));
    } catch (error) {
      return Result.fail<CheckIn[]>(
        `Failed to find check-ins: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
