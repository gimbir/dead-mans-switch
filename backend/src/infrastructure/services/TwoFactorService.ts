import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import {
  ITwoFactorService,
  TwoFactorSecret,
  TwoFactorVerification,
} from '../../domain/services/ITwoFactorService.js';

/**
 * Two-Factor Authentication Service Implementation
 * Uses TOTP (Time-based One-Time Password) for 2FA
 * Compatible with Google Authenticator, Authy, 1Password, etc.
 */
export class TwoFactorService implements ITwoFactorService {
  private readonly ISSUER = process.env.TWO_FACTOR_ISSUER ?? 'deadmansswitch.com';
  private readonly BACKUP_CODE_COUNT = 10;

  /**
   * Generate a new TOTP secret and QR code
   */
  async generateSecret(userEmail: string): Promise<TwoFactorSecret> {
    // Generate cryptographically secure secret
    const secret = new Secret({ size: 20 }); // 160 bits

    // Create TOTP instance
    const totp = new TOTP({
      issuer: this.ISSUER,
      label: userEmail,
      algorithm: 'SHA1', // Standard TOTP algorithm (compatible with all authenticator apps)
      digits: 6,
      period: 30, // 30 second window
      secret: secret,
    });

    // Generate QR code
    const otpauthUrl = totp.toString();
    const qrCodeDataUrl = await this.generateQRCodeFromUrl(otpauthUrl);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret: secret.base32, // Return base32 encoded secret for storage
      qrCodeDataUrl,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token or backup code
   */
  async verifyToken(
    secretBase32: string,
    token: string,
    backupCodes?: string[]
  ): Promise<TwoFactorVerification> {
    // First, try to verify as TOTP token
    if (token.length === 6 && /^\d{6}$/.test(token)) {
      try {
        const totp = new TOTP({
          issuer: this.ISSUER,
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: Secret.fromBase32(secretBase32),
        });

        // Validate with a window of 2 (accounts for clock drift)
        // Window of 2 = checks current time ±60 seconds (2 * 30 second periods)
        const delta = totp.validate({
          token,
          window: 2, // Check current, previous 2, and next 2 time windows
        });

        if (delta !== null) {
          return { isValid: true, usedBackupCode: false };
        }
      } catch (error) {
        // Continue to try backup codes if TOTP fails
      }
    }

    // If TOTP failed and backup codes provided, try backup code
    if (backupCodes && backupCodes.length > 0) {
      const backupCodeIndex = await this.verifyBackupCode(token, backupCodes);
      if (backupCodeIndex !== -1) {
        return { isValid: true, usedBackupCode: true };
      }
    }

    return { isValid: false };
  }

  /**
   * Generate 10 random backup codes
   * Format: XXXX-XXXX-XXXX (12 characters)
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = this.generateSingleBackupCode();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Generate a single backup code
   */
  private generateSingleBackupCode(): string {
    const bytes = randomBytes(6);
    const hex = bytes.toString('hex').toUpperCase();
    // Format: XXXX-XXXX-XXXX
    return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
  }

  /**
   * Hash backup codes using bcrypt
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    const saltRounds = 10;
    const hashedCodes = await Promise.all(
      codes.map((code) => bcrypt.hash(code, saltRounds))
    );
    return hashedCodes;
  }

  /**
   * Verify backup code and return its index if found
   */
  async verifyBackupCode(
    code: string,
    hashedCodes: string[]
  ): Promise<number> {
    for (let i = 0; i < hashedCodes.length; i++) {
      const hashedCode = hashedCodes[i];
      if (!hashedCode) continue;

      const isMatch = await bcrypt.compare(code, hashedCode);
      if (isMatch) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Generate QR code from TOTP secret
   */
  async generateQRCode(secret: string, userEmail: string): Promise<string> {
    const totp = new TOTP({
      issuer: this.ISSUER,
      label: userEmail,
      algorithm: 'SHA1', // Standard TOTP algorithm (compatible with all authenticator apps)
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    });

    const otpauthUrl = totp.toString();
    return this.generateQRCodeFromUrl(otpauthUrl);
  }

  /**
   * Generate QR code data URL from otpauth URL
   */
  private async generateQRCodeFromUrl(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }
}
