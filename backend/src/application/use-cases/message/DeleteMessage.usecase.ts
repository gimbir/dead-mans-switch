/**
 * Delete Message Use Case
 *
 * Business logic for deleting (soft delete) a message.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find message by ID
 * 3. Find switch and verify ownership
 * 4. Check if message can be deleted (not sent)
 * 5. Soft delete the message
 * 6. Save updated message to repository
 * 7. Return success result
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - IMessageRepository: Message data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { Result } from '@shared/types/Result.js';
import { DeleteMessageDto } from '@application/dtos/message/DeleteMessageDto.js';

export class DeleteMessageUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  /**
   * Executes the delete message use case
   * @param userId User ID (from authenticated session)
   * @param dto Message deletion data
   * @returns Result with success message or error
   */
  async execute(userId: string, dto: DeleteMessageDto): Promise<Result<{ message: string }>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<{ message: string }>('User ID is required');
    }

    // Step 2: Find message by ID
    const messageResult = await this.messageRepository.findById(dto.messageId);
    if (messageResult.isFailure) {
      return Result.fail<{ message: string }>(messageResult.error as string);
    }

    const messageEntity = messageResult.value;
    if (!messageEntity) {
      return Result.fail<{ message: string }>('Message not found');
    }

    // Step 3: Find switch and verify ownership
    const switchResult = await this.switchRepository.findById(messageEntity.switchId);
    if (switchResult.isFailure) {
      return Result.fail<{ message: string }>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<{ message: string }>('Switch not found');
    }

    if (switchEntity.userId !== userId) {
      return Result.fail<{ message: string }>('Unauthorized: You do not own this message');
    }

    // Step 4: Check if already deleted
    if (messageEntity.isDeleted()) {
      return Result.fail<{ message: string }>('Message is already deleted');
    }

    // Step 5: Check if message has been sent (optional - allow deletion of sent messages?)
    if (messageEntity.isSent) {
      return Result.fail<{ message: string }>(
        'Cannot delete a message that has already been sent'
      );
    }

    // Step 6: Soft delete the message
    messageEntity.delete();

    // Step 7: Update message in repository
    const updateResult = await this.messageRepository.update(messageEntity);
    if (updateResult.isFailure) {
      return Result.fail<{ message: string }>(updateResult.error as string);
    }

    // Step 8: Return success message
    return Result.ok<{ message: string }>({
      message: 'Message deleted successfully',
    });
  }
}
