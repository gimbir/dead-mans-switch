/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

/**
 * Switch Types
 */
export enum SwitchStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  TRIGGERED = 'TRIGGERED',
  EXPIRED = 'EXPIRED',
}

export interface Switch {
  id: string;
  userId: string;
  name: string;
  description?: string;
  checkInIntervalDays: number; // in days
  gracePeriodDays: number; // in days
  isActive: boolean;
  status: SwitchStatus;
  lastCheckInAt?: string; // ISO date string
  nextCheckInDue?: string; // ISO date string
  triggeredAt?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface CreateSwitchData {
  name: string;
  description?: string;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  isActive?: boolean;
}

export interface UpdateSwitchData {
  name?: string;
  description?: string;
  checkInIntervalDays?: number;
  gracePeriodDays?: number;
  isActive?: boolean;
}

/**
 * Message Types
 */
export interface Message {
  id: string;
  switchId: string;
  recipientEmail: string;
  recipientName: string;
  subject?: string;
  encryptedContent: string;
  isSent: boolean;
  sentAt?: string;
  deliveryAttempts: number;
  lastAttemptAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  recipientEmail: string;
  recipientName: string;
  subject?: string;
  encryptedContent: string;
}

export interface UpdateMessageData {
  recipientEmail?: string;
  recipientName?: string;
  subject?: string;
  encryptedContent?: string;
}

// Type aliases for hooks consistency
export type CreateMessageRequest = CreateMessageData;
export type UpdateMessageRequest = UpdateMessageData;

/**
 * CheckIn Types
 */
export interface CheckIn {
  id: string;
  switchId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface PerformCheckInData {
  notes?: string;
}

/**
 * Two-Factor Authentication Types
 */
export interface TwoFactorSetupData {
  secret: string; // Encrypted secret (JSON string)
  qrCodeDataUrl: string; // Data URL for QR code image
  backupCodes: string[]; // Array of 10 backup codes
}

export interface Verify2FASetupRequest {
  token: string; // 6-digit TOTP code
  encryptedSecret: string; // From setup response
  backupCodes: string[]; // From setup response
}

export interface Disable2FARequest {
  password: string; // User's password for verification
  token?: string; // Optional 2FA token
}

export interface Verify2FALoginRequest {
  userId: string;
  token: string; // 6-digit TOTP or backup code
}

export interface TwoFactorLoginResponse {
  requiresTwoFactor?: boolean;
  userId?: string;
  user?: User;
  tokens?: AuthTokens;
}
