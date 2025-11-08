/**
 * Create Switch DTO
 *
 * Data Transfer Object for creating a new dead man's switch.
 * Validates switch configuration using Zod schema.
 *
 * Validation Rules:
 * - name: Required, 3-100 chars
 * - description: Optional, max 500 chars
 * - checkInIntervalDays: Required, 1-30 days
 * - gracePeriodDays: Required, 1-7 days
 * - isActive: Optional, defaults to true
 */

import { z } from 'zod';

/**
 * Zod validation schema for switch creation
 */
export const CreateSwitchDtoSchema = z.object({
  name: z
    .string()
    .min(3, 'Switch name must be at least 3 characters')
    .max(100, 'Switch name must not exceed 100 characters')
    .trim(),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),

  checkInIntervalDays: z
    .number()
    .int('Check-in interval must be a whole number')
    .min(1, 'Check-in interval must be at least 1 day')
    .max(30, 'Check-in interval must not exceed 30 days'),

  gracePeriodDays: z
    .number()
    .int('Grace period must be a whole number')
    .min(1, 'Grace period must be at least 1 day')
    .max(7, 'Grace period must not exceed 7 days'),

  isActive: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type CreateSwitchDto = z.infer<typeof CreateSwitchDtoSchema>;

/**
 * Validates switch creation data
 * @param data Raw switch data
 * @returns Validated CreateSwitchDto or throws ZodError
 */
export function validateCreateSwitchDto(data: unknown): CreateSwitchDto {
  return CreateSwitchDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw switch data
 * @returns Validation result with data or error
 */
export function safeValidateCreateSwitchDto(data: unknown) {
  return CreateSwitchDtoSchema.safeParse(data);
}
