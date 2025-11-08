/**
 * Get Check-In History DTO
 *
 * Data Transfer Object for retrieving check-in history for a switch.
 * Validates pagination and filtering parameters using Zod schema.
 *
 * Validation Rules:
 * - switchId: Required UUID
 * - page: Optional, min 1, default 1
 * - limit: Optional, 1-100, default 20
 */

import { z } from 'zod';

/**
 * Zod validation schema for getting check-in history
 */
export const GetCheckInHistoryDtoSchema = z.object({
  switchId: z.uuid('Switch ID must be a valid UUID').min(1, 'Switch ID is required'),

  page: z
    .number()
    .int('Page must be a whole number')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),

  limit: z
    .number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .optional()
    .default(20),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type GetCheckInHistoryDto = z.infer<typeof GetCheckInHistoryDtoSchema>;

/**
 * Validates get check-in history data
 * @param data Raw pagination data
 * @returns Validated GetCheckInHistoryDto or throws ZodError
 */
export function validateGetCheckInHistoryDto(data: unknown): GetCheckInHistoryDto {
  return GetCheckInHistoryDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw pagination data
 * @returns Validation result with data or error
 */
export function safeValidateGetCheckInHistoryDto(data: unknown) {
  return GetCheckInHistoryDtoSchema.safeParse(data);
}
