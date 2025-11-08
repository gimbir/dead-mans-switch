/**
 * List Switches DTO
 *
 * Data Transfer Object for listing user's switches with pagination.
 * Validates pagination and filtering parameters using Zod schema.
 *
 * Validation Rules:
 * - page: Optional, min 1, default 1
 * - limit: Optional, 1-100, default 10
 * - isActive: Optional boolean filter
 * - includeDeleted: Optional, default false
 */

import { z } from 'zod';

/**
 * Zod validation schema for listing switches
 */
export const ListSwitchesDtoSchema = z.object({
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
    .default(10),

  isActive: z
    .boolean()
    .optional(),

  includeDeleted: z
    .boolean()
    .optional()
    .default(false),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ListSwitchesDto = z.infer<typeof ListSwitchesDtoSchema>;

/**
 * Validates list switches data
 * @param data Raw pagination data
 * @returns Validated ListSwitchesDto or throws ZodError
 */
export function validateListSwitchesDto(data: unknown): ListSwitchesDto {
  return ListSwitchesDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw pagination data
 * @returns Validation result with data or error
 */
export function safeValidateListSwitchesDto(data: unknown) {
  return ListSwitchesDtoSchema.safeParse(data);
}
