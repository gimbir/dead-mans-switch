/**
 * List Messages Use Case
 *
 * Business logic for listing messages for a switch with pagination.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Fetch messages for switch
 * 5. Get total count for pagination
 * 6. Map messages to response DTOs
 * 7. Return paginated response
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - IMessageRepository: Message data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { IMessageRepository } from '@domain/repositories/IMessageRepository.js';
import { Message } from '@domain/entities/Message.entity.js';
import { Result } from '@shared/types/Result.js';
import { ListMessagesDto } from '@application/dtos/message/ListMessagesDto.js';
import {
  PaginatedMessagesResponseDto,
  MessageResponseDto,
  createMessageResponseDto,
  createPaginatedMessagesResponseDto,
} from '@application/dtos/message/MessageResponseDto.js';

export class ListMessagesUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  /**
   * Executes the list messages use case
   * @param userId User ID (from authenticated session)
   * @param dto Messages list query data
   * @returns Result with PaginatedMessagesResponseDto or error
   */
  async execute(
    userId: string,
    dto: ListMessagesDto
  ): Promise<Result<PaginatedMessagesResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<PaginatedMessagesResponseDto>('User ID is required');
    }

    // Step 2: Find switch by ID
    const switchResult = await this.switchRepository.findById(dto.switchId);
    if (switchResult.isFailure) {
      return Result.fail<PaginatedMessagesResponseDto>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<PaginatedMessagesResponseDto>('Switch not found');
    }

    // Step 3: Verify ownership
    if (switchEntity.userId !== userId) {
      return Result.fail<PaginatedMessagesResponseDto>(
        'Unauthorized: You do not own this switch'
      );
    }

    // Step 4: Fetch messages for switch
    const messagesResult = await this.messageRepository.findBySwitchId(
      dto.switchId,
      dto.includeDeleted
    );
    if (messagesResult.isFailure) {
      return Result.fail<PaginatedMessagesResponseDto>(messagesResult.error as string);
    }

    let messages = messagesResult.value;

    // Step 5: Apply pagination
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const total = messages.length;
    const offset = (page - 1) * limit;

    messages = messages.slice(offset, offset + limit);

    // Step 6: Map messages to response DTOs
    const messageResponseDtos: MessageResponseDto[] = messages.map((message) =>
      this.toResponseDto(message)
    );

    // Step 7: Create paginated response
    const response = createPaginatedMessagesResponseDto(messageResponseDtos, page, limit, total);

    return Result.ok<PaginatedMessagesResponseDto>(response);
  }

  /**
   * Maps Message entity to MessageResponseDto
   * @param message Message domain entity
   * @returns MessageResponseDto
   */
  private toResponseDto(message: Message): MessageResponseDto {
    return createMessageResponseDto({
      id: message.id,
      switchId: message.switchId,
      recipientEmail: message.recipientEmail.getValue(),
      recipientName: message.recipientName,
      subject: message.subject,
      encryptedContent: message.encryptedContent,
      isSent: message.isSent,
      sentAt: message.sentAt,
      deliveryAttempts: message.deliveryAttempts,
      lastAttemptAt: message.lastAttemptAt,
      failureReason: message.failureReason,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
  }
}
