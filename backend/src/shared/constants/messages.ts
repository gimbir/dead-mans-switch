/**
 * Application Messages and Error Messages
 *
 * Centralized message constants for consistent user-facing messages.
 * Helps with internationalization (i18n) in the future.
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Authentication required',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    EMAIL_NOT_VERIFIED: 'Please verify your email address',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    WEAK_PASSWORD: 'Password does not meet security requirements',
    VERIFICATION_TOKEN_INVALID: 'Invalid or expired verification token',
    RESET_TOKEN_INVALID: 'Invalid or expired password reset token',
    REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  },

  // User errors
  USER: {
    NOT_FOUND: 'User not found',
    ALREADY_VERIFIED: 'Email already verified',
    FORBIDDEN: 'You do not have permission to perform this action',
  },

  // Switch errors
  SWITCH: {
    NOT_FOUND: 'Switch not found',
    ALREADY_TRIGGERED: 'Switch has already been triggered',
    LIMIT_REACHED: 'Maximum number of switches reached',
    CANNOT_MODIFY_TRIGGERED: 'Cannot modify a triggered switch',
    INVALID_INTERVAL: 'Check-in interval must be between 1 and 365 days',
    INVALID_GRACE_PERIOD: 'Grace period must be between 0 and 90 days',
    NOT_ACTIVE: 'Switch is not active',
  },

  // Message errors
  MESSAGE: {
    NOT_FOUND: 'Message not found',
    ALREADY_SENT: 'Cannot modify a sent message',
    INVALID_EMAIL: 'Invalid recipient email address',
    ENCRYPTION_REQUIRED: 'Message content must be encrypted',
    CANNOT_DELETE_SENT: 'Cannot delete a sent message',
  },

  // Check-in errors
  CHECKIN: {
    NOT_FOUND: 'Check-in not found',
    INVALID_SWITCH: 'Invalid switch for check-in',
  },

  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email format',
    INVALID_UUID: 'Invalid ID format',
    INVALID_DATE: 'Invalid date format',
    INVALID_NUMBER: 'Must be a valid number',
    MIN_LENGTH: 'Must be at least {min} characters',
    MAX_LENGTH: 'Must be at most {max} characters',
  },

  // Server errors
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred',
    DATABASE_ERROR: 'Database operation failed',
    CACHE_ERROR: 'Cache operation failed',
    EMAIL_SEND_ERROR: 'Failed to send email',
    ENCRYPTION_ERROR: 'Encryption operation failed',
  },
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication success
  AUTH: {
    REGISTERED: 'Registration successful. Please check your email to verify your account.',
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset instructions sent to your email',
    PASSWORD_RESET: 'Password reset successful',
    TOKEN_REFRESHED: 'Token refreshed successfully',
  },

  // Switch success
  SWITCH: {
    CREATED: 'Switch created successfully',
    UPDATED: 'Switch updated successfully',
    DELETED: 'Switch deleted successfully',
    PAUSED: 'Switch paused',
    ACTIVATED: 'Switch activated',
  },

  // Check-in success
  CHECKIN: {
    SUCCESS: 'Check-in recorded successfully',
  },

  // Message success
  MESSAGE: {
    CREATED: 'Message created successfully',
    UPDATED: 'Message updated successfully',
    DELETED: 'Message deleted successfully',
    SENT: 'Message sent successfully',
  },
} as const;

export const INFO_MESSAGES = {
  HEALTH: {
    OK: 'Service is healthy',
    DEGRADED: 'Service is degraded',
    DOWN: 'Service is down',
  },
} as const;
