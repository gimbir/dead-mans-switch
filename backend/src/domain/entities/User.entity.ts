/**
 * User Domain Entity
 *
 * Represents a user in the system with business rules and behavior.
 * This is a rich domain model - it contains both data AND behavior.
 *
 * Business Rules:
 * - Email must be unique
 * - Password must be hashed (never store plain text)
 * - Users can be soft deleted
 * - Email verification is required for certain actions
 *
 * @example
 * const userOrError = User.create({
 *   email: Email.create('user@example.com').value,
 *   name: 'John Doe',
 *   hashedPassword: '...'
 * });
 */

import { z } from 'zod';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';
import { v7 as uuidv7 } from 'uuid';

/**
 * Zod schema for validating persistence data
 * Ensures data from database is valid before creating entity
 */
const UserPersistenceSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  password: z.string().min(1),
  isVerified: z.boolean(),
  verificationToken: z.string().nullable(),
  passwordResetToken: z.string().nullable(),
  passwordResetExpiry: z.date().nullable(),
  refreshToken: z.string().nullable(),
  twoFactorSecret: z.string().nullable(),
  twoFactorEnabled: z.boolean(),
  twoFactorBackupCodes: z.array(z.string()),
  lastBackupCodeUsedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  version: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface UserProps {
  email: Email;
  name: string;
  hashedPassword: string;
  isVerified?: boolean;
  verificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpiry?: Date | null;
  refreshToken?: string | null;
  twoFactorSecret?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorBackupCodes?: string[];
  lastBackupCodeUsedAt?: Date | null;
  deletedAt?: Date | null;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateUserProps {
  id?: string;
  email: Email;
  name: string;
  hashedPassword: string;
  isVerified?: boolean;
  verificationToken?: string | null;
  refreshToken?: string | null;
}

/**
 * User Persistence Data Interface
 * Defines the exact structure for database operations
 */
export interface UserPersistenceData {
  id: string;
  email: string;
  name: string;
  password: string;
  isVerified: boolean;
  verificationToken: string | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  refreshToken: string | null;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  twoFactorBackupCodes: string[];
  lastBackupCodeUsedAt: Date | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly _id: string;
  private _props: UserProps;

  private constructor(id: string, props: UserProps) {
    this._id = id;
    this._props = {
      ...props,
      isVerified: props.isVerified ?? false,
      verificationToken: props.verificationToken ?? null,
      passwordResetToken: props.passwordResetToken ?? null,
      passwordResetExpiry: props.passwordResetExpiry ?? null,
      refreshToken: props.refreshToken ?? null,
      twoFactorSecret: props.twoFactorSecret ?? null,
      twoFactorEnabled: props.twoFactorEnabled ?? false,
      twoFactorBackupCodes: props.twoFactorBackupCodes ?? [],
      lastBackupCodeUsedAt: props.lastBackupCodeUsedAt ?? null,
      deletedAt: props.deletedAt ?? null,
      version: props.version ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  /**
   * Factory method to create a new User
   */
  public static create(props: CreateUserProps, id?: string): Result<User> {
    // Validate name
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<User>('User name cannot be empty');
    }

    if (props.name.trim().length < 2) {
      return Result.fail<User>('User name must be at least 2 characters');
    }

    if (props.name.trim().length > 100) {
      return Result.fail<User>('User name cannot exceed 100 characters');
    }

    // Validate hashed password exists
    if (!props.hashedPassword || props.hashedPassword.length === 0) {
      return Result.fail<User>('Hashed password is required');
    }

    const userId = id ?? this.generateId();

    return Result.ok<User>(
      new User(userId, {
        email: props.email,
        name: props.name.trim(),
        hashedPassword: props.hashedPassword,
        isVerified: props.isVerified ?? false,
        verificationToken: props.verificationToken ?? null,
        refreshToken: props.refreshToken ?? null,
      })
    );
  }

  /**
   * Generates a new UUID
   * In production, this should use a proper UUID library
   */
  private static generateId(): string {
    return uuidv7();
  }

  // ==================== Getters ====================

  public get id(): string {
    return this._id;
  }

  public get email(): Email {
    return this._props.email;
  }

  public get name(): string {
    return this._props.name;
  }

  public get hashedPassword(): string {
    return this._props.hashedPassword;
  }

  public get isVerified(): boolean {
    return this._props.isVerified ?? false;
  }

  public get verificationToken(): string | null {
    return this._props.verificationToken ?? null;
  }

  public get passwordResetToken(): string | null {
    return this._props.passwordResetToken ?? null;
  }

  public get passwordResetExpiry(): Date | null {
    return this._props.passwordResetExpiry ?? null;
  }

  public get refreshToken(): string | null {
    return this._props.refreshToken ?? null;
  }

  public get password(): string {
    return this._props.hashedPassword;
  }

  public get deletedAt(): Date | null {
    return this._props.deletedAt ?? null;
  }

  public get version(): number {
    return this._props.version ?? 0;
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  public get twoFactorSecret(): string | null {
    return this._props.twoFactorSecret ?? null;
  }

  public get twoFactorEnabled(): boolean {
    return this._props.twoFactorEnabled ?? false;
  }

  public get twoFactorBackupCodes(): string[] {
    return this._props.twoFactorBackupCodes ?? [];
  }

  public get lastBackupCodeUsedAt(): Date | null {
    return this._props.lastBackupCodeUsedAt ?? null;
  }

  // ==================== Business Logic Methods ====================

  /**
   * Checks if the user is deleted (soft delete)
   */
  public isDeleted(): boolean {
    return this._props.deletedAt !== null && this._props.deletedAt !== undefined;
  }

  /**
   * Checks if the user is active (not deleted and verified)
   */
  public isActive(): boolean {
    return !this.isDeleted() && this.isVerified;
  }

  /**
   * Updates user's name
   */
  public updateName(newName: string): Result<void> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail<void>('Name cannot be empty');
    }

    if (newName.trim().length < 2) {
      return Result.fail<void>('Name must be at least 2 characters');
    }

    if (newName.trim().length > 100) {
      return Result.fail<void>('Name cannot exceed 100 characters');
    }

    this._props.name = newName.trim();
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Updates the hashed password
   */
  public updatePassword(newHashedPassword: string): Result<void> {
    if (!newHashedPassword || newHashedPassword.length === 0) {
      return Result.fail<void>('Hashed password cannot be empty');
    }

    this._props.hashedPassword = newHashedPassword;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Verifies the user's email
   */
  public verifyEmail(): void {
    this._props.isVerified = true;
    this._props.verificationToken = null;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Sets a new verification token
   */
  public setVerificationToken(token: string): void {
    this._props.verificationToken = token;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Verifies the user (alias for verifyEmail for backward compatibility)
   */
  public verify(): Result<void> {
    if (this._props.isVerified) {
      return Result.fail<void>('User is already verified');
    }
    this.verifyEmail();
    return Result.ok();
  }

  /**
   * Clears the verification token
   */
  public clearVerificationToken(): void {
    this._props.verificationToken = null;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Sets a password reset token with expiry
   */
  public setPasswordResetToken(token: string, expiryDate: Date): Result<void> {
    if (!token || token.trim().length === 0) {
      return Result.fail<void>('Password reset token cannot be empty');
    }

    if (expiryDate <= new Date()) {
      return Result.fail<void>('Password reset expiry must be in the future');
    }

    this._props.passwordResetToken = token;
    this._props.passwordResetExpiry = expiryDate;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Clears the password reset token and expiry
   */
  public clearPasswordResetToken(): void {
    this._props.passwordResetToken = null;
    this._props.passwordResetExpiry = null;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Checks if password reset token is valid and not expired
   */
  public isPasswordResetTokenValid(token: string): boolean {
    if (!this._props.passwordResetToken || !this._props.passwordResetExpiry) {
      return false;
    }

    if (this._props.passwordResetToken !== token) {
      return false;
    }

    return new Date() < this._props.passwordResetExpiry;
  }

  /**
   * Sets a new refresh token
   */
  public setRefreshToken(token: string | null): Result<void> {
    this._props.refreshToken = token;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
    return Result.ok();
  }

  /**
   * Soft deletes the user
   */
  public delete(): void {
    this._props.deletedAt = new Date();
    this._props.refreshToken = null; // Clear refresh token on deletion
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Restores a soft deleted user
   */
  public restore(): Result<void> {
    if (!this.isDeleted()) {
      return Result.fail<void>('User is not deleted');
    }

    this._props.deletedAt = null;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  // ==================== 2FA Methods ====================

  /**
   * Sets 2FA secret (encrypted)
   */
  public set twoFactorSecret(secret: string | null) {
    this._props.twoFactorSecret = secret;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Enables or disables 2FA
   */
  public set twoFactorEnabled(enabled: boolean) {
    this._props.twoFactorEnabled = enabled;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Sets 2FA backup codes (hashed)
   */
  public set twoFactorBackupCodes(codes: string[]) {
    this._props.twoFactorBackupCodes = codes;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Sets last backup code used timestamp
   */
  public set lastBackupCodeUsedAt(date: Date | null) {
    this._props.lastBackupCodeUsedAt = date;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Enable 2FA with all required fields in a single atomic operation
   * This prevents version increment issues when setting multiple fields
   */
  public enable2FA(secret: string, backupCodes: string[]): Result<void> {
    this._props.twoFactorSecret = secret;
    this._props.twoFactorEnabled = true;
    this._props.twoFactorBackupCodes = backupCodes;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1; // Only increment once
    return Result.ok();
  }

  /**
   * Disable 2FA and clear all 2FA-related fields
   */
  public disable2FA(): Result<void> {
    this._props.twoFactorSecret = null;
    this._props.twoFactorEnabled = false;
    this._props.twoFactorBackupCodes = [];
    this._props.lastBackupCodeUsedAt = null;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1; // Only increment once
    return Result.ok();
  }

  /**
   * Returns a plain object representation (for database persistence)
   */
  public toPersistence(): UserPersistenceData {
    return {
      id: this._id,
      email: this._props.email.getValue(),
      name: this._props.name,
      password: this._props.hashedPassword,
      isVerified: this._props.isVerified ?? false,
      verificationToken: this._props.verificationToken ?? null,
      passwordResetToken: this._props.passwordResetToken ?? null,
      passwordResetExpiry: this._props.passwordResetExpiry ?? null,
      refreshToken: this._props.refreshToken ?? null,
      twoFactorSecret: this._props.twoFactorSecret ?? null,
      twoFactorEnabled: this._props.twoFactorEnabled ?? false,
      twoFactorBackupCodes: this._props.twoFactorBackupCodes ?? [],
      lastBackupCodeUsedAt: this._props.lastBackupCodeUsedAt ?? null,
      deletedAt: this._props.deletedAt ?? null,
      version: this._props.version ?? 0,
      createdAt: this._props.createdAt ?? new Date(),
      updatedAt: this._props.updatedAt ?? new Date(),
    };
  }

  /**
   * Creates a User entity from persistence data
   * Validates data with Zod before creating entity
   */
  public static fromPersistence(data: Record<string, unknown>): Result<User> {
    // Validate persistence data with Zod
    const validationResult = UserPersistenceSchema.safeParse(data);

    if (!validationResult.success) {
      return Result.fail<User>(
        `Invalid user persistence data: ${validationResult.error.issues.map((e: z.core.$ZodIssue) => e.message).join(', ')}`
      );
    }

    const validData = validationResult.data;

    // Create Email value object
    const emailOrError = Email.create(validData.email);
    if (emailOrError.isFailure) {
      return Result.fail<User>(emailOrError.error as string);
    }

    return Result.ok(
      new User(validData.id, {
        email: emailOrError.value,
        name: validData.name,
        hashedPassword: validData.password,
        isVerified: validData.isVerified,
        verificationToken: validData.verificationToken,
        passwordResetToken: validData.passwordResetToken,
        passwordResetExpiry: validData.passwordResetExpiry,
        refreshToken: validData.refreshToken,
        twoFactorSecret: validData.twoFactorSecret,
        twoFactorEnabled: validData.twoFactorEnabled,
        twoFactorBackupCodes: validData.twoFactorBackupCodes,
        lastBackupCodeUsedAt: validData.lastBackupCodeUsedAt,
        deletedAt: validData.deletedAt,
        version: validData.version,
        createdAt: validData.createdAt,
        updatedAt: validData.updatedAt,
      })
    );
  }
}
