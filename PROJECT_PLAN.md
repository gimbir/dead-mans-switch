# Dead Man's Switch Web Application - Project Plan

## Project Overview

Dead Man's Switch is a security application where users periodically confirm they're "alive" by
checking in. If they fail to check in within a specified timeframe, the system automatically sends
pre-configured messages/information to designated recipients.

---

## 📊 Project Status & Progress

**Last Updated:** November 9, 2025 (Frontend Polish & UX Complete - SPRINT 14 COMPLETED)

### Sprint Progress

- ✅ **SPRINT 1: Project Setup & Infrastructure** - COMPLETED
- ✅ **SPRINT 2: Core Domain Layer** - COMPLETED
- ✅ **SPRINT 3: Infrastructure Layer** - COMPLETED
- ✅ **SPRINT 4: Application Layer - Authentication** - COMPLETED
- ✅ **SPRINT 5: Application Layer - Switch Management** - COMPLETED
- ✅ **SPRINT 6: Application Layer - Message Management** - COMPLETED
- ✅ **SPRINT 7: Presentation Layer - Controllers & Routes** - COMPLETED
- ✅ **SPRINT 8: Background Jobs & Queue** - COMPLETED
- ✅ **SPRINT 8.5: API Documentation (Swagger/OpenAPI)** - COMPLETED
- ⏳ **SPRINT 9: Testing** - IN PROGRESS (30% complete)
- ✅ **SPRINT 10: Frontend Setup** - COMPLETED
- ✅ **SPRINT 11: Frontend - Authentication & Theme System** - COMPLETED
- ✅ **SPRINT 12: Frontend - Switch Management** - COMPLETED
- ✅ **SPRINT 13: Frontend - Message Management** - COMPLETED
- ✅ **SPRINT 14: Frontend - Polish & UX** - COMPLETED
- 📋 Remaining sprints (15, 16, 17...)...

### Completed Work Summary

#### Recent Technical Improvements (November 2025)

**Type Safety & Code Quality Enhancements:**

- Implemented type-safe persistence interfaces for all entities (UserPersistenceData,
  SwitchPersistenceData, MessagePersistenceData, CheckInPersistenceData)
- Replaced `Record<string, unknown>` with typed interfaces in all repositories for compile-time type
  checking
- Converted all repository implementations from bracket notation to dot notation
- Zero TypeScript errors maintained with strict mode + exactOptionalPropertyTypes

**UUID v7 Implementation:**

- Updated CheckIn.entity.ts to use UUID v7 for time-sortable IDs
- Updated DomainEvent.ts to use UUID v7 for event IDs
- All entities now consistently use UUID v7 (`uuid` package, v7 function)

**Data Consistency & Field Naming:**

- Renamed Prisma schema fields: `checkInInterval` → `checkInIntervalDays`, `gracePeriod` →
  `gracePeriodDays`
- Updated Zod persistence validation schemas to match database column names exactly
- Updated all entity `toPersistence()` methods to use correct field names
- Updated all repository save/update methods with correct database field mapping
- Updated all use-case response DTOs (CreateSwitch, UpdateSwitch, GetSwitch, ListSwitches)
- Fixed critical bug: Changed `.toHours()` to `.toDays()` in all switch use-cases
- Updated frontend TypeScript interfaces to match backend DTOs
- Updated all frontend components (SwitchForm, SwitchDetailPage, SwitchCard) with consistent field
  names
- Complete stack consistency: Database ↔ Backend ↔ Frontend

**Benefits Achieved:**

- Compile-time type safety across all layers
- Eliminated runtime type errors from incorrect field access
- Consistent naming convention throughout the entire application
- Improved developer experience with IntelliSense support
- Correct unit display (days instead of incorrect hours conversion)
- Database migration successfully applied

#### SPRINT 1 Highlights

- TypeScript 5.9.3 with strict mode and NodeNext module resolution
- Clean Architecture folder structure established
- Prisma 6.19.0 schema with 5 models (User, Switch, Message, CheckIn, AuditLog)
- All latest package versions (Express 5.1.0, Zod 4.1.12, BullMQ 5.63.0)
- Path aliases configured (@domain/_, @shared/_, etc.)

#### SPRINT 2 Highlights - Domain Layer (31 files, ~3000+ LOC)

**Entities (4):** User, Switch (core), Message, CheckIn

- Rich domain model with business logic
- UUID v7 for time-sortable IDs (all entities and domain events)
- Type-safe persistence interfaces (UserPersistenceData, SwitchPersistenceData,
  MessagePersistenceData, CheckInPersistenceData)
- Optimistic locking, soft delete patterns
- Zod validation for all persistence data with exact field name matching to database schema
- Comprehensive business methods

**Value Objects (3):** Email (RFC 5322), Password (strength), TimeInterval (1-365 days)

- Immutable and self-validating
- Type-safe domain primitives

**Repository Interfaces (4):** IUserRepository, ISwitchRepository, IMessageRepository,
ICheckInRepository

- CRUD + business query methods
- Pagination and filtering support

**Domain Services (4):** SwitchMonitoringService, IEncryptionService, INotificationService,
IHashingService

- Switch health monitoring and urgency calculations
- Encryption, notification, and hashing contracts

**Domain Events (18):** User events (4), Switch events (7), CheckIn events (2), Message events (5)

- Event-driven architecture foundation
- Comprehensive event coverage for all domain state changes

### Technology Achievements

- ✅ 100% TypeScript strict mode compliance (140+ files, ~32,000 LOC)
- ✅ Type-safe persistence layer with typed interfaces (no Record<string, unknown>)
- ✅ Dot notation throughout repositories for compile-time type checking
- ✅ UUID v7 for time-sortable IDs across all entities and events
- ✅ Result<T> pattern for functional error handling
- ✅ SOLID principles applied throughout
- ✅ DDD patterns: Entities, Value Objects, Repositories, Services, Events
- ✅ Zero TypeScript errors (strict mode + exactOptionalPropertyTypes)
- ✅ Zod runtime validation with type safety matching database schema
- ✅ Full stack type consistency: Database ↔ Backend ↔ Frontend
- ✅ Clean Architecture: Domain → Application → Infrastructure → Presentation
- ✅ RESTful API with comprehensive error handling
- ✅ Security: Rate limiting, CORS, Helmet, JWT authentication
- ✅ Production-ready: Winston logging, graceful shutdown, health checks
- ✅ Background job queue system with BullMQ (100% complete)
- ✅ Event-driven architecture with handlers
- ✅ Email notification system with templates
- ✅ Cleanup job for data retention policies
- ✅ Complete Swagger/OpenAPI 3.0 documentation (19 endpoints)
- ✅ Jest testing framework setup with factory patterns
- ✅ Unit tests for domain layer (User, Email, Password value objects)
- ✅ Backend API 100% complete (fully functional and documented)
- ✅ Frontend setup with React 19 + TypeScript 5.9 + Vite 7 (100% complete)
- ✅ Tailwind CSS 4.1, Zustand, React Query, React Router 7 configured
- ✅ Frontend dev server running on http://localhost:3000
- ✅ All Windows/WSL compatibility issues resolved (Yarn recommended for Windows)
- ✅ 20 frontend files created with routing, layout, and services

---

## Technology Stack

### Backend (Enterprise-Grade with TypeScript)

- **Node.js 18+**: JavaScript runtime with ES Modules
- **TypeScript 5.x**: Type-safe development
- **Express.js**: Web framework with typed middleware
- **PostgreSQL**: Relational database
- **Prisma ORM**: Type-safe database access with automatic migrations
- **Zod**: Runtime validation with type inference
- **Bull/BullMQ**: Redis-based job queue for background tasks
- **Redis**: Caching and job queue
- **Winston**: Structured logging
- **Passport.js**: Authentication strategies
- **Helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **bcrypt/argon2**: Password hashing
- **jsonwebtoken**: JWT token generation
- **nodemailer**: Email service
- **Jest + Supertest**: Testing framework

### Frontend

- **React 18+**: UI library
- **TypeScript**: Type-safe components
- **React Router v6**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **React Query (TanStack Query)**: Server state management
- **date-fns**: Date manipulation
- **Zustand**: Lightweight state management

### DevOps & Tools

- **Git**: Version control
- **ESLint + Prettier**: Code quality and formatting
- **Husky**: Git hooks
- **Docker + Docker Compose**: Containerization
- **Postman/Insomnia**: API testing

---

## Architecture Design Patterns

### 1. Clean Architecture + Domain-Driven Design (DDD Lite)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  ├── HTTP Controllers (Express)                                  │
│  ├── Middleware (Auth, Validation, Error Handling)               │
│  ├── Request/Response DTOs                                       │
│  └── Routes                                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ├── Use Cases (Business workflows)                              │
│  ├── Application Services                                        │
│  ├── DTOs (Data Transfer Objects)                                │
│  └── Event Handlers                                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                      DOMAIN LAYER                                │
│  ├── Entities (Business objects)                                 │
│  ├── Value Objects                                               │
│  ├── Domain Services (Pure business logic)                       │
│  ├── Repository Interfaces                                       │
│  └── Domain Events                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                            │
│  ├── Repository Implementations (Prisma)                         │
│  ├── External Services (Email, SMS)                              │
│  ├── Database (PostgreSQL)                                       │
│  ├── Cache (Redis)                                               │
│  ├── Job Queue (Bull)                                            │
│  └── File Storage                                                │
└──────────────────────────────────────────────────────────────────┘
```

### 2. Design Patterns to Implement

#### Creational Patterns

- **Factory Pattern**: Creating complex objects (notification factories)
- **Singleton Pattern**: Database connection, logger, cache client
- **Builder Pattern**: Complex query building

#### Structural Patterns

- **Repository Pattern**: Abstract data access layer
- **Adapter Pattern**: External service integrations (email providers)
- **Decorator Pattern**: Middleware composition
- **Proxy Pattern**: Caching layer

#### Behavioral Patterns

- **Strategy Pattern**: Different notification strategies (Email, SMS, Webhook)
- **Observer Pattern**: Event-driven architecture
- **Chain of Responsibility**: Middleware pipeline
- **Command Pattern**: Use cases as commands
- **Template Method**: Base repository/service patterns

### 3. SOLID Principles Application

- **S - Single Responsibility**: Each class has one reason to change
- **O - Open/Closed**: Open for extension, closed for modification
- **L - Liskov Substitution**: Derived classes can substitute base classes
- **I - Interface Segregation**: Clients don't depend on unused interfaces
- **D - Dependency Inversion**: Depend on abstractions, not concretions

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                      React + TypeScript                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTPS REST API (JSON)
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    API GATEWAY / REVERSE PROXY                   │
│                    (Nginx - Production)                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│               BACKEND (Node.js + Express + TypeScript)           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth API   │  │  Switch API  │  │  Message API │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              Background Job Queue (Bull)             │        │
│  │  ├── Check Switch Status Job                        │        │
│  │  ├── Send Notification Job                          │        │
│  │  └── Send Reminder Job                              │        │
│  └─────────────────────────────────────────────────────┘        │
└─────────────────────┬─────────────────┬─────────────────────────┘
                      │                 │
        ┌─────────────▼──────┐    ┌────▼─────────┐
        │   PostgreSQL DB    │    │    Redis     │
        │  ┌────────────┐    │    │ ├── Cache    │
        │  │   Users    │    │    │ └── Queue    │
        │  │  Switches  │    │    └──────────────┘
        │  │  Messages  │    │
        │  │  CheckIns  │    │
        │  └────────────┘    │
        └────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │   External Services        │
        │  ├── Email (SMTP/SendGrid) │
        │  ├── SMS (Twilio)          │
        │  └── File Storage (S3)     │
        └────────────────────────────┘
```

---

## Project Structure (Enterprise-Grade)

