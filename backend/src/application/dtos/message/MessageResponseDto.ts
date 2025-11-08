/**
 * Message Response DTO
 *
 * Data Transfer Object for returning message data to clients.
 * Represents a message with all its properties.
 *
 * Fields:
 * - id: Message unique identifier
 * - switchId: Switch ID this message belongs to
 * - recipientEmail: Recipient email address
 * - recipientName: Recipient name
 * - subject: Optional message subject
 * - encryptedContent: Encrypted message content
 * - isSent: Whether message has been sent
 * - sentAt: When message was sent
 * - deliveryAttempts: Number of delivery attempts
 * - lastAttemptAt: Last delivery attempt timestamp
 * - failureReason: Reason for delivery failure
 * - createdAt: Message creation timestamp
 * - updatedAt: Last update timestamp
 */

import { z } from 'zod';

/**
 * Zod validation schema for message response
 */
export const MessageResponseDtoSchema = z.object({
  id: z.uuid(),
  switchId: z.uuid(),
  recipientEmail: z.string().email(),
  recipientName: z.string(),
  subject: z.string().optional(),
  encryptedContent: z.string(),
  isSent: z.boolean(),
  sentAt: z.date().optional(),
  deliveryAttempts: z.number().int().nonnegative(),
  lastAttemptAt: z.date().optional(),
  failureReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type MessageResponseDto = z.infer<typeof MessageResponseDtoSchema>;

/**
 * Paginated list response for messages
 */
export const PaginatedMessagesResponseDtoSchema = z.object({
  messages: z.array(MessageResponseDtoSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});

/**
 * TypeScript type for paginated messages
 */
export type PaginatedMessagesResponseDto = z.infer<typeof PaginatedMessagesResponseDtoSchema>;

/**
 * Factory function to create message response DTO from Message entity
 * @param messageEntity Message entity from domain
 * @returns MessageResponseDto
 */
export function createMessageResponseDto(messageEntity: {
  id: string;
  switchId: string;
  recipientEmail: string;
  recipientName: string;
  subject?: string | null | undefined;
  encryptedContent: string;
  isSent: boolean;
  sentAt?: Date | null | undefined;
  deliveryAttempts: number;
  lastAttemptAt?: Date | null | undefined;
  failureReason?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}): MessageResponseDto {
  return {
    id: messageEntity.id,
    switchId: messageEntity.switchId,
    recipientEmail: messageEntity.recipientEmail,
    recipientName: messageEntity.recipientName,
    subject: messageEntity.subject ?? undefined,
    encryptedContent: messageEntity.encryptedContent,
    isSent: messageEntity.isSent,
    sentAt: messageEntity.sentAt ?? undefined,
    deliveryAttempts: messageEntity.deliveryAttempts,
    lastAttemptAt: messageEntity.lastAttemptAt ?? undefined,
    failureReason: messageEntity.failureReason ?? undefined,
    createdAt: messageEntity.createdAt,
    updatedAt: messageEntity.updatedAt,
  };
}

/**
 * Factory function to create paginated messages response
 * @param messages Array of message entities
 * @param page Current page
 * @param limit Items per page
 * @param total Total count
 * @returns PaginatedMessagesResponseDto
 */
export function createPaginatedMessagesResponseDto(
  messages: MessageResponseDto[],
  page: number,
  limit: number,
  total: number
): PaginatedMessagesResponseDto {
  return {
    messages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
