/**
 * Switch Controller
 *
 * Handles all switch management endpoints.
 * This is a thin layer that delegates business logic to use cases.
 *
 * Endpoints:
 * - POST /switches - Create a new switch
 * - GET /switches - List all switches for authenticated user
 * - GET /switches/:id - Get specific switch details
 * - PUT /switches/:id - Update switch configuration
 * - DELETE /switches/:id - Delete switch (soft delete)
 * - POST /switches/:id/checkin - Perform check-in
 * - GET /switches/:id/checkins - Get check-in history
 *
 * Note: All endpoints require authentication (userId from JWT middleware)
 *
 * Response Formats:
 * - Success: { success: true, data: {...} }
 * - Error: { success: false, error: string }
 */

import { Request, Response } from 'express';
import { CreateSwitchUseCase } from '@application/use-cases/switch/CreateSwitch.usecase.js';
import { UpdateSwitchUseCase } from '@application/use-cases/switch/UpdateSwitch.usecase.js';
import { GetSwitchUseCase } from '@application/use-cases/switch/GetSwitch.usecase.js';
import { DeleteSwitchUseCase } from '@application/use-cases/switch/DeleteSwitch.usecase.js';
import { ListSwitchesUseCase } from '@application/use-cases/switch/ListSwitches.usecase.js';
import { PerformCheckInUseCase } from '@application/use-cases/checkin/PerformCheckIn.usecase.js';
import { GetCheckInHistoryUseCase } from '@application/use-cases/checkin/GetCheckInHistory.usecase.js';

// Extend Express Request to include authenticated user ID
interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class SwitchController {
  constructor(
    private readonly createSwitchUseCase: CreateSwitchUseCase,
    private readonly updateSwitchUseCase: UpdateSwitchUseCase,
    private readonly getSwitchUseCase: GetSwitchUseCase,
    private readonly deleteSwitchUseCase: DeleteSwitchUseCase,
    private readonly listSwitchesUseCase: ListSwitchesUseCase,
    private readonly performCheckInUseCase: PerformCheckInUseCase,
    private readonly getCheckInHistoryUseCase: GetCheckInHistoryUseCase
  ) {}

  /**
   * POST /switches
   * Create a new switch
   */
  async createSwitch(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      const { name, description, checkInIntervalDays, gracePeriodDays, isActive } = req.body;

      // Execute use case
      const result = await this.createSwitchUseCase.execute(userId, {
        name,
        description,
        checkInIntervalDays,
        gracePeriodDays,
        isActive,
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
        error: 'Internal server error during switch creation',
      });
    }
  }

  /**
   * GET /switches
   * List all switches for authenticated user
   */
  async listSwitches(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: User ID not found',
        });
        return;
      }

      // Query params are validated and transformed by middleware
      const { page, limit, includeDeleted } = req.query as unknown as {
        page: number;
        limit: number;
        includeDeleted: boolean;
      };

      // Execute use case
      const result = await this.listSwitchesUseCase.execute(userId, {
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
        error: 'Internal server error during switch listing',
      });
    }
  }

  /**
   * GET /switches/:id
   * Get specific switch details
   */
  async getSwitch(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const { id: switchId } = req.params as { id: string };

      // Execute use case
      const result = await this.getSwitchUseCase.execute(userId, {
        switchId,
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
        error: 'Internal server error during switch retrieval',
      });
    }
  }

  /**
   * PUT /switches/:id
   * Update switch configuration
   */
  async updateSwitch(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const { id: switchId } = req.params as { id: string };

      // Body is validated by middleware
      const { name, description, checkInIntervalDays, gracePeriodDays, isActive } = req.body;

      // Execute use case
      const result = await this.updateSwitchUseCase.execute(userId, {
        switchId,
        name,
        description,
        checkInIntervalDays,
        gracePeriodDays,
        isActive,
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
        error: 'Internal server error during switch update',
      });
    }
  }

  /**
   * DELETE /switches/:id
   * Delete switch (soft delete)
   */
  async deleteSwitch(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const { id: switchId } = req.params as { id: string };

      // Execute use case
      const result = await this.deleteSwitchUseCase.execute(userId, {
        switchId,
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
        error: 'Internal server error during switch deletion',
      });
    }
  }

  /**
   * POST /switches/:id/checkin
   * Perform check-in for a switch
   */
  async performCheckIn(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const { id: switchId } = req.params as { id: string };

      // Body is validated by middleware
      const { notes } = req.body;

      // Extract metadata from request
      const ipAddress = (req.ip || req.socket.remoteAddress || '').replace('::ffff:', '');
      const userAgent = req.get('user-agent') || '';

      // Execute use case
      const result = await this.performCheckInUseCase.execute(userId, {
        switchId,
        notes,
        ipAddress,
        userAgent,
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
      res.status(201).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during check-in',
      });
    }
  }

  /**
   * GET /switches/:id/checkins
   * Get check-in history for a switch
   */
  async getCheckInHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const { id: switchId } = req.params as { id: string };

      // Query params are validated and transformed by middleware
      const { page, limit } = req.query as unknown as {
        page: number;
        limit: number;
      };

      // Execute use case
      const result = await this.getCheckInHistoryUseCase.execute(userId, {
        switchId,
        page,
        limit,
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
        error: 'Internal server error during check-in history retrieval',
      });
    }
  }
}
