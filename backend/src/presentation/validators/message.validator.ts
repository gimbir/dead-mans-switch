/**
 * Message Request Validators
 *
 * Zod schemas for validating message-related HTTP requests.
 * Used with validation middleware to ensure type-safe request handling.
 *
 * Features:
 * - Params validation (UUIDs, etc.)
 * - Query string validation with type transformation
 * - Body validation using existing DTOs
 *
 * Usage:
 * router.get('/messages/:id',
 *   validate(messageValidators.getMessage),
 *   messageController.getMessage
 * );
 */

import { z } from 'zod';
import { CreateMessageDtoSchema } from '@application/dtos/message/CreateMessageDto.js';
import { UpdateMessageDtoSchema } from '@application/dtos/message/UpdateMessageDto.js';

/**
 * Validator for GET /messages/:id
 * Validates message ID parameter
 */
export const getMessageValidator = {
  params: z.object({
    id: z.string().uuid('Message ID must be a valid UUID'),
  }),
};

/**
 * Validator for DELETE /messages/:id
 * Validates message ID parameter
 */
export const deleteMessageValidator = {
  params: z.object({
    id: z.string().uuid('Message ID must be a valid UUID'),
  }),
};

/**
 * Validator for PUT /messages/:id
 * Validates message ID parameter and update body
 */
export const updateMessageValidator = {
  params: z.object({
    id: z.string().uuid('Message ID must be a valid UUID'),
  }),
  body: UpdateMessageDtoSchema.omit({ messageId: true }), // messageId comes from params
};

/**
 * Validator for POST /switches/:switchId/messages
 * Validates switch ID and message creation body
 */
export const createMessageValidator = {
  params: z.object({
    switchId: z.string().uuid('Switch ID must be a valid UUID'),
  }),
  body: CreateMessageDtoSchema.omit({ switchId: true }), // switchId comes from params
};

/**
 * Validator for GET /switches/:switchId/messages
 * Validates switch ID and pagination parameters
 */
export const listMessagesValidator = {
  params: z.object({
    switchId: z.string().uuid('Switch ID must be a valid UUID'),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .optional()
      .default('1')
      .transform(Number),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .optional()
      .default('10')
      .transform(Number)
      .refine((val: number) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
    includeDeleted: z
      .string()
      .optional()
      .default('false')
      .transform((val) => val === 'true'),
  }),
};

/**
 * Export all message validators
 */
export const messageValidators = {
  getMessage: getMessageValidator,
  deleteMessage: deleteMessageValidator,
  updateMessage: updateMessageValidator,
  createMessage: createMessageValidator,
  listMessages: listMessagesValidator,
};
