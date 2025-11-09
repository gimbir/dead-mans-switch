/**
 * Get Switch Use Case
 *
 * Business logic for retrieving a specific dead man's switch.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Return switch response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { Result } from '@shared/types/Result.js';
import { GetSwitchDto } from '@application/dtos/switch/GetSwitchDto.js';
import { SwitchResponseDto } from '@application/dtos/switch/SwitchResponseDto.js';

export class GetSwitchUseCase {
  constructor(private readonly switchRepository: ISwitchRepository) {}

  /**
   * Executes the get switch use case
   * @param userId User ID (from authenticated session)
   * @param dto Switch retrieval data
   * @returns Result with SwitchResponseDto or error
   */
  async execute(userId: string, dto: GetSwitchDto): Promise<Result<SwitchResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<SwitchResponseDto>('User ID is required');
    }

    // Step 2: Find switch by ID
    const switchResult = await this.switchRepository.findById(dto.switchId);
    if (switchResult.isFailure) {
      return Result.fail<SwitchResponseDto>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<SwitchResponseDto>('Switch not found');
    }

    // Step 3: Verify ownership
    if (switchEntity.userId !== userId) {
      return Result.fail<SwitchResponseDto>('Unauthorized: You do not own this switch');
    }

    // Step 4: Check if switch is deleted (optional - you might want to show deleted switches)
    if (switchEntity.isDeleted()) {
      return Result.fail<SwitchResponseDto>('Switch has been deleted');
    }

    // Step 5: Create and return response DTO
    const responseDto: SwitchResponseDto = this.toResponseDto(switchEntity);

    return Result.ok<SwitchResponseDto>(responseDto);
  }

  /**
   * Maps Switch entity to SwitchResponseDto
   * @param switchEntity Switch domain entity
   * @returns SwitchResponseDto
   */
  private toResponseDto(switchEntity: any): SwitchResponseDto {
    return {
      id: switchEntity.id,
      userId: switchEntity.userId,
      name: switchEntity.name,
      description: switchEntity.description ?? undefined,
      checkInIntervalDays: switchEntity.checkInInterval.toDays(),
      gracePeriodDays: switchEntity.gracePeriod.toDays(),
      isActive: switchEntity.isActive,
      status: switchEntity.status as any,
      lastCheckInAt: switchEntity.lastCheckIn ?? undefined,
      nextCheckInDue: switchEntity.nextCheckInDue ?? undefined,
      createdAt: switchEntity.createdAt,
      updatedAt: switchEntity.updatedAt,
    };
  }
}
