/**
 * Update Message DTO
 *
 * Data Transfer Object for updating an existing message.
 * Can only update messages that haven't been sent yet.
 *
 * Validation Rules:
 * - messageId: Required UUID
 * - recipientEmail: Optional valid email
 * - recipientName: Optional, 2-100 chars
 * - subject: Optional, max 200 chars
 * - encryptedContent: Optional, min 10 chars (must be already encrypted)
 */

import { z } from 'zod';

/**
 * Zod validation schema for message update
 */
export const UpdateMessageDtoSchema = z.object({
  messageId: z
    .string()
    .uuid('Message ID must be a valid UUID')
    .min(1, 'Message ID is required'),

  recipientEmail: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase()
    .optional(),

  recipientName: z
    .string()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(100, 'Recipient name must not exceed 100 characters')
    .trim()
    .optional(),

  subject: z
    .string()
    .max(200, 'Subject must not exceed 200 characters')
    .trim()
    .optional(),

  encryptedContent: z
    .string()
    .min(10, 'Encrypted content must be at least 10 characters')
    .trim()
    .optional(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type UpdateMessageDto = z.infer<typeof UpdateMessageDtoSchema>;

/**
 * Validates message update data
 * @param data Raw message update data
 * @returns Validated UpdateMessageDto or throws ZodError
 */
export function validateUpdateMessageDto(data: unknown): UpdateMessageDto {
  return UpdateMessageDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw message update data
 * @returns Validation result with data or error
 */
export function safeValidateUpdateMessageDto(data: unknown) {
  return UpdateMessageDtoSchema.safeParse(data);
}
