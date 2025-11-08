/**
 * Auth Routes
 *
 * Defines all authentication-related HTTP routes.
 * These routes handle user registration, login, token refresh,
 * email verification, and password reset.
 *
 * All routes use validation middleware to ensure type-safe request handling.
 *
 * Routes:
 * - POST /auth/register - Register a new user
 * - POST /auth/login - Login with email and password
 * - POST /auth/refresh - Refresh access token using refresh token
 * - POST /auth/verify-email - Verify email with token
 * - POST /auth/forgot-password - Request password reset email
 * - POST /auth/reset-password - Reset password with token
 */

import { Router } from 'express';
import { AuthController } from '@presentation/http/controllers/AuthController.js';
import { validate } from '@presentation/http/middleware/validation.middleware.js';
import { authValidators } from '@presentation/validators/auth.validator.js';

/**
 * Creates and configures the auth router
 * @param authController Instance of AuthController
 * @returns Configured Express Router
 */
export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  /**
   * POST /auth/register
   * Register a new user account
   *
   * Request Body:
   * - email: string (valid email format)
   * - password: string (min 8 characters)
   * - name: string (min 2 characters)
   *
   * Response: 201 Created
   * {
   *   success: true,
   *   data: {
   *     userId: string,
   *     email: string,
   *     name: string,
   *     message: string
   *   }
   * }
   */
  router.post(
    '/register',
    validate(authValidators.register),
    authController.register.bind(authController)
  );

  /**
   * POST /auth/login
   * Authenticate user and receive tokens
   *
   * Request Body:
   * - email: string
   * - password: string
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     accessToken: string,
   *     refreshToken: string,
   *     user: { userId, email, name, isVerified }
   *   }
   * }
   */
  router.post('/login', validate(authValidators.login), authController.login.bind(authController));

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   *
   * Request Body:
   * - refreshToken: string
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     accessToken: string,
   *     refreshToken: string
   *   }
   * }
   */
  router.post(
    '/refresh',
    validate(authValidators.refreshToken),
    authController.refresh.bind(authController)
  );

  /**
   * POST /auth/verify-email
   * Verify user's email address with token
   *
   * Request Body:
   * - token: string (verification token from email)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { message: string }
   * }
   */
  router.post(
    '/verify-email',
    validate(authValidators.verifyEmail),
    authController.verifyEmail.bind(authController)
  );

  /**
   * POST /auth/forgot-password
   * Request password reset email
   *
   * Request Body:
   * - email: string
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { message: string }
   * }
   */
  router.post(
    '/forgot-password',
    validate(authValidators.forgotPassword),
    authController.forgotPassword.bind(authController)
  );

  /**
   * POST /auth/reset-password
   * Reset password using token from email
   *
   * Request Body:
   * - token: string (reset token from email)
   * - newPassword: string (min 8 characters)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { message: string }
   * }
   */
  router.post(
    '/reset-password',
    validate(authValidators.resetPassword),
    authController.resetPassword.bind(authController)
  );

  return router;
}
