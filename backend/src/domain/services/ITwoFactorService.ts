/**
 * Two-Factor Authentication Service Interface
 * Defines contract for 2FA operations (TOTP-based)
 */

export interface TwoFactorSecret {
  secret: string;
  qrCodeDataUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: boolean;
}

export interface ITwoFactorService {
  /**
   * Generate a new TOTP secret and QR code for user setup
   * @param userEmail - User's email for labeling in authenticator app
   * @returns Secret, QR code data URL, and backup codes
   */
  generateSecret(userEmail: string): Promise<TwoFactorSecret>;

  /**
   * Verify a TOTP token or backup code
   * @param secret - The user's encrypted TOTP secret
   * @param token - The 6-digit token from authenticator app
   * @param backupCodes - Array of hashed backup codes (optional)
   * @returns Verification result
   */
  verifyToken(
    secret: string,
    token: string,
    backupCodes?: string[]
  ): Promise<TwoFactorVerification>;

  /**
   * Generate backup codes for account recovery
   * @returns Array of 10 backup codes (plain text)
   */
  generateBackupCodes(): string[];

  /**
   * Hash backup codes for secure storage
   * @param codes - Array of plain text backup codes
   * @returns Array of hashed backup codes
   */
  hashBackupCodes(codes: string[]): Promise<string[]>;

  /**
   * Verify a backup code against stored hashed codes
   * @param code - Plain text backup code from user
   * @param hashedCodes - Array of hashed backup codes from database
   * @returns Index of matched code, or -1 if no match
   */
  verifyBackupCode(code: string, hashedCodes: string[]): Promise<number>;

  /**
   * Generate QR code data URL for manual entry
   * @param secret - TOTP secret
   * @param userEmail - User's email
   * @returns Data URL for QR code image
   */
  generateQRCode(secret: string, userEmail: string): Promise<string>;
}
