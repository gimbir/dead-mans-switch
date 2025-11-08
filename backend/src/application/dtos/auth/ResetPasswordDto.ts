/**
 * Reset Password DTO
 *
 * Data Transfer Object for password reset.
 * Validates reset token and new password using Zod schema.
 *
 * Validation Rules:
 * - token: Required, non-empty string
 * - newPassword: Min 8 chars, uppercase, lowercase, number
 */

import { z } from 'zod';

/**
 * Zod validation schema for password reset
 */
export const ResetPasswordDtoSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required')
    .trim(),

  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters') // bcrypt limit
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;

/**
 * Validates reset password data
 * @param data Raw reset password data
 * @returns Validated ResetPasswordDto or throws ZodError
 */
export function validateResetPasswordDto(data: unknown): ResetPasswordDto {
  return ResetPasswordDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw reset password data
 * @returns Validation result with data or error
 */
export function safeValidateResetPasswordDto(data: unknown) {
  return ResetPasswordDtoSchema.safeParse(data);
}
