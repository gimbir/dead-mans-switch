/**
 * Register DTO
 *
 * Data Transfer Object for user registration.
 * Validates input using Zod schema.
 *
 * Validation Rules:
 * - Email: Valid email format (RFC 5322)
 * - Password: Min 8 chars, uppercase, lowercase, number
 * - Name: 2-100 characters
 */

import { z } from 'zod';

/**
 * Zod validation schema for registration
 */
export const RegisterDtoSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must not exceed 72 characters') // bcrypt limit
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type RegisterDto = z.infer<typeof RegisterDtoSchema>;

/**
 * Validates registration data
 * @param data Raw registration data
 * @returns Validated RegisterDto or throws ZodError
 */
export function validateRegisterDto(data: unknown): RegisterDto {
  return RegisterDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw registration data
 * @returns Validation result with data or error
 */
export function safeValidateRegisterDto(data: unknown) {
  return RegisterDtoSchema.safeParse(data);
}
