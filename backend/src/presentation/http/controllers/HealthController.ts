/**
 * Health Controller
 *
 * Handles health check endpoints for monitoring and infrastructure status.
 * These endpoints are typically used by load balancers, monitoring systems,
 * and DevOps tools to ensure the application is running correctly.
 *
 * Endpoints:
 * - GET /health - Basic health check (always returns 200 if server is running)
 * - GET /health/db - Database connection health check
 * - GET /health/redis - Redis connection health check
 * - GET /health/full - Comprehensive health check (all services)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { env } from '@config/env.config.js';

export class HealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Basic health check
   * Returns 200 if server is running
   */
  async health(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  }

  /**
   * Database health check
   * Tests connection to PostgreSQL via Prisma
   */
  async databaseHealth(_req: Request, res: Response): Promise<void> {
    try {
      // Simple query to test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      res.status(200).json({
        status: 'ok',
        service: 'database',
        message: 'Database connection is healthy',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        service: 'database',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Redis health check
   * Tests connection to Redis cache
   */
  async redisHealth(_req: Request, res: Response): Promise<void> {
    try {
      // Use CacheService health check
      const isHealthy = await this.cacheService.healthCheck();

      if (isHealthy) {
        res.status(200).json({
          status: 'ok',
          service: 'redis',
          message: 'Redis connection is healthy',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'error',
          service: 'redis',
          message: 'Redis connection failed',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'error',
        service: 'redis',
        message: 'Redis health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Full health check
   * Checks all critical services (database, redis)
   */
  async fullHealth(_req: Request, res: Response): Promise<void> {
    const results = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: { status: 'unknown', message: '' },
        redis: { status: 'unknown', message: '' },
      },
    };

    let overallStatus = 200;

    // Check database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      results.services.database.status = 'ok';
      results.services.database.message = 'Database connection is healthy';
    } catch (error) {
      results.services.database.status = 'error';
      results.services.database.message = error instanceof Error ? error.message : 'Unknown error';
      overallStatus = 503;
    }

    // Check Redis
    try {
      const isHealthy = await this.cacheService.healthCheck();
      if (isHealthy) {
        results.services.redis.status = 'ok';
        results.services.redis.message = 'Redis connection is healthy';
      } else {
        results.services.redis.status = 'error';
        results.services.redis.message = 'Redis connection failed';
        overallStatus = 503;
      }
    } catch (error) {
      results.services.redis.status = 'error';
      results.services.redis.message = error instanceof Error ? error.message : 'Unknown error';
      overallStatus = 503;
    }

    // Update overall status
    if (overallStatus !== 200) {
      results.status = 'degraded';
    }

    res.status(overallStatus).json(results);
  }
}
