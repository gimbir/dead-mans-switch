/**
 * Login DTO
 *
 * Data Transfer Object for user authentication.
 * Validates login credentials using Zod schema.
 *
 * Validation Rules:
 * - Email: Valid email format
 * - Password: Required, non-empty
 */

import { z } from 'zod';

/**
 * Zod validation schema for login
 */
export const LoginDtoSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required')
    .max(72, 'Password must not exceed 72 characters'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type LoginDto = z.infer<typeof LoginDtoSchema>;

/**
 * Validates login data
 * @param data Raw login data
 * @returns Validated LoginDto or throws ZodError
 */
export function validateLoginDto(data: unknown): LoginDto {
  return LoginDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw login data
 * @returns Validation result with data or error
 */
export function safeValidateLoginDto(data: unknown) {
  return LoginDtoSchema.safeParse(data);
}
