/**
 * Refresh Token DTO
 *
 * Data Transfer Object for token refresh requests.
 * Validates refresh token using Zod schema.
 *
 * Validation Rules:
 * - refreshToken: Required, non-empty string
 */

import { z } from 'zod';

/**
 * Zod validation schema for refresh token request
 */
export const RefreshTokenDtoSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required')
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

/**
 * Validates refresh token data
 * @param data Raw refresh token data
 * @returns Validated RefreshTokenDto or throws ZodError
 */
export function validateRefreshTokenDto(data: unknown): RefreshTokenDto {
  return RefreshTokenDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw refresh token data
 * @returns Validation result with data or error
 */
export function safeValidateRefreshTokenDto(data: unknown) {
  return RefreshTokenDtoSchema.safeParse(data);
}
