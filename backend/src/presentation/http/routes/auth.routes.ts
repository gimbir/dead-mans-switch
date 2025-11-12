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
import { authenticate } from '@presentation/http/middleware/auth.middleware.js';
import { authValidators } from '@presentation/validators/auth.validator.js';

/**
 * Creates and configures the auth router
 * @param authController Instance of AuthController
 * @returns Configured Express Router
 */
export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Register a new user
   *     description: Create a new user account. A verification email will be sent.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 minLength: 8
   *                 example: StrongPass123!
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 maxLength: 100
   *                 example: John Doe
   *     responses:
   *       201:
   *         description: User registered successfully
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
   *                     userId:
   *                       type: string
   *                       format: uuid
   *                     email:
   *                       type: string
   *                     name:
   *                       type: string
   *                     message:
   *                       type: string
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: User already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post(
    '/register',
    validate(authValidators.register),
    authController.register.bind(authController)
  );

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Login user
   *     description: Authenticate user with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *               password:
   *                 type: string
   *                 format: password
   *                 example: StrongPass123!
   *     responses:
   *       200:
   *         description: Login successful
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
   *                     accessToken:
   *                       type: string
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                     refreshToken:
   *                       type: string
   *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                     user:
   *                       type: object
   *                       properties:
   *                         userId:
   *                           type: string
   *                           format: uuid
   *                         email:
   *                           type: string
   *                         name:
   *                           type: string
   *                         isVerified:
   *                           type: boolean
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/login', validate(authValidators.login), authController.login.bind(authController));

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Refresh access token
   *     description: Get a new access token using refresh token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *     responses:
   *       200:
   *         description: Token refreshed successfully
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
   *                     accessToken:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *       401:
   *         description: Invalid refresh token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
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

  /**
   * POST /auth/2fa/enable
   * Enable 2FA for authenticated user
   * Requires authentication
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: {
   *     secret: string (encrypted, temporary),
   *     qrCodeDataUrl: string,
   *     backupCodes: string[]
   *   }
   * }
   */
  router.post(
    '/2fa/enable',
    authenticate,
    authController.enable2FA.bind(authController)
  );

  /**
   * POST /auth/2fa/verify
   * Verify and complete 2FA setup
   * Requires authentication
   *
   * Request Body:
   * - token: string (6-digit TOTP code)
   * - encryptedSecret: string (from enable response)
   * - backupCodes: string[] (from enable response)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { success: true, message: string }
   * }
   */
  router.post(
    '/2fa/verify',
    authenticate,
    validate(authValidators.verify2FA),
    authController.verify2FA.bind(authController)
  );

  /**
   * POST /auth/2fa/disable
   * Disable 2FA for authenticated user
   * Requires authentication
   *
   * Request Body:
   * - password: string (user's password for verification)
   * - token: string (optional 2FA token for extra security)
   *
   * Response: 200 OK
   * {
   *   success: true,
   *   data: { success: true, message: string }
   * }
   */
  router.post(
    '/2fa/disable',
    authenticate,
    validate(authValidators.disable2FA),
    authController.disable2FA.bind(authController)
  );

  /**
   * POST /auth/2fa/verify-login
   * Verify 2FA token during login
   * Called after successful email/password authentication
   *
   * Request Body:
   * - userId: string
   * - token: string (6-digit TOTP or backup code)
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
  router.post(
    '/2fa/verify-login',
    validate(authValidators.verify2FALogin),
    authController.verify2FALogin.bind(authController)
  );

  return router;
}
