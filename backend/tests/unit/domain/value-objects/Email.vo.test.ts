/**
 * Email Value Object Tests
 */

import { Email } from '@domain/value-objects/Email.vo';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const result = Email.create('test@example.com');

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(Email);
      expect((result.value as Email).getValue()).toBe('test@example.com');
    });

    it('should accept email with subdomain', () => {
      const result = Email.create('user@mail.example.com');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Email).getValue()).toBe('user@mail.example.com');
    });

    it('should accept email with plus addressing', () => {
      const result = Email.create('user+tag@example.com');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Email).getValue()).toBe('user+tag@example.com');
    });

    it('should accept email with dots in local part', () => {
      const result = Email.create('first.last@example.com');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Email).getValue()).toBe('first.last@example.com');
    });

    it('should fail with empty email', () => {
      const result = Email.create('');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Email cannot be empty');
    });

    it('should fail with invalid format (no @)', () => {
      const result = Email.create('invalidemail.com');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should fail with invalid format (no domain)', () => {
      const result = Email.create('user@');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should fail with invalid format (no local part)', () => {
      const result = Email.create('@example.com');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should fail with spaces', () => {
      const result = Email.create('user @example.com');

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should trim whitespace before validation', () => {
      const result = Email.create('  test@example.com  ');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Email).getValue()).toBe('test@example.com');
    });

    it('should convert to lowercase', () => {
      const result = Email.create('User@Example.COM');

      expect(result.isSuccess).toBe(true);
      expect((result.value as Email).getValue()).toBe('user@example.com');
    });
  });

  describe('getLocalPart', () => {
    it('should return local part of email', () => {
      const email = Email.create('user@example.com').value as Email;

      expect(email.getLocalPart()).toBe('user');
    });

    it('should return local part with dots', () => {
      const email = Email.create('first.last@example.com').value as Email;

      expect(email.getLocalPart()).toBe('first.last');
    });

    it('should return local part with plus', () => {
      const email = Email.create('user+tag@example.com').value as Email;

      expect(email.getLocalPart()).toBe('user+tag');
    });
  });

  describe('getDomain', () => {
    it('should return domain part of email', () => {
      const email = Email.create('user@example.com').value as Email;

      expect(email.getDomain()).toBe('example.com');
    });

    it('should return domain with subdomain', () => {
      const email = Email.create('user@mail.example.com').value as Email;

      expect(email.getDomain()).toBe('mail.example.com');
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('test@example.com').value as Email;
      const email2 = Email.create('test@example.com').value as Email;

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same email with different case', () => {
      const email1 = Email.create('Test@Example.com').value as Email;
      const email2 = Email.create('test@example.com').value as Email;

      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com').value as Email;
      const email2 = Email.create('test2@example.com').value as Email;

      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const email = Email.create('test@example.com').value as Email;

      expect(email.equals(null as any)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not be modifiable', () => {
      const email = Email.create('test@example.com').value as Email;
      const originalValue = email.getValue();

      // Try to modify (should not work due to readonly)
      // @ts-expect-error - Testing immutability
      expect(() => { email['value'] = 'hacked@example.com'; }).not.toThrow();

      // Value should remain unchanged
      expect(email.getValue()).toBe(originalValue);
    });
  });
});
