/**
 * Password Value Object Tests
 */

import { Password, PasswordStrength } from '@domain/value-objects/Password.vo';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid strong password', () => {
      const result = Password.create('StrongPass123!');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(Password);
      expect((result.value as Password).getValue()).toBe('StrongPass123!');
    });

    it('should create a medium strength password', () => {
      const result = Password.create('Password123');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Password).getStrength()).toBe(PasswordStrength.MEDIUM);
    });

    it('should create a very strong password', () => {
      const result = Password.create('VeryStr0ng!Pass@2024');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Password).getStrength()).toBe(PasswordStrength.VERY_STRONG);
    });

    it('should fail with empty password', () => {
      const result = Password.create('');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Password cannot be empty');
    });

    it('should fail with password less than 8 characters', () => {
      const result = Password.create('Pass12');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('should fail with password more than 72 characters', () => {
      const longPassword = 'A'.repeat(73) + '1a!';
      const result = Password.create(longPassword);

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('cannot exceed 72 characters');
    });

    it('should fail without uppercase letter', () => {
      const result = Password.create('password123');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('one uppercase letter');
    });

    it('should fail without lowercase letter', () => {
      const result = Password.create('PASSWORD123');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('one lowercase letter');
    });

    it('should fail without number', () => {
      const result = Password.create('PasswordABC');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('one number');
    });

    it('should accept password with special characters', () => {
      const result = Password.create('Password123!@#');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Password).getStrength()).toBe(PasswordStrength.VERY_STRONG);
    });

    it('should accept exactly 8 characters', () => {
      const result = Password.create('Pass123!');

      expect(result.isSuccess).toBe(true);
    });

    it('should accept exactly 72 characters', () => {
      const password = 'A'.repeat(68) + '1a!'; // 72 chars total
      const result = Password.create(password);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('getStrength', () => {
    it('should return WEAK for minimum requirements', () => {
      const password = Password.create('Password1').value as Password;

      expect(password.getStrength()).toBe(PasswordStrength.WEAK);
    });

    it('should return MEDIUM for 10+ chars with uppercase, lowercase, numbers', () => {
      const password = Password.create('Password123').value as Password;

      expect(password.getStrength()).toBe(PasswordStrength.MEDIUM);
    });

    it('should return STRONG for 12+ chars with special characters', () => {
      const password = Password.create('Password123!').value as Password;

      expect(password.getStrength()).toBe(PasswordStrength.STRONG);
    });

    it('should return VERY_STRONG for 16+ chars with all requirements', () => {
      const password = Password.create('VeryStrongPass123!@#').value as Password;

      expect(password.getStrength()).toBe(PasswordStrength.VERY_STRONG);
    });
  });

  describe('strength comparison', () => {
    it('should have MEDIUM strength for 10+ character password', () => {
      const password = Password.create('Password123').value as Password;
      const strength = password.getStrength();

      expect(strength).toBe(PasswordStrength.MEDIUM);
      expect(strength >= PasswordStrength.WEAK).toBe(true);
    });

    it('should have WEAK strength for minimum requirements', () => {
      const weakPassword = Password.create('Password1').value as Password;
      const strength = weakPassword.getStrength();

      expect(strength).toBe(PasswordStrength.WEAK);
    });

    it('should have VERY_STRONG for long password with special chars', () => {
      const veryStrongPassword = Password.create('VeryStrongPass123!@#').value as Password;
      const strength = veryStrongPassword.getStrength();

      expect(strength).toBe(PasswordStrength.VERY_STRONG);
    });
  });

  describe('equals', () => {
    it('should return true for same password value', () => {
      const password1 = Password.create('Password123').value as Password;
      const password2 = Password.create('Password123').value as Password;

      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for different passwords', () => {
      const password1 = Password.create('Password123').value as Password;
      const password2 = Password.create('DifferentPass123').value as Password;

      expect(password1.equals(password2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const password1 = Password.create('Password123').value as Password;
      const password2 = Password.create('password123').value as Password;

      expect(password1.equals(password2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const password = Password.create('Password123').value as Password;

      expect(password.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not be modifiable', () => {
      const password = Password.create('Password123').value as Password;
      const originalValue = password.getValue();

      // Try to modify (should not work due to readonly)
      // @ts-expect-error - Testing immutability
      expect(() => { password['value'] = 'hacked'; }).not.toThrow();

      // Value should remain unchanged
      expect(password.getValue()).toBe(originalValue);
    });
  });

  describe('edge cases', () => {
    it('should handle password with unicode characters', () => {
      const result = Password.create('Pässwörd123');

      expect(result.isSuccess).toBe(true);
    });

    it('should handle password with emojis', () => {
      const result = Password.create('Password123😀');

      expect(result.isSuccess).toBe(true);
    });

    it('should trim whitespace', () => {
      const result = Password.create('  Password123  ');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Password).getValue()).toBe('Password123');
    });
  });
});
