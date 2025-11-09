/**
 * List Switches Use Case
 *
 * Business logic for listing user's dead man's switches with pagination.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Calculate pagination offset
 * 3. Find switches for user with pagination
 * 4. Get total count for pagination metadata
 * 5. Map switches to response DTOs
 * 6. Return paginated response
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { Switch } from '@domain/entities/Switch.entity.js';
import { Result } from '@shared/types/Result.js';
import { ListSwitchesDto } from '@application/dtos/switch/ListSwitchesDto.js';
import {
  PaginatedSwitchesResponseDto,
  SwitchResponseDto,
  createPaginatedSwitchesResponseDto,
} from '@application/dtos/switch/SwitchResponseDto.js';

export class ListSwitchesUseCase {
  constructor(private readonly switchRepository: ISwitchRepository) {}

  /**
   * Executes the list switches use case
   * @param userId User ID (from authenticated session)
   * @param dto Pagination and filter data
   * @returns Result with PaginatedSwitchesResponseDto or error
   */
  async execute(
    userId: string,
    dto: ListSwitchesDto
  ): Promise<Result<PaginatedSwitchesResponseDto>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<PaginatedSwitchesResponseDto>('User ID is required');
    }

    // Step 2: Calculate pagination offset
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const offset = (page - 1) * limit;

    // Step 3: Find switches for user
    const includeDeleted = dto.includeDeleted ?? false;
    const switchesResult = await this.switchRepository.findByUserId(userId, includeDeleted);
    if (switchesResult.isFailure) {
      return Result.fail<PaginatedSwitchesResponseDto>(switchesResult.error as string);
    }

    let switches = switchesResult.value;

    // Step 4: Apply isActive filter if provided
    if (dto.isActive !== undefined) {
      switches = switches.filter((sw) => sw.isActive === dto.isActive);
    }

    // Step 5: Get total count before pagination
    const total = switches.length;

    // Step 6: Apply pagination
    const paginatedSwitches = switches.slice(offset, offset + limit);

    // Step 7: Map to response DTOs
    const switchResponseDtos: SwitchResponseDto[] = paginatedSwitches.map((sw) =>
      this.toResponseDto(sw)
    );

    // Step 8: Create paginated response
    const response = createPaginatedSwitchesResponseDto(switchResponseDtos, page, limit, total);

    return Result.ok<PaginatedSwitchesResponseDto>(response);
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
