/**
 * Health Routes
 *
 * Defines health check endpoints for monitoring and infrastructure status.
 * These routes are typically used by load balancers, monitoring systems,
 * and DevOps tools to ensure the application is running correctly.
 *
 * Routes do NOT require authentication - they are public for monitoring.
 *
 * Routes:
 * - GET /health - Basic health check
 * - GET /health/db - Database connection health check
 * - GET /health/redis - Redis connection health check
 * - GET /health/full - Comprehensive health check (all services)
 */

import { Router } from 'express';
import { HealthController } from '@presentation/http/controllers/HealthController.js';

/**
 * Creates and configures the health router
 * @param healthController Instance of HealthController
 * @returns Configured Express Router
 */
export function createHealthRouter(healthController: HealthController): Router {
  const router = Router();

  /**
   * GET /health
   * Basic health check - returns 200 if server is running
   *
   * Response: 200 OK
   * {
   *   status: 'ok',
   *   timestamp: '2024-01-01T00:00:00.000Z',
   *   uptime: 123.456,
   *   environment: 'development'
   * }
   */
  router.get('/', healthController.health.bind(healthController));

  /**
   * GET /health/db
   * Database connection health check
   *
   * Response: 200 OK / 503 Service Unavailable
   * {
   *   status: 'ok' | 'error',
   *   service: 'database',
   *   timestamp: '2024-01-01T00:00:00.000Z',
   *   message?: string
   * }
   */
  router.get('/db', healthController.databaseHealth.bind(healthController));

  /**
   * GET /health/redis
   * Redis connection health check
   *
   * Response: 200 OK / 503 Service Unavailable
   * {
   *   status: 'ok' | 'error',
   *   service: 'redis',
   *   timestamp: '2024-01-01T00:00:00.000Z',
   *   message?: string
   * }
   */
  router.get('/redis', healthController.redisHealth.bind(healthController));

  /**
   * GET /health/full
   * Comprehensive health check for all services
   *
   * Response: 200 OK / 503 Service Unavailable
   * {
   *   status: 'ok' | 'degraded' | 'error',
   *   timestamp: '2024-01-01T00:00:00.000Z',
   *   uptime: 123.456,
   *   services: {
   *     database: { status: 'ok' | 'error', message?: string },
   *     redis: { status: 'ok' | 'error', message?: string }
   *   }
   * }
   */
  router.get('/full', healthController.fullHealth.bind(healthController));

  return router;
}
