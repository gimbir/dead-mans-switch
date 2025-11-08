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
   * @swagger
   * /health:
   *   get:
   *     tags:
   *       - Health
   *     summary: Basic health check
   *     description: Returns server status and basic information
   *     responses:
   *       200:
   *         description: Server is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   *                   description: Server uptime in seconds
   *                   example: 123.456
   *                 environment:
   *                   type: string
   *                   example: development
   */
  router.get('/', healthController.health.bind(healthController));

  /**
   * @swagger
   * /health/db:
   *   get:
   *     tags:
   *       - Health
   *     summary: Database health check
   *     description: Checks PostgreSQL database connection status
   *     responses:
   *       200:
   *         description: Database is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 service:
   *                   type: string
   *                   example: database
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       503:
   *         description: Database is unavailable
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: error
   *                 service:
   *                   type: string
   *                   example: database
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 message:
   *                   type: string
   *                   example: Database connection failed
   */
  router.get('/db', healthController.databaseHealth.bind(healthController));

  /**
   * @swagger
   * /health/redis:
   *   get:
   *     tags:
   *       - Health
   *     summary: Redis health check
   *     description: Checks Redis cache connection status
   *     responses:
   *       200:
   *         description: Redis is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: ok
   *                 service:
   *                   type: string
   *                   example: redis
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       503:
   *         description: Redis is unavailable
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: error
   *                 service:
   *                   type: string
   *                   example: redis
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 message:
   *                   type: string
   *                   example: Redis connection failed
   */
  router.get('/redis', healthController.redisHealth.bind(healthController));

  /**
   * @swagger
   * /health/full:
   *   get:
   *     tags:
   *       - Health
   *     summary: Comprehensive health check
   *     description: Checks all services including database and Redis
   *     responses:
   *       200:
   *         description: All services are healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [ok, degraded, error]
   *                   example: ok
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   *                   description: Server uptime in seconds
   *                   example: 123.456
   *                 services:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           enum: [ok, error]
   *                           example: ok
   *                         message:
   *                           type: string
   *                     redis:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                           enum: [ok, error]
   *                           example: ok
   *                         message:
   *                           type: string
   *       503:
   *         description: One or more services are unhealthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [degraded, error]
   *                   example: degraded
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   *                 services:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                         message:
   *                           type: string
   *                     redis:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                         message:
   *                           type: string
   */
  router.get('/full', healthController.fullHealth.bind(healthController));

  return router;
}
