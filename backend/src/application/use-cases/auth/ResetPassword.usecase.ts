/**
 * Reset Password Use Case
 *
 * Business logic for password reset (after forgot password).
 *
 * Workflow:
 * 1. Validate input (DTO validation)
 * 2. Find user by reset token
 * 3. Check if user exists
 * 4. Check if token is expired
 * 5. Check if user is deleted
 * 6. Validate new password
 * 7. Hash new password
 * 8. Update user password
 * 9. Clear reset token and expiry
 * 10. Invalidate all refresh tokens (force re-login)
 * 11. Save updated user
 * 12. Return success message
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - IHashingService: Password hashing
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { IHashingService } from '@domain/services/IHashingService.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { Password } from '@domain/value-objects/Password.vo.js';
import { Result } from '@shared/types/Result.js';
import { ResetPasswordDto } from '@application/dtos/auth/index.js';

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashingService: IHashingService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Executes the reset password use case
   * @param dto Reset token and new password data
   * @returns Result with success message or error
   */
  async execute(dto: ResetPasswordDto): Promise<Result<string>> {
    // Step 1: Check if token exists in cache
    const cacheKey = `password-reset:${dto.token}`;
    const cachedDataResult = await this.cacheService.get<{ userId: string; email: string }>(cacheKey);

    if (cachedDataResult.isFailure || !cachedDataResult.value) {
      return Result.fail<string>('Invalid or expired reset token');
    }

    const cachedData = cachedDataResult.value;

    // Step 2: Find user by reset token
    const userResult = await this.userRepository.findByPasswordResetToken(dto.token);
    if (userResult.isFailure) {
      return Result.fail<string>(userResult.error as string);
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<string>('Invalid or expired reset token');
    }

    // Verify user ID matches cached data
    if (user.id !== cachedData.userId) {
      return Result.fail<string>('Invalid reset token');
    }

    // Step 3: Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<string>('Account has been deleted');
    }

    // Step 4: Check if reset token is expired
    if (!user.passwordResetExpiry) {
      return Result.fail<string>('Invalid or expired reset token');
    }

    const now = new Date();
    if (user.passwordResetExpiry < now) {
      return Result.fail<string>('Reset token has expired');
    }

    // Step 5: Validate new password
    const passwordOrError = Password.create(dto.newPassword, true); // requireStrong = true
    if (passwordOrError.isFailure) {
      return Result.fail<string>(passwordOrError.error as string);
    }
    const password = passwordOrError.value;

    // Step 6: Hash new password
    const hashedPasswordResult = await this.hashingService.hashPassword(password);
    if (hashedPasswordResult.isFailure) {
      return Result.fail<string>(hashedPasswordResult.error as string);
    }
    const hashedPassword = hashedPasswordResult.value;

    // Step 7: Update user password
    const updatePasswordResult = user.updatePassword(hashedPassword);
    if (updatePasswordResult.isFailure) {
      return Result.fail<string>(updatePasswordResult.error as string);
    }

    // Step 8: Clear reset token and expiry for security
    user.clearPasswordResetToken();

    // Step 9: Invalidate refresh token (force re-login for security)
    user.setRefreshToken(null);

    // Step 10: Save updated user
    const updateResult = await this.userRepository.update(user);
    if (updateResult.isFailure) {
      return Result.fail<string>(updateResult.error as string);
    }

    // Step 11: Delete reset token from cache
    await this.cacheService.delete(cacheKey);

    return Result.ok<string>('Password has been reset successfully');
  }
}
