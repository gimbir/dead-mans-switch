/**
 * Controllers Index
 *
 * Central export point for all HTTP controllers.
 *
 * Available Controllers:
 * - HealthController: Health check endpoints for monitoring
 * - AuthController: Authentication and authorization endpoints
 * - SwitchController: Switch management and check-in endpoints
 * - MessageController: Message management endpoints
 */

export * from './HealthController.js';
export * from './AuthController.js';
export * from './SwitchController.js';
export * from './MessageController.js';
