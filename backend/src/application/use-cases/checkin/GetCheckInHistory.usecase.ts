/**
 * Get Check-In History Use Case
 *
 * Business logic for retrieving check-in history for a switch.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Calculate pagination offset
 * 5. Fetch check-ins for switch with pagination
 * 6. Get total count for pagination metadata
 * 7. Map check-ins to response DTOs
 * 8. Return paginated response
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 * - ICheckInRepository: CheckIn data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { ICheckInRepository } from '@domain/repositories/ICheckInRepository.js';
import { CheckIn } from '@domain/entities/CheckIn.entity.js';
import { Result } from '@shared/types/Result.js';
import { GetCheckInHistoryDto } from '@application/dtos/checkin/GetCheckInHistoryDto.js';
import {
  PaginatedCheckInsResponseDto,
  CheckInResponseDto,
  createCheckInResponseDto,
  createPaginatedCheckInsResponseDto,
} from '@application/dtos/checkin/CheckInResponseDto.js';

export class GetCheckInHistoryUseCase {
  constructor(
    private readonly switchRepository: ISwitchRepository,
    private readonly checkInRepository: ICheckInRepository
  ) {}

  /**
   * Executes the get check-in history use case
   * @param userId User ID (from authenticated session)
   * @param dto Check-in history query data
   * @returns Result with PaginatedCheckInsResponseDto or error
   */
  async execute(
    userId: string,
    dto: GetCheckInHistoryDto
  ): Promise<Result<PaginatedCheckInsResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<PaginatedCheckInsResponseDto>('User ID is required');
    }

    // Step 2: Find switch by ID
    const switchResult = await this.switchRepository.findById(dto.switchId);
    if (switchResult.isFailure) {
      return Result.fail<PaginatedCheckInsResponseDto>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<PaginatedCheckInsResponseDto>('Switch not found');
    }

    // Step 3: Verify ownership
    if (switchEntity.userId !== userId) {
      return Result.fail<PaginatedCheckInsResponseDto>(
        'Unauthorized: You do not own this switch'
      );
    }

    // Step 4: Calculate pagination offset
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;

    // Step 5: Fetch check-ins for switch
    const checkInsResult = await this.checkInRepository.findBySwitchId(dto.switchId, limit, offset);
    if (checkInsResult.isFailure) {
      return Result.fail<PaginatedCheckInsResponseDto>(checkInsResult.error as string);
    }

    const checkIns = checkInsResult.value;

    // Step 6: Get total count for pagination
    const countResult = await this.checkInRepository.countBySwitchId(dto.switchId);
    if (countResult.isFailure) {
      return Result.fail<PaginatedCheckInsResponseDto>(countResult.error as string);
    }

    const total = countResult.value;

    // Step 7: Map check-ins to response DTOs
    const checkInResponseDtos: CheckInResponseDto[] = checkIns.map((checkIn) =>
      this.toResponseDto(checkIn)
    );

    // Step 8: Create paginated response
    const response = createPaginatedCheckInsResponseDto(checkInResponseDtos, page, limit, total);

    return Result.ok<PaginatedCheckInsResponseDto>(response);
  }

  /**
   * Maps CheckIn entity to CheckInResponseDto
   * @param checkIn CheckIn domain entity
   * @returns CheckInResponseDto
   */
  private toResponseDto(checkIn: CheckIn): CheckInResponseDto {
    return createCheckInResponseDto({
      id: checkIn.id,
      switchId: checkIn.switchId,
      timestamp: checkIn.timestamp,
      ipAddress: checkIn.ipAddress ?? undefined,
      userAgent: checkIn.userAgent ?? undefined,
      location: checkIn.location ?? undefined,
      notes: checkIn.notes ?? undefined,
      createdAt: checkIn.createdAt,
    });
  }
}
