/**
 * Delete Switch DTO
 *
 * Data Transfer Object for deleting (soft delete) a switch.
 * Validates switch ID using Zod schema.
 *
 * Validation Rules:
 * - switchId: Required UUID
 */

import { z } from 'zod';

/**
 * Zod validation schema for deleting switch
 */
export const DeleteSwitchDtoSchema = z.object({
  switchId: z
    .string()
    .uuid('Switch ID must be a valid UUID')
    .min(1, 'Switch ID is required'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type DeleteSwitchDto = z.infer<typeof DeleteSwitchDtoSchema>;

/**
 * Validates delete switch data
 * @param data Raw switch ID data
 * @returns Validated DeleteSwitchDto or throws ZodError
 */
export function validateDeleteSwitchDto(data: unknown): DeleteSwitchDto {
  return DeleteSwitchDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw switch ID data
 * @returns Validation result with data or error
 */
export function safeValidateDeleteSwitchDto(data: unknown) {
  return DeleteSwitchDtoSchema.safeParse(data);
}
