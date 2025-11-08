/**
 * Environment Configuration
 *
 * Type-safe environment variables with Zod validation.
 * This module validates all environment variables at startup
 * and provides typed access throughout the application.
 *
 * Benefits:
 * - Compile-time type safety
 * - Runtime validation
 * - Single source of truth
 * - Fail-fast on missing/invalid env vars
 *
 * Usage:
 * import { env } from '@config/env.config.js';
 * console.log(env.DATABASE_URL); // Type-safe!
 */

import { z } from 'zod';

/**
 * Environment variable schema with validation rules
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server Configuration
  PORT: z.string().regex(/^\d+$/).default('3000').transform(Number),

  // Database Configuration
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .min(1, 'DATABASE_URL is required'),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),

  REDIS_PORT: z.string().regex(/^\d+$/).default('6379').transform(Number),

  REDIS_PASSWORD: z.string().optional(),

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),

  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  JWT_ACCESS_EXPIRY: z.string().default('15m'),

  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Encryption Configuration
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),

  // Email Configuration (SMTP)
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),

  SMTP_PORT: z.string().regex(/^\d+$/).default('587').transform(Number),

  SMTP_SECURE: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),

  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),

  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),

  SMTP_FROM_EMAIL: z.string().email('SMTP_FROM_EMAIL must be a valid email'),

  SMTP_FROM_NAME: z.string().default("Dead Man's Switch"),

  // Application Configuration
  APP_URL: z.string().url('APP_URL must be a valid URL').default('http://localhost:3000'),

  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL').default('http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .regex(/^\d+$/)
    .default('900000') // 15 minutes
    .transform(Number),

  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).default('100').transform(Number),

  // Switch Configuration
  MAX_SWITCHES_PER_USER: z.string().regex(/^\d+$/).default('10').transform(Number),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

/**
 * Validated environment variables
 * Type is automatically inferred from schema
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 * Throws error if validation fails
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: z.core.$ZodIssue) => {
        return `  - ${err.path.join('.')}: ${err.message}`;
      });

      console.error('❌ Environment validation failed:');
      console.error(missingVars.join('\n'));
      console.error('\n💡 Please check your .env file\n');

      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validated and typed environment variables
 * Use this throughout the application instead of process.env
 *
 * @example
 * import { env } from '@config/env.config.js';
 * console.log(env.DATABASE_URL); // Type-safe!
 * console.log(env.PORT);         // number, not string!
 */
export const env = validateEnv();

/**
 * Helper function to check if running in production
 */
export const isProduction = () => env.NODE_ENV === 'production';

/**
 * Helper function to check if running in development
 */
export const isDevelopment = () => env.NODE_ENV === 'development';

/**
 * Helper function to check if running in test
 */
export const isTest = () => env.NODE_ENV === 'test';
