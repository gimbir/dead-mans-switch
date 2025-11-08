/**
 * Auth Controller
 *
 * Handles all authentication and authorization endpoints.
 * This is a thin layer that delegates business logic to use cases.
 *
 * Endpoints:
 * - POST /auth/register - Register a new user
 * - POST /auth/login - Authenticate user and return JWT tokens
 * - POST /auth/refresh - Refresh access token using refresh token
 * - POST /auth/verify-email - Verify user email with token
 * - POST /auth/forgot-password - Request password reset
 * - POST /auth/reset-password - Reset password with token
 *
 * Response Formats:
 * - Success: { success: true, data: {...} }
 * - Error: { success: false, error: string }
 */

import { Request, Response } from 'express';
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUser.usecase.js';
import { AuthenticateUserUseCase } from '@application/use-cases/auth/AuthenticateUser.usecase.js';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshToken.usecase.js';
import { VerifyEmailUseCase } from '@application/use-cases/auth/VerifyEmail.usecase.js';
import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPassword.usecase.js';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPassword.usecase.js';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  /**
   * POST /auth/register
   * Register a new user account
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Execute use case
      const result = await this.registerUserUseCase.execute({
        email,
        password,
        name,
      });

      // Handle result
      if (result.isFailure) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success - return auth tokens and user info
      res.status(201).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during registration',
      });
    }
  }

  /**
   * POST /auth/login
   * Authenticate user and return JWT tokens
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Execute use case
      const result = await this.authenticateUserUseCase.execute({
        email,
        password,
      });

      // Handle result
      if (result.isFailure) {
        res.status(401).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success - return auth tokens and user info
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during login',
      });
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Execute use case
      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
      });

      // Handle result
      if (result.isFailure) {
        res.status(401).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success - return new tokens
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during token refresh',
      });
    }
  }

  /**
   * POST /auth/verify-email
   * Verify user email with verification token
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      // Execute use case
      const result = await this.verifyEmailUseCase.execute({
        token,
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
        error: 'Internal server error during email verification',
      });
    }
  }

  /**
   * POST /auth/forgot-password
   * Request password reset (sends email with reset token)
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Execute use case
      const result = await this.forgotPasswordUseCase.execute({
        email,
      });

      // Handle result
      if (result.isFailure) {
        res.status(400).json({
          success: false,
          error: result.error,
        });
        return;
      }

      // Success - always return success for security reasons (don't reveal if email exists)
      res.status(200).json({
        success: true,
        data: result.value,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error during password reset request',
      });
    }
  }

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      // Execute use case
      const result = await this.resetPasswordUseCase.execute({
        token,
        newPassword,
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
        error: 'Internal server error during password reset',
      });
    }
  }
}
