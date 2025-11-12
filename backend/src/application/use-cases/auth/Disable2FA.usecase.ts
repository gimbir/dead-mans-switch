/**
 * Disable Two-Factor Authentication Use Case
 *
 * Business logic for disabling 2FA for a user.
 *
 * Workflow:
 * 1. Validate user exists
 * 2. Check if 2FA is enabled
 * 3. Verify password (security check)
 * 4. Optionally verify 2FA token or backup code
 * 5. Clear 2FA data
 * 6. Save updated user
 * 7. Return success
 *
 * Security: Requires password verification to prevent unauthorized disable
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - IHashingService: Password verification
 * - ITwoFactorService: (Optional) Token verification
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { IHashingService } from '@domain/services/IHashingService.js';
import { ITwoFactorService } from '@domain/services/ITwoFactorService.js';
import { IEncryptionService } from '@domain/services/IEncryptionService.js';
import { Result } from '@shared/types/Result.js';

export interface Disable2FARequest {
  userId: string;
  password: string; // Required for security
  token?: string; // Optional 2FA token for extra verification
}

export interface Disable2FAResponse {
  success: boolean;
  message: string;
}

export class Disable2FAUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashingService: IHashingService,
    private readonly twoFactorService: ITwoFactorService,
    private readonly encryptionService: IEncryptionService
  ) {}

  /**
   * Execute disable 2FA use case
   * @param request User ID and password
   * @returns Success or failure
   */
  async execute(request: Disable2FARequest): Promise<Result<Disable2FAResponse>> {
    // Step 1: Find user
    const userResult = await this.userRepository.findById(request.userId);
    if (userResult.isFailure) {
      return Result.fail<Disable2FAResponse>('User not found');
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<Disable2FAResponse>('User not found');
    }

    // Step 2: Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<Disable2FAResponse>('Account has been deleted');
    }

    // Step 3: Check if 2FA is currently enabled
    if (!user.twoFactorEnabled) {
      return Result.fail<Disable2FAResponse>('Two-factor authentication is not enabled');
    }

    // Step 4: Verify password (security check)
    const passwordResult = await this.hashingService.verifyPassword(
      request.password,
      user.password
    );

    if (passwordResult.isFailure || !passwordResult.value) {
      return Result.fail<Disable2FAResponse>('Invalid password');
    }

    // Step 5: (Optional) Verify 2FA token if provided
    if (request.token && user.twoFactorSecret) {
      let decryptParams;
      try {
        decryptParams = JSON.parse(user.twoFactorSecret);
      } catch {
        return Result.fail<Disable2FAResponse>('Invalid 2FA configuration');
      }

      const decryptedSecretResult = await this.encryptionService.decrypt(decryptParams);

      if (decryptedSecretResult.isSuccess) {
        const verification = await this.twoFactorService.verifyToken(
          decryptedSecretResult.value,
          request.token,
          user.twoFactorBackupCodes
        );

        if (!verification.isValid) {
          return Result.fail<Disable2FAResponse>('Invalid 2FA token');
        }
      }
    }

    // Step 6: Clear 2FA data using atomic method
    user.disable2FA();

    // Step 7: Save updated user
    const updateResult = await this.userRepository.update(user);
    if (updateResult.isFailure) {
      return Result.fail<Disable2FAResponse>('Failed to disable 2FA. Please try again.');
    }

    return Result.ok<Disable2FAResponse>({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    });
  }
}
