/**
 * Forgot Password DTO
 *
 * Data Transfer Object for password reset requests.
 * Validates email using Zod schema.
 *
 * Validation Rules:
 * - email: Valid email format
 */

import { z } from 'zod';

/**
 * Zod validation schema for forgot password request
 */
export const ForgotPasswordDtoSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;

/**
 * Validates forgot password data
 * @param data Raw forgot password data
 * @returns Validated ForgotPasswordDto or throws ZodError
 */
export function validateForgotPasswordDto(data: unknown): ForgotPasswordDto {
  return ForgotPasswordDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw forgot password data
 * @returns Validation result with data or error
 */
export function safeValidateForgotPasswordDto(data: unknown) {
  return ForgotPasswordDtoSchema.safeParse(data);
}
