/**
 * Message Use Cases Index
 *
 * Central export point for all message-related use cases.
 *
 * Available Use Cases:
 * - CreateMessageUseCase: Create a new message for a switch
 * - UpdateMessageUseCase: Update an existing message (before it's sent)
 * - GetMessageUseCase: Retrieve a specific message by ID
 * - DeleteMessageUseCase: Soft delete a message (before it's sent)
 * - ListMessagesUseCase: List messages for a switch with pagination
 */

export * from './CreateMessage.usecase.js';
export * from './UpdateMessage.usecase.js';
export * from './GetMessage.usecase.js';
export * from './DeleteMessage.usecase.js';
export * from './ListMessages.usecase.js';
