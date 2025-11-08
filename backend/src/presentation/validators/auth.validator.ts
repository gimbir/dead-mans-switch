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
};
