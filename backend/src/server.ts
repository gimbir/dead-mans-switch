/**
 * Server Entry Point
 *
 * Starts the HTTP server and handles graceful shutdown.
 *
 * Responsibilities:
 * - Start Express server
 * - Connect to database
 * - Connect to Redis
 * - Handle graceful shutdown
 * - Log server status
 *
 * Environment Variables Required:
 * - PORT: Server port (default: 3000)
 * - All database and service configuration from env.config.ts
 */

import { createApp } from './app.js';
import { env } from '@config/env.config.js';
import { connectDatabase, disconnectDatabase } from '@infrastructure/database/prisma.client.js';
import { initializeQueue, shutdownQueue } from '@infrastructure/queue/initializeQueue.js';
import { prisma } from '@infrastructure/database/prisma.client.js';
import { UserRepository } from '@infrastructure/repositories/UserRepository.js';
import { SwitchRepository } from '@infrastructure/repositories/SwitchRepository.js';
import { MessageRepository } from '@infrastructure/repositories/MessageRepository.js';
import { EmailService } from '@infrastructure/services/EmailService.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    console.log("🚀 Starting Dead Man's Switch API Server...\n");

    // Connect to database
    console.log('📊 Connecting to database...');
    await connectDatabase();

    // Create Express app
    console.log('⚙️  Initializing Express application...');
    const app = createApp();

    // Initialize background job queue system
    console.log('📬 Initializing background job queue...');
    const userRepository = new UserRepository(prisma as any);
    const switchRepository = new SwitchRepository(prisma as any);
    const messageRepository = new MessageRepository(prisma as any);
    const emailService = new EmailService();
    const cacheService = new CacheService();

    await initializeQueue({
      switchRepository,
      messageRepository,
      userRepository,
      notificationService: emailService,
      cacheService,
    });

    // Start HTTP server
    const port = env.PORT;
    const server = app.listen(port, () => {
      console.log('\n✅ Server started successfully!');
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Server URL: http://localhost:${port}`);
      console.log(`📡 Health check: http://localhost:${port}/health`);
      console.log(`🔐 API Base URL: http://localhost:${port}/api`);
      console.log('\n📋 Available endpoints:');
      console.log('  - POST   /api/auth/register');
      console.log('  - POST   /api/auth/login');
      console.log('  - POST   /api/auth/refresh');
      console.log('  - GET    /api/switches');
      console.log('  - POST   /api/switches');
      console.log('  - POST   /api/switches/:id/checkin');
      console.log('  - GET    /health');
      console.log('  - GET    /health/db');
      console.log('  - GET    /health/redis');
      console.log('  - GET    /health/full');
      console.log('\n🎯 Server is ready to accept requests!\n');
    });

    // ===== Graceful Shutdown Handlers =====

    /**
     * Gracefully shut down the server
     */
    async function gracefulShutdown(signal: string): Promise<void> {
      console.log(`\n\n⚠️  ${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        console.log('🔌 HTTP server closed');

        try {
          // Shutdown queue system
          console.log('📬 Shutting down queue system...');
          await shutdownQueue();

          // Disconnect from database
          console.log('📊 Disconnecting from database...');
          await disconnectDatabase();

          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⏱️  Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
