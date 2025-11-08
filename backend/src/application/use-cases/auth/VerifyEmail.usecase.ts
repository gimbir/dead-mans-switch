/**
 * Verify Email Use Case
 *
 * Business logic for email verification.
 *
 * Workflow:
 * 1. Validate input (DTO validation)
 * 2. Find user by verification token
 * 3. Check if user exists
 * 4. Check if already verified
 * 5. Check if user is deleted
 * 6. Verify the user (set isVerified = true)
 * 7. Clear verification token
 * 8. Save updated user
 * 9. Return success message
 *
 * Dependencies:
 * - IUserRepository: User data access
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { Result } from '@shared/types/Result.js';
import { VerifyEmailDto } from '@application/dtos/auth/index.js';

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Executes the verify email use case
   * @param dto Verification token data
   * @returns Result with success message or error
   */
  async execute(dto: VerifyEmailDto): Promise<Result<string>> {
    // Step 1: Check if token exists in cache
    const cacheKey = `email-verification:${dto.token}`;
    const cachedDataResult = await this.cacheService.get<{ userId: string; email: string }>(cacheKey);

    if (cachedDataResult.isFailure || !cachedDataResult.value) {
      return Result.fail<string>('Invalid or expired verification token');
    }

    const cachedData = cachedDataResult.value;

    // Step 2: Find user by verification token
    const userResult = await this.userRepository.findByVerificationToken(dto.token);
    if (userResult.isFailure) {
      return Result.fail<string>(userResult.error as string);
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<string>('Invalid or expired verification token');
    }

    // Verify user ID matches cached data
    if (user.id !== cachedData.userId) {
      return Result.fail<string>('Invalid verification token');
    }

    // Step 3: Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<string>('Account has been deleted');
    }

    // Step 4: Check if already verified
    if (user.isVerified) {
      return Result.fail<string>('Email is already verified');
    }

    // Step 5: Verify the user (this also clears the verification token)
    const verifyResult = user.verify();
    if (verifyResult.isFailure) {
      return Result.fail<string>(verifyResult.error as string);
    }

    // Step 6: Save updated user
    const updateResult = await this.userRepository.update(user);
    if (updateResult.isFailure) {
      return Result.fail<string>(updateResult.error as string);
    }

    // Step 7: Delete verification token from cache
    await this.cacheService.delete(cacheKey);

    return Result.ok<string>('Email verified successfully');
  }
}
