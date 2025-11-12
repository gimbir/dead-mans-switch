/**
 * Auth Response DTO
 *
 * Data Transfer Object for authentication responses.
 * Contains user data and JWT tokens.
 *
 * Used for:
 * - Login response
 * - Register response
 * - Token refresh response
 */

import { z } from 'zod';

/**
 * User data included in auth response
 */
export const UserDataDtoSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  isVerified: z.boolean(),
  twoFactorEnabled: z.boolean(),
  createdAt: z.date(),
});

/**
 * Tokens included in auth response
 */
export const TokensDtoSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(), // Access token expiry in seconds
});

/**
 * Full auth response schema
 */
export const AuthResponseDtoSchema = z.object({
  user: UserDataDtoSchema,
  tokens: TokensDtoSchema,
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type UserDataDto = z.infer<typeof UserDataDtoSchema>;
export type TokensDto = z.infer<typeof TokensDtoSchema>;
export type AuthResponseDto = z.infer<typeof AuthResponseDtoSchema>;

/**
 * Factory function to create AuthResponseDto
 * @param user User data
 * @param tokens JWT tokens
 * @returns AuthResponseDto
 */
export function createAuthResponseDto(user: UserDataDto, tokens: TokensDto): AuthResponseDto {
  return {
    user,
    tokens,
  };
}
