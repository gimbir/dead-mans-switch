/**
 * Verify Two-Factor Authentication Use Case
 *
 * Business logic for verifying and completing 2FA setup.
 *
 * Workflow:
 * 1. Validate user exists
 * 2. Decrypt the temporary TOTP secret
 * 3. Verify the token provided by user
 * 4. If valid, save encrypted secret to database
 * 5. Hash and save backup codes
 * 6. Enable 2FA for the user
 * 7. Return success
 *
 * This completes the 2FA setup process after Enable2FA.
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - ITwoFactorService: 2FA token verification
 * - IEncryptionService: Encrypt TOTP secret
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { ITwoFactorService } from '@domain/services/ITwoFactorService.js';
import { IEncryptionService } from '@domain/services/IEncryptionService.js';
import { Result } from '@shared/types/Result.js';

export interface Verify2FARequest {
  userId: string;
  token: string; // 6-digit TOTP code
  encryptedSecret: string; // Encrypted secret from Enable2FA
  backupCodes: string[]; // Plain text backup codes from Enable2FA
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
}

export class Verify2FAUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService,
    private readonly encryptionService: IEncryptionService
  ) {}

  /**
   * Execute verify 2FA use case
   * @param request User ID, token, secret, and backup codes
   * @returns Success or failure
   */
  async execute(request: Verify2FARequest): Promise<Result<Verify2FAResponse>> {
    // Step 1: Find user
    const userResult = await this.userRepository.findById(request.userId);
    if (userResult.isFailure) {
      return Result.fail<Verify2FAResponse>('User not found');
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<Verify2FAResponse>('User not found');
    }

    // Step 2: Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<Verify2FAResponse>('Account has been deleted');
    }

    // Step 3: Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return Result.fail<Verify2FAResponse>('Two-factor authentication is already enabled');
    }

    // Step 4: Decrypt the secret
    let decryptParams;
    try {
      decryptParams = JSON.parse(request.encryptedSecret);
    } catch {
      return Result.fail<Verify2FAResponse>('Invalid secret format');
    }

    const decryptedSecretResult = await this.encryptionService.decrypt(decryptParams);

    if (decryptedSecretResult.isFailure) {
      return Result.fail<Verify2FAResponse>('Invalid secret provided');
    }

    const decryptedSecret = decryptedSecretResult.value;

    // Step 5: Verify the token
    const verification = await this.twoFactorService.verifyToken(
      decryptedSecret,
      request.token
    );

    if (!verification.isValid) {
      return Result.fail<Verify2FAResponse>('Invalid verification code. Please try again.');
    }

    // Step 6: Hash backup codes
    const hashedBackupCodes = await this.twoFactorService.hashBackupCodes(
      request.backupCodes
    );

    // Step 7: Encrypt secret for database storage
    const encryptedForStorageResult = await this.encryptionService.encrypt(decryptedSecret);

    if (encryptedForStorageResult.isFailure) {
      return Result.fail<Verify2FAResponse>('Failed to store 2FA secret');
    }

    const encrypted = encryptedForStorageResult.value;

    // Step 8: Update user with 2FA data
    // Store as JSON so we can decrypt later
    const secretJson = JSON.stringify({
      encryptedContent: encrypted.encryptedContent,
      encryptionKey: encrypted.encryptionKey,
      iv: encrypted.iv,
      algorithm: encrypted.algorithm,
    });

    // Use atomic enable2FA method to prevent multiple version increments
    user.enable2FA(secretJson, hashedBackupCodes);

    // Step 9: Save user
    const updateResult = await this.userRepository.update(user);
    if (updateResult.isFailure) {
      return Result.fail<Verify2FAResponse>('Failed to enable 2FA. Please try again.');
    }

    return Result.ok<Verify2FAResponse>({
      success: true,
      message: 'Two-factor authentication enabled successfully',
    });
  }
}
