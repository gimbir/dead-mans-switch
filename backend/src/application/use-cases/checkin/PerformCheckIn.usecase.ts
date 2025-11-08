/**
 * Perform Check-In Use Case
 *
 * Business logic for performing a check-in on a dead man's switch.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Check if switch allows check-ins (not triggered/deleted)
 * 5. Create CheckIn entity
 * 6. Perform check-in on switch (updates lastCheckIn, nextCheckInDue)
 * 7. Save both check-in and updated switch
 * 8. Return check-in response DTO
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - ICheckInRepository: CheckIn data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { ICheckInRepository } from '@domain/repositories/ICheckInRepository.js';
import { CheckIn } from '@domain/entities/CheckIn.entity.js';
import { Result } from '@shared/types/Result.js';
import { PerformCheckInDto } from '@application/dtos/checkin/PerformCheckInDto.js';
import { CheckInResponseDto, createCheckInResponseDto } from '@application/dtos/checkin/CheckInResponseDto.js';

export class PerformCheckInUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly checkInRepository: ICheckInRepository
  ) {}

  /**
   * Executes the perform check-in use case
   * @param userId User ID (from authenticated session)
   * @param dto Check-in data
   * @returns Result with CheckInResponseDto or error
   */
  async execute(userId: string, dto: PerformCheckInDto): Promise<Result<CheckInResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<CheckInResponseDto>('User ID is required');
    }

    // Step 2: Find switch by ID
    const switchResult = await this.switchRepository.findById(dto.switchId);
    if (switchResult.isFailure) {
      return Result.fail<CheckInResponseDto>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<CheckInResponseDto>('Switch not found');
    }

    // Step 3: Verify ownership
    if (switchEntity.userId !== userId) {
      return Result.fail<CheckInResponseDto>('Unauthorized: You do not own this switch');
    }

    // Step 4: Check if switch is deleted
    if (switchEntity.isDeleted()) {
      return Result.fail<CheckInResponseDto>('Cannot check in to a deleted switch');
    }

    // Step 5: Check if switch can be checked in
    if (!switchEntity.canCheckIn()) {
      return Result.fail<CheckInResponseDto>(
        'Cannot check in: Switch is triggered or in an invalid state'
      );
    }

    // Step 6: Create CheckIn entity
    const checkInOrError = CheckIn.create({
      switchId: dto.switchId,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      notes: dto.notes,
    });

    if (checkInOrError.isFailure) {
      return Result.fail<CheckInResponseDto>(checkInOrError.error as string);
    }
    const checkInEntity = checkInOrError.value;

    // Step 7: Perform check-in on switch (updates lastCheckIn and nextCheckInDue)
    const checkInResult = switchEntity.checkIn();
    if (checkInResult.isFailure) {
      return Result.fail<CheckInResponseDto>(checkInResult.error as string);
    }

    // Step 8: Save check-in to repository
    const saveCheckInResult = await this.checkInRepository.save(checkInEntity);
    if (saveCheckInResult.isFailure) {
      return Result.fail<CheckInResponseDto>(saveCheckInResult.error as string);
    }
    const savedCheckIn = saveCheckInResult.value;

    // Step 9: Update switch with new check-in time
    const updateSwitchResult = await this.switchRepository.update(switchEntity);
    if (updateSwitchResult.isFailure) {
      // Log error but don't fail - check-in was recorded
      console.error('Failed to update switch after check-in:', updateSwitchResult.error);
      // In production, this should trigger a retry mechanism or alert
    }

    // Step 10: Create and return response DTO
    const responseDto: CheckInResponseDto = createCheckInResponseDto({
      id: savedCheckIn.id,
      switchId: savedCheckIn.switchId,
      timestamp: savedCheckIn.timestamp,
      ipAddress: savedCheckIn.ipAddress ?? undefined,
      userAgent: savedCheckIn.userAgent ?? undefined,
      location: savedCheckIn.location ?? undefined,
      notes: savedCheckIn.notes ?? undefined,
      createdAt: savedCheckIn.createdAt,
    });

    return Result.ok<CheckInResponseDto>(responseDto);
  }
}
