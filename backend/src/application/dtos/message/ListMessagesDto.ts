/**
 * List Messages DTO
 *
 * Data Transfer Object for listing messages for a switch.
 * Validates switch ID and pagination parameters using Zod schema.
 *
 * Validation Rules:
 * - switchId: Required UUID
 * - page: Optional, min 1, default 1
 * - limit: Optional, 1-100, default 10
 * - includeDeleted: Optional boolean
 */

import { z } from 'zod';

/**
 * Zod validation schema for listing messages
 */
export const ListMessagesDtoSchema = z.object({
  switchId: z
    .string()
    .uuid('Switch ID must be a valid UUID')
    .min(1, 'Switch ID is required'),

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

  includeDeleted: z
    .boolean()
    .optional()
    .default(false),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type ListMessagesDto = z.infer<typeof ListMessagesDtoSchema>;

/**
 * Validates list messages data
 * @param data Raw pagination data
 * @returns Validated ListMessagesDto or throws ZodError
 */
export function validateListMessagesDto(data: unknown): ListMessagesDto {
  return ListMessagesDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw pagination data
 * @returns Validation result with data or error
 */
export function safeValidateListMessagesDto(data: unknown) {
  return ListMessagesDtoSchema.safeParse(data);
}
