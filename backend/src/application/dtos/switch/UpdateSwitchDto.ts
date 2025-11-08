/**
 * Update Switch DTO
 *
 * Data Transfer Object for updating an existing dead man's switch.
 * Validates partial switch updates using Zod schema.
 *
 * Validation Rules:
 * - switchId: Required UUID
 * - name: Optional, 3-100 chars
 * - description: Optional, max 500 chars
 * - checkInIntervalDays: Optional, 1-30 days
 * - gracePeriodDays: Optional, 1-7 days
 * - isActive: Optional boolean
 */

import { z } from 'zod';

/**
 * Zod validation schema for switch update
 */
export const UpdateSwitchDtoSchema = z.object({
  switchId: z
    .string()
    .uuid('Switch ID must be a valid UUID')
    .min(1, 'Switch ID is required'),

  name: z
    .string()
    .min(3, 'Switch name must be at least 3 characters')
    .max(100, 'Switch name must not exceed 100 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),

  checkInIntervalDays: z
    .number()
    .int('Check-in interval must be a whole number')
    .min(1, 'Check-in interval must be at least 1 day')
    .max(30, 'Check-in interval must not exceed 30 days')
    .optional(),

  gracePeriodDays: z
    .number()
    .int('Grace period must be a whole number')
    .min(1, 'Grace period must be at least 1 day')
    .max(7, 'Grace period must not exceed 7 days')
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type UpdateSwitchDto = z.infer<typeof UpdateSwitchDtoSchema>;

/**
 * Validates switch update data
 * @param data Raw switch update data
 * @returns Validated UpdateSwitchDto or throws ZodError
 */
export function validateUpdateSwitchDto(data: unknown): UpdateSwitchDto {
  return UpdateSwitchDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw switch update data
 * @returns Validation result with data or error
 */
export function safeValidateUpdateSwitchDto(data: unknown) {
  return UpdateSwitchDtoSchema.safeParse(data);
}
