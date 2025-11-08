/**
 * Update Message Use Case
 *
 * Business logic for updating an existing message.
 * Can only update messages that haven't been sent yet.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find message by ID
 * 3. Find switch and verify ownership
 * 4. Check if message can be updated (not sent, not deleted)
 * 5. Create Email value object if email is being updated
 * 6. Update message recipient if provided
 * 7. Update message content if provided
 * 8. Save updated message to repository
 * 9. Return message response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - IMessageRepository: Message data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';
import { UpdateMessageDto } from '@application/dtos/message/UpdateMessageDto.js';
import { MessageResponseDto, createMessageResponseDto } from '@application/dtos/message/MessageResponseDto.js';

export class UpdateMessageUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  /**
   * Executes the update message use case
   * @param userId User ID (from authenticated session)
   * @param dto Message update data
   * @returns Result with MessageResponseDto or error
   */
  async execute(userId: string, dto: UpdateMessageDto): Promise<Result<MessageResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<MessageResponseDto>('User ID is required');
    }

    // Step 2: Find message by ID
    const messageResult = await this.messageRepository.findById(dto.messageId);
    if (messageResult.isFailure) {
      return Result.fail<MessageResponseDto>(messageResult.error as string);
    }

    const messageEntity = messageResult.value;
    if (!messageEntity) {
      return Result.fail<MessageResponseDto>('Message not found');
    }

    // Step 3: Find switch and verify ownership
    const switchResult = await this.switchRepository.findById(messageEntity.switchId);
    if (switchResult.isFailure) {
      return Result.fail<MessageResponseDto>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<MessageResponseDto>('Switch not found');
    }

    if (switchEntity.userId !== userId) {
      return Result.fail<MessageResponseDto>('Unauthorized: You do not own this message');
    }

    // Step 4: Check if message is deleted
    if (messageEntity.isDeleted()) {
      return Result.fail<MessageResponseDto>('Cannot update a deleted message');
    }

    // Step 5: Check if message has been sent
    if (messageEntity.isSent) {
      return Result.fail<MessageResponseDto>('Cannot update a message that has already been sent');
    }

    // Step 6: Update recipient if provided
    if (dto.recipientEmail !== undefined || dto.recipientName !== undefined) {
      let recipientEmail = messageEntity.recipientEmail;

      if (dto.recipientEmail !== undefined) {
        const emailOrError = Email.create(dto.recipientEmail);
        if (emailOrError.isFailure) {
          return Result.fail<MessageResponseDto>(emailOrError.error as string);
        }
        recipientEmail = emailOrError.value;
      }

      const updateRecipientResult = messageEntity.updateRecipient(
        dto.recipientEmail !== undefined ? recipientEmail : undefined,
        dto.recipientName
      );

      if (updateRecipientResult.isFailure) {
        return Result.fail<MessageResponseDto>(updateRecipientResult.error as string);
      }
    }

    // Step 7: Update content if provided
    if (dto.encryptedContent !== undefined || dto.subject !== undefined) {
      const updateContentResult = messageEntity.updateContent(dto.encryptedContent, dto.subject);

      if (updateContentResult.isFailure) {
        return Result.fail<MessageResponseDto>(updateContentResult.error as string);
      }
    }

    // Step 8: Save updated message to repository
    const saveResult = await this.messageRepository.update(messageEntity);
    if (saveResult.isFailure) {
      return Result.fail<MessageResponseDto>(saveResult.error as string);
    }
    const updatedMessage = saveResult.value;

    // Step 9: Create and return response DTO
    const responseDto: MessageResponseDto = createMessageResponseDto({
      id: updatedMessage.id,
      switchId: updatedMessage.switchId,
      recipientEmail: updatedMessage.recipientEmail.getValue(),
      recipientName: updatedMessage.recipientName,
      subject: updatedMessage.subject,
      encryptedContent: updatedMessage.encryptedContent,
      isSent: updatedMessage.isSent,
      sentAt: updatedMessage.sentAt,
      deliveryAttempts: updatedMessage.deliveryAttempts,
      lastAttemptAt: updatedMessage.lastAttemptAt,
      failureReason: updatedMessage.failureReason,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
    });

    return Result.ok<MessageResponseDto>(responseDto);
  }
}
