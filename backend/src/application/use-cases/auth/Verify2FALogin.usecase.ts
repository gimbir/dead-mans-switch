/**
 * Verify 2FA Login Use Case
 *
 * Business logic for verifying 2FA token during login.
 *
 * Workflow:
 * 1. Find user by ID
 * 2. Check if 2FA is enabled
 * 3. Decrypt TOTP secret
 * 4. Verify token or backup code
 * 5. If backup code used, remove it from list
 * 6. Return JWT tokens on success
 *
 * This is called after initial email/password authentication succeeds.
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - ITwoFactorService: Token verification
 * - IEncryptionService: Decrypt TOTP secret
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { ITwoFactorService } from '@domain/services/ITwoFactorService.js';
import { IEncryptionService } from '@domain/services/IEncryptionService.js';
import { Result } from '@shared/types/Result.js';
import { JwtUtil } from '@shared/utils/jwt.util.js';

export interface Verify2FALoginRequest {
  userId: string;
  token: string; // 6-digit TOTP or backup code
}

export interface Verify2FALoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: Date;
  };
}

export class Verify2FALoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService,
    private readonly encryptionService: IEncryptionService
  ) {}

  /**
   * Execute 2FA login verification
   * @param request User ID and 2FA token
   * @returns JWT tokens or error
   */
  async execute(
    request: Verify2FALoginRequest
  ): Promise<Result<Verify2FALoginResponse>> {
    // Step 1: Find user
    const userResult = await this.userRepository.findById(request.userId);
    if (userResult.isFailure) {
      return Result.fail<Verify2FALoginResponse>('User not found');
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<Verify2FALoginResponse>('User not found');
    }

    // Step 2: Check if 2FA is enabled
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return Result.fail<Verify2FALoginResponse>('2FA is not enabled for this account');
    }

    // Step 3: Decrypt TOTP secret
    let decryptParams;
    try {
      decryptParams = JSON.parse(user.twoFactorSecret);
    } catch {
      return Result.fail<Verify2FALoginResponse>('Invalid 2FA configuration');
    }

    const decryptedSecretResult = await this.encryptionService.decrypt(decryptParams);

    if (decryptedSecretResult.isFailure) {
      return Result.fail<Verify2FALoginResponse>('Failed to verify 2FA token');
    }

    const decryptedSecret = decryptedSecretResult.value;

    // Step 4: Verify token
    const verification = await this.twoFactorService.verifyToken(
      decryptedSecret,
      request.token,
      user.twoFactorBackupCodes
    );

    if (!verification.isValid) {
      return Result.fail<Verify2FALoginResponse>(
        'Invalid 2FA token. Please try again.'
      );
    }

    // Step 5: If backup code was used, remove it
    if (verification.usedBackupCode && user.twoFactorBackupCodes) {
      const backupCodeIndex = await this.twoFactorService.verifyBackupCode(
        request.token,
        user.twoFactorBackupCodes
      );

      if (backupCodeIndex !== -1) {
        // Remove used backup code
        user.twoFactorBackupCodes.splice(backupCodeIndex, 1);
        user.lastBackupCodeUsedAt = new Date();

        // Save updated user
        await this.userRepository.update(user);
      }
    }

    // Step 6: Generate JWT tokens using JwtUtil
    const accessToken = JwtUtil.generateAccessToken({
      userId: user.id,
      email: user.email.getValue(),
      isVerified: user.isVerified,
    });

    const refreshToken = JwtUtil.generateRefreshToken({
      userId: user.id,
      tokenVersion: 1, // Default version
    });

    // Update user's refresh token
    const setTokenResult = user.setRefreshToken(refreshToken);
    if (setTokenResult.isFailure) {
      return Result.fail<Verify2FALoginResponse>('Failed to update refresh token');
    }

    await this.userRepository.update(user);

    // Step 7: Return tokens and user data
    return Result.ok<Verify2FALoginResponse>({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt,
      },
    });
  }
}
