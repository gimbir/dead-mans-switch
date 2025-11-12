/**
 * Express Application Setup
 *
 * Configures and creates the Express application with all middleware,
 * routes, and error handlers.
 *
 * This file sets up:
 * - Body parsing middleware
 * - CORS configuration
 * - Request logging
 * - API routes
 * - Error handling
 * - 404 handling
 *
 * The app is exported for use in server.ts and for testing.
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger.config.js';

// Middleware
import {
  corsMiddleware,
  requestLogger,
  errorHandler,
  notFoundHandler,
  authenticate,
} from '@presentation/http/middleware/index.js';

// Routes
import {
  createAuthRouter,
  createSwitchRouter,
  createMessageRouter,
  createHealthRouter,
} from '@presentation/http/routes/index.js';

// Controllers
import { AuthController } from '@presentation/http/controllers/AuthController.js';
import { SwitchController } from '@presentation/http/controllers/SwitchController.js';
import { MessageController } from '@presentation/http/controllers/MessageController.js';
import { HealthController } from '@presentation/http/controllers/HealthController.js';

// Use Cases - Auth
import { RegisterUserUseCase } from '@application/use-cases/auth/RegisterUser.usecase.js';
import { AuthenticateUserUseCase } from '@application/use-cases/auth/AuthenticateUser.usecase.js';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshToken.usecase.js';
import { VerifyEmailUseCase } from '@application/use-cases/auth/VerifyEmail.usecase.js';
import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPassword.usecase.js';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPassword.usecase.js';
import { Enable2FAUseCase } from '@application/use-cases/auth/Enable2FA.usecase.js';
import { Verify2FAUseCase } from '@application/use-cases/auth/Verify2FA.usecase.js';
import { Disable2FAUseCase } from '@application/use-cases/auth/Disable2FA.usecase.js';
import { Verify2FALoginUseCase } from '@application/use-cases/auth/Verify2FALogin.usecase.js';

// Use Cases - Switch
import { CreateSwitchUseCase } from '@application/use-cases/switch/CreateSwitch.usecase.js';
import { UpdateSwitchUseCase } from '@application/use-cases/switch/UpdateSwitch.usecase.js';
import { GetSwitchUseCase } from '@application/use-cases/switch/GetSwitch.usecase.js';
import { DeleteSwitchUseCase } from '@application/use-cases/switch/DeleteSwitch.usecase.js';
import { ListSwitchesUseCase } from '@application/use-cases/switch/ListSwitches.usecase.js';

// Use Cases - Check-In
import { PerformCheckInUseCase } from '@application/use-cases/checkin/PerformCheckIn.usecase.js';
import { GetCheckInHistoryUseCase } from '@application/use-cases/checkin/GetCheckInHistory.usecase.js';

// Use Cases - Message
import { CreateMessageUseCase } from '@application/use-cases/message/CreateMessage.usecase.js';
import { UpdateMessageUseCase } from '@application/use-cases/message/UpdateMessage.usecase.js';
import { GetMessageUseCase } from '@application/use-cases/message/GetMessage.usecase.js';
import { DeleteMessageUseCase } from '@application/use-cases/message/DeleteMessage.usecase.js';
import { ListMessagesUseCase } from '@application/use-cases/message/ListMessages.usecase.js';

// Repositories
import { UserRepository } from '@infrastructure/repositories/UserRepository.js';
import { SwitchRepository } from '@infrastructure/repositories/SwitchRepository.js';
import { CheckInRepository } from '@infrastructure/repositories/CheckInRepository.js';
import { MessageRepository } from '@infrastructure/repositories/MessageRepository.js';

// Services
import { HashingService } from '@infrastructure/services/HashingService.js';
import { EmailService } from '@infrastructure/services/EmailService.js';
import { CacheService } from '@infrastructure/cache/CacheService.js';
import { TwoFactorService } from '@infrastructure/services/TwoFactorService.js';
import { EncryptionService } from '@infrastructure/services/EncryptionService.js';

// Database
import { prisma } from '@infrastructure/database/prisma.client.js';

/**
 * Creates and configures the Express application
 */
