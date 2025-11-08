/**
 * Get Message DTO
 *
 * Data Transfer Object for retrieving a specific message by ID.
 * Validates message ID using Zod schema.
 *
 * Validation Rules:
 * - messageId: Required UUID
 */

import { z } from 'zod';

/**
 * Zod validation schema for getting message
 */
export const GetMessageDtoSchema = z.object({
  messageId: z
    .string()
    .uuid('Message ID must be a valid UUID')
    .min(1, 'Message ID is required'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type GetMessageDto = z.infer<typeof GetMessageDtoSchema>;

/**
 * Validates get message data
 * @param data Raw message ID data
 * @returns Validated GetMessageDto or throws ZodError
 */
export function validateGetMessageDto(data: unknown): GetMessageDto {
  return GetMessageDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw message ID data
 * @returns Validation result with data or error
 */
export function safeValidateGetMessageDto(data: unknown) {
  return GetMessageDtoSchema.safeParse(data);
}
