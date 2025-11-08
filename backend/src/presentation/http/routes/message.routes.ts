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
   * POST /switches/:switchId/messages
   * Create a new message for a switch
   *
   * Path Parameters:
   * - switchId: string (UUID)
   *
   * Request Body:
   * - recipientEmail: string (valid email format)
   * - recipientName: string (1-100 characters)
   * - subject: string (1-200 characters)
   * - encryptedContent: string (encrypted message content)
   *
   * Response: 201 Created
   * {
   *   success: true,
   *   data: {
   *     messageId: string,
   *     switchId: string,
   *     recipientEmail: string,
   *     ...
   *   }
   * }
   */
  router.post(
    '/switches/:switchId/messages',
    validate(messageValidators.createMessage),
    messageController.createMessage.bind(messageController)
  );

  /**
   * GET /switches/:switchId/messages
   * List all messages for a switch with pagination
   *
   * Path Parameters:
   * - switchId: string (UUID)
   *
   * Query Parameters:
   * - page: number (optional, default: 1)
   * - limit: number (optional, default: 10, max: 100)
   * - includeDeleted: boolean (optional, default: false)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     messages: [...],
   *     pagination: { page, limit, total, totalPages }
   *   }
   * }
   */
  router.get(
    '/switches/:switchId/messages',
    validate(messageValidators.listMessages),
    messageController.listMessages.bind(messageController)
  );

  /**
   * GET /messages/:id
   * Get details of a specific message
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     messageId: string,
   *     recipientEmail: string,
   *     subject: string,
   *     isSent: boolean,
   *     sentAt: Date | null,
   *     ...
   *   }
   * }
   */
  router.get(
    '/messages/:id',
    validate(messageValidators.getMessage),
    messageController.getMessage.bind(messageController)
  );

  /**
   * PUT /messages/:id
   * Update a message (only if not yet sent)
   *
   * Path Parameters:
   * - id: string (UUID)
   *
   * Request Body (all optional):
   * - recipientEmail: string (valid email format)
   * - recipientName: string (1-100 characters)
   * - subject: string (1-200 characters)
   * - encryptedContent: string
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { messageId: string, ... }
   * }
   */
  router.put(
    '/messages/:id',
    validate(messageValidators.updateMessage),
    messageController.updateMessage.bind(messageController)
  );

  /**
   * DELETE /messages/:id
   * Delete a message (soft delete, only if not yet sent)
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
    '/messages/:id',
    validate(messageValidators.deleteMessage),
    messageController.deleteMessage.bind(messageController)
  );

  return router;
}
