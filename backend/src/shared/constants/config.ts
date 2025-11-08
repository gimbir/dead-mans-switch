/**
 * Application Configuration Constants
 *
 * Non-sensitive configuration values that are used throughout the application.
 * For sensitive values (API keys, secrets), use environment variables.
 */

/**
 * JWT Token Configuration
 */
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '15m', // 15 minutes
  REFRESH_TOKEN_EXPIRES_IN: '7d', // 7 days
  ISSUER: 'dead-mans-switch-api',
} as const;

/**
 * Password Security Configuration
 */
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 72, // bcrypt limitation
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false, // Optional for higher security
  BCRYPT_ROUNDS: 12, // Cost factor for bcrypt
} as const;

/**
 * Switch Configuration Limits
 */
export const SWITCH_CONFIG = {
  MIN_INTERVAL_DAYS: 1,
  MAX_INTERVAL_DAYS: 365,
  MIN_GRACE_PERIOD_DAYS: 0,
  MAX_GRACE_PERIOD_DAYS: 90,
  MAX_SWITCHES_PER_USER: 50, // Free tier limit
  WARNING_THRESHOLD: 0.8, // Warn when 80% of check-in interval has passed
} as const;

/**
 * Message Configuration
 */
export const MESSAGE_CONFIG = {
  MAX_MESSAGES_PER_SWITCH: 20,
  MAX_DELIVERY_ATTEMPTS: 5,
  MAX_SUBJECT_LENGTH: 200,
  MAX_CONTENT_LENGTH: 10000, // 10KB for encrypted content
  RETRY_DELAY_MS: 60000, // 1 minute between retries
} as const;

/**
 * Pagination Configuration
 */
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  USER_SESSION: 900, // 15 minutes
  SWITCH_DATA: 300, // 5 minutes
  EMAIL_VERIFICATION: 3600, // 1 hour
  PASSWORD_RESET: 3600, // 1 hour
  RATE_LIMIT: 60, // 1 minute
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Global rate limit for all requests
  GLOBAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 1000, // 1000 requests per 15 minutes
  },

  // Auth endpoints (stricter limits)
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 20, // 20 requests per 15 minutes
  },

  // Login attempts (very strict)
  LOGIN: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // 5 login attempts per 15 minutes
  },

  // Check-in endpoint
  CHECKIN: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10, // 10 check-ins per minute (generous for testing)
  },
} as const;

/**
 * Email Configuration
 */
export const EMAIL_CONFIG = {
  FROM_NAME: 'Dead Man\'s Switch',
  NO_REPLY_EMAIL: 'noreply@deadmansswitch.com',
  SUPPORT_EMAIL: 'support@deadmansswitch.com',
} as const;

/**
 * Audit Log Configuration
 */
export const AUDIT_CONFIG = {
  RETENTION_DAYS: 90, // Keep audit logs for 90 days
  ACTIONS: {
    USER_CREATED: 'USER_CREATED',
    USER_VERIFIED: 'USER_VERIFIED',
    USER_DELETED: 'USER_DELETED',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    PASSWORD_CHANGED: 'PASSWORD_CHANGED',
    SWITCH_CREATED: 'SWITCH_CREATED',
    SWITCH_UPDATED: 'SWITCH_UPDATED',
    SWITCH_DELETED: 'SWITCH_DELETED',
    SWITCH_TRIGGERED: 'SWITCH_TRIGGERED',
    CHECKIN_PERFORMED: 'CHECKIN_PERFORMED',
    MESSAGE_CREATED: 'MESSAGE_CREATED',
    MESSAGE_SENT: 'MESSAGE_SENT',
  },
} as const;

/**
 * Background Job Configuration
 */
export const JOB_CONFIG = {
  // Check switches job (runs every hour to find triggered switches)
  CHECK_SWITCHES: {
    NAME: 'check-switches',
    CRON: '0 * * * *', // Every hour at minute 0
    BATCH_SIZE: 100, // Process 100 switches at a time
  },

  // Send reminders job (runs every 6 hours)
  SEND_REMINDERS: {
    NAME: 'send-reminders',
    CRON: '0 */6 * * *', // Every 6 hours
    REMINDER_THRESHOLD: 0.9, // Send reminder when 90% of interval has passed
  },

  // Cleanup job (runs daily)
  CLEANUP: {
    NAME: 'cleanup',
    CRON: '0 2 * * *', // Every day at 2 AM
    RETENTION_DAYS: 90, // Delete soft-deleted records after 90 days
  },

  // Send notifications job (processes queued notification jobs)
  SEND_NOTIFICATIONS: {
    NAME: 'send-notifications',
    CONCURRENCY: 5, // Process 5 notifications concurrently
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 5000, // 5 seconds
  },
} as const;

/**
 * HTTP Status Codes (for reference)
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
