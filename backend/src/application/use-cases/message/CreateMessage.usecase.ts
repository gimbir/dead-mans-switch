/**
 * Create Message Use Case
 *
 * Business logic for creating a new message for a switch.
 * Messages are encrypted and will be delivered when the switch triggers.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Check if switch allows message creation (not triggered/deleted)
 * 5. Create Email value object
 * 6. Create Message entity
 * 7. Save to repository
 * 8. Return message response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - IMessageRepository: Message data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { Message } from '@domain/entities/Message.entity.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';
import { CreateMessageDto } from '@application/dtos/message/CreateMessageDto.js';
import { MessageResponseDto, createMessageResponseDto } from '@application/dtos/message/MessageResponseDto.js';

export class CreateMessageUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  /**
   * Executes the create message use case
   * @param userId User ID (from authenticated session)
   * @param dto Message creation data
   * @returns Result with MessageResponseDto or error
   */
  async execute(userId: string, dto: CreateMessageDto): Promise<Result<MessageResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<MessageResponseDto>('User ID is required');
    }

    // Step 2: Find switch by ID
    const switchResult = await this.switchRepository.findById(dto.switchId);
    if (switchResult.isFailure) {
      return Result.fail<MessageResponseDto>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<MessageResponseDto>('Switch not found');
    }

    // Step 3: Verify ownership
    if (switchEntity.userId !== userId) {
      return Result.fail<MessageResponseDto>('Unauthorized: You do not own this switch');
    }

    // Step 4: Check if switch is deleted
    if (switchEntity.isDeleted()) {
      return Result.fail<MessageResponseDto>('Cannot add message to a deleted switch');
    }

    // Step 5: Check if switch is triggered (optional - allow adding messages even after trigger)
    // Note: In some implementations, you might want to prevent adding messages after trigger
    // if (switchEntity.status === SwitchStatus.TRIGGERED) {
    //   return Result.fail<MessageResponseDto>('Cannot add message to a triggered switch');
    // }

    // Step 6: Create Email value object
    const emailOrError = Email.create(dto.recipientEmail);
    if (emailOrError.isFailure) {
      return Result.fail<MessageResponseDto>(emailOrError.error as string);
    }
    const recipientEmail = emailOrError.value;

    // Step 7: Create Message entity
    const messageOrError = Message.create({
      switchId: dto.switchId,
      recipientEmail,
      recipientName: dto.recipientName,
      subject: dto.subject,
      encryptedContent: dto.encryptedContent,
    });

    if (messageOrError.isFailure) {
      return Result.fail<MessageResponseDto>(messageOrError.error as string);
    }
    const messageEntity = messageOrError.value;

    // Step 8: Save to repository
    const saveResult = await this.messageRepository.save(messageEntity);
    if (saveResult.isFailure) {
      return Result.fail<MessageResponseDto>(saveResult.error as string);
    }
    const savedMessage = saveResult.value;

    // Step 9: Create and return response DTO
    const responseDto: MessageResponseDto = createMessageResponseDto({
      id: savedMessage.id,
      switchId: savedMessage.switchId,
      recipientEmail: savedMessage.recipientEmail.getValue(),
      recipientName: savedMessage.recipientName,
      subject: savedMessage.subject,
      encryptedContent: savedMessage.encryptedContent,
      isSent: savedMessage.isSent,
      sentAt: savedMessage.sentAt,
      deliveryAttempts: savedMessage.deliveryAttempts,
      lastAttemptAt: savedMessage.lastAttemptAt,
      failureReason: savedMessage.failureReason,
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
    });

    return Result.ok<MessageResponseDto>(responseDto);
  }
}