```
dead-mans-switch/
├── backend/
│   ├── src/
│   │   ├── config/                          # Configuration management
│   │   │   ├── database.config.ts           # Database configuration
│   │   │   ├── env.config.ts                # Environment validation (Zod)
│   │   │   ├── logger.config.ts             # Winston logger setup
│   │   │   ├── redis.config.ts              # Redis configuration
│   │   │   └── email.config.ts              # Email service config
│   │   │
│   │   ├── domain/                          # Domain layer (Core business logic)
│   │   │   ├── entities/                    # Business entities
│   │   │   │   ├── User.entity.ts
│   │   │   │   ├── Switch.entity.ts
│   │   │   │   ├── Message.entity.ts
│   │   │   │   └── CheckIn.entity.ts
│   │   │   │
│   │   │   ├── value-objects/               # Value objects (immutable)
│   │   │   │   ├── Email.vo.ts
│   │   │   │   ├── Password.vo.ts
│   │   │   │   └── TimeInterval.vo.ts
│   │   │   │
│   │   │   ├── repositories/                # Repository interfaces
│   │   │   │   ├── IUserRepository.ts
│   │   │   │   ├── ISwitchRepository.ts
│   │   │   │   ├── IMessageRepository.ts
│   │   │   │   └── ICheckInRepository.ts
│   │   │   │
│   │   │   ├── services/                    # Domain services
│   │   │   │   ├── SwitchDomainService.ts   # Business rules
│   │   │   │   └── NotificationDomainService.ts
│   │   │   │
│   │   │   └── events/                      # Domain events
│   │   │       ├── SwitchTriggered.event.ts
│   │   │       ├── CheckInMissed.event.ts
│   │   │       └── UserRegistered.event.ts
│   │   │
│   │   ├── application/                     # Application layer
│   │   │   ├── use-cases/                   # Use cases (application workflows)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── RegisterUser.usecase.ts
│   │   │   │   │   ├── AuthenticateUser.usecase.ts
│   │   │   │   │   └── RefreshToken.usecase.ts
│   │   │   │   │
│   │   │   │   ├── switch/
│   │   │   │   │   ├── CreateSwitch.usecase.ts
│   │   │   │   │   ├── UpdateSwitch.usecase.ts
│   │   │   │   │   ├── DeleteSwitch.usecase.ts
│   │   │   │   │   ├── CheckIn.usecase.ts
│   │   │   │   │   └── TriggerSwitch.usecase.ts
│   │   │   │   │
│   │   │   │   └── message/
│   │   │   │       ├── CreateMessage.usecase.ts
│   │   │   │       ├── UpdateMessage.usecase.ts
│   │   │   │       └── SendMessages.usecase.ts
│   │   │   │
│   │   │   ├── dtos/                        # Data Transfer Objects
│   │   │   │   ├── auth/
│   │   │   │   │   ├── RegisterDto.ts
│   │   │   │   │   ├── LoginDto.ts
│   │   │   │   │   └── AuthResponseDto.ts
│   │   │   │   │
│   │   │   │   ├── switch/
│   │   │   │   │   ├── CreateSwitchDto.ts
│   │   │   │   │   ├── UpdateSwitchDto.ts
│   │   │   │   │   └── SwitchResponseDto.ts
│   │   │   │   │
│   │   │   │   └── message/
│   │   │   │       ├── CreateMessageDto.ts
│   │   │   │       └── MessageResponseDto.ts
│   │   │   │
│   │   │   ├── services/                    # Application services
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── SwitchService.ts
│   │   │   │   └── MessageService.ts
│   │   │   │
│   │   │   └── event-handlers/              # Event handlers
│   │   │       ├── SwitchTriggeredHandler.ts
│   │   │       └── CheckInMissedHandler.ts
│   │   │
│   │   ├── infrastructure/                  # Infrastructure layer
│   │   │   ├── database/
│   │   │   │   └── prisma.client.ts         # ✅ Prisma Client singleton
│   │   │   │
│   │   │   ├── repositories/                # ✅ Repository implementations
│   │   │   │   ├── UserRepository.ts        # ✅ Complete with optimistic locking
│   │   │   │   ├── SwitchRepository.ts      # ✅ Complete with business queries
│   │   │   │   ├── MessageRepository.ts     # ✅ Complete with delivery tracking
│   │   │   │   └── CheckInRepository.ts     # ✅ Complete with metadata tracking
│   │   │   │
│   │   │   ├── services/                    # ✅ Infrastructure services
│   │   │   │   ├── EncryptionService.ts     # ✅ AES-256-GCM encryption
│   │   │   │   ├── HashingService.ts        # ✅ bcrypt password hashing
│   │   │   │   └── EmailService.ts          # ✅ Nodemailer SMTP with templates
│   │   │   │
│   │   │   ├── cache/                       # ✅ Caching layer
│   │   │   │   └── CacheService.ts          # ✅ Redis with TTL and namespaces
│   │   │   │
│   │   │   ├── queue/                       # Job queue (PENDING)
│   │   │   │   ├── QueueManager.ts
│   │   │   │   └── processors/
│   │   │   │       ├── CheckSwitchProcessor.ts
│   │   │   │       └── SendNotificationProcessor.ts
│   │   │   │
│   │   │   ├── email/                       # Email templates directory
│   │   │   │   └── templates/               # Template files
│   │   │   │
│   │   │   └── storage/                     # File storage (PENDING)
│   │   │       └── FileStorageService.ts
│   │   │
│   │   ├── presentation/                    # Presentation layer (HTTP)
│   │   │   ├── http/
│   │   │   │   ├── controllers/             # HTTP controllers (thin layer)
│   │   │   │   │   ├── AuthController.ts
│   │   │   │   │   ├── SwitchController.ts
│   │   │   │   │   ├── MessageController.ts
│   │   │   │   │   └── HealthController.ts
│   │   │   │   │
│   │   │   │   ├── middleware/              # Express middleware
│   │   │   │   │   ├── auth.middleware.ts           # JWT validation
│   │   │   │   │   ├── validation.middleware.ts     # Zod validation
│   │   │   │   │   ├── errorHandler.middleware.ts   # Global error handler
│   │   │   │   │   ├── rateLimiter.middleware.ts    # Rate limiting
│   │   │   │   │   ├── requestLogger.middleware.ts  # Request logging
│   │   │   │   │   └── cors.middleware.ts           # CORS configuration
│   │   │   │   │
│   │   │   │   └── routes/                  # Route definitions
│   │   │   │       ├── index.ts             # Route aggregator
│   │   │   │       ├── auth.routes.ts
│   │   │   │       ├── switch.routes.ts
│   │   │   │       ├── message.routes.ts
│   │   │   │       └── health.routes.ts
│   │   │   │
│   │   │   └── validators/                  # Request validators (Zod schemas)
│   │   │       ├── auth.validator.ts
│   │   │       ├── switch.validator.ts
│   │   │       └── message.validator.ts
│   │   │
│   │   ├── shared/                          # Shared utilities
│   │   │   ├── errors/                      # Custom error classes
│   │   │   │   ├── AppError.ts              # Base error class
│   │   │   │   ├── ValidationError.ts
│   │   │   │   ├── UnauthorizedError.ts
│   │   │   │   ├── NotFoundError.ts
│   │   │   │   └── ConflictError.ts
│   │   │   │
│   │   │   ├── types/                       # Shared types and interfaces
│   │   │   │   ├── index.ts
│   │   │   │   ├── express.d.ts             # Express type extensions
│   │   │   │   └── enums.ts                 # Shared enums
│   │   │   │
│   │   │   ├── utils/                       # Utility functions
│   │   │   │   ├── logger.ts                # Winston logger instance
│   │   │   │   ├── jwt.util.ts              # JWT helpers
│   │   │   │   ├── date.util.ts             # Date helpers
│   │   │   │   └── crypto.util.ts           # Cryptography helpers
│   │   │   │
│   │   │   └── constants/                   # Application constants
│   │   │       ├── messages.ts
│   │   │       └── config.ts
│   │   │
│   │   ├── jobs/                            # Background jobs
│   │   │   ├── CheckSwitchesJob.ts          # Check switch status job
│   │   │   ├── SendRemindersJob.ts          # Send reminder emails
│   │   │   └── CleanupJob.ts                # Cleanup old records
│   │   │
│   │   ├── di/                              # Dependency Injection
│   │   │   ├── container.ts                 # DI container setup
│   │   │   └── types.ts                     # DI type symbols
│   │   │
│   │   ├── app.ts                           # Express app configuration
│   │   └── server.ts                        # Server entry point
│   │
│   ├── tests/                               # Tests
│   │   ├── unit/                            # Unit tests
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   │
│   │   ├── integration/                     # Integration tests
│   │   │   ├── auth.test.ts
│   │   │   ├── switch.test.ts
│   │   │   └── message.test.ts
│   │   │
│   │   ├── e2e/                             # End-to-end tests
│   │   │   └── workflows.test.ts
│   │   │
│   │   └── helpers/                         # Test helpers
│   │       ├── setup.ts
│   │       └── factories.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma                    # ✅ Updated with failureReason, deletedAt, version
│   │   ├── migrations/                      # ✅ Migration applied successfully
│   │   └── seed.ts
│   │
│   ├── .env                                 # Environment variables (NEVER commit!)
│   ├── .env.example                         # Example env file
│   ├── .env.test                            # Test environment variables
│   ├── .eslintrc.js                         # ESLint configuration
│   ├── .prettierrc                          # Prettier configuration
│   ├── tsconfig.json                        # TypeScript configuration
│   ├── jest.config.js                       # Jest configuration
│   ├── nodemon.json                         # Nodemon configuration
│   ├── docker-compose.yml                   # Docker compose for local dev
│   ├── Dockerfile                           # Production Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/                      # Reusable components
│   │   │   ├── common/                      # Generic components
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Toast/
│   │   │   │   └── Spinner/
│   │   │   │
│   │   │   ├── layout/                      # Layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   │
│   │   │   ├── auth/                        # Auth components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── switch/                      # Switch components
│   │   │   │   ├── SwitchCard.tsx
│   │   │   │   ├── SwitchForm.tsx
│   │   │   │   ├── SwitchList.tsx
│   │   │   │   └── CheckInButton.tsx
│   │   │   │
│   │   │   └── message/                     # Message components
│   │   │       ├── MessageForm.tsx
│   │   │       ├── MessageList.tsx
│   │   │       └── MessagePreview.tsx
│   │   │
│   │   ├── pages/                           # Page components
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   │
│   │   │   ├── switch/
│   │   │   │   ├── SwitchListPage.tsx
│   │   │   │   ├── SwitchCreatePage.tsx
│   │   │   │   ├── SwitchEditPage.tsx
│   │   │   │   └── SwitchDetailPage.tsx
│   │   │   │
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── services/                        # API services
│   │   │   ├── api.ts                       # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── switch.service.ts
│   │   │   └── message.service.ts
│   │   │
│   │   ├── hooks/                           # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSwitches.ts
│   │   │   ├── useMessages.ts
│   │   │   └── useCheckIn.ts
│   │   │
│   │   ├── stores/                          # State management (Zustand)
│   │   │   ├── authStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── types/                           # TypeScript types
│   │   │   ├── auth.types.ts
│   │   │   ├── switch.types.ts
│   │   │   └── message.types.ts
│   │   │
│   │   ├── utils/                           # Utility functions
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   └── formatting.ts
│   │   │
│   │   ├── constants/                       # Constants
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx                          # Main app component
│   │   ├── main.tsx                         # Entry point
│   │   └── index.css                        # Global styles
│   │
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── tsconfig.json
│   ├── vite.config.ts                       # Vite configuration
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── docs/                                    # Documentation
│   ├── API.md                               # API documentation
│   ├── ARCHITECTURE.md                      # Architecture documentation
│   ├── DEPLOYMENT.md                        # Deployment guide
│   ├── SECURITY.md                          # Security guidelines
│   └── CONTRIBUTING.md                      # Contribution guidelines
│
├── .gitignore
├── .dockerignore
├── docker-compose.yml                       # Docker compose for full stack
├── README.md
└── PROJECT_PLAN.md                          # This file
```

---

## Database Schema (Advanced)

### Prisma Schema with Advanced Features

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"  // Custom output for better control
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// User Model
// ============================================
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String    // Hashed with bcrypt/argon2
  name          String
  isVerified    Boolean   @default(false)
  verificationToken String?

  // Refresh token for JWT
  refreshToken  String?

  // Soft delete pattern
  deletedAt     DateTime?

  // Optimistic locking
  version       Int       @default(0)

  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  switches      Switch[]

  // Indexes for performance
  @@index([email])
  @@map("users")
}

