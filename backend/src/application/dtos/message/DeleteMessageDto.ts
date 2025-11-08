/**
 * Delete Message DTO
 *
 * Data Transfer Object for deleting (soft delete) a message.
 * Validates message ID using Zod schema.
 *
 * Validation Rules:
 * - messageId: Required UUID
 */

import { z } from 'zod';

/**
 * Zod validation schema for deleting message
 */
export const DeleteMessageDtoSchema = z.object({
  messageId: z
    .string()
    .uuid('Message ID must be a valid UUID')
    .min(1, 'Message ID is required'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type DeleteMessageDto = z.infer<typeof DeleteMessageDtoSchema>;

/**
 * Validates delete message data
 * @param data Raw message ID data
 * @returns Validated DeleteMessageDto or throws ZodError
 */
export function validateDeleteMessageDto(data: unknown): DeleteMessageDto {
  return DeleteMessageDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw message ID data
 * @returns Validation result with data or error
 */
export function safeValidateDeleteMessageDto(data: unknown) {
  return DeleteMessageDtoSchema.safeParse(data);
}
