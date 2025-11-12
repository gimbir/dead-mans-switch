/**
 * Enable Two-Factor Authentication Use Case
 *
 * Business logic for enabling 2FA for a user.
 *
 * Workflow:
 * 1. Validate user exists and is authenticated
 * 2. Check if 2FA is already enabled
 * 3. Generate TOTP secret and QR code
 * 4. Generate backup codes
 * 5. Hash backup codes for storage
 * 6. Encrypt TOTP secret
 * 7. Return secret, QR code, and backup codes (don't save yet)
 *
 * Note: The secret is not saved until user verifies a token (Verify2FA use case)
 *
 * Dependencies:
 * - IUserRepository: User data access
 * - ITwoFactorService: 2FA operations
 * - IEncryptionService: Encrypt TOTP secret
 */

import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { ITwoFactorService } from '@domain/services/ITwoFactorService.js';
import { IEncryptionService } from '@domain/services/IEncryptionService.js';
import { Result } from '@shared/types/Result.js';

export interface Enable2FARequest {
  userId: string;
}

export interface Enable2FAResponse {
  secret: string; // Encrypted, for temporary storage
  qrCodeDataUrl: string;
  backupCodes: string[]; // Plain text, to show user once
}

export class Enable2FAUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService,
    private readonly encryptionService: IEncryptionService
  ) {}

  /**
   * Execute enable 2FA use case
   * @param request User ID
   * @returns TOTP secret, QR code, and backup codes
   */
  async execute(request: Enable2FARequest): Promise<Result<Enable2FAResponse>> {
    // Step 1: Find user
    const userResult = await this.userRepository.findById(request.userId);
    if (userResult.isFailure) {
      return Result.fail<Enable2FAResponse>('User not found');
    }

    const user = userResult.value;
    if (!user) {
      return Result.fail<Enable2FAResponse>('User not found');
    }

    // Step 2: Check if user is deleted
    if (user.isDeleted()) {
      return Result.fail<Enable2FAResponse>('Account has been deleted');
    }

    // Step 3: Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      return Result.fail<Enable2FAResponse>('Two-factor authentication is already enabled');
    }

    // Step 4: Generate TOTP secret and QR code
    const secretData = await this.twoFactorService.generateSecret(user.email.getValue());

    // Step 5: Encrypt the secret for temporary storage
    // (Will be saved to DB after user verifies a token)
    const encryptedSecretResult = await this.encryptionService.encrypt(secretData.secret);

    if (encryptedSecretResult.isFailure) {
      return Result.fail<Enable2FAResponse>('Failed to encrypt 2FA secret');
    }

    const encrypted = encryptedSecretResult.value;

    // Step 6: Return data for frontend
    // Frontend will store this temporarily and send back during verification
    // We return all encryption params so they can be passed back for verification
    return Result.ok<Enable2FAResponse>({
      secret: JSON.stringify({
        encryptedContent: encrypted.encryptedContent,
        encryptionKey: encrypted.encryptionKey,
        iv: encrypted.iv,
        algorithm: encrypted.algorithm,
      }), // JSON-encoded encryption params
      qrCodeDataUrl: secretData.qrCodeDataUrl,
      backupCodes: secretData.backupCodes, // Plain text (show once!)
    });
  }
}
