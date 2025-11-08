/**
 * Perform Check-In DTO
 *
 * Data Transfer Object for performing a check-in on a switch.
 * Validates check-in data using Zod schema.
 *
 * Validation Rules:
 * - switchId: Required UUID
 * - notes: Optional, max 500 chars (user can add notes about this check-in)
 * - ipAddress: Optional, captured automatically by server
 * - userAgent: Optional, captured automatically by server
 */

import { z } from 'zod';

/**
 * Zod validation schema for check-in
 */
export const PerformCheckInDtoSchema = z.object({
  switchId: z
    .string()
    .uuid('Switch ID must be a valid UUID')
    .min(1, 'Switch ID is required'),

  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .trim()
    .optional(),

  // These are typically captured by middleware/controller
  ipAddress: z
    .string()
    .optional(),

  userAgent: z
    .string()
    .optional(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type PerformCheckInDto = z.infer<typeof PerformCheckInDtoSchema>;

/**
 * Validates check-in data
 * @param data Raw check-in data
 * @returns Validated PerformCheckInDto or throws ZodError
 */
export function validatePerformCheckInDto(data: unknown): PerformCheckInDto {
  return PerformCheckInDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw check-in data
 * @returns Validation result with data or error
 */
export function safeValidatePerformCheckInDto(data: unknown) {
  return PerformCheckInDtoSchema.safeParse(data);
}