// ============================================
// Switch Model
// ============================================
model Switch {
  id                String      @id @default(uuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  name              String
  description       String?

  // Check-in configuration
  checkInInterval   Int         // in days
  gracePeriod       Int         @default(0) // in days

  // Status tracking
  isActive          Boolean     @default(true)
  status            SwitchStatus @default(ACTIVE)
  lastCheckIn       DateTime?
  nextCheckInDue    DateTime?

  // Trigger tracking
  triggeredAt       DateTime?

  // Soft delete
  deletedAt         DateTime?

  // Optimistic locking
  version           Int         @default(0)

  // Audit
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  messages          Message[]
  checkIns          CheckIn[]

  // Indexes
  @@index([userId])
  @@index([status])
  @@index([nextCheckInDue])
  @@map("switches")
}

enum SwitchStatus {
  ACTIVE      // Actively monitoring
  PAUSED      // User paused
  TRIGGERED   // Switch triggered, messages sent
  EXPIRED     // Grace period expired
}

// ============================================
// Message Model
// ============================================
model Message {
  id                String        @id @default(uuid())
  switchId          String
  switch            Switch        @relation(fields: [switchId], references: [id], onDelete: Cascade)

  // Recipient details
  recipientEmail    String
  recipientName     String

  // Message content
  subject           String?
  encryptedContent  String        @db.Text // Encrypted at rest

  // Delivery configuration
  deliveryType      DeliveryType  @default(EMAIL)

  // File attachments
  attachmentUrl     String?

  // Delivery tracking
  isSent            Boolean       @default(false)
  sentAt            DateTime?
  deliveryAttempts  Int           @default(0)
  lastAttemptAt     DateTime?
  failureReason     String?       // Track delivery failure reason

  // Idempotency (prevent duplicate sends)
  idempotencyKey    String        @unique

  // Soft delete pattern
  deletedAt         DateTime?

  // Optimistic locking
  version           Int           @default(0)

  // Audit
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  // Indexes
  @@index([switchId])
  @@index([isSent])
  @@map("messages")
}

enum DeliveryType {
  EMAIL
  SMS
  WEBHOOK
}

// ============================================
// CheckIn Model
// ============================================
model CheckIn {
  id            String    @id @default(uuid())
  switchId      String
  switch        Switch    @relation(fields: [switchId], references: [id], onDelete: Cascade)

  // Check-in metadata
  timestamp     DateTime  @default(now()) // Renamed from checkedInAt to match domain
  ipAddress     String?
  userAgent     String?
  location      String?   // Optional geolocation
  notes         String?   // User notes for this check-in

  // Optimistic locking
  version       Int       @default(0)

  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Indexes
  @@index([switchId])
  @@index([timestamp])
  @@map("check_ins")
}

// ============================================
// Audit Log Model (Optional)
// ============================================
model AuditLog {
  id            String    @id @default(uuid())
  userId        String?
  action        String    // CREATE, UPDATE, DELETE, LOGIN, etc.
  entityType    String    // User, Switch, Message
  entityId      String?
  changes       Json?     // Store what changed
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## API Endpoints

### Authentication

```
POST   /api/v1/auth/register              - Register new user
POST   /api/v1/auth/login                 - Login
POST   /api/v1/auth/logout                - Logout
POST   /api/v1/auth/refresh               - Refresh access token
GET    /api/v1/auth/me                    - Get current user
PUT    /api/v1/auth/profile               - Update profile
PUT    /api/v1/auth/password              - Change password
POST   /api/v1/auth/forgot-password       - Request password reset
POST   /api/v1/auth/reset-password        - Reset password
POST   /api/v1/auth/verify-email          - Verify email address
```

### Switches

```
GET    /api/v1/switches                   - List all switches (with pagination)
POST   /api/v1/switches                   - Create new switch
GET    /api/v1/switches/:id               - Get switch details
PUT    /api/v1/switches/:id               - Update switch
DELETE /api/v1/switches/:id               - Delete switch (soft delete)
POST   /api/v1/switches/:id/checkin       - Perform check-in
GET    /api/v1/switches/:id/checkins      - Get check-in history
PATCH  /api/v1/switches/:id/status        - Update status (activate/pause)
POST   /api/v1/switches/:id/test          - Test switch (send test notification)
```

### Messages

```
GET    /api/v1/switches/:switchId/messages    - List messages for switch
POST   /api/v1/switches/:switchId/messages    - Create message
GET    /api/v1/messages/:id                   - Get message details
PUT    /api/v1/messages/:id                   - Update message
DELETE /api/v1/messages/:id                   - Delete message
POST   /api/v1/messages/:id/preview           - Preview message
```

### Health & Monitoring

```
GET    /api/v1/health                     - Health check
GET    /api/v1/health/db                  - Database health
GET    /api/v1/health/redis               - Redis health
GET    /api/v1/metrics                    - Application metrics (Prometheus format)
```

---

## Security Best Practices

### 1. Authentication & Authorization

- JWT with short-lived access tokens (15 min) + refresh tokens (7 days)
- Refresh token rotation
- Password hashing with bcrypt (salt rounds: 12) or argon2
- Account lockout after failed login attempts
- Email verification for new accounts
- 2FA support (future phase)

### 2. Data Security

- Encrypt sensitive message content at rest (AES-256-GCM)
- HTTPS/TLS enforcement in production
- Secure HTTP headers (Helmet.js)
- SQL injection prevention (Prisma ORM)
- XSS protection (input sanitization)
- CSRF protection

### 3. API Security

- Rate limiting per IP and per user
- Request validation with Zod schemas
- CORS configuration (whitelist origins)
- API versioning (/api/v1)
- Request/Response sanitization
- Secure error handling (no sensitive data leaks)

### 4. Infrastructure Security

- Environment variable management
- Secrets management (never commit secrets)
- Database connection pooling
- Redis authentication
- Regular dependency updates (Dependabot)
- Security headers (HSTS, CSP, etc.)

### 5. Monitoring & Logging

- Structured logging (Winston)
- Audit logging for sensitive operations
- Error tracking (Sentry integration)
- Performance monitoring
- Security event alerts

### 6. GDPR & Privacy

- Right to access data
- Right to deletion (soft delete + purge)
- Data portability
- Clear privacy policy
- Cookie consent
- Data retention policies

---

## Development Sprints & Tasks

### SPRINT 1: Project Setup & Infrastructure ✅ COMPLETED

#### Backend TypeScript Setup

- [x] Initialize Node.js project with TypeScript
- [x] Configure TypeScript (tsconfig.json)
  - Strict mode enabled
  - Path aliases for clean imports (@domain/_, @shared/_, etc.)
  - ES2022 target with NodeNext module resolution
  - exactOptionalPropertyTypes enabled
- [x] Setup ESLint + Prettier
  - TypeScript rules configured
  - Import sorting enabled
- [x] Setup folder structure (Clean Architecture)
  - `/src/domain` - Domain layer
  - `/src/application` - Application layer (pending)
  - `/src/infrastructure` - Infrastructure layer (pending)
  - `/src/presentation` - Presentation layer (pending)
  - `/src/shared` - Shared utilities
  - `/src/config` - Configuration (pending)
- [x] Install core dependencies
  - express@5.1.0
  - @prisma/client@6.19.0
  - zod@4.1.12
  - winston@3.18.3
  - bcrypt@6.0.0
  - bullmq@5.63.0
  - typescript@5.9.3
  - All type definitions installed

#### Environment & Configuration

- [x] Create .env.example with DATABASE_URL
- [x] Create .gitignore, .editorconfig
- [x] Configure VS Code settings for formatting
- [ ] Setup environment validation with Zod (pending)
- [ ] Configure Winston logger (pending)
- [ ] Create configuration modules (database, redis, email) (pending)

#### Database Setup

- [x] Install and configure Prisma
- [x] Initialize Prisma with PostgreSQL
- [x] Define Prisma schema with all models
  - User model (soft delete, optimistic locking, indexes)
  - Switch model (status tracking, check-in logic)
  - Message model (delivery tracking, idempotency)
  - CheckIn model (history tracking)
  - AuditLog model
- [x] Generate Prisma Client
- [ ] Create initial migration (pending)
- [ ] Setup database seeder (pending)

#### Express Application Setup

- [ ] Create Express app with TypeScript (pending)
- [ ] Setup middleware pipeline (pending)
- [ ] Create health check endpoint (pending)
- [ ] Test server startup (pending)

#### Docker Setup

- [ ] Create Dockerfile for backend (pending)
- [ ] Create docker-compose.yml (pending)
- [ ] Test Docker setup (pending)

### SPRINT 2: Core Domain Layer ✅ COMPLETED

#### Domain Entities (All with Rich Domain Model + Business Logic)

- [x] Create User entity with validation
  - Email verification support
  - Refresh token management
  - Soft delete pattern
  - Password update with security
  - Optimistic locking (version field)
  - Full CRUD business methods
  - Zod validation for persistence data
- [x] Create Switch entity with business rules
  - Check-in logic with grace period
  - Status transitions (ACTIVE/PAUSED/TRIGGERED/EXPIRED)
  - Trigger detection (shouldTrigger, isPastDue, isGracePeriodExpired)
  - Configuration updates with validation
  - Time until due calculations
  - Immutable once triggered (security feature)
  - Zod validation for persistence data
- [x] Create Message entity
  - Encrypted content storage
  - Delivery tracking with retry logic
  - Idempotency key for duplicate prevention
  - Max delivery attempts (5)
  - Content and recipient updates
  - Zod validation for persistence data
- [x] Create CheckIn entity
  - Immutable historical records
  - Metadata tracking (IP, user agent, location)
  - Security validation (IP address format)
  - Notes field for user context
  - Zod validation for persistence data

#### Value Objects (Immutable + Self-Validating)

- [x] Email value object with RFC 5322 validation
  - Domain and local part extraction
  - Immutable design
- [x] Password value object with strength validation
  - Strength levels: WEAK, MEDIUM, STRONG, VERY_STRONG
  - Requirements: min 8 chars, uppercase, lowercase, numbers
  - Optional special characters for stronger passwords
  - Max 72 chars (bcrypt limit)
- [x] TimeInterval value object
  - 1-365 days validation
  - Conversion methods (days, hours, minutes, milliseconds)
  - Date calculations (addToDate, daysBetween)
  - Comparison methods (isLongerThan, isShorterThan)
  - Human-readable formatting

#### Repository Interfaces (Comprehensive CRUD + Business Queries)

- [x] Define IUserRepository interface
  - Find by ID, email, verification token, refresh token
  - Exists check
  - Save, update, delete, permanent delete
  - Pagination with count
- [x] Define ISwitchRepository interface
  - Find by ID, user ID, status
  - Business queries: switches ready to trigger, approaching due, active switches
  - User limit checks
  - Pagination with count
- [x] Define IMessageRepository interface
  - Find by ID, switch ID, idempotency key
  - Business queries: unsent messages, failed for retry
  - Delivery status tracking
  - Pagination with count
- [x] Define ICheckInRepository interface
  - Find by ID, switch ID with pagination
  - Latest check-in per switch
  - Date range queries
  - Recent check-ins by user
  - Suspicious pattern detection
  - Data retention (deleteOlderThan)

#### Domain Services

- [x] Create SwitchMonitoringService
  - Calculate switch health status (OK/WARNING/CRITICAL/TRIGGERED)
  - Check if in warning period
  - Calculate urgency level (0-100)
  - Validate check-in eligibility
  - Format time remaining (human-readable)
- [x] Define IEncryptionService interface
  - Encrypt/decrypt with AES-256-GCM
  - Key generation and management
  - IV (initialization vector) support
  - Algorithm flexibility
- [x] Define INotificationService interface
  - Send email notifications
  - Send check-in reminders
  - Send switch triggered alerts
  - Send encrypted messages to recipients
  - Email validation
- [x] Define IHashingService interface
  - Password hashing with bcrypt
  - Password verification
  - Rehash detection (for algorithm updates)

#### Domain Events (18 Events Total)

- [x] Create BaseDomainEvent base class
  - Event ID generation
  - Timestamp tracking
  - Aggregate ID and version
- [x] Define User Events (4 events)
  - UserCreatedEvent
  - UserVerifiedEvent
  - UserPasswordChangedEvent
  - UserDeletedEvent
- [x] Define Switch Events (7 events)
  - SwitchCreatedEvent
  - SwitchTriggeredEvent (CRITICAL!)
  - SwitchPausedEvent
  - SwitchActivatedEvent
  - SwitchConfigurationUpdatedEvent
  - SwitchDeletedEvent
  - SwitchApproachingDueEvent
- [x] Define CheckIn Events (2 events)
  - CheckInPerformedEvent
  - SuspiciousCheckInDetectedEvent
- [x] Define Message Events (5 events)
  - MessageCreatedEvent
  - MessageSentEvent
  - MessageDeliveryFailedEvent
  - MessageUpdatedEvent
  - MessageDeletedEvent

#### Additional Achievements

- [x] Result<T> pattern for functional error handling
- [x] Zod schemas for all persistence data validation
- [x] TypeScript strict mode compliance (100%)
- [x] All undefined-safe operations (version++, deliveryAttempts++, etc.)
- [x] Index exports for clean imports
- [x] Comprehensive JSDoc documentation
- [x] 31 files created, ~3000+ lines of production-quality code

#### SPRINT 3 Highlights - Infrastructure Layer (9 files, ~1500+ LOC)

**Repository Implementations (4):** UserRepository, SwitchRepository, MessageRepository,
CheckInRepository

- Full Prisma ORM integration with type-safe queries
- Optimistic locking pattern (updateMany with version check)
- Soft delete support (deletedAt field)
- Result pattern error handling throughout
- Dot notation instead of bracket notation for type safety
- Type-safe persistence interfaces: UserPersistenceData, SwitchPersistenceData,
  MessagePersistenceData, CheckInPersistenceData
- All repositories use typed interfaces instead of Record<string, unknown> for compile-time type
  checking
- Complex business queries (switches ready to trigger, approaching due, failed messages for retry)

**Services (4):**

- EncryptionService: AES-256-GCM authenticated encryption with unique IV per operation
- HashingService: bcrypt password hashing (cost: 12) with rehash detection
- EmailService: Nodemailer SMTP with pre-built templates (verification, password reset, switch
  triggered)
- CacheService: Redis caching with TTL, namespaces, increment/decrement, pattern deletion

**Schema Updates:**

- Message model: Added `failureReason`, `deletedAt`, `version`, made `subject` nullable, made
  `idempotencyKey` unique
- CheckIn model: Renamed `checkedInAt` → `timestamp`, added `notes`, `version`, `createdAt`,
  `updatedAt`
- Switch model: Renamed `checkInInterval` → `checkInIntervalDays`, `gracePeriod` → `gracePeriodDays`
  for consistent naming across frontend/backend/database
- All migrations created and applied successfully

**Infrastructure Features:**

- Prisma Client singleton with connection pooling and graceful shutdown
- Custom Prisma output directory (`src/generated/prisma`) with path aliases
- Environment variable configuration for all services
- Health check methods for Redis and SMTP connections
- Security: Constant-time password verification, auth tag verification, secure key generation

#### SPRINT 4-6 Highlights - Application Layer (~40 files, ~4000+ LOC)

**Authentication (SPRINT 4):** Complete auth system with JWT

- **DTOs (7 files):** RegisterDto, LoginDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto,
  RefreshTokenDto, AuthResponseDto
- **Use Cases (6 files):** RegisterUser, AuthenticateUser, VerifyEmail, ForgotPassword,
  ResetPassword, RefreshToken
- **Features:** Email verification flow, password reset with token expiry, refresh token rotation,
  comprehensive validation

**Switch Management (SPRINT 5):** Full CRUD operations for switches

- **DTOs (6 files):** CreateSwitchDto, UpdateSwitchDto, GetSwitchDto, DeleteSwitchDto,
  ListSwitchesDto, SwitchResponseDto
- **Use Cases (5 files):** CreateSwitch, UpdateSwitch, GetSwitch, DeleteSwitch, ListSwitches
- **Features:** Ownership validation, switch limit checking, pause/activate logic, status management
- **Data Consistency:** Field names consistent across all layers
  (checkInIntervalDays/gracePeriodDays in days, not hours)

**Check-In System (SPRINT 5):** Check-in functionality with history tracking

- **DTOs (3 files):** PerformCheckInDto, GetCheckInHistoryDto, CheckInResponseDto
- **Use Cases (2 files):** PerformCheckIn, GetCheckInHistory
- **Features:** IP/user agent tracking, optional notes, pagination support, metadata collection

**Message Management (SPRINT 6):** Complete message lifecycle

- **DTOs (6 files):** CreateMessageDto, UpdateMessageDto, GetMessageDto, DeleteMessageDto,
  ListMessagesDto, MessageResponseDto
- **Use Cases (5 files):** CreateMessage, UpdateMessage, GetMessage, DeleteMessage, ListMessages
- **Features:** Encrypted content handling, delivery tracking, recipient management, prevent
  modification after send

**Application Layer Achievements:**

- Result<T> pattern consistently applied throughout
- Ownership validation on all protected operations
- Soft delete checks before operations
- Optimistic locking support (version fields)
- exactOptionalPropertyTypes TypeScript compliance
- Comprehensive business validation in use cases
- Factory functions for response DTOs
- Pagination support with total counts

#### SPRINT 7 Highlights - Presentation Layer (~30 files, ~2500+ LOC)

**Controllers (4):** AuthController, SwitchController, MessageController, HealthController

- Thin controller layer (delegates to use cases)
- Standardized API response format
- Request/Response mapping
- HTTP status code management
- Error handling with proper status codes

**Routes (4 modules):** auth.routes, switch.routes, message.routes, health.routes

- RESTful API design
- Protected routes with authentication middleware
- Rate limiting per endpoint
- Request validation with Zod schemas
- OpenAPI-ready structure

**Middleware (6):**

- `auth.middleware.ts`: JWT authentication, optional auth, email verification check
- `error.middleware.ts`: Global error handler, 404 handler, async wrapper
- `cors.middleware.ts`: CORS configuration with environment-based origin
- `logger.middleware.ts`: HTTP request logging with Winston
- `validation.middleware.ts`: Zod schema validation with detailed error messages
- `rateLimiter.middleware.ts`: Rate limiting (global, auth, login, check-in limiters)

**Validators (3):** auth.validator, switch.validator, message.validator

- Comprehensive Zod schemas for all endpoints
- Request body, params, and query validation
- Type-safe validation with TypeScript inference
- Reusable validation schemas

**Custom Error Classes (6):**

- `AppError`: Base error class with HTTP status codes
- `ValidationError`, `UnauthorizedError`, `ForbiddenError`
- `NotFoundError`, `ConflictError`
- Operational vs programmer errors
- Stack traces in development mode

**Shared Constants (2):**

- `messages.ts`: ERROR_MESSAGES, SUCCESS_MESSAGES (centralized)
- `config.ts`: JWT_CONFIG, PASSWORD_CONFIG, SWITCH_CONFIG, RATE_LIMIT_CONFIG, JOB_CONFIG, etc.

**Configuration (1):**

- `logger.config.ts`: Winston logger with file rotation, colorized dev output, JSON prod output

**Application Setup (2):**

- `app.ts`: Express app configuration with all middleware and routes
- `server.ts`: Server entry point with graceful shutdown

**Presentation Layer Features:**

- Zero TypeScript errors (strict mode compliance)
- Rate limiting: Global (1000/15min), Auth (20/15min), Login (5/15min), Check-in (10/min)
- Security headers with Helmet
- Request/Response compression
- Health check endpoints (/, /db, /redis, /full)
- Graceful shutdown handling
- Environment-based configuration

#### SPRINT 8 Highlights - Background Jobs & Queue (COMPLETED - 15 files, ~2200+ LOC)

**Queue Infrastructure:**

- `QueueManager.ts`: Singleton pattern for BullMQ queue management
- Redis connection handling with connection pooling
- Four queues: CHECK_SWITCHES, SEND_NOTIFICATIONS, SEND_REMINDERS, CLEANUP
- Graceful shutdown support with proper cleanup

**Job Processors (4):**

- `CheckSwitchesProcessor`: Monitors switches and triggers when past due
- `SendNotificationProcessor`: Handles email delivery with retry logic
- `SendRemindersProcessor`: Sends proactive check-in reminders
- `CleanupProcessor`: Data retention policy enforcement (NEW)

**Event Handlers (2):**

- `SwitchTriggeredHandler`: Responds to switch trigger events
- `CheckInMissedHandler`: Sends warning notifications

**Enhanced Services:**

- `EmailService`: Now implements INotificationService interface
- Added email templates for reminders, alerts, and messages
- Support for HTML and plain text emails

**Cleanup Features (NEW):**

- Automatic cleanup of old check-ins (>90 days)
- Automatic cleanup of old audit logs (>180 days)
- Permanent deletion of soft-deleted records (>30 days)
- Scheduled daily at 2 AM
- Comprehensive error handling and reporting

**Technical Features:**

- Exponential backoff for retries
- Idempotency checks to prevent duplicate sends
- Cache-based duplicate prevention
- Batch processing for performance
- Comprehensive error handling and logging
- Scheduled jobs with cron patterns
- Test coverage with test-processors.ts and test-cleanup.ts

### SPRINT 3: Infrastructure Layer (4-5 days) ✅ COMPLETED

#### Repository Implementations

- [x] Implement UserRepository (Prisma)
  - CRUD operations with Result pattern
  - Find by email, verification token, refresh token
  - Update refresh token
  - Optimistic locking with version field
  - Soft delete support
- [x] Implement SwitchRepository
  - CRUD operations with Result pattern
  - Find switches due for check-in (findSwitchesReadyToTrigger)
  - Find switches approaching due date
  - Update last check-in
  - Complex business queries
  - Optimistic locking
- [x] Implement MessageRepository
  - CRUD operations with Result pattern
  - Find unsent messages
  - Find failed messages for retry
  - Idempotency key lookup
  - Mark as sent with delivery tracking
  - Optimistic locking
- [x] Implement CheckInRepository
  - Create check-in with metadata (IP, user agent, location, notes)
  - Get history with pagination
  - Latest check-in per switch
  - Date range queries
  - Suspicious pattern detection
  - Data retention (deleteOlderThan)

#### Caching Layer

- [x] Setup Redis client (ioredis)
- [x] Create CacheService
  - Get/Set/Delete operations with JSON serialization
  - TTL management (default 1 hour)
  - Cache invalidation strategies (delete, deletePattern)
  - Namespace support for key organization
  - Increment/Decrement for counters
  - Health check method
  - Statistics retrieval

#### Email Service

- [x] Create EmailService (Nodemailer-based)
- [x] Implement NodemailerProvider with SMTP
- [x] Create email templates
  - Verification email (sendVerificationEmail)
  - Password reset email (sendPasswordResetEmail)
  - Switch triggered notification (sendSwitchTriggeredEmail)
  - Generic send method with HTML/text support
- [x] Email validation and sanitization
- [x] SMTP connection verification

#### Encryption Service

- [x] Create EncryptionService
  - Encrypt/Decrypt with AES-256-GCM
  - Generate secure keys (crypto.randomBytes)
  - Unique IV per encryption
  - Auth tag verification on decryption
  - Algorithm flexibility
- [x] Create HashingService
  - Password hashing (bcrypt, cost: 12)
  - Constant-time password verification
  - Rehash detection for security updates
  - bcrypt hash format validation

### SPRINT 4: Application Layer - Authentication (3-4 days) ✅ COMPLETED

#### DTOs

- [x] Create RegisterDto with Zod validation
- [x] Create LoginDto
- [x] Create AuthResponseDto
- [x] Create RefreshTokenDto
- [x] Create VerifyEmailDto
- [x] Create ForgotPasswordDto
- [x] Create ResetPasswordDto

#### Use Cases

- [x] RegisterUser use case
  - Validate input
  - Check if email exists
  - Hash password
  - Create user
  - Send verification email
  - Return JWT tokens
- [x] AuthenticateUser use case
  - Validate credentials
  - Generate JWT tokens
  - Store refresh token
- [x] RefreshToken use case
  - Validate refresh token
  - Generate new access token
  - Rotate refresh token
- [x] VerifyEmail use case
- [x] ForgotPassword use case
- [x] ResetPassword use case

#### JWT Service

- [x] Create JWT utility
  - Generate access token (15 min)
  - Generate refresh token (7 days)
  - Verify token
  - Decode token

#### Auth Middleware

- [ ] Create authentication middleware (PENDING - SPRINT 7)
  - Extract token from header
  - Verify token
  - Attach user to request
- [ ] Create authorization middleware (role-based) (PENDING - SPRINT 7)

### SPRINT 5: Application Layer - Switch Management (4-5 days) ✅ COMPLETED

#### DTOs

- [x] CreateSwitchDto with validation
- [x] UpdateSwitchDto
- [x] SwitchResponseDto
- [x] GetSwitchDto
- [x] DeleteSwitchDto
- [x] ListSwitchesDto
- [x] PerformCheckInDto
- [x] GetCheckInHistoryDto
- [x] CheckInResponseDto

#### Use Cases

- [x] CreateSwitch use case
  - Validate input
  - Create switch entity
  - Calculate next check-in date
  - Save to database
- [x] UpdateSwitch use case
  - Validate ownership
  - Update switch
  - Recalculate dates if interval changed
- [x] DeleteSwitch use case (soft delete)
- [x] GetSwitches use case (ListSwitches with pagination)
- [x] GetSwitchById use case (GetSwitch)
- [x] CheckIn use case (PerformCheckIn)
  - Validate switch ownership
  - Record check-in
  - Update next check-in date
  - Clear any pending triggers
- [x] GetCheckInHistory use case
  - Retrieve paginated check-in history
  - Ownership validation

### SPRINT 6: Application Layer - Message Management (3-4 days) ✅ COMPLETED

#### DTOs

- [x] CreateMessageDto with validation
- [x] UpdateMessageDto
- [x] MessageResponseDto
- [x] GetMessageDto
- [x] DeleteMessageDto
- [x] ListMessagesDto

#### Use Cases

- [x] CreateMessage use case
  - Validate input
  - Encrypt message content (content comes pre-encrypted)
  - Save message
- [x] UpdateMessage use case
  - Update content (pre-encrypted) and recipient info
  - Prevent updates after send
- [x] DeleteMessage use case (soft delete)
  - Prevent deletion after send
- [x] GetMessage use case
  - Retrieve single message by ID
  - Ownership validation
- [x] ListMessages use case (for a switch)
  - Paginated message list
  - Optional includeDeleted filter
- [ ] SendMessages use case (PENDING - Background Job)
  - Triggered by switch timeout
  - Decrypt messages
  - Send via appropriate provider (email/SMS)
  - Mark as sent
  - Handle failures and retries

### SPRINT 7: Presentation Layer - Controllers & Routes (3-4 days) ✅ COMPLETED

#### Controllers (Thin Layer)

- [x] AuthController
  - register, login, logout, refresh, verifyEmail, forgotPassword, resetPassword
- [x] SwitchController
  - create, getAll, getById, update, delete, checkIn, getCheckIns
- [x] MessageController
  - create, getAll, getById, update, delete
- [x] HealthController
  - health, dbHealth, redisHealth, fullHealth

#### Request Validators

- [x] Auth validators (Zod schemas)
- [x] Switch validators
- [x] Message validators

#### Middleware

- [x] Validation middleware
  - Apply Zod schema validation
  - Return 400 with detailed errors
- [x] Error handling middleware
  - Catch all errors
  - Format error responses
  - Log errors
  - Don't leak sensitive info
- [x] Rate limiting middleware
  - Global, auth, login, check-in limiters
  - Configurable limits per endpoint
- [x] CORS middleware
  - Environment-based origin configuration
- [x] Logger middleware
  - Winston HTTP request logging
- [x] Auth middleware
  - JWT authentication
  - Optional authentication
  - Email verification check

#### Routes

- [x] Auth routes
- [x] Switch routes (protected)
- [x] Message routes (protected)
- [x] Health routes (public)
- [x] Aggregate all routes in index

#### Custom Error Classes

- [x] AppError (base class)
- [x] ValidationError
- [x] UnauthorizedError
- [x] ForbiddenError
- [x] NotFoundError
- [x] ConflictError

#### Shared Constants

- [x] Error messages (centralized)
- [x] Success messages (centralized)
- [x] Configuration constants (JWT, password, switch, rate limit, job configs)

#### Configuration

- [x] Winston logger configuration
  - Development: colorized console output
  - Production: JSON logs with file rotation

#### Application Setup

- [x] app.ts (Express configuration)
  - Middleware pipeline
  - Dependency injection
  - Route registration
- [x] server.ts (Server entry point)
  - Database connection
  - Graceful shutdown
  - Error handling

#### API Documentation

- [x] Setup Swagger/OpenAPI 3.0 ✅ COMPLETED (Sprint 8.5)
- [x] Document all endpoints (19 total) ✅ COMPLETED
- [x] Add example requests/responses ✅ COMPLETED
- [x] Interactive Swagger UI at /api-docs ✅ COMPLETED

### SPRINT 8: Background Jobs & Queue (4-5 days) ✅ COMPLETED

**Status:** 100% Complete - All processors implemented, tested, and working

#### Job Queue Setup

- [x] Install Bull and setup Redis connection ✅
  - Installed: bull, bullmq, ioredis, @types/bull
  - Redis connection via Docker Compose
- [x] Create QueueManager
  - ✅ Initialize queues (CHECK_SWITCHES, SEND_NOTIFICATIONS, SEND_REMINDERS, CLEANUP)
  - ✅ Register processors
  - ✅ Handle job events
  - ✅ Redis connection management
  - ✅ Graceful shutdown support

#### Job Processors

- [x] CheckSwitchesProcessor
  - ✅ Run every hour (configurable)
  - ✅ Find switches past due date
  - ✅ Trigger switches and update status
  - ✅ Queue notification jobs for triggered switches
  - ✅ Batch processing for performance
- [x] SendNotificationProcessor
  - ✅ Process notification jobs
  - ✅ Send messages via EmailService
  - ✅ Handle retries with exponential backoff
  - ✅ Update delivery status
  - ✅ Idempotency checks (won't send twice)
  - ✅ Max delivery attempts (5)
- [x] SendRemindersProcessor
  - ✅ Send reminder before check-in due
  - ✅ Configurable reminder window (90% of interval)
  - ✅ Cache-based duplicate prevention
  - ✅ Bulk processing with error tracking

#### Job Scheduling

- [x] Create scheduled jobs
  - ✅ Check switches job (every hour)
  - ✅ Send reminders job (every 6 hours)
  - ✅ Cleanup old data job (daily at 2 AM)

#### Event Handlers

- [x] SwitchTriggeredHandler
  - ✅ Listen to SwitchTriggered event
  - ✅ Queue notification jobs for each message
  - ✅ Skip already sent messages
  - ✅ Detailed logging for audit trail
- [x] CheckInMissedHandler
  - ✅ Send warning notifications
  - ✅ Check switch status before sending
  - ✅ HTML email templates with call-to-action

#### Additional Implementations

- [x] EmailService updated to implement INotificationService
  - ✅ sendEmail method for general notifications
  - ✅ sendCheckInReminder method with templates
  - ✅ sendSwitchTriggered method for alerts
  - ✅ sendEncryptedMessage for final delivery
- [x] Fixed all TypeScript errors
  - ✅ Result pattern corrections (isSuccess, value)
  - ✅ Email value object handling
  - ✅ Event property mappings (aggregateId)
  - ✅ Optional property handling

#### ✅ Sprint 8 Completion Summary (November 8, 2025):

1. ✅ **Installed npm packages**: `bull`, `bullmq`, `ioredis`, `@types/bull`
2. ✅ **QueueManager** - Complete with 4 queues (CHECK_SWITCHES, SEND_NOTIFICATIONS, SEND_REMINDERS,
   CLEANUP)
3. ✅ **4 Job Processors** - CheckSwitches, SendNotification, SendReminders, Cleanup
4. ✅ **Cleanup job** - Data retention policies (90/180/30 days)
5. ✅ **Event Handlers** - SwitchTriggered, CheckInMissed
6. ✅ **Integration** - initializeQueue.ts wires everything together
7. ✅ **Test scripts** - test-processors.ts, test-cleanup.ts created

**Note:** All queue-related code is complete with zero TypeScript errors. CleanupProcessor uses
correct Prisma import path from custom output directory.

### SPRINT 8.5: API Documentation (Swagger/OpenAPI) ✅ COMPLETED

#### Swagger/OpenAPI 3.0 Setup

- [x] Install swagger-jsdoc and swagger-ui-express
- [x] Create swagger.config.ts with OpenAPI 3.0 definition
- [x] Configure API metadata (title, version, description, servers)
- [x] Define security schemes (Bearer JWT authentication)
- [x] Define reusable schema components (Error, User, Switch, Message, CheckIn)
- [x] Setup Swagger UI endpoint at `/api-docs`
- [x] Configure file path resolution for ESM modules

#### Comprehensive Endpoint Documentation (19 endpoints total)

- [x] **Authentication Routes (3 endpoints)**

  - POST /api/auth/register - Register new user with email verification
  - POST /api/auth/login - Login with credentials and receive JWT tokens
  - POST /api/auth/refresh - Refresh access token using refresh token

- [x] **Switch Routes (7 endpoints)**

  - POST /api/switches - Create new dead man's switch
  - GET /api/switches - List all switches with pagination and filters
  - GET /api/switches/{id} - Get switch details by ID
  - PUT /api/switches/{id} - Update switch configuration
  - DELETE /api/switches/{id} - Soft delete switch
  - POST /api/switches/{id}/checkin - Perform check-in to reset countdown
  - GET /api/switches/{id}/checkins - Get paginated check-in history

- [x] **Message Routes (5 endpoints)**

  - POST /api/switches/{switchId}/messages - Create encrypted message
  - GET /api/switches/{switchId}/messages - List messages with pagination
  - GET /api/messages/{id} - Get message details by ID
  - PUT /api/messages/{id} - Update message (only if not sent)
  - DELETE /api/messages/{id} - Soft delete message (only if not sent)

- [x] **Health Check Routes (4 endpoints)**
  - GET /health - Basic server health check
  - GET /health/db - PostgreSQL database health check
  - GET /health/redis - Redis cache health check
  - GET /health/full - Comprehensive system health check

#### Documentation Features

- [x] Complete request/response schemas with examples
- [x] Request body validation requirements
- [x] Path and query parameter descriptions
- [x] HTTP status codes (200, 201, 400, 401, 404, 503, etc.)
- [x] Error response formats with error codes
- [x] Security requirements per endpoint
- [x] Tags for endpoint organization
- [x] Detailed descriptions for business logic

#### Technical Implementation

- [x] JSDoc @swagger comments in all route files
- [x] Reusable schema definitions ($ref references)
- [x] Path parameter validation (UUID format)
- [x] Query parameter specifications (pagination, filters)
- [x] Request body schemas with required fields
- [x] Response schemas with nested objects
- [x] Enum definitions for status fields

#### Documentation Quality

- [x] All 19 endpoints fully documented
- [x] Interactive Swagger UI for API testing
- [x] Example values for all fields
- [x] Clear descriptions of business rules
- [x] Consistent response format across all endpoints
- [x] Debug logging for documentation generation

#### SPRINT 10 Highlights - Frontend Setup (IN PROGRESS - 11 files, ~800+ LOC)

**Modern Tech Stack:**

- React 19.1.1 with TypeScript 5.9.3 (strict mode)
- Vite 7.1.7 as build tool (ESM, fast HMR)
- Tailwind CSS 4.1.17 with PostCSS
- Latest package versions for all dependencies

**State Management & Data Fetching:**

- Zustand 5.0.8 for global state management
- TanStack React Query 5.90.7 for server state
- React Hook Form 7.66.0 for form state
- Zod 4.1.12 for schema validation

**Routing & Navigation:**

- React Router DOM 7.9.5 installed
- Path aliases configured (@/_, @components/_, @services/\*, etc.)
- Protected route architecture prepared

**API Integration:**

- Axios 1.13.2 with request/response interceptors
- Automatic JWT token injection
- Centralized error handling
- API service modules (auth, switch services started)

**UI Components & Utilities:**

- lucide-react 0.553.0 for icons
- react-hot-toast 2.6.0 for notifications
- date-fns 4.1.0 for date formatting
- Tailwind design system configured

**Files Created:**

- ✅ `services/api.ts` - Axios instance with interceptors
- ✅ `services/auth.service.ts` - Authentication API
- ✅ `services/switch.service.ts` - Switch management API
- ✅ `stores/authStore.ts` - Zustand auth state
- ✅ `types/index.ts` - TypeScript types
- ✅ `constants/index.ts` - App constants
- ✅ `tsconfig.app.json` - TypeScript config with path aliases
- ✅ `tailwind.config.js` - Tailwind CSS configuration

**Next Tasks:**

1. ⏳ Complete message.service.ts
2. ⏳ Setup React Router with route configuration
3. ⏳ Create ProtectedRoute component
4. ⏳ Build layout components (Header, Footer)
5. ⏳ Configure React Query Provider

### SPRINT 9: Testing (4-5 days) ⏳ IN PROGRESS (30% complete)

#### Unit Tests

- [x] Setup Jest with TypeScript
  - jest.config.ts created with ES modules support
  - tsconfig.test.json for test-specific TypeScript config
  - Test scripts in package.json (test, test:watch, test:coverage)
- [x] Test setup and helpers
  - tests/setup.ts with global test configuration
  - tests/helpers/factories.ts with data factory functions
  - Mock data generators for all domain entities
- [x] Test domain entities (partial)
  - [x] User entity validation (363 LOC, comprehensive)
  - [ ] Switch business rules
  - [ ] Message entity
  - [ ] CheckIn entity
- [x] Test value objects (complete)
  - [x] Email value object (164 LOC, RFC 5322 validation)
  - [x] Password value object (208 LOC, strength validation)
  - [ ] TimeInterval value object
- [ ] Test use cases (mocked repositories)
  - [ ] RegisterUser
  - [ ] CreateSwitch
  - [ ] CheckIn
  - [ ] SendMessages
- [ ] Test services
  - [ ] Email service
  - [ ] Encryption service
  - [ ] Hashing service
- [ ] Aim for 80%+ code coverage (currently ~15%)

#### Integration Tests

- [ ] Setup test database
- [ ] Test repository implementations
- [ ] Test API endpoints with Supertest
  - Auth flow
  - Switch CRUD
  - Message CRUD
  - Check-in flow

#### E2E Tests

- [ ] Test complete user workflows
  - Register → Login → Create Switch → Check In
  - Switch timeout → Notifications sent

### SPRINT 10: Frontend Setup (3-4 days) ✅ COMPLETED

#### React + TypeScript Setup

- [x] Create React app with Vite + TypeScript
  - ✅ React 19.1.1 with TypeScript 5.9.3
  - ✅ Vite 7.1.7 as build tool
- [x] Configure TypeScript (strict mode)
  - ✅ Strict mode enabled with all recommended options
  - ✅ ES2022 target with ESNext modules
- [x] Setup ESLint + Prettier
  - ✅ ESLint 9.36.0 with TypeScript parser
  - ✅ React Hooks + React Refresh plugins
- [x] Configure path aliases
  - ✅ @/_, @components/_, @pages/_, @services/_, @hooks/_, @stores/_, @types/_, @utils/_,
    @constants/\*

#### Styling Setup

- [x] Install and configure Tailwind CSS
  - ✅ Tailwind CSS 4.1.17
  - ✅ PostCSS + Autoprefixer configured
- [x] Setup design system (via Tailwind config)
  - ✅ Colors configured in tailwind.config.js
  - ✅ Typography and spacing (Tailwind defaults)
- [x] Create global styles
  - ✅ index.css with Tailwind directives

#### State Management

- [x] Setup Zustand for global state
  - ✅ Zustand 5.0.8 installed
- [x] Create auth store
  - ✅ authStore.ts created with TypeScript
- [ ] Create UI store (modals, toasts)
  - ✅ react-hot-toast 2.6.0 installed (alternative approach)
  - ⏳ UI store pending (optional with react-hot-toast)

#### Routing

- [x] Install React Router v7
  - ✅ react-router-dom 7.9.5 installed
- [x] Setup routes
  - ✅ Public routes (login, register)
  - ✅ Protected routes (dashboard, switches)
  - ✅ 404 Not Found page
- [x] Create ProtectedRoute component

#### API Integration

- [x] Setup Axios instance
  - ✅ Axios 1.13.2 installed
  - ✅ api.ts with base configuration
  - ✅ Request interceptor (add auth token)
  - ✅ Response interceptor (handle errors)
- [x] Create API service modules
  - ✅ auth.service.ts
  - ✅ switch.service.ts
  - ✅ message.service.ts

#### Additional Packages Installed

- [x] React Query (TanStack Query) 5.90.7 - Server state management
- [x] React Hook Form 7.66.0 - Form state management
- [x] Zod 4.1.12 - Schema validation
- [x] date-fns 4.1.0 - Date manipulation
- [x] lucide-react 0.553.0 - Icon library
- [x] react-hot-toast 2.6.0 - Toast notifications

#### Files Created (20 files, ~1500+ LOC)

**Services (3 files):**

- ✅ `/src/services/api.ts` - Axios instance with interceptors
- ✅ `/src/services/auth.service.ts` - Authentication API calls
- ✅ `/src/services/switch.service.ts` - Switch API calls
- ✅ `/src/services/message.service.ts` - Message API calls

**State Management (1 file):**

- ✅ `/src/stores/authStore.ts` - Zustand auth state management

**Components (4 files):**

- ✅ `/src/components/common/ProtectedRoute.tsx` - Route protection
- ✅ `/src/components/layout/Header.tsx` - Navigation header
- ✅ `/src/components/layout/Footer.tsx` - Application footer
- ✅ `/src/components/layout/MainLayout.tsx` - Layout wrapper

**Pages (5 files):**

- ✅ `/src/pages/auth/LoginPage.tsx` - Login page (skeleton)
- ✅ `/src/pages/auth/RegisterPage.tsx` - Register page (skeleton)
- ✅ `/src/pages/dashboard/DashboardPage.tsx` - Dashboard (skeleton)
- ✅ `/src/pages/switch/SwitchListPage.tsx` - Switch list (skeleton)
- ✅ `/src/pages/NotFoundPage.tsx` - 404 page

**Core Configuration (7 files):**

- ✅ `/src/types/index.ts` - TypeScript type definitions
- ✅ `/src/constants/index.ts` - Application constants
- ✅ `/src/main.tsx` - Application entry point with React Query
- ✅ `/src/App.tsx` - Main App component with routing
- ✅ `/src/index.css` - Global styles with Tailwind
- ✅ `tsconfig.app.json` - TypeScript configuration with path aliases
- ✅ `tailwind.config.js` - Tailwind CSS configuration

#### ✅ SPRINT 10 Completed Successfully (100%):

1. ✅ **message.service.ts** - All message API methods
2. ✅ **React Router** - Complete routing with BrowserRouter
3. ✅ **ProtectedRoute** - Authentication-based route protection
4. ✅ **Layout Components** - Header, Footer, MainLayout (responsive)
5. ✅ **React Query** - QueryClient configured in main.tsx
6. ✅ **5 Page Skeletons** - Ready for SPRINT 11 implementation
7. ✅ **Toast Notifications** - react-hot-toast integrated
8. ✅ **Dev Server Running** - http://localhost:3000
9. ✅ **Node.js 24.11.0** - Updated via nvm (WSL)
10. ✅ **Axios Type Imports Fixed** - Runtime compatibility resolved
11. ✅ **Tailwind CSS 4.x** - @tailwindcss/postcss configured
12. ✅ **Yarn Package Manager** - Windows compatibility (npm rollup bug workaround)

**Issues Resolved:**

- Vite 7.x rollup binary issues on Windows (solved with Yarn)
- Tailwind CSS 4.x PostCSS plugin configuration
- Axios AxiosInstance type import error
- Node.js version compatibility (WSL: nvm, Windows: native v24)

**Package Manager Notes:**

- WSL/Linux: npm or yarn both work
- Windows: **Yarn recommended** (npm has rollup/win32-x64-msvc bug)

### SPRINT 11: Frontend - Authentication & Theme System (3-4 days) ✅ COMPLETED

**Status:** 100% Complete - Fully functional authentication with enhanced theme system and i18n

#### Components Created/Updated (8 files)

- [x] LoginForm component ✅ COMPLETED
  - React Hook Form with Zod validation
  - Translated error messages with i18n
  - Loading states with spinner animation
  - Remember me functionality
  - Theme-aware styling with CSS variables
- [x] RegisterForm component ✅ COMPLETED
  - Password strength indicator (Weak/Medium/Strong/Very Strong)
  - Real-time password requirements validation
  - Confirm password matching
  - Terms of service checkbox
  - Fully translated (EN/TR)
- [x] ThemeContext & ThemeProvider ✅ COMPLETED
  - Light/Dark/System theme support
  - localStorage persistence
  - System theme detection
  - Theme state management
- [x] ThemeSwitcher component ✅ COMPLETED
  - Dropdown menu with hover interaction
  - Light/Dark/System options with icons
  - Visual indication of active theme
  - Theme-aware styling
- [x] LanguageSwitcher component ✅ COMPLETED
  - English/Turkish language support
  - Flag emojis for visual clarity
  - Dropdown menu interface
  - localStorage persistence
- [x] Header component ✅ UPDATED
  - Fully translated navigation
  - Theme and language switchers
  - Responsive design
  - Theme-aware styling
- [x] LoginPage & RegisterPage ✅ UPDATED
  - Theme-aware card design
  - Centered layout with gradients
  - Fully translated content

#### Pages

- [x] LoginPage ✅ COMPLETED
  - Full authentication flow
  - Email and password validation
  - "Remember me" option
  - Navigation to register
  - Multi-language support
- [x] RegisterPage ✅ COMPLETED
  - User registration with validation
  - Password strength feedback
  - Terms acceptance
  - Navigation to login
  - Multi-language support
- [x] ThemeDemoPage ✅ NEW FEATURE
  - Comprehensive theme color palette showcase
  - All background, text, and border colors
  - Interactive elements (buttons, forms, links)
  - Status colors display
  - Card examples
  - Accessible via /theme-demo route

#### State Management

- [x] Auth store with Zustand ✅ COMPLETED
  - Zustand persist middleware (built-in)
  - Login action with rememberMe support
  - Logout action with cleanup
  - Token management
  - User state persistence in localStorage
  - Automatic state rehydration

#### Internationalization (i18n) System

- [x] React-i18next setup ✅ COMPLETED
  - i18next 25.6.1 + react-i18next 16.2.4
  - Browser language detection
  - JSON-based translations (en.json, tr.json)
  - localStorage language persistence
  - ~100+ translation keys
- [x] Translation files ✅ COMPLETED
  - English (en.json): Complete
  - Turkish (tr.json): Complete
  - Includes: auth, common, header, validation, toast messages
- [x] Components translated ✅ COMPLETED
  - LoginForm, RegisterForm, LoginPage, RegisterPage
  - Header navigation
  - All validation messages
  - Success/error toast messages

#### Centralized Theme System

- [x] CSS Variables System ✅ NEW FEATURE
  - Complete theme color system in index.css
  - Light mode colors (white backgrounds, gray-900 text)
  - Dark mode colors (gray-800 backgrounds, gray-100 text)
  - Brand colors (indigo-400 for dark mode visibility)
- [x] Theme Utility Classes ✅ COMPLETED
  - Background: .bg-theme-primary, .bg-theme-secondary, .bg-theme-card, .bg-theme-hover
  - Text: .text-theme-primary, .text-theme-secondary, .text-theme-tertiary, .text-theme-inverse
  - Border: .border-theme-primary, .border-theme-secondary
  - Brand: .bg-brand-primary, .text-brand-primary, .border-brand-primary
- [x] Theme Documentation ✅ COMPLETED
  - THEME_SYSTEM.md created with comprehensive guide
  - Usage examples and best practices
  - Migration guide from dark: prefix to theme utilities

#### Technical Achievements

- [x] Zero TypeScript errors (strict mode) ✅
- [x] Zero dark: prefixes (all converted to theme utilities) ✅
- [x] JSON-based i18n (moved from inline to organized files) ✅
- [x] Password strength algorithm with 5 levels ✅
- [x] Form validation with real-time feedback ✅
- [x] Responsive design (mobile-first) ✅
- [x] Accessibility (ARIA labels, keyboard navigation) ✅

#### API Integration

- [x] Auth API service ✅ ALREADY COMPLETED (SPRINT 10)
  - login() with credentials
  - register() with user data
  - logout() with cleanup
  - refreshToken() for token rotation

#### Files Created/Modified Summary

**New Files (3):**

- `/src/contexts/ThemeContext.tsx` - Theme management
- `/src/components/common/ThemeSwitcher.tsx` - Theme switcher UI
- `/src/pages/ThemeDemoPage.tsx` - Theme color showcase
- `/src/i18n/config.ts` - i18n configuration
- `/src/i18n/locales/en.json` - English translations
- `/src/i18n/locales/tr.json` - Turkish translations
- `/THEME_SYSTEM.md` - Theme documentation

**Updated Files (7):**

- `/src/components/auth/LoginForm.tsx` - Full i18n + theme utilities
- `/src/components/auth/RegisterForm.tsx` - Full i18n + theme utilities + password strength
- `/src/components/layout/Header.tsx` - Full i18n + theme utilities
- `/src/components/common/LanguageSwitcher.tsx` - Theme utilities
- `/src/pages/auth/LoginPage.tsx` - Theme utilities
- `/src/pages/auth/RegisterPage.tsx` - Theme utilities
- `/src/index.css` - Complete CSS variables system
- `/src/App.tsx` - Theme demo route
- `/src/constants/index.ts` - Theme demo route constant

#### ✅ Sprint 11 Completion Summary (November 9, 2025):

1. ✅ **Complete authentication UI** - LoginForm, RegisterForm with full validation
2. ✅ **Multi-language support** - English & Turkish with react-i18next
3. ✅ **Theme management** - Light/Dark/System with CSS variables
4. ✅ **Centralized theme system** - No more dark: prefixes, all CSS variables
5. ✅ **Password strength indicator** - Real-time visual feedback
6. ✅ **Form validation** - Zod schemas with translated error messages
7. ✅ **Responsive design** - Mobile-first approach
8. ✅ **Theme demo page** - Comprehensive color palette showcase
9. ✅ **Persistent state** - Auth, theme, and language preferences saved
10. ✅ **Zero TypeScript errors** - 100% strict mode compliance

**Next Sprint:** SPRINT 12 - Frontend Switch Management

- Dashboard with switch overview
- Switch CRUD operations
- Check-in functionality
- Switch status indicators

### SPRINT 12: Frontend - Switch Management (5-6 days) ✅ COMPLETED

#### Type Safety & Data Consistency Improvements

- [x] Updated Switch TypeScript interface with consistent field names
  - `checkInIntervalDays` and `gracePeriodDays` (matching backend)
  - Ensures type safety across frontend-backend communication
- [x] Field name consistency enforced across all layers (database → backend → frontend)

#### Components

- [x] SwitchCard component
  - Display switch info
  - Show check-in status
  - Actions (edit, delete, check-in)
  - Updated with consistent field names (checkInIntervalDays/gracePeriodDays)
  - Fixed nested Link issue (Edit button now uses useNavigate)
- [x] SwitchForm component
  - Create/Edit form
  - Validation
  - React Hook Form integration
  - Updated with consistent field names
- [x] SwitchList component
  - Display all switches
  - Empty state
  - Loading state
  - Pagination support
- [x] CheckInButton component
  - Visual countdown
  - One-click check-in

#### Pages

- [x] DashboardPage
  - Overview of all switches
  - Quick stats
  - Upcoming check-ins list
  - Statistics cards
- [x] SwitchListPage
  - Search and filter functionality
  - Delete with confirmation
- [x] SwitchCreatePage
  - Form with validation
  - Success redirect
- [x] SwitchEditPage
  - Pre-populated form
  - Update functionality
- [x] SwitchDetailPage
  - Switch info
  - Check-in history
  - Messages list
  - Updated with consistent field names

#### Custom Hooks

- [x] useSwitches hook
  - Fetch switches (useSwitches)
  - Fetch single switch (useSwitch)
  - Create switch (useCreateSwitch)
  - Update switch (useUpdateSwitch)
  - Delete switch (useDeleteSwitch)
  - React Query integration with proper cache invalidation
- [x] useCheckIn hook
  - Perform check-in
  - Optimistic updates
  - Check-in history (useCheckInHistory)

#### Bug Fixes

- [x] Fixed backend response format (switches → items) for PaginatedResponse consistency
- [x] Fixed nested `<a>` elements in SwitchCard (Edit button uses useNavigate instead of Link)
- [x] All components use custom hooks for data fetching and mutations

### SPRINT 13: Frontend - Message Management (3-4 days) ✅ COMPLETED

**Status:** 100% Complete - Full message management UI with CRUD operations

#### Components

- [x] MessageForm component ✅ COMPLETED
  - React Hook Form with Zod validation
  - Recipient email and name fields
  - Subject (optional) and content fields
  - Encryption note for users
  - Create/Edit modes with proper state handling
  - Theme-aware styling with CSS variables
  - Multi-language support (EN/TR)
  - Loading states and error handling
- [x] MessageList component ✅ COMPLETED
  - Display messages with pagination
  - Preview, Edit, Delete actions
  - Status badges (Sent/Pending)
  - Empty state with helpful message
  - Sent messages are read-only (no edit/delete)
  - Responsive card layout
  - Theme-aware styling
- [x] MessagePreview component ✅ COMPLETED
  - Modal overlay with backdrop
  - Full message details display
  - Recipient information
  - Delivery status and attempts
  - Failure reason display (if any)
  - Encryption note for users
  - Keyboard support (ESC to close)

#### Custom Hooks

- [x] useMessages hook ✅ COMPLETED
  - Fetch messages with pagination
  - Fetch single message
  - React Query integration
  - Cache invalidation on mutations
  - Translated error messages
- [x] useCreateMessage hook ✅ COMPLETED
  - Create new message mutation
  - Success/error toast notifications
  - Automatic cache updates
- [x] useUpdateMessage hook ✅ COMPLETED
  - Update existing message mutation
  - Only works for unsent messages
  - Cache invalidation and updates
- [x] useDeleteMessage hook ✅ COMPLETED
  - Soft delete message mutation
  - Only works for unsent messages
  - Cache cleanup

#### Integration

- [x] Message API service ✅ ALREADY COMPLETED (SPRINT 10)
  - Backend response format transformation
  - Type-safe API calls
  - Error handling
- [x] Add message management to SwitchDetailPage ✅ COMPLETED
  - Modal-based message form
  - Integrated MessageList component
  - Create/Edit message flows
  - Seamless UX with React Query

#### Type Safety & Backend Integration

- [x] Updated Message type with delivery fields ✅ COMPLETED
  - deliveryAttempts, lastAttemptAt, failureReason
  - Full compatibility with backend DTOs
- [x] Fixed pagination format mismatch ✅ COMPLETED
  - Backend: `{ messages: [], pagination: {...} }`
  - Frontend: `{ items: [], pagination: {...} }`
  - Automatic transformation in service layer
- [x] Type aliases for consistency ✅ COMPLETED
  - CreateMessageRequest = CreateMessageData
  - UpdateMessageRequest = UpdateMessageData

#### i18n (Internationalization)

- [x] English translations (en.json) ✅ COMPLETED
  - Message form labels and placeholders
  - Status labels (Sent/Pending/Failed)
  - Action labels (Preview/Edit/Delete)
  - Preview modal content
  - Success/error messages
  - ~50+ translation keys added
- [x] Turkish translations (tr.json) ✅ COMPLETED
  - Complete Turkish translations for all message UI
  - Consistent terminology throughout

#### Files Created/Modified Summary

**New Files (6):**

- `/src/hooks/useMessages.ts` - Message management hooks (180 LOC)
- `/src/components/message/MessageForm.tsx` - Message form component (220 LOC)
- `/src/components/message/MessageList.tsx` - Message list component (190 LOC)
- `/src/components/message/MessagePreview.tsx` - Message preview modal (160 LOC)
- `/src/components/message/index.ts` - Barrel exports

**Updated Files (5):**

- `/src/types/index.ts` - Added delivery fields to Message type
- `/src/services/message.service.ts` - Backend format transformation
- `/src/pages/switch/SwitchDetailPage.tsx` - Integrated message management
- `/src/i18n/locales/en.json` - Message translations
- `/src/i18n/locales/tr.json` - Turkish message translations

#### Form Validation Enhancements

- [x] Real-time validation with onBlur mode ✅ COMPLETED
  - Instant feedback on field blur
  - Visual error states (red borders)
  - LoginForm/RegisterForm consistency
- [x] Comprehensive validation rules ✅ COMPLETED
  - Email: Required + valid format
  - Recipient Name: Required, 2-100 characters
  - Subject: Optional, max 200 characters
  - Content: Required, 10-5000 characters
- [x] Translated validation messages (EN/TR) ✅ COMPLETED
  - ~10 new validation keys per language
  - Context-specific error messages
- [x] Visual error indicators ✅ COMPLETED
  - Red border on invalid fields
  - AlertCircle icon with error message
  - Error text below each field
- [x] Backend error display ✅ COMPLETED
  - Top-of-form error banner
  - Backend error message extraction
  - User-friendly error formatting
- [x] Loading states ✅ COMPLETED
  - Disabled inputs during submission
  - Opacity reduction (60%)
  - Cursor not-allowed

#### ✅ Sprint 13 Completion Summary (November 9, 2025):

1. ✅ **Complete message CRUD UI** - MessageForm, MessageList, MessagePreview
2. ✅ **React Query integration** - Optimistic updates, cache management
3. ✅ **Type-safe backend integration** - Fixed pagination format, added delivery fields
4. ✅ **Multi-language support** - Full EN/TR translations
5. ✅ **Theme-aware styling** - CSS variables, no dark: prefixes
6. ✅ **User-friendly UX** - Modals, confirmations, loading states
7. ✅ **Message status handling** - Sent messages are read-only
8. ✅ **Pagination support** - 10 items per page with navigation
9. ✅ **Zero TypeScript errors** - 100% strict mode compliance
10. ✅ **Integrated into SwitchDetailPage** - Seamless user experience
11. ✅ **Real-time form validation** - onBlur validation, visual error states, translated messages

**Total Lines of Code:** ~850 LOC across 11 files

**Next Sprint:** SPRINT 14 - Frontend Polish & UX

- Loading skeletons for better perceived performance
- Confirmation modals for destructive actions
- Error boundaries for graceful error handling
- Responsive design improvements
- Accessibility enhancements

### SPRINT 14: Frontend - Polish & UX (3-4 days) ✅ COMPLETED

**Status:** 100% Complete - Core UX improvements implemented with loading states, modals, error handling, and accessibility

**Goal:** Enhance user experience with loading states, better error handling, and responsive design

#### Bug Fixes

- [x] **Bug: Message list not refreshing after create/update/delete** ✅ FIXED
  - Updated React Query cache invalidation with predicate-based approach
  - Changed from simple key match to predicate that clears all paginated results
  - Messages now refresh automatically after mutations
- [x] **Bug: Buttons missing pointer cursor on hover** ✅ FIXED
  - Added global CSS rule for all interactive elements
  - Applied to buttons, links, and role="button" elements
  - Disabled elements show not-allowed cursor

#### Loading States & Skeletons

- [x] Create LoadingSkeleton component ✅ COMPLETED
  - 7 skeleton variants: Base Skeleton, CardSkeleton, ListSkeleton, FormSkeleton, TableSkeleton, PageSkeleton, DetailPageSkeleton
  - Shimmer animation with CSS
  - Theme-aware styling with CSS variables
  - ARIA labels for accessibility (role="status", aria-label="Loading...")
- [x] Add skeleton to SwitchListPage ✅ COMPLETED
  - Replaced loading spinner with CardSkeleton
  - Shows 6 skeleton cards during loading
  - Smooth transition to real data
- [x] Add skeleton to MessageList ✅ COMPLETED
  - Message card skeleton with proper structure
  - Loading state during fetch
- [x] Add skeleton to SwitchDetailPage ✅ COMPLETED
  - DetailPageSkeleton for full page loading
  - Better perceived performance

#### Confirmation Modals

- [x] Create ConfirmDialog component ✅ COMPLETED
  - Generic reusable modal with backdrop blur
  - Title, message, confirm/cancel buttons
  - Danger variant (red) and Primary variant
  - Theme-aware styling with CSS variables
  - Keyboard support (Enter to confirm, Escape to cancel)
  - Loading state during async operations
  - ARIA attributes (role="dialog", aria-modal="true")
- [x] Create useConfirmDialog hook ✅ COMPLETED
  - Simplified state management for confirmation dialogs
  - Async operation support
  - Configuration-based API
- [x] Replace window.confirm in SwitchListPage ✅ COMPLETED
  - Delete switch confirmation with ConfirmDialog
  - Styled modal instead of browser dialog
- [x] Replace window.confirm in MessageList ✅ COMPLETED
  - Delete message confirmation
  - Shows recipient name in confirmation
- [x] Replace window.confirm in SwitchCard ✅ COMPLETED
  - Removed window.confirm (parent handles confirmation)
  - Better UX with centralized dialog
- [x] Add confirmation to SwitchDetailPage ✅ COMPLETED
  - Delete switch confirmation
  - Integrated with useConfirmDialog hook
- [x] Add confirmation to CheckInButton ✅ COMPLETED
  - Check-in confirmation (optional via showConfirmation prop)
  - Uses ConfirmDialog for consistency

#### Error Boundaries

- [x] Create ErrorBoundary component ✅ COMPLETED
  - React class component catching JavaScript errors
  - Fallback UI with error message
  - "Try Again" button to reset error state
  - "Reload Page" and "Go Home" buttons
  - Logs errors to console in development
  - Theme-aware styling
  - componentDidCatch lifecycle for error logging
- [x] Wrap entire app with ErrorBoundary ✅ COMPLETED
  - Wrapped in App.tsx at root level
  - Catches errors from all routes
  - Dashboard, Switches, Auth routes all protected
- [x] ErrorFallback UI integrated ✅ COMPLETED
  - User-friendly error message
  - Multiple recovery options
  - Shield icon with error indication

#### Toast Notifications Enhancement

- [x] Customize toast styling ✅ COMPLETED
  - Theme-aware colors with CSS variables
  - Consistent with app design system
  - Success: green border with checkmark icon
  - Error: red border with X icon
  - Loading: animated spinner
  - Border and background colors match theme
- [x] Add toast positions configuration ✅ COMPLETED
  - Top-right for all notifications
  - 4 second duration
  - Theme transitions apply to toasts

#### Responsive Design Improvements

- [x] Improve ConfirmDialog mobile layout ✅ COMPLETED
  - Responsive padding (p-4 on mobile, p-6 on desktop)
  - Full-width buttons on mobile
  - Touch-friendly button sizes
- [x] Improve MessageForm mobile layout ✅ COMPLETED
  - Full-width inputs on all screens
  - Stack buttons vertically on mobile (flex-col)
  - Button ordering: Cancel first, Submit second on mobile
  - Responsive padding and text sizes
- [x] Improve SwitchDetailPage mobile layout ✅ COMPLETED
  - Responsive header with flex-col on mobile
  - Icon-only buttons on mobile (Edit/Delete text hidden)
  - Touch-friendly button spacing
  - Modal responsive on all screen sizes

#### Accessibility Enhancements

- [x] Add ARIA labels to all interactive elements ✅ COMPLETED
  - MessageList: aria-label on Preview, Edit, Delete buttons
  - SwitchCard: aria-label on View Details link and action buttons
  - All icon-only buttons have descriptive labels
  - Modal components have proper ARIA attributes
- [x] Keyboard navigation ✅ COMPLETED
  - ConfirmDialog: Enter to confirm, Escape to cancel
  - All modals closable with Escape key
  - Forms submit with Enter key
  - Tab navigation works throughout
- [x] Form accessibility ✅ COMPLETED
  - MessageForm: aria-invalid on invalid fields
  - aria-describedby linking to error messages
  - role="alert" on error messages
  - AlertCircle icons with aria-hidden="true"
  - Proper label associations with htmlFor

#### Theme & Internationalization Improvements

- [x] SwitchDetailPage info card ✅ COMPLETED
  - Replaced hardcoded colors with theme CSS variables
  - Added i18n translations (switches.detail.infoCardTitle/infoCardDescription)
  - Works seamlessly with light/dark mode
- [x] Footer component ✅ COMPLETED
  - Full theme-aware styling with CSS variables
  - Multi-language support (EN/TR)
  - Responsive design improvements
  - Transition effects on hover
  - Added footer translations to both language files

#### ✅ Sprint 14 Completion Summary (November 9, 2025):

1. ✅ **Bug Fixes** - Message list refresh and cursor pointer on buttons
2. ✅ **Loading Skeletons** - 7 skeleton variants with shimmer animation
3. ✅ **Confirmation Modals** - ConfirmDialog component replacing window.confirm in 5 locations
4. ✅ **Error Boundaries** - ErrorBoundary wrapping entire app with fallback UI
5. ✅ **Toast Styling** - Theme-aware notifications with custom icons
6. ✅ **Mobile Responsive** - Improved layouts for ConfirmDialog, MessageForm, SwitchDetailPage
7. ✅ **Accessibility** - ARIA labels, keyboard navigation, form accessibility
8. ✅ **Theme Consistency** - Info card and Footer using CSS variables and i18n
9. ✅ **useConfirmDialog Hook** - Simplified confirmation dialog state management
10. ✅ **Global CSS Improvements** - Cursor pointer rules, shimmer animations

**New Files Created (4):**
- `/src/components/common/ConfirmDialog.tsx` - Reusable confirmation modal (150 LOC)
- `/src/components/common/LoadingSkeleton.tsx` - Loading skeleton variants (200 LOC)
- `/src/components/common/ErrorBoundary.tsx` - Error boundary component (120 LOC)
- `/src/hooks/useConfirmDialog.ts` - Confirmation dialog hook (80 LOC)

**Updated Files (11):**
- `/src/hooks/useMessages.ts` - Fixed cache invalidation
- `/src/index.css` - Added cursor-pointer rules and shimmer animation
- `/src/App.tsx` - Added ErrorBoundary wrapper and toast styling
- `/src/components/message/MessageList.tsx` - ConfirmDialog + accessibility
- `/src/pages/switch/SwitchListPage.tsx` - ConfirmDialog integration
- `/src/components/switch/SwitchCard.tsx` - Removed window.confirm, added aria-labels
- `/src/pages/switch/SwitchDetailPage.tsx` - ConfirmDialog + responsive + theme improvements
- `/src/components/switch/CheckInButton.tsx` - Optional confirmation support
- `/src/components/message/MessageForm.tsx` - Accessibility + responsive improvements
- `/src/i18n/locales/en.json` - Footer and info card translations
- `/src/i18n/locales/tr.json` - Turkish translations

**Total Lines of Code:** ~550 new LOC, ~700 LOC modified

**Next Sprint:** SPRINT 15 - Deployment & DevOps

- Backend deployment (Railway, Render, or DigitalOcean)
- Frontend deployment (Vercel, Netlify, or Cloudflare Pages)
- CI/CD pipeline setup
- Monitoring and logging
- Production database and Redis setup

### SPRINT 15: Deployment & DevOps (4-5 days)

#### Backend Deployment

- [ ] Choose hosting provider
  - Railway
  - Render
  - DigitalOcean App Platform
  - AWS (EC2/ECS)
- [ ] Setup production database (PostgreSQL)
- [ ] Setup production Redis
- [ ] Configure environment variables
- [ ] Setup CI/CD pipeline (GitHub Actions)
  - Run tests
  - Build Docker image
  - Deploy to hosting
- [ ] Configure domain and SSL
- [ ] Setup monitoring (PM2, New Relic, or Datadog)

#### Frontend Deployment

- [ ] Choose hosting provider
  - Vercel
  - Netlify
  - Cloudflare Pages
- [ ] Configure environment variables
- [ ] Setup CI/CD
- [ ] Configure custom domain
- [ ] SSL certificate

#### Monitoring & Logging

- [ ] Setup error tracking (Sentry)
- [ ] Setup application monitoring
- [ ] Configure log aggregation
- [ ] Setup alerts

#### Documentation

- [ ] Finalize API documentation
- [ ] Write deployment guide
- [ ] Create user guide
- [ ] Document architecture decisions

---

## Core Concepts & Patterns Explained

### 1. Clean Architecture Benefits

- **Independence**: Business logic independent of frameworks
- **Testability**: Easy to test each layer in isolation
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap implementations (e.g., change database)

### 2. Repository Pattern

Abstracts data access logic. Business logic doesn't know if data comes from PostgreSQL, MongoDB, or
an API.

```typescript
// Domain layer - interface only
interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// Infrastructure layer - implementation
class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const data = this.toPersistence(user);
    const saved = await this.prisma.user.create({ data });
    return this.toDomain(saved);
  }
}
```

### 3. Use Case Pattern

Each use case represents a single business operation. Makes business logic explicit and testable.

```typescript
class CreateSwitch {
  constructor(
    private switchRepo: ISwitchRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(dto: CreateSwitchDto, userId: string): Promise<Switch> {
    // Validate user exists
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // Create switch entity (validates business rules)
    const switch = Switch.create({
      userId,
      name: dto.name,
      checkInInterval: dto.checkInInterval,
      gracePeriod: dto.gracePeriod
    });

    // Persist
    return await this.switchRepo.save(switch);
  }
}
```

### 4. Dependency Injection

Components receive their dependencies rather than creating them. Enables testing and loose coupling.

```typescript
// Manual DI (simple approach)
const prisma = new PrismaClient();
const userRepo = new UserRepository(prisma);
const switchRepo = new SwitchRepository(prisma);
const createSwitchUseCase = new CreateSwitch(switchRepo, userRepo);

// Or use a DI container (inversify, tsyringe)
```

### 5. Strategy Pattern for Notifications

Different delivery methods implement the same interface.

```typescript
interface NotificationStrategy {
  send(recipient: string, content: string): Promise<void>;
}

class EmailStrategy implements NotificationStrategy {
  async send(recipient: string, content: string): Promise<void> {
    // Send email
  }
}

class SMSStrategy implements NotificationStrategy {
  async send(recipient: string, content: string): Promise<void> {
    // Send SMS
  }
}

class NotificationService {
  constructor(private strategies: Map<DeliveryType, NotificationStrategy>) {}

  async send(type: DeliveryType, recipient: string, content: string) {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new Error('Invalid delivery type');
    await strategy.send(recipient, content);
  }
}
```

### 6. Event-Driven Architecture

Decouples components by using events.

```typescript
// Domain event
class SwitchTriggeredEvent {
  constructor(public readonly switchId: string, public readonly triggeredAt: Date) {}
}

// Event handler
class SendNotificationsHandler {
  async handle(event: SwitchTriggeredEvent): Promise<void> {
    const messages = await this.messageRepo.findBySwitchId(event.switchId);
    for (const message of messages) {
      await this.notificationService.send(message);
    }
  }
}

// Event emitter
eventBus.emit('switch.triggered', new SwitchTriggeredEvent(switchId, new Date()));
```

---

## Performance Optimization Strategies

### 1. Database Optimization

- **Indexes**: Critical fields (email, userId, nextCheckInDue)
- **Query optimization**: Use Prisma's `select` and `include` strategically
- **Connection pooling**: Prisma handles this automatically
- **Read replicas**: For scaling reads (future)

### 2. Caching Strategy

- **Cache user sessions**: Redis
- **Cache switch data**: Short TTL for frequently accessed switches
- **Cache invalidation**: On updates

### 3. API Performance

- **Pagination**: Cursor-based for large datasets
- **Rate limiting**: Prevent abuse
- **Compression**: gzip/brotli middleware
- **Response optimization**: Only return needed fields

### 4. Background Jobs

- **Job queue**: Bull for asynchronous processing
- **Job prioritization**: Critical jobs first
- **Retry logic**: Exponential backoff
- **Dead letter queue**: For failed jobs

### 5. Frontend Performance

- **Code splitting**: Lazy load routes
- **React Query**: Cache API responses
- **Debouncing**: Search/filter inputs
- **Memoization**: Expensive calculations

---

## Testing Strategy

### Unit Tests (Jest)

- Test business logic in isolation
- Mock dependencies
- Fast execution
- High coverage (80%+)

```typescript
describe('CreateSwitch Use Case', () => {
  it('should create a switch with valid data', async () => {
    const mockSwitchRepo = mock<ISwitchRepository>();
    const mockUserRepo = mock<IUserRepository>();

    mockUserRepo.findById.mockResolvedValue(mockUser);
    mockSwitchRepo.save.mockResolvedValue(mockSwitch);

    const useCase = new CreateSwitch(mockSwitchRepo, mockUserRepo);
    const result = await useCase.execute(validDto, userId);

    expect(result).toBeDefined();
    expect(result.name).toBe(validDto.name);
  });
});
```

### Integration Tests (Supertest)

- Test API endpoints
- Use test database
- Test real interactions

```typescript
describe('POST /api/v1/switches', () => {
  it('should create a switch', async () => {
    const response = await request(app)
      .post('/api/v1/switches')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validSwitchData)
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
  });
});
```

### E2E Tests

- Test complete user flows
- Simulate real usage
- Critical paths only

---

## Resources & Learning Materials

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Node.js & Express

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Documentation](https://expressjs.com/)

### Clean Architecture

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Design Patterns

- [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- [Patterns.dev](https://www.patterns.dev/)

### Prisma

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### Security

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Testing

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Next Steps (November 9, 2025)

### ✅ Completed Sprints (1-11)

- Backend fully functional with API documentation
- Frontend setup complete with authentication
- Theme system and i18n fully implemented
- All core infrastructure in place

### 🎯 Current Priority: SPRINT 12 - Frontend Switch Management

#### Immediate Next Tasks (Tomorrow - November 10, 2025):

1. **Dashboard Page Implementation**

   - Create DashboardPage with switch overview
   - Display switch statistics (total, active, triggered)
   - Show upcoming check-ins
   - Add quick action buttons

2. **Switch Components**

   - Implement SwitchCard component
     - Display switch name, description
     - Show countdown timer to next check-in
     - Status badge (ACTIVE/PAUSED/TRIGGERED/EXPIRED)
     - Quick actions (Check-in, Edit, Delete)
   - Create SwitchList component
     - Grid/list layout toggle
     - Pagination support
     - Empty state message
     - Loading skeleton
   - Build SwitchForm component
     - Create/Edit switch form
     - Interval and grace period configuration
     - Form validation with Zod
     - Multi-language support

3. **Switch Pages**

   - SwitchListPage - List all user switches
   - SwitchCreatePage - Create new switch
   - SwitchDetailPage - View switch details and messages

4. **Switch API Integration**

   - Connect to existing switch.service.ts
   - Use React Query for data fetching
   - Implement optimistic updates for check-ins
   - Add error handling and retry logic

5. **Check-In Functionality**
   - CheckInButton component with countdown
   - Visual feedback on successful check-in
   - Automatic switch list refresh
   - Toast notifications

#### Development Notes:

- Continue using theme utilities (no dark: prefixes)
- Add all new text to en.json and tr.json
- Follow the same pattern as LoginForm/RegisterForm
- Use React Hook Form + Zod for all forms
- Implement responsive design (mobile-first)

#### Testing Checklist:

- [ ] Test switch CRUD operations
- [ ] Test check-in flow
- [ ] Test theme switching on all new pages
- [ ] Test language switching with all new translations
- [ ] Test on mobile devices (responsive design)

### 📝 Documentation Updates Needed:

- Update THEME_SYSTEM.md if new color utilities are added
- Document any new patterns or conventions
- Add inline JSDoc comments for complex components

---

## Decision Points

Before we start, let's decide on a few technical choices:

### 1. Dependency Injection

- **Option A**: Manual DI (simple, no library)
- **Option B**: InversifyJS (powerful, full-featured)
- **Option C**: TSyringe (lightweight, decorator-based)

**Recommendation**: Start with **Manual DI** (Option A), migrate to library if needed

### 2. Validation

- **Option A**: Zod (type inference, composable)
- **Option B**: class-validator (decorator-based)

**Recommendation**: **Zod** (Option A) - Better TypeScript integration

### 3. Background Jobs

- **Option A**: Bull (Redis-based, powerful)
- **Option B**: node-cron (simple, no Redis required)

**Recommendation**: **Bull** (Option A) - Production-ready, scalable

### 4. Email Service

- **Option A**: Nodemailer (SMTP)
- **Option B**: SendGrid SDK
- **Option C**: AWS SES

**Recommendation**: **Nodemailer** for dev, **SendGrid/SES** for production

### 5. Testing

- **Jest** (standard choice, excellent TypeScript support)

---

## Let's Begin! 🚀

Ready to build an enterprise-grade Dead Man's Switch application with:

- ✅ Clean Architecture
- ✅ SOLID Principles
- ✅ Design Patterns
- ✅ Type Safety (TypeScript)
- ✅ Comprehensive Testing
- ✅ Production-Ready Code
