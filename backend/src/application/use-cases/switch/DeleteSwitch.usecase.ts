/**
 * Delete Switch Use Case
 *
 * Business logic for deleting (soft delete) a dead man's switch.
 *
 * Workflow:
 * 1. Validate input DTO
 * 2. Find switch by ID
 * 3. Verify ownership (switch belongs to user)
 * 4. Soft delete the switch (sets deletedAt timestamp)
 * 5. Update switch in repository
 * 6. Return success result
 *
 * Dependencies:
 * - ISwitchRepository: Switch data access
 *
 * Note: This performs a soft delete, not a permanent deletion.
 * The switch remains in the database with a deletedAt timestamp.
 */

import { ISwitchRepository } from '@domain/repositories/ISwitchRepository.js';
import { Result } from '@shared/types/Result.js';
import { DeleteSwitchDto } from '@application/dtos/switch/DeleteSwitchDto.js';

export class DeleteSwitchUseCase {
  constructor(private readonly switchRepository: ISwitchRepository) {}

  /**
   * Executes the delete switch use case
   * @param userId User ID (from authenticated session)
   * @param dto Switch deletion data
   * @returns Result with success message or error
   */
  async execute(userId: string, dto: DeleteSwitchDto): Promise<Result<{ message: string }>> {
    // Step 1: Validate userId
    if (!userId || userId.trim().length === 0) {
      return Result.fail<{ message: string }>('User ID is required');
    }

    // Step 2: Find switch by ID
    const switchResult = await this.switchRepository.findById(dto.switchId);
    if (switchResult.isFailure) {
      return Result.fail<{ message: string }>(switchResult.error as string);
    }

    const switchEntity = switchResult.value;
    if (!switchEntity) {
      return Result.fail<{ message: string }>('Switch not found');
    }

    // Step 3: Verify ownership
    if (switchEntity.userId !== userId) {
      return Result.fail<{ message: string }>('Unauthorized: You do not own this switch');
    }

    // Step 4: Check if already deleted
    if (switchEntity.isDeleted()) {
      return Result.fail<{ message: string }>('Switch is already deleted');
    }

    // Step 5: Soft delete the switch
    switchEntity.delete();

    // Step 6: Update switch in repository
    const updateResult = await this.switchRepository.update(switchEntity);
    if (updateResult.isFailure) {
      return Result.fail<{ message: string }>(updateResult.error as string);
    }

    // Step 7: Return success message
    return Result.ok<{ message: string }>({
      message: 'Switch deleted successfully',
    });
  }
}
