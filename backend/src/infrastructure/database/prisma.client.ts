/**
 * Prisma Client Singleton
 *
 * Provides a single instance of PrismaClient throughout the application.
 * Implements the Singleton pattern to prevent multiple database connections.
 *
 * Features:
 * - Connection pooling
 * - Query logging in development
 * - Graceful shutdown handling
 * - Error logging
 */

import { PrismaClient } from '@generated/prisma/index.js';
import { env } from '@config/env.config.js';

/**
 * Singleton instance of PrismaClient
 */
class PrismaClientSingleton {
  private static instance: PrismaClient | null = null;

  /**
   * Gets the PrismaClient instance
   * Creates a new instance if one doesn't exist
   */
  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient({
        log:
          env.NODE_ENV === 'development'
            ? ['query', 'info', 'warn', 'error']
            : ['error'],
        errorFormat: 'pretty',
      });

      // Graceful shutdown handling
      process.on('beforeExit', async () => {
        await PrismaClientSingleton.disconnect();
      });
    }

    return PrismaClientSingleton.instance;
  }

  /**
   * Connects to the database
   */
  public static async connect(): Promise<void> {
    const client = PrismaClientSingleton.getInstance();
    await client.$connect();
    console.log('✅ Database connected successfully');
  }

  /**
   * Disconnects from the database
   */
  public static async disconnect(): Promise<void> {
    if (PrismaClientSingleton.instance) {
      await PrismaClientSingleton.instance.$disconnect();
      PrismaClientSingleton.instance = null;
      console.log('✅ Database disconnected successfully');
    }
  }

  /**
   * Checks database connection health
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      const client = PrismaClientSingleton.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

// Export the singleton instance
export const prisma = PrismaClientSingleton.getInstance();

// Export utility functions
export const connectDatabase = PrismaClientSingleton.connect;
export const disconnectDatabase = PrismaClientSingleton.disconnect;
export const databaseHealthCheck = PrismaClientSingleton.healthCheck;
