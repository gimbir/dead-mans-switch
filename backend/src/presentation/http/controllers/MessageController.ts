/**
 * Message Controller
 *
 * Handles all message management endpoints.
 * This is a thin layer that delegates business logic to use cases.
 *
 * Endpoints:
 * - POST /switches/:switchId/messages - Create a new message for a switch
 * - GET /switches/:switchId/messages - List messages for a switch
 * - GET /messages/:id - Get specific message details
 * - PUT /messages/:id - Update message (only if not sent)
 * - DELETE /messages/:id - Delete message (soft delete, only if not sent)
 *
 * Note: All endpoints require authentication (userId from JWT middleware)
 *
 * Response Formats:
 * - Success: { success: true, data: {...} }
 * - Error: { success: false, error: string }
 */

import { Request, Response } from 'express';
import { CreateMessageUseCase } from '@application/use-cases/message/CreateMessage.usecase.js';
import { UpdateMessageUseCase } from '@application/use-cases/message/UpdateMessage.usecase.js';
import { GetMessageUseCase } from '@application/use-cases/message/GetMessage.usecase.js';
import { DeleteMessageUseCase } from '@application/use-cases/message/DeleteMessage.usecase.js';
import { ListMessagesUseCase } from '@application/use-cases/message/ListMessages.usecase.js';

// Extend Express Request to include authenticated user ID
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class MessageController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly updateMessageUseCase: UpdateMessageUseCase,
    private readonly getMessageUseCase: GetMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase
  ) {}

  /**
   * POST /switches/:switchId/messages
   * Create a new message for a switch
   */
  async createMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      // Params are validated by middleware
      const { switchId } = req.params as { switchId: string };

      // Body is validated by middleware
      const { recipientEmail, recipientName, subject, encryptedContent } = req.body;

      // Execute use case
      const result = await this.createMessageUseCase.execute(userId, {
        switchId,
        recipientEmail,
        recipientName,
        subject,
        encryptedContent,
      });

      // Handle result
      if (result.isFailure) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success
      res.status(201).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during message creation',
      });
    }
  }

  /**
   * GET /switches/:switchId/messages
   * List messages for a switch
   */
  async listMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      // Params are validated by middleware
      const { switchId } = req.params as { switchId: string };

      // Query params are validated and transformed by middleware
      const { page, limit, includeDeleted } = req.query as unknown as {
        page: number;
        limit: number;
        includeDeleted: boolean;
      };

      // Execute use case
      const result = await this.listMessagesUseCase.execute(userId, {
        switchId,
        page,
        limit,
        includeDeleted,
      });

      // Handle result
      if (result.isFailure) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during message listing',
      });
    }
  }

  /**
   * GET /messages/:id
   * Get specific message details
   */
  async getMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      // Params are validated by middleware
      const { id: messageId } = req.params as { id: string };

      // Execute use case
      const result = await this.getMessageUseCase.execute(userId, {
        messageId,
      });

      // Handle result
      if (result.isFailure) {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during message retrieval',
      });
    }
  }

  /**
   * PUT /messages/:id
   * Update message (only if not sent)
   */
  async updateMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      // Params are validated by middleware
      const { id: messageId } = req.params as { id: string };

      // Body is validated by middleware
      const { recipientEmail, recipientName, subject, encryptedContent } = req.body;

      // Execute use case
      const result = await this.updateMessageUseCase.execute(userId, {
        messageId,
        recipientEmail,
        recipientName,
        subject,
        encryptedContent,
      });

      // Handle result
      if (result.isFailure) {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during message update',
      });
    }
  }

  /**
   * DELETE /messages/:id
   * Delete message (soft delete, only if not sent)
   */
  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      // Params are validated by middleware
      const { id: messageId } = req.params as { id: string };

      // Execute use case
      const result = await this.deleteMessageUseCase.execute(userId, {
        messageId,
      });

      // Handle result
      if (result.isFailure) {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during message deletion',
      });
    }
  }
}
