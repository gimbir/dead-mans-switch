/**
 * Get Switch DTO
 *
 * Data Transfer Object for retrieving a specific switch by ID.
 * Validates switch ID using Zod schema.
 *
 * Validation Rules:
 * - switchId: Required UUID
 */

import { z } from 'zod';

/**
 * Zod validation schema for getting switch
 */
export const GetSwitchDtoSchema = z.object({
  switchId: z
    .string()
    .uuid('Switch ID must be a valid UUID')
    .min(1, 'Switch ID is required'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type GetSwitchDto = z.infer<typeof GetSwitchDtoSchema>;

/**
 * Validates get switch data
 * @param data Raw switch ID data
 * @returns Validated GetSwitchDto or throws ZodError
 */
export function validateGetSwitchDto(data: unknown): GetSwitchDto {
  return GetSwitchDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw switch ID data
 * @returns Validation result with data or error
 */
export function safeValidateGetSwitchDto(data: unknown) {
  return GetSwitchDtoSchema.safeParse(data);
}
