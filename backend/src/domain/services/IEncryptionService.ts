/**
 * Encryption Service Interface
 *
 * Defines the contract for encrypting and decrypting message content.
 * The actual implementation will be in the infrastructure layer.
 *
 * Security Requirements:
 * - Use strong encryption algorithms (AES-256-GCM recommended)
 * - Generate unique encryption keys per message
 * - Store keys securely (separate from encrypted content)
 * - Support key rotation
 *
 * This is a Domain Service interface because:
 * - Encryption is a core domain concept (messages MUST be encrypted)
 * - The domain layer needs to enforce encryption
 * - Implementation details are infrastructure concern
 */

import { Result } from '@shared/types/Result.js';

export interface EncryptionResult {
  encryptedContent: string;
  encryptionKey: string;
  iv: string; // Initialization vector
  algorithm: string;
}

export interface DecryptionParams {
  encryptedContent: string;
  encryptionKey: string;
  iv: string;
  algorithm: string;
}

export interface IEncryptionService {
  /**
   * Encrypts message content
   * @param plainText Plain text content to encrypt
   * @returns Encrypted content with metadata
   */
  encrypt(plainText: string): Promise<Result<EncryptionResult>>;

  /**
   * Decrypts message content
   * @param params Decryption parameters
   * @returns Decrypted plain text
   */
  decrypt(params: DecryptionParams): Promise<Result<string>>;

  /**
   * Generates a new encryption key
   * @returns Base64-encoded encryption key
   */
  generateKey(): Promise<Result<string>>;

  /**
   * Validates if an encrypted content can be decrypted
   * @param params Decryption parameters
   * @returns True if valid
   */
  canDecrypt(params: DecryptionParams): Promise<boolean>;
}