export function createApp(): Application {
  const app = express();

  // ===== Security Middleware =====
  // Helmet helps secure Express apps by setting various HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  );

  // ===== Body Parsing Middleware =====
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===== Compression Middleware =====
  app.use(compression());

  // ===== CORS Middleware =====
  app.use(corsMiddleware);

  // ===== Request Logging Middleware =====
  app.use(requestLogger);

  // ===== Initialize Services =====
  const hashingService = new HashingService();
  const emailService = new EmailService();
  const cacheService = new CacheService();
  const twoFactorService = new TwoFactorService();
  const encryptionService = new EncryptionService();
  // Note: EncryptionService is used for 2FA secrets, messages are encrypted client-side (zero-knowledge architecture)

  // ===== Initialize Repositories =====
  // Cast to any to avoid Prisma generated types mismatch between node_modules and src/generated
  const userRepository = new UserRepository(prisma as any);
  const switchRepository = new SwitchRepository(prisma as any);
  const checkInRepository = new CheckInRepository(prisma as any);
  const messageRepository = new MessageRepository(prisma as any);

  // ===== Initialize Use Cases - Auth =====
  const registerUserUseCase = new RegisterUserUseCase(
    userRepository,
    hashingService,
    emailService,
    cacheService
  );
  const authenticateUserUseCase = new AuthenticateUserUseCase(
    userRepository,
    hashingService
  );
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository);
  const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, cacheService);
  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    userRepository,
    emailService,
    cacheService
  );
  const resetPasswordUseCase = new ResetPasswordUseCase(
    userRepository,
    hashingService,
    cacheService
  );

  // ===== Initialize Use Cases - Two-Factor Authentication =====
  const enable2FAUseCase = new Enable2FAUseCase(
    userRepository,
    twoFactorService,
    encryptionService
  );
  const verify2FAUseCase = new Verify2FAUseCase(
    userRepository,
    twoFactorService,
    encryptionService
  );
  const disable2FAUseCase = new Disable2FAUseCase(
    userRepository,
    hashingService,
    twoFactorService,
    encryptionService
  );
  const verify2FALoginUseCase = new Verify2FALoginUseCase(
    userRepository,
    twoFactorService,
    encryptionService
  );

  // ===== Initialize Use Cases - Switch =====
  const createSwitchUseCase = new CreateSwitchUseCase(switchRepository);
  const updateSwitchUseCase = new UpdateSwitchUseCase(switchRepository);
  const getSwitchUseCase = new GetSwitchUseCase(switchRepository);
  const deleteSwitchUseCase = new DeleteSwitchUseCase(switchRepository);
  const listSwitchesUseCase = new ListSwitchesUseCase(switchRepository);

  // ===== Initialize Use Cases - Check-In =====
  const performCheckInUseCase = new PerformCheckInUseCase(
    switchRepository,
    checkInRepository
  );
  const getCheckInHistoryUseCase = new GetCheckInHistoryUseCase(
    switchRepository,
    checkInRepository
  );

  // ===== Initialize Use Cases - Message =====
  const createMessageUseCase = new CreateMessageUseCase(
    switchRepository,
    messageRepository
  );
  const updateMessageUseCase = new UpdateMessageUseCase(
    switchRepository,
    messageRepository
  );
  const getMessageUseCase = new GetMessageUseCase(
    switchRepository,
    messageRepository
  );
  const deleteMessageUseCase = new DeleteMessageUseCase(
    switchRepository,
    messageRepository
  );
  const listMessagesUseCase = new ListMessagesUseCase(
    switchRepository,
    messageRepository
  );

  // ===== Initialize Controllers =====
  const authController = new AuthController(
    registerUserUseCase,
    authenticateUserUseCase,
    refreshTokenUseCase,
    verifyEmailUseCase,
    forgotPasswordUseCase,
    resetPasswordUseCase,
    enable2FAUseCase,
    verify2FAUseCase,
    disable2FAUseCase,
    verify2FALoginUseCase
  );

  const switchController = new SwitchController(
    createSwitchUseCase,
    updateSwitchUseCase,
    getSwitchUseCase,
    deleteSwitchUseCase,
    listSwitchesUseCase,
    performCheckInUseCase,
    getCheckInHistoryUseCase
  );

  const messageController = new MessageController(
    createMessageUseCase,
    updateMessageUseCase,
    getMessageUseCase,
    deleteMessageUseCase,
    listMessagesUseCase
  );

  const healthController = new HealthController(prisma as any, cacheService);

  // ===== Create Routers =====
  const authRouter = createAuthRouter(authController);
  const switchRouter = createSwitchRouter(switchController);
  const messageRouter = createMessageRouter(messageController);
  const healthRouter = createHealthRouter(healthController);

  // ===== Register Routes =====
  // API Documentation (Swagger UI)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Dead Man\'s Switch API',
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  // Health check routes (public, no authentication)
  app.use('/health', healthRouter);

  // Auth routes (public)
  app.use('/api/auth', authRouter);

  // Protected routes (require authentication)
  app.use('/api/switches', authenticate, switchRouter);
  app.use('/api', authenticate, messageRouter);

  // ===== 404 Handler =====
  // Must be after all other routes
  app.use(notFoundHandler);

  // ===== Error Handler =====
  // Must be last middleware
  app.use(errorHandler);

  return app;
}
