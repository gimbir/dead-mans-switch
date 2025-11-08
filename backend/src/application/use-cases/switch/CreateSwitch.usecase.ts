/**
 * Create Switch Use Case
 *
 * Business logic for creating a new dead man's switch.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Check if user has reached switch limit (optional)
 * 3. Create TimeInterval value objects
 * 4. Create Switch entity
 * 5. Save to repository
 * 6. Return switch response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { Switch } from '@domain/entities/Switch.entity.js';
import { TimeInterval } from '@domain/value-objects/TimeInterval.vo.js';
import { Result } from '@shared/types/Result.js';
import { CreateSwitchDto } from '@application/dtos/switch/CreateSwitchDto.js';
import { SwitchResponseDto } from '@application/dtos/switch/SwitchResponseDto.js';

export class CreateSwitchUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly maxSwitchesPerUser: number = 10 // Configurable limit
  ) {}

  /**
   * Executes the create switch use case
   * @param userId User ID (from authenticated session)
   * @param dto Switch creation data
   * @returns Result with SwitchResponseDto or error
   */
  async execute(userId: string, dto: CreateSwitchDto): Promise<Result<SwitchResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<SwitchResponseDto>('User ID is required');
    }

    // Step 2: Check if user has reached switch limit
    const hasReachedLimit = await this.switchRepository.hasReachedLimit(
      userId,
      this.maxSwitchesPerUser
    );

    if (hasReachedLimit) {
      return Result.fail<SwitchResponseDto>(
        `You have reached the maximum limit of ${this.maxSwitchesPerUser} switches`
      );
    }

    // Step 3: Create TimeInterval value objects
    const checkInIntervalOrError = TimeInterval.create(dto.checkInIntervalDays);
    if (checkInIntervalOrError.isFailure) {
      return Result.fail<SwitchResponseDto>(checkInIntervalOrError.error as string);
    }
    const checkInInterval = checkInIntervalOrError.value;

    const gracePeriodOrError = TimeInterval.create(dto.gracePeriodDays);
    if (gracePeriodOrError.isFailure) {
      return Result.fail<SwitchResponseDto>(gracePeriodOrError.error as string);
    }
    const gracePeriod = gracePeriodOrError.value;

    // Step 4: Create Switch entity
    const switchOrError = Switch.create({
      userId,
      name: dto.name,
      description: dto.description,
      checkInInterval,
      gracePeriod,
    });

    if (switchOrError.isFailure) {
      return Result.fail<SwitchResponseDto>(switchOrError.error as string);
    }
    const switchEntity = switchOrError.value;

    // Step 5: Save to repository
    const saveResult = await this.switchRepository.save(switchEntity);
    if (saveResult.isFailure) {
      return Result.fail<SwitchResponseDto>(saveResult.error as string);
    }
    const savedSwitch = saveResult.value;

    // Step 6: Create and return response DTO
    const responseDto: SwitchResponseDto = this.toResponseDto(savedSwitch);

    return Result.ok<SwitchResponseDto>(responseDto);
  }

  /**
   * Maps Switch entity to SwitchResponseDto
   * @param switchEntity Switch domain entity
   * @returns SwitchResponseDto
   */
  private toResponseDto(switchEntity: Switch): SwitchResponseDto {
    return {
      id: switchEntity.id,
      userId: switchEntity.userId,
      name: switchEntity.name,
      description: switchEntity.description ?? undefined,
      checkInInterval: switchEntity.checkInInterval.toHours(),
      gracePeriod: switchEntity.gracePeriod.toHours(),
      isActive: switchEntity.isActive,
      status: switchEntity.status as any, // Map domain status to DTO status
      lastCheckInAt: switchEntity.lastCheckIn ?? undefined,
      nextCheckInDue: switchEntity.nextCheckInDue ?? undefined,
      createdAt: switchEntity.createdAt,
      updatedAt: switchEntity.updatedAt,
    };
  }
}
