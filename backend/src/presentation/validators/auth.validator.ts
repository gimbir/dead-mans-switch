/**
 * Auth Request Validators
 *
 * Zod schemas for validating authentication-related HTTP requests.
 * Used with validation middleware to ensure type-safe request handling.
 *
 * Features:
 * - Body validation using existing DTOs
 * - Email and password format validation
 * - Token validation
 *
 * Usage:
 * router.post('/auth/register',
 *   validate(authValidators.register),
 *   authController.register
 * );
 */

import { z } from 'zod';
import { RegisterDtoSchema } from '@application/dtos/auth/RegisterDto.js';
import { LoginDtoSchema } from '@application/dtos/auth/LoginDto.js';
import { VerifyEmailDtoSchema } from '@application/dtos/auth/VerifyEmailDto.js';
import { ForgotPasswordDtoSchema } from '@application/dtos/auth/ForgotPasswordDto.js';
import { ResetPasswordDtoSchema } from '@application/dtos/auth/ResetPasswordDto.js';
import { RefreshTokenDtoSchema } from '@application/dtos/auth/RefreshTokenDto.js';

/**
 * Validator for POST /auth/register
 * Validates user registration data
 */
export const registerValidator = {
  body: RegisterDtoSchema,
};

/**
 * Validator for POST /auth/login
 * Validates user login credentials
 */
export const loginValidator = {
  body: LoginDtoSchema,
};

/**
 * Validator for POST /auth/verify-email
 * Validates email verification token
 */
export const verifyEmailValidator = {
  body: VerifyEmailDtoSchema,
};

/**
 * Validator for POST /auth/forgot-password
 * Validates email for password reset
 */
export const forgotPasswordValidator = {
  body: ForgotPasswordDtoSchema,
};

/**
 * Validator for POST /auth/reset-password
 * Validates password reset token and new password
 */
export const resetPasswordValidator = {
  body: ResetPasswordDtoSchema,
};

/**
 * Validator for POST /auth/refresh
 * Validates refresh token
 */
export const refreshTokenValidator = {
  body: RefreshTokenDtoSchema,
};

// ==================== 2FA Validators ====================

/**
 * Validator for POST /auth/2fa/verify
 * Validates 2FA setup verification
 */
export const verify2FASchema = z.object({
  token: z.string().length(6, '2FA token must be 6 digits').regex(/^\d{6}$/, '2FA token must be numeric'),
  encryptedSecret: z.string().min(1, 'Encrypted secret is required'),
  backupCodes: z.array(z.string()).length(10, 'Must provide 10 backup codes'),
});

export const verify2FAValidator = {
  body: verify2FASchema,
};

/**
 * Validator for POST /auth/2fa/disable
 * Validates 2FA disable request
 */
export const disable2FASchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  token: z.string().length(6, '2FA token must be 6 digits').regex(/^\d{6}$/, '2FA token must be numeric').optional(),
});

export const disable2FAValidator = {
  body: disable2FASchema,
};

/**
 * Validator for POST /auth/2fa/verify-login
 * Validates 2FA login verification
 */
export const verify2FALoginSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  token: z.string().min(6, 'Token must be at least 6 characters').max(15, 'Token is too long'), // TOTP (6) or backup code (12)
});

export const verify2FALoginValidator = {
  body: verify2FALoginSchema,
};

/**
 * Export all auth validators
 */
export const authValidators = {
  register: registerValidator,
  login: loginValidator,
  verifyEmail: verifyEmailValidator,
  forgotPassword: forgotPasswordValidator,
  resetPassword: resetPasswordValidator,
  refreshToken: refreshTokenValidator,
  verify2FA: verify2FAValidator,
  disable2FA: disable2FAValidator,
  verify2FALogin: verify2FALoginValidator,
};
