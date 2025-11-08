/**
 * Switch Routes
 *
 * Defines all switch management HTTP routes.
 * These routes handle CRUD operations for switches and check-ins.
 *
 * All routes require authentication (JWT middleware).
 * All routes use validation middleware to ensure type-safe request handling.
 *
 * Routes:
 * - POST /switches - Create a new switch
 * - GET /switches - List all switches for authenticated user
 * - GET /switches/:id - Get specific switch details
 * - PUT /switches/:id - Update switch configuration
 * - DELETE /switches/:id - Delete switch (soft delete)
 * - POST /switches/:id/checkin - Perform check-in
 * - GET /switches/:id/checkins - Get check-in history
 */

import { Router } from 'express';
import { SwitchController } from '@presentation/http/controllers/SwitchController.js';
import { validate } from '@presentation/http/middleware/validation.middleware.js';
import { switchValidators } from '@presentation/validators/switch.validator.js';

/**
 * Creates and configures the switch router
 * @param switchController Instance of SwitchController
 * @returns Configured Express Router
 */
export function createSwitchRouter(switchController: SwitchController): Router {
  const router = Router();

  // Note: All routes require authentication middleware (applied at app level)

  /**
   * POST /switches
   * Create a new dead man's switch
   *
   * Request Body:
   * - name: string (1-100 characters)
   * - description: string (optional, max 500 characters)
   * - checkInIntervalDays: number (1-365)
   * - gracePeriodDays: number (1-30)
   * - isActive: boolean (optional, default: true)
   *
   * Response: 201 Created
   * {
   *   success: true,
   *   data: {
   *     switchId: string,
   *     name: string,
   *     ...
   *   }
   * }
   */
  router.post(
    '/',
    validate(switchValidators.createSwitch),
    switchController.createSwitch.bind(switchController)
  );

  /**
   * GET /switches
   * List all switches for authenticated user with pagination
   *
   * Query Parameters:
   * - page: number (optional, default: 1)
   * - limit: number (optional, default: 10, max: 100)
   * - includeDeleted: boolean (optional, default: false)
   * - isActive: boolean (optional, filters by active status)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     switches: [...],
   *     pagination: { page, limit, total, totalPages }
   *   }
   * }
   */
  router.get(
    '/',
    validate(switchValidators.listSwitches),
    switchController.listSwitches.bind(switchController)
  );

  /**
   * GET /switches/:id
   * Get details of a specific switch
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     switchId: string,
   *     name: string,
   *     status: string,
   *     nextCheckInDue: Date,
   *     ...
   *   }
   * }
   */
  router.get(
    '/:id',
    validate(switchValidators.getSwitch),
    switchController.getSwitch.bind(switchController)
  );

  /**
   * PUT /switches/:id
   * Update switch configuration
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Request Body (all optional):
   * - name: string (1-100 characters)
   * - description: string (max 500 characters)
   * - checkInIntervalDays: number (1-365)
   * - gracePeriodDays: number (1-30)
   * - isActive: boolean
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { switchId: string, ... }
   * }
   */
  router.put(
    '/:id',
    validate(switchValidators.updateSwitch),
    switchController.updateSwitch.bind(switchController)
  );

  /**
   * DELETE /switches/:id
   * Delete a switch (soft delete)
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { message: string }
   * }
   */
  router.delete(
    '/:id',
    validate(switchValidators.deleteSwitch),
    switchController.deleteSwitch.bind(switchController)
  );

  /**
   * POST /switches/:id/checkin
   * Perform a check-in for the switch
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Request Body:
   * - notes: string (optional, max 500 characters)
   *
   * Response: 201 Created
   * {
   *   success: true,
   *   data: {
   *     checkInId: string,
   *     switchId: string,
   *     checkedInAt: Date,
   *     nextCheckInDue: Date,
   *     ...
   *   }
   * }
   */
  router.post(
    '/:id/checkin',
    validate(switchValidators.performCheckIn),
    switchController.performCheckIn.bind(switchController)
  );

  /**
   * GET /switches/:id/checkins
   * Get check-in history for a switch
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Query Parameters:
   * - page: number (optional, default: 1)
   * - limit: number (optional, default: 20, max: 100)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     checkIns: [...],
   *     pagination: { page, limit, total, totalPages }
   *   }
   * }
   */
  router.get(
    '/:id/checkins',
    validate(switchValidators.getCheckInHistory),
    switchController.getCheckInHistory.bind(switchController)
  );

  return router;
}
