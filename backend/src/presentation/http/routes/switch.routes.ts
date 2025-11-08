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
   * @swagger
   * /api/switches:
   *   post:
   *     tags:
   *       - Switches
   *     summary: Create a new switch
   *     description: Create a new dead man's switch with configurable check-in intervals
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - checkInIntervalDays
   *               - gracePeriodDays
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 example: Emergency Contacts
   *               description:
   *                 type: string
   *                 maxLength: 500
   *                 example: Important contacts and passwords for family
   *               checkInIntervalDays:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 365
   *                 example: 7
   *                 description: Number of days between required check-ins
   *               gracePeriodDays:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 30
   *                 example: 1
   *                 description: Grace period before triggering the switch
   *               isActive:
   *                 type: boolean
   *                 default: true
   *                 example: true
   *     responses:
   *       201:
   *         description: Switch created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Switch'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/',
    validate(switchValidators.createSwitch),
    switchController.createSwitch.bind(switchController)
  );

  /**
   * @swagger
   * /api/switches:
   *   get:
   *     tags:
   *       - Switches
   *     summary: List all switches
   *     description: Get a paginated list of all switches for the authenticated user
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: includeDeleted
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Include soft-deleted switches
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: List of switches
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     switches:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Switch'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/',
    validate(switchValidators.listSwitches),
    switchController.listSwitches.bind(switchController)
  );

  /**
   * @swagger
   * /api/switches/{id}:
   *   get:
   *     tags:
   *       - Switches
   *     summary: Get switch by ID
   *     description: Get detailed information about a specific switch
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Switch ID
   *     responses:
   *       200:
   *         description: Switch details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Switch'
   *       404:
   *         description: Switch not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/:id',
    validate(switchValidators.getSwitch),
    switchController.getSwitch.bind(switchController)
  );

  /**
   * @swagger
   * /api/switches/{id}:
   *   put:
   *     tags:
   *       - Switches
   *     summary: Update switch
   *     description: Update switch configuration
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Switch ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *               description:
   *                 type: string
   *                 maxLength: 500
   *               checkInIntervalDays:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 365
   *               gracePeriodDays:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 30
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Switch updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Switch'
   *       404:
   *         description: Switch not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *   delete:
   *     tags:
   *       - Switches
   *     summary: Delete switch
   *     description: Soft delete a switch
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Switch ID
   *     responses:
   *       200:
   *         description: Switch deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     message:
   *                       type: string
   *                       example: Switch deleted successfully
   *       404:
   *         description: Switch not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.put(
    '/:id',
    validate(switchValidators.updateSwitch),
    switchController.updateSwitch.bind(switchController)
  );

  router.delete(
    '/:id',
    validate(switchValidators.deleteSwitch),
    switchController.deleteSwitch.bind(switchController)
  );

  /**
   * @swagger
   * /api/switches/{id}/checkin:
   *   post:
   *     tags:
   *       - Check-ins
   *     summary: Perform check-in
   *     description: Perform a check-in for a switch to reset the countdown
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Switch ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               notes:
   *                 type: string
   *                 maxLength: 500
   *                 example: Regular check-in
   *     responses:
   *       201:
   *         description: Check-in successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CheckIn'
   *       404:
   *         description: Switch not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *
   * /api/switches/{id}/checkins:
   *   get:
   *     tags:
   *       - Check-ins
   *     summary: Get check-in history
   *     description: Get paginated check-in history for a switch
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Switch ID
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *     responses:
   *       200:
   *         description: Check-in history
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     checkIns:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/CheckIn'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                         limit:
   *                           type: integer
   *                         total:
   *                           type: integer
   *                         totalPages:
   *                           type: integer
   */
  router.post(
    '/:id/checkin',
    validate(switchValidators.performCheckIn),
    switchController.performCheckIn.bind(switchController)
  );

  router.get(
    '/:id/checkins',
    validate(switchValidators.getCheckInHistory),
    switchController.getCheckInHistory.bind(switchController)
  );

  return router;
}
