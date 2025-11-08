/**
 * Winston Logger Configuration
 *
 * Creates and configures a Winston logger instance with:
 * - Multiple transports (console, file, error file)
 * - Different log levels based on environment
 * - JSON formatting for production
 * - Colorized output for development
 * - Request ID tracking
 * - Error stack traces
 *
 * Usage:
 * import { logger } from '@config/logger.config.js';
 * logger.info('User registered', { userId: '123' });
 * logger.error('Database error', { error: err });
 */

import winston from 'winston';
import { env } from './env.config.js';

/**
 * Custom log format for development (human-readable)
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return msg;
  })
);

/**
 * Custom log format for production (JSON)
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: {
    service: 'dead-mans-switch-api',
    environment: env.NODE_ENV,
  },
  transports: [
    // Console transport (always enabled)
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),

    // File transport for all logs (only in production)
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true,
          }),
        ]
      : []),

    // File transport for errors only (only in production)
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

/**
 * Create a child logger with additional metadata
 */
export const createChildLogger = (meta: Record<string, unknown>): winston.Logger => {
  return logger.child(meta);
};

/**
 * Log levels reference:
 * - error: 0
 * - warn: 1
 * - info: 2
 * - http: 3
 * - verbose: 4
 * - debug: 5
 * - silly: 6
 */

/**
 * Utility functions for common log patterns
 */
export const loggerUtils = {
  /**
   * Log HTTP request
   */
  logRequest: (method: string, url: string, statusCode: number, duration: number) => {
    logger.http('HTTP Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    });
  },

  /**
   * Log database query (debug level)
   */
  logQuery: (query: string, duration: number) => {
    logger.debug('Database Query', {
      query,
      duration: `${duration}ms`,
    });
  },

  /**
   * Log authentication event
   */
  logAuth: (event: string, userId?: string, success: boolean = true) => {
    logger.info('Authentication Event', {
      event,
      userId,
      success,
    });
  },

  /**
   * Log business event
   */
  logEvent: (event: string, data?: Record<string, unknown>) => {
    logger.info('Business Event', {
      event,
      ...data,
    });
  },

  /**
   * Log error with stack trace
   */
  logError: (message: string, error: Error, context?: Record<string, unknown>) => {
    logger.error(message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    });
  },
};

/**
 * Stream for Morgan HTTP logger middleware
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
