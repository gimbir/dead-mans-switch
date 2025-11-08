/**
 * Create Message DTO
 *
 * Data Transfer Object for creating a new message for a switch.
 * Messages are encrypted and will be delivered when the switch triggers.
 *
 * Validation Rules:
 * - switchId: Required UUID
 * - recipientEmail: Required valid email
 * - recipientName: Required, 2-100 chars
 * - subject: Optional, max 200 chars
 * - encryptedContent: Required, min 10 chars (must be already encrypted)
 */

import { z } from 'zod';

/**
 * Zod validation schema for message creation
 */
export const CreateMessageDtoSchema = z.object({
  switchId: z
    .string()
    .uuid('Switch ID must be a valid UUID')
    .min(1, 'Switch ID is required'),

  recipientEmail: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),

  recipientName: z
    .string()
    .min(2, 'Recipient name must be at least 2 characters')
    .max(100, 'Recipient name must not exceed 100 characters')
    .trim(),

  subject: z
    .string()
    .max(200, 'Subject must not exceed 200 characters')
    .trim()
    .optional(),

  encryptedContent: z
    .string()
    .min(10, 'Encrypted content must be at least 10 characters')
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type CreateMessageDto = z.infer<typeof CreateMessageDtoSchema>;

/**
 * Validates message creation data
 * @param data Raw message data
 * @returns Validated CreateMessageDto or throws ZodError
 */
export function validateCreateMessageDto(data: unknown): CreateMessageDto {
  return CreateMessageDtoSchema.parse(data);
}

/**
 * Safe validation that returns success/error
 * @param data Raw message data
 * @returns Validation result with data or error
 */
export function safeValidateCreateMessageDto(data: unknown) {
  return CreateMessageDtoSchema.safeParse(data);
}
