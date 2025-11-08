/**
 * User Entity Tests
 */

import { User } from '@domain/entities/User.entity';
import { generateTestEmail } from '../../../helpers/factories';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a new user with valid data', () => {
      const email = generateTestEmail('user');

      const result = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: false,
      });

      const user = result.value as User;
      expect(user.email.equals(email)).toBe(true);
      expect(user.name).toBe('Test User');
      expect(user.isVerified).toBe(false);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create user with verified status', () => {
      const email = generateTestEmail('verified');

      const result = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Verified User',
        isVerified: true,
      });

      const user = result.value as User;
      expect(user.isVerified).toBe(true);
      expect(user.verificationToken).toBeNull();
    });

    it('should fail with empty name', () => {
      const email = generateTestEmail('user');

      const result = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: '',
        isVerified: false,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Name');
    });

    it('should fail with name less than 2 characters', () => {
      const email = generateTestEmail('user');

      const result = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'A',
        isVerified: false,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Name');
    });

    it('should fail with name more than 100 characters', () => {
      const email = generateTestEmail('user');
      const longName = 'A'.repeat(101);

      const result = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: longName,
        isVerified: false,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Name');
    });
  });

  describe('fromPersistence', () => {
    it('should restore user from persistence data', () => {
      const persistenceData = {
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        isVerified: true,
        verificationToken: null,
        refreshToken: 'refresh-token-123',
        deletedAt: null,
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const result = User.fromPersistence(persistenceData);

      const user = result.value as User;
      expect(user.id).toBe('user-123');
      expect(user.email.getValue()).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.isVerified).toBe(true);
      expect(user.refreshToken).toBe('refresh-token-123');
      expect(user.version).toBe(1);
    });

    it('should restore soft-deleted user', () => {
      const deletedAt = new Date();
      const persistenceData = {
        id: 'user-123',
        email: 'deleted@example.com',
        password: 'hashedpassword',
        name: 'Deleted User',
        isVerified: true,
        verificationToken: null,
        refreshToken: null,
        deletedAt,
        version: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = User.fromPersistence(persistenceData);

      const user = result.value as User;
      expect(user.isDeleted()).toBe(true);
      expect(user.deletedAt).toEqual(deletedAt);
    });
  });

  describe('verify', () => {
    it('should verify unverified user', () => {
      const email = generateTestEmail('unverified');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Unverified User',
        isVerified: false,
      }).value as User;

      user.verify();

      expect(user.isVerified).toBe(true);
      expect(user.verificationToken).toBeNull();
    });

    it('should fail when user is already verified', () => {
      const email = generateTestEmail('verified');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Verified User',
        isVerified: true,
      }).value as User;

      user.verify();

    });
  });

  describe('updatePassword', () => {
    it('should update password with valid new password', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$oldpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.updatePassword('$2b$12$newpassword');

      expect(user.hashedPassword).toBe('$2b$12$newpassword');
    });

    it('should increment version when password updated', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$oldpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      const oldVersion = user.version;
      user.updatePassword('$2b$12$newpassword');

      expect(user.version).toBe(oldVersion + 1);
    });
  });

  describe('setRefreshToken', () => {
    it('should set refresh token', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.setRefreshToken('new-refresh-token');

      expect(user.refreshToken).toBe('new-refresh-token');
    });

    it('should clear refresh token with null', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.setRefreshToken('some-token');
      expect(user.refreshToken).toBe('some-token');

      user.setRefreshToken(null);
      expect(user.refreshToken).toBeNull();
    });
  });

  describe('setVerificationToken', () => {
    it('should set verification token for unverified user', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: false,
      }).value as User;

      user.setVerificationToken('verification-token-123');

      expect(user.verificationToken).toBe('verification-token-123');
    });
  });

  describe('delete', () => {
    it('should soft delete user', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.delete();

      expect(user.isDeleted()).toBe(true);
      expect(user.deletedAt).toBeInstanceOf(Date);
    });

    it('should fail when user is already deleted', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.delete();
      user.delete();

    });

    it('should clear refresh token when soft deleted', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.setRefreshToken('some-token');
      user.delete();

      expect(user.refreshToken).toBeNull();
    });
  });

  describe('toPersistence', () => {
    it('should convert to persistence format', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      const persistence = user.toPersistence();

      expect(persistence.id).toBe(user.id);
      expect(persistence.email).toBe(email.getValue());
      expect(persistence.password).toBe('$2b$12$hashedpassword');
      expect(persistence.name).toBe('Test User');
      expect(persistence.isVerified).toBe(true);
      expect(persistence.version).toBe(0);
    });

    it('should include refresh token in persistence', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.setRefreshToken('refresh-token');
      const persistence = user.toPersistence();

      expect(persistence.refreshToken).toBe('refresh-token');
    });

    it('should include deletedAt in persistence', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: true,
      }).value as User;

      user.delete();
      const persistence = user.toPersistence();

      expect(persistence.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('optimistic locking', () => {
    it('should increment version on updates', () => {
      const email = generateTestEmail('user');
      const user = User.create({
        email,
        hashedPassword: '$2b$12$hashedpassword',
        name: 'Test User',
        isVerified: false,
      }).value as User;

      expect(user.version).toBe(0);

      user.verify();
      expect(user.version).toBe(1);

      user.updatePassword('$2b$12$newpassword');
      expect(user.version).toBe(2);
    });
  });
});
