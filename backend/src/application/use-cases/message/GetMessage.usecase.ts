/**
 * Get Message Use Case
 *
 * Business logic for retrieving a specific message.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find message by ID
 * 3. Find switch and verify ownership
 * 4. Return message response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - IMessageRepository: Message data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { Result } from '@shared/types/Result.js';
import { GetMessageDto } from '@application/dtos/message/GetMessageDto.js';
import { MessageResponseDto, createMessageResponseDto } from '@application/dtos/message/MessageResponseDto.js';

export class GetMessageUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  /**
   * Executes the get message use case
   * @param userId User ID (from authenticated session)
   * @param dto Message retrieval data
   * @returns Result with MessageResponseDto or error
   */
  async execute(userId: string, dto: GetMessageDto): Promise<Result<MessageResponseDto>> {
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

    // Step 4: Check if message is deleted (optional - you might want to show deleted messages)
    if (messageEntity.isDeleted()) {
      return Result.fail<MessageResponseDto>('Message has been deleted');
    }

    // Step 5: Create and return response DTO
    const responseDto: MessageResponseDto = createMessageResponseDto({
      id: messageEntity.id,
      switchId: messageEntity.switchId,
      recipientEmail: messageEntity.recipientEmail.getValue(),
      recipientName: messageEntity.recipientName,
      subject: messageEntity.subject,
      encryptedContent: messageEntity.encryptedContent,
      isSent: messageEntity.isSent,
      sentAt: messageEntity.sentAt,
      deliveryAttempts: messageEntity.deliveryAttempts,
      lastAttemptAt: messageEntity.lastAttemptAt,
      failureReason: messageEntity.failureReason,
      createdAt: messageEntity.createdAt,
      updatedAt: messageEntity.updatedAt,
    });

    return Result.ok<MessageResponseDto>(responseDto);
  }
}
