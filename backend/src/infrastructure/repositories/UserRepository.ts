/**
 * User Repository Implementation
 *
 * Implements IUserRepository using Prisma ORM.
 * Handles all User entity persistence operations.
 *
 * Features:
 * - Prisma type-safe queries
 * - Entity mapping (Prisma ↔ Domain)
 * - Optimistic locking with version field
 * - Soft delete support
 * - Error handling with Result pattern
 */

import { PrismaClient } from '@generated/prisma/index.js';
import { IUserRepository } from '@domain/repositories/IUserRepository.js';
import { User, UserPersistenceData } from '@domain/entities/User.entity.js';
import { Email } from '@domain/value-objects/Email.vo.js';
import { Result } from '@shared/types/Result.js';

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds a user by their unique ID
   */
  async findById(id: string): Promise<Result<User | null>> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { id, deletedAt: null },
      });

      if (!userData) {
        return Result.ok(null);
      }

      return User.fromPersistence(userData);
    } catch (error) {
      return Result.fail<User | null>(
        `Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds a user by their email address
   */
  async findByEmail(email: Email): Promise<Result<User | null>> {
    try {
      const userData = await this.prisma.user.findUnique({
        where: { email: email.getValue(), deletedAt: null },
      });

      if (!userData) {
        return Result.ok(null);
      }

      return User.fromPersistence(userData);
    } catch (error) {
      return Result.fail<User | null>(
        `Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds a user by their verification token
   */
  async findByVerificationToken(token: string): Promise<Result<User | null>> {
    try {
      const userData = await this.prisma.user.findFirst({
        where: { verificationToken: token, deletedAt: null },
      });

      if (!userData) {
        return Result.ok(null);
      }

      return User.fromPersistence(userData);
    } catch (error) {
      return Result.fail<User | null>(
        `Failed to find user by verification token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds a user by their refresh token
   */
  async findByRefreshToken(token: string): Promise<Result<User | null>> {
    try {
      const userData = await this.prisma.user.findFirst({
        where: { refreshToken: token, deletedAt: null },
      });

      if (!userData) {
        return Result.ok(null);
      }

      return User.fromPersistence(userData);
    } catch (error) {
      return Result.fail<User | null>(
        `Failed to find user by refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds a user by their password reset token
   */
  async findByPasswordResetToken(token: string): Promise<Result<User | null>> {
    try {
      const userData = await this.prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          deletedAt: null,
          passwordResetExpiry: { gt: new Date() }, // Token must not be expired
        },
      });

      if (!userData) {
        return Result.ok(null);
      }

      return User.fromPersistence(userData);
    } catch (error) {
      return Result.fail<User | null>(
        `Failed to find user by password reset token: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Checks if a user with the given email exists
   */
  async existsByEmail(email: Email): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email: email.getValue(), deletedAt: null },
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Saves a new user to the database
   */
  async save(user: User): Promise<Result<User>> {
    try {
      const persistenceData: UserPersistenceData = user.toPersistence();

      const createdUser = await this.prisma.user.create({
        data: {
          id: persistenceData.id,
          email: persistenceData.email,
          password: persistenceData.password,
          name: persistenceData.name,
          isVerified: persistenceData.isVerified,
          verificationToken: persistenceData.verificationToken,
          refreshToken: persistenceData.refreshToken,
          deletedAt: persistenceData.deletedAt,
          version: persistenceData.version,
          createdAt: persistenceData.createdAt,
          updatedAt: persistenceData.updatedAt,
        },
      });

      return User.fromPersistence(createdUser);
    } catch (error) {
      return Result.fail<User>(
        `Failed to save user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Updates an existing user in the database
   * Uses optimistic locking via version field
   */
  async update(user: User): Promise<Result<User>> {
    try {
      const persistenceData: UserPersistenceData = user.toPersistence();
      const currentVersion = persistenceData.version;

      // Optimistic locking: check version before update
      const updatedUser = await this.prisma.user.updateMany({
        where: {
          id: persistenceData.id,
          version: currentVersion - 1, // Previous version
        },
        data: {
          email: persistenceData.email,
          password: persistenceData.password,
          name: persistenceData.name,
          isVerified: persistenceData.isVerified,
          verificationToken: persistenceData.verificationToken,
          passwordResetToken: persistenceData.passwordResetToken,
          passwordResetExpiry: persistenceData.passwordResetExpiry,
          refreshToken: persistenceData.refreshToken,
          twoFactorSecret: persistenceData.twoFactorSecret,
          twoFactorEnabled: persistenceData.twoFactorEnabled,
          twoFactorBackupCodes: persistenceData.twoFactorBackupCodes,
          lastBackupCodeUsedAt: persistenceData.lastBackupCodeUsedAt,
          deletedAt: persistenceData.deletedAt,
          version: currentVersion,
          updatedAt: new Date(),
        },
      });

      // If no rows updated, version conflict occurred
      if (updatedUser.count === 0) {
        return Result.fail<User>(
          'Optimistic locking failure: User was modified by another process'
        );
      }

      // Fetch and return updated user
      const fetchedUser = await this.prisma.user.findUnique({
        where: { id: persistenceData.id },
      });

      if (!fetchedUser) {
        return Result.fail<User>('User not found after update');
      }

      return User.fromPersistence(fetchedUser);
    } catch (error) {
      return Result.fail<User>(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Deletes a user (soft delete - sets deletedAt)
   */
  async delete(id: string): Promise<Result<boolean>> {
    try {
      const result = await this.prisma.user.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return Result.ok(result.count > 0);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Permanently removes a user from the database (hard delete)
   */
  async permanentlyDelete(id: string): Promise<Result<boolean>> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return Result.ok(true);
    } catch (error) {
      // Prisma throws error if record not found
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        return Result.ok(false);
      }

      return Result.fail<boolean>(
        `Failed to permanently delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Finds all users (with pagination)
   */
  async findAll(
    limit: number,
    offset: number,
    includeDeleted: boolean = false
  ): Promise<Result<User[]>> {
    try {
      const users = await this.prisma.user.findMany({
        where: includeDeleted ? {} : { deletedAt: null },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      });

      const userResults = users.map((userData: Record<string, unknown>) =>
        User.fromPersistence(userData)
      );

      // Check if any user mapping failed
      const failedResult = userResults.find((r: Result<User>) => r.isFailure);
      if (failedResult) {
        return Result.fail<User[]>(failedResult.error as string);
      }

      const domainUsers = userResults.map((r: Result<User>) => r.value);
      return Result.ok(domainUsers);
    } catch (error) {
      return Result.fail<User[]>(
        `Failed to find users: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Counts total number of users
   */
  async count(includeDeleted: boolean = false): Promise<Result<number>> {
    try {
      const count = await this.prisma.user.count({
        where: includeDeleted ? {} : { deletedAt: null },
      });

      return Result.ok(count);
    } catch (error) {
      return Result.fail<number>(
        `Failed to count users: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
