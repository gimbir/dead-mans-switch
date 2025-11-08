/**
 * Encryption Service Implementation
 *
 * Implements IEncryptionService using Node.js crypto module.
 * Provides AES-256-GCM encryption for message content.
 *
 * Security Features:
 * - AES-256-GCM (Authenticated Encryption)
 * - Unique IV (Initialization Vector) per encryption
 * - Random key generation using crypto.randomBytes
 * - Auth tag verification on decryption
 *
 * Usage:
 * const result = await encryptionService.encrypt('sensitive message');
 * if (result.isSuccess) {
 *   const { encryptedContent, encryptionKey, iv } = result.value;
 *   // Store these values separately
 * }
 */

import crypto from 'node:crypto';
import {
  IEncryptionService,
  EncryptionResult,
  DecryptionParams,
} from '@domain/services/IEncryptionService.js';
import { Result } from '@shared/types/Result.js';

export class EncryptionService implements IEncryptionService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32; // 256 bits
  private readonly IV_LENGTH = 16; // 128 bits
  private readonly AUTH_TAG_LENGTH = 16; // 128 bits

  /**
   * Encrypts plain text using AES-256-GCM
   */
  async encrypt(plainText: string): Promise<Result<EncryptionResult>> {
    try {
      // Validate input
      if (!plainText || plainText.trim().length === 0) {
        return Result.fail<EncryptionResult>('Plain text cannot be empty');
      }

      // Generate random encryption key and IV
      const keyResult = await this.generateKey();
      if (keyResult.isFailure) {
        return Result.fail<EncryptionResult>(keyResult.error as string);
      }

      const encryptionKey = keyResult.value;
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Convert base64 key to buffer
      const keyBuffer = Buffer.from(encryptionKey, 'base64');

      // Create cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, keyBuffer, iv);

      // Encrypt the content
      let encrypted = cipher.update(plainText, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag (GCM mode)
      const authTag = cipher.getAuthTag();

      // Combine encrypted content and auth tag
      const encryptedWithTag = encrypted + ':' + authTag.toString('base64');

      return Result.ok<EncryptionResult>({
        encryptedContent: encryptedWithTag,
        encryptionKey,
        iv: iv.toString('base64'),
        algorithm: this.ALGORITHM,
      });
    } catch (error) {
      return Result.fail<EncryptionResult>(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrypts encrypted content using AES-256-GCM
   */
  async decrypt(params: DecryptionParams): Promise<Result<string>> {
    try {
      // Validate parameters
      if (!params.encryptedContent || !params.encryptionKey || !params.iv) {
        return Result.fail<string>('Missing required decryption parameters');
      }

      // Verify algorithm matches
      if (params.algorithm !== this.ALGORITHM) {
        return Result.fail<string>(
          `Unsupported algorithm: ${params.algorithm}. Expected: ${this.ALGORITHM}`
        );
      }

      // Split encrypted content and auth tag
      const parts = params.encryptedContent.split(':');
      if (parts.length !== 2) {
        return Result.fail<string>('Invalid encrypted content format');
      }

      const encryptedData = parts[0];
      const authTagBase64 = parts[1];

      if (!encryptedData || !authTagBase64) {
        return Result.fail<string>('Invalid encrypted content format');
      }

      // Convert from base64
      const keyBuffer = Buffer.from(params.encryptionKey, 'base64');
      const ivBuffer = Buffer.from(params.iv, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');

      // Validate buffer sizes
      if (keyBuffer.length !== this.KEY_LENGTH) {
        return Result.fail<string>('Invalid encryption key length');
      }

      if (ivBuffer.length !== this.IV_LENGTH) {
        return Result.fail<string>('Invalid IV length');
      }

      if (authTag.length !== this.AUTH_TAG_LENGTH) {
        return Result.fail<string>('Invalid authentication tag length');
      }

      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, keyBuffer, ivBuffer);
      decipher.setAuthTag(authTag);

      // Decrypt the content
      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return Result.ok<string>(decrypted);
    } catch (error) {
      // Authentication tag verification failure is a common error
      if (error instanceof Error && error.message.includes('Unsupported state')) {
        return Result.fail<string>('Decryption failed: Authentication tag verification failed');
      }

      return Result.fail<string>(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generates a cryptographically secure random encryption key
   * Returns base64-encoded key
   */
  async generateKey(): Promise<Result<string>> {
    try {
      const key = crypto.randomBytes(this.KEY_LENGTH);
      return Result.ok<string>(key.toString('base64'));
    } catch (error) {
      return Result.fail<string>(
        `Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validates if encrypted content can be decrypted with given parameters
   */
  async canDecrypt(params: DecryptionParams): Promise<boolean> {
    try {
      // Basic validation
      if (!params.encryptedContent || !params.encryptionKey || !params.iv) {
        return false;
      }

      if (params.algorithm !== this.ALGORITHM) {
        return false;
      }

      // Check format
      const parts = params.encryptedContent.split(':');
      if (parts.length !== 2) {
        return false;
      }

      // Validate buffer sizes
      const keyBuffer = Buffer.from(params.encryptionKey, 'base64');
      const ivBuffer = Buffer.from(params.iv, 'base64');

      if (keyBuffer.length !== this.KEY_LENGTH) {
        return false;
      }

      if (ivBuffer.length !== this.IV_LENGTH) {
        return false;
      }

      // Try to decrypt (don't return the result, just check if it works)
      const decryptResult = await this.decrypt(params);
      return decryptResult.isSuccess;
    } catch (_error) {
      return false;
    }
  }
}
