/**
 * Test Data Factories
 *
 * Factory functions to create test data for entities and DTOs
 */

import { User } from '@domain/entities/User.entity';
import { Switch } from '@domain/entities/Switch.entity';
import { Message } from '@domain/entities/Message.entity';
import { CheckIn } from '@domain/entities/CheckIn.entity';
import { Email } from '@domain/value-objects/Email.vo';
import { TimeInterval } from '@domain/value-objects/TimeInterval.vo';

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(prefix: string = 'test'): Email {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return Email.create(`${prefix}-${timestamp}-${random}@example.com`).value as Email;
}

/**
 * Create a test User entity
 */
export function createTestUser(overrides?: Partial<{
  email: Email;
  hashedPassword: string;
  name: string;
  isVerified: boolean;
}>): User {
  const email = overrides?.email || generateTestEmail('user');
  const hashedPassword = overrides?.hashedPassword || '$2b$12$hashedpassword123';
  const name = overrides?.name || 'Test User';
  const isVerified = overrides?.isVerified ?? false;

  return User.create({
    email,
    hashedPassword,
    name,
    isVerified,
  }).value as User;
}

/**
 * Create a test User with persistence data
 */
export function createTestUserPersistence(overrides?: Partial<{
  id: string;
  email: string;
  password: string;
  name: string;
  isVerified: boolean;
  refreshToken: string | null;
  verificationToken: string | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: overrides?.id || `user-${Date.now()}`,
    email: overrides?.email || generateTestEmail('user').getValue(),
    password: overrides?.password || 'hashedpassword123',
    name: overrides?.name || 'Test User',
    isVerified: overrides?.isVerified ?? false,
    refreshToken: overrides?.refreshToken || null,
    verificationToken: overrides?.verificationToken || null,
    deletedAt: overrides?.deletedAt || null,
    version: overrides?.version || 0,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };
}

/**
 * Create a test Switch entity
 */
export function createTestSwitch(userId: string, overrides?: Partial<{
  name: string;
  description: string;
  checkInInterval: number;
  gracePeriod: number;
}>): Switch {
  const name = overrides?.name || 'Test Switch';
  const description = overrides?.description || 'Test switch description';
  const checkInInterval = overrides?.checkInInterval || 7;
  const gracePeriod = overrides?.gracePeriod || 1;

  const intervalVO = TimeInterval.create(checkInInterval).value as TimeInterval;
  const gracePeriodVO = TimeInterval.create(gracePeriod).value as TimeInterval;

  return Switch.create({
    userId,
    name,
    description,
    checkInInterval: intervalVO,
    gracePeriod: gracePeriodVO,
  }).value as Switch;
}

/**
 * Create a test Switch with persistence data
 */
export function createTestSwitchPersistence(userId: string, overrides?: Partial<{
  id: string;
  name: string;
  description: string;
  checkInInterval: number;
  gracePeriod: number;
  isActive: boolean;
  lastCheckIn: Date | null;
  nextCheckInDue: Date | null;
  triggeredAt: Date | null;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: overrides?.id || `switch-${Date.now()}`,
    userId,
    name: overrides?.name || 'Test Switch',
    description: overrides?.description || 'Test description',
    checkInInterval: overrides?.checkInInterval || 7,
    gracePeriod: overrides?.gracePeriod || 1,
    isActive: overrides?.isActive ?? true,
    // status: overrides?.status || SwitchStatus.ACTIVE,
    lastCheckIn: overrides?.lastCheckIn || new Date(),
    nextCheckInDue: overrides?.nextCheckInDue || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    triggeredAt: overrides?.triggeredAt || null,
    deletedAt: overrides?.deletedAt || null,
    version: overrides?.version || 0,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };
}

/**
 * Create a test Message entity
 */
export function createTestMessage(switchId: string, overrides?: Partial<{
  recipientEmail: Email;
  recipientName: string;
  subject: string;
  encryptedContent: string;
}>): Message {
  const recipientEmail = overrides?.recipientEmail || generateTestEmail('recipient');
  const recipientName = overrides?.recipientName || 'Test Recipient';
  const subject = overrides?.subject || 'Test Subject';
  const encryptedContent = overrides?.encryptedContent || 'encrypted-content-here';

  return Message.create({
    switchId,
    recipientEmail,
    recipientName,
    subject,
    encryptedContent,
  }).value as Message;
}

/**
 * Create a test Message with persistence data
 */
export function createTestMessagePersistence(switchId: string, overrides?: Partial<{
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  encryptedContent: string;
  isSent: boolean;
  sentAt: Date | null;
  deliveryAttempts: number;
  lastAttemptAt: Date | null;
  failureReason: string | null;
  idempotencyKey: string;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: overrides?.id || `message-${Date.now()}`,
    switchId,
    recipientEmail: overrides?.recipientEmail || generateTestEmail('recipient').getValue(),
    recipientName: overrides?.recipientName || 'Test Recipient',
    subject: overrides?.subject || 'Test Subject',
    encryptedContent: overrides?.encryptedContent || 'encrypted-content',
    deliveryType: 'EMAIL' as const,
    attachmentUrl: null,
    isSent: overrides?.isSent ?? false,
    sentAt: overrides?.sentAt || null,
    deliveryAttempts: overrides?.deliveryAttempts || 0,
    lastAttemptAt: overrides?.lastAttemptAt || null,
    failureReason: overrides?.failureReason || null,
    idempotencyKey: overrides?.idempotencyKey || `idempotency-${Date.now()}`,
    deletedAt: overrides?.deletedAt || null,
    version: overrides?.version || 0,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };
}

/**
 * Create a test CheckIn entity
 */
export function createTestCheckIn(switchId: string, overrides?: Partial<{
  ipAddress: string;
  userAgent: string;
  location: string;
  notes: string;
}>): CheckIn {
  const ipAddress = overrides?.ipAddress || '192.168.1.1';
  const userAgent = overrides?.userAgent || 'Mozilla/5.0';
  const location = overrides?.location;
  const notes = overrides?.notes;

  return CheckIn.create({
    switchId,
    ipAddress,
    userAgent,
    location,
    notes,
  }).value as CheckIn;
}

/**
 * Create a test CheckIn with persistence data
 */
export function createTestCheckInPersistence(switchId: string, overrides?: Partial<{
  id: string;
  timestamp: Date;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  notes: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}>) {
  return {
    id: overrides?.id || `checkin-${Date.now()}`,
    switchId,
    timestamp: overrides?.timestamp || new Date(),
    ipAddress: overrides?.ipAddress || '192.168.1.1',
    userAgent: overrides?.userAgent || 'Mozilla/5.0',
    location: overrides?.location || null,
    notes: overrides?.notes || null,
    version: overrides?.version || 0,
    createdAt: overrides?.createdAt || new Date(),
    updatedAt: overrides?.updatedAt || new Date(),
  };
}
