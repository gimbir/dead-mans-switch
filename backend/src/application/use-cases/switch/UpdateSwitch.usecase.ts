/**
 * Update Switch Use Case
 *
 * Business logic for updating an existing dead man's switch.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find existing switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Create TimeInterval value objects if provided
 * 5. Update switch configuration
 * 6. Save updated switch to repository
 * 7. Return switch response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { TimeInterval } from '@domain/value-objects/TimeInterval.vo.js';
import { Result } from '@shared/types/Result.js';
import { UpdateSwitchDto } from '@application/dtos/switch/UpdateSwitchDto.js';
import { SwitchResponseDto } from '@application/dtos/switch/SwitchResponseDto.js';

export class UpdateSwitchUseCase {
  constructor(private readonly switchRepository: ISwitchRepository) {}

  /**
   * Executes the update switch use case
   * @param userId User ID (from authenticated session)
   * @param dto Switch update data
   * @returns Result with SwitchResponseDto or error
   */
  async execute(userId: string, dto: UpdateSwitchDto): Promise<Result<SwitchResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<SwitchResponseDto>('User ID is required');
    }

    // Step 2: Find existing switch
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

    // Step 4: Check if switch is deleted
    if (switchEntity.isDeleted()) {
      return Result.fail<SwitchResponseDto>('Cannot update a deleted switch');
    }

    // Step 5: Create TimeInterval value objects if provided
    let checkInInterval: TimeInterval | undefined;
    let gracePeriod: TimeInterval | undefined;

    if (dto.checkInIntervalDays !== undefined) {
      const checkInIntervalOrError = TimeInterval.create(dto.checkInIntervalDays);
      if (checkInIntervalOrError.isFailure) {
        return Result.fail<SwitchResponseDto>(checkInIntervalOrError.error as string);
      }
      checkInInterval = checkInIntervalOrError.value;
    }

    if (dto.gracePeriodDays !== undefined) {
      const gracePeriodOrError = TimeInterval.create(dto.gracePeriodDays);
      if (gracePeriodOrError.isFailure) {
        return Result.fail<SwitchResponseDto>(gracePeriodOrError.error as string);
      }
      gracePeriod = gracePeriodOrError.value;
    }

    // Step 6: Update switch configuration
    const updateResult = switchEntity.updateConfiguration(
      dto.name,
      dto.description,
      checkInInterval,
      gracePeriod
    );

    if (updateResult.isFailure) {
      return Result.fail<SwitchResponseDto>(updateResult.error as string);
    }

    // Step 7: Handle isActive flag (pause/activate)
    if (dto.isActive !== undefined) {
      if (dto.isActive && !switchEntity.isActive) {
        // Activate the switch
        const activateResult = switchEntity.activate();
        if (activateResult.isFailure) {
          return Result.fail<SwitchResponseDto>(activateResult.error as string);
        }
      } else if (!dto.isActive && switchEntity.isActive) {
        // Pause the switch
        const pauseResult = switchEntity.pause();
        if (pauseResult.isFailure) {
          return Result.fail<SwitchResponseDto>(pauseResult.error as string);
        }
      }
    }

    // Step 8: Save updated switch to repository
    const saveResult = await this.switchRepository.update(switchEntity);
    if (saveResult.isFailure) {
      return Result.fail<SwitchResponseDto>(saveResult.error as string);
    }
    const updatedSwitch = saveResult.value;

    // Step 9: Create and return response DTO
    const responseDto: SwitchResponseDto = this.toResponseDto(updatedSwitch);

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
      checkInInterval: switchEntity.checkInInterval.toHours(),
      gracePeriod: switchEntity.gracePeriod.toHours(),
      isActive: switchEntity.isActive,
      status: switchEntity.status as any,
      lastCheckInAt: switchEntity.lastCheckIn ?? undefined,
      nextCheckInDue: switchEntity.nextCheckInDue ?? undefined,
      createdAt: switchEntity.createdAt,
      updatedAt: switchEntity.updatedAt,
    };
  }
}
