/**
 * Verify Email DTO
 *
 * Data Transfer Object for email verification.
 * Validates verification token using Zod schema.
 *
 * Validation Rules:
 * - token: Required, non-empty string
 */

import { z } from 'zod';

/**
 * Zod validation schema for email verification
 */
export const VerifyEmailDtoSchema = z.object({
  token: z
    .string()
    .min(1, 'Verification token is required')
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type VerifyEmailDto = z.infer<typeof VerifyEmailDtoSchema>;

/**
 * Validates verification data
 * @param data Raw verification data
 * @returns Validated VerifyEmailDto or throws ZodError
 */
export function validateVerifyEmailDto(data: unknown): VerifyEmailDto {
  return VerifyEmailDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw verification data
 * @returns Validation result with data or error
 */
export function safeValidateVerifyEmailDto(data: unknown) {
  return VerifyEmailDtoSchema.safeParse(data);
}
