/**
 * Message Routes
 *
 * Defines all message management HTTP routes.
 * These routes handle CRUD operations for messages that will be sent
 * when a dead man's switch is triggered.
 *
 * All routes require authentication (JWT middleware).
 * All routes use validation middleware to ensure type-safe request handling.
 *
 * Routes:
 * - POST /switches/:switchId/messages - Create a new message for a switch
 * - GET /switches/:switchId/messages - List messages for a switch
 * - GET /messages/:id - Get specific message details
 * - PUT /messages/:id - Update message (only if not sent)
 * - DELETE /messages/:id - Delete message (soft delete, only if not sent)
 */

import { Router } from 'express';
import { MessageController } from '@presentation/http/controllers/MessageController.js';
import { validate } from '@presentation/http/middleware/validation.middleware.js';
import { messageValidators } from '@presentation/validators/message.validator.js';

/**
 * Creates and configures the message router
 * @param messageController Instance of MessageController
 * @returns Configured Express Router
 */
export function createMessageRouter(messageController: MessageController): Router {
  const router = Router();

  // Note: All routes require authentication middleware (applied at app level)

  /**
   * @swagger
   * /api/switches/{switchId}/messages:
   *   post:
   *     tags:
   *       - Messages
   *     summary: Create a new message
   *     description: Create a new encrypted message that will be sent when the switch is triggered
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: switchId
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
   *             required:
   *               - recipientEmail
   *               - recipientName
   *               - subject
   *               - encryptedContent
   *             properties:
   *               recipientEmail:
   *                 type: string
   *                 format: email
   *                 example: recipient@example.com
   *               recipientName:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 example: John Doe
   *               subject:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *                 example: Important Information
   *               encryptedContent:
   *                 type: string
   *                 description: Client-side encrypted message content
   *     responses:
   *       201:
   *         description: Message created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Message'
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
   *       404:
   *         description: Switch not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/switches/:switchId/messages',
    validate(messageValidators.createMessage),
    messageController.createMessage.bind(messageController)
  );

  /**
   * @swagger
   * /api/switches/{switchId}/messages:
   *   get:
   *     tags:
   *       - Messages
   *     summary: List messages for a switch
   *     description: Get a paginated list of all messages for a specific switch
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: switchId
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
   *         description: Include soft-deleted messages
   *     responses:
   *       200:
   *         description: List of messages
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
   *                     messages:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/Message'
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
   *       404:
   *         description: Switch not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/switches/:switchId/messages',
    validate(messageValidators.listMessages),
    messageController.listMessages.bind(messageController)
  );

  /**
   * @swagger
   * /api/messages/{id}:
   *   get:
   *     tags:
   *       - Messages
   *     summary: Get message by ID
   *     description: Get detailed information about a specific message
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Message ID
   *     responses:
   *       200:
   *         description: Message details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Message'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Message not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get(
    '/messages/:id',
    validate(messageValidators.getMessage),
    messageController.getMessage.bind(messageController)
  );

  /**
   * @swagger
   * /api/messages/{id}:
   *   put:
   *     tags:
   *       - Messages
   *     summary: Update message
   *     description: Update message details (only if not yet sent)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Message ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               recipientEmail:
   *                 type: string
   *                 format: email
   *               recipientName:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *               subject:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *               encryptedContent:
   *                 type: string
   *                 description: Client-side encrypted message content
   *     responses:
   *       200:
   *         description: Message updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/Message'
   *       400:
   *         description: Validation error or message already sent
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
   *       404:
   *         description: Message not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.put(
    '/messages/:id',
    validate(messageValidators.updateMessage),
    messageController.updateMessage.bind(messageController)
  );

  /**
   * @swagger
   * /api/messages/{id}:
   *   delete:
   *     tags:
   *       - Messages
   *     summary: Delete message
   *     description: Soft delete a message (only if not yet sent)
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Message ID
   *     responses:
   *       200:
   *         description: Message deleted successfully
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
   *                       example: Message deleted successfully
   *       400:
   *         description: Message already sent and cannot be deleted
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
   *       404:
   *         description: Message not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.delete(
    '/messages/:id',
    validate(messageValidators.deleteMessage),
    messageController.deleteMessage.bind(messageController)
  );

  return router;
}
