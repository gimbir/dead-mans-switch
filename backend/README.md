# 🛡️ Dead Man's Switch - Backend API

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

*A secure, enterprise-grade Dead Man's Switch service for automated message delivery*

[Features](#-features) •
[Architecture](#-architecture) •
[Quick Start](#-quick-start) •
[API Documentation](#-api-documentation) •
[Development](#-development)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**Dead Man's Switch** is a service that automatically sends encrypted messages to designated recipients if you fail to check in within a specified time period. Perfect for:

- 🔐 **Digital Estate Planning** - Share important passwords and account info with loved ones
- 🆘 **Emergency Contacts** - Automatically notify people if something happens to you
- 💼 **Business Continuity** - Ensure critical information reaches the right people
- 🔑 **Secret Management** - Securely share sensitive information after a specified time

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure JWT-based authentication with refresh tokens
- ⏰ **Configurable Check-ins** - Set custom intervals and grace periods
- 📧 **Email Notifications** - Automated delivery of encrypted messages
- 🔔 **Reminder System** - Get notified before your switch triggers
- 🔒 **Client-side Encryption** - Zero-knowledge architecture for maximum security
- 📊 **Activity Tracking** - Monitor all check-ins and system events

### Technical Features
- 🏗️ **Clean Architecture** - Domain-Driven Design with clear separation of concerns
- 🔐 **Enterprise Security** - Rate limiting, CORS, Helmet, input validation
- 📈 **Scalable Infrastructure** - Redis caching and Bull queues for background jobs
- 🔄 **Background Processing** - Automated switch checking and cleanup
- 📝 **Comprehensive Logging** - Winston logger with different log levels
- 🧪 **Testing Ready** - Jest setup with factory patterns
- 📚 **API Documentation** - Auto-generated Swagger/OpenAPI documentation
- 🐳 **Docker Ready** - Containerized deployment support

## 🏛️ Architecture

This project follows **Clean Architecture** principles and **Domain-Driven Design**:

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│    (Controllers, Routes, Middleware, DTOs)       │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│             Application Layer                    │
│           (Use Cases, Services)                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│               Domain Layer                       │
│      (Entities, Value Objects, Rules)            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Infrastructure Layer                   │
│  (Database, External Services, Implementations)  │
└─────────────────────────────────────────────────┘
```

### Key Design Patterns
- **Repository Pattern** - Abstract data access
- **Dependency Injection** - Loose coupling between layers
- **Factory Pattern** - Object creation abstraction
- **Singleton Pattern** - Database connection management
- **Strategy Pattern** - Email service implementations

## 🛠️ Tech Stack

### Core
- **[Node.js](https://nodejs.org/)** (v20+) - Runtime environment
- **[TypeScript](https://www.typescriptlang.org/)** (v5.9+) - Type safety
- **[Express](https://expressjs.com/)** (v5.x) - Web framework

### Database & Caching
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Prisma](https://www.prisma.io/)** (v6.x) - ORM and migrations
- **[Redis](https://redis.io/)** - Caching and session storage

### Background Jobs
- **[Bull](https://github.com/OptimalBits/bull)** - Queue management
- **Cron Jobs** - Scheduled task execution

### Security & Validation
- **[bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - JWT authentication
- **[helmet](https://helmetjs.github.io/)** - Security headers
- **[express-rate-limit](https://www.npmjs.com/package/express-rate-limit)** - Rate limiting
- **[zod](https://zod.dev/)** - Runtime validation

### Development Tools
- **[Jest](https://jestjs.io/)** - Testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Nodemon](https://nodemon.io/)** - Hot reload
- **[Husky](https://typicode.github.io/husky/)** - Git hooks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 14.x
- **Redis** >= 6.x

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dead-mans-switch-backend.git
   cd dead-mans-switch-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed database (optional)**
   ```bash
   npm run prisma:seed
   ```

## ⚙️ Configuration

### Environment Variables

See `.env.example` for all available configuration options. Key variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key

# Email (SMTP or SendGrid)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASSWORD=your-password
```

### Security Recommendations

For production:
1. Generate strong secrets for JWT tokens
2. Use environment-specific database credentials
3. Enable HTTPS and configure proper CORS
4. Set appropriate rate limits
5. Use a production-ready email service (SendGrid, AWS SES)

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Server starts at `http://localhost:5000`

### Production Mode
```bash
npm run build
npm start
```

### With Docker
```bash
docker-compose up -d
```

## 📚 API Documentation

### Swagger UI
Once the server is running, access the interactive API documentation:

**Local:** `http://localhost:5000/api-docs`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Switches
- `GET /api/switches` - List all switches
- `POST /api/switches` - Create new switch
- `GET /api/switches/:id` - Get switch details
- `PATCH /api/switches/:id` - Update switch
- `DELETE /api/switches/:id` - Delete switch
- `POST /api/switches/:id/checkin` - Perform check-in

#### Messages
- `GET /api/switches/:switchId/messages` - List messages for a switch
- `POST /api/switches/:switchId/messages` - Create message
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

#### Health Checks
- `GET /health` - Basic health check
- `GET /health/db` - Database health
- `GET /health/redis` - Redis health
- `GET /health/full` - Complete system health

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/                # Unit tests
│   ├── domain/         # Domain entities and value objects
│   ├── application/    # Use cases
│   └── infrastructure/ # Repositories and services
├── integration/        # Integration tests
├── e2e/               # End-to-end tests
└── helpers/           # Test utilities and factories
```

## 📁 Project Structure

```
src/
├── application/           # Use cases (business logic)
│   └── use-cases/
│       ├── auth/         # Authentication use cases
│       ├── switch/       # Switch management
│       ├── message/      # Message management
│       └── checkin/      # Check-in operations
│
├── domain/               # Domain layer (core business rules)
│   ├── entities/         # Domain entities
│   ├── value-objects/    # Value objects
│   └── repositories/     # Repository interfaces
│
├── infrastructure/       # Infrastructure layer
│   ├── database/         # Prisma client
│   ├── repositories/     # Repository implementations
│   ├── services/         # External services (email, etc.)
│   ├── cache/           # Redis caching
│   └── queue/           # Background job processing
│
├── presentation/         # Presentation layer
│   └── http/
│       ├── controllers/  # Request handlers
│       ├── routes/       # Route definitions
│       ├── middleware/   # Express middleware
│       └── validators/   # Input validation
│
├── shared/              # Shared utilities
│   ├── constants/       # App constants
│   ├── errors/          # Custom error classes
│   └── types/           # TypeScript types
│
├── config/              # Configuration files
└── generated/           # Generated code (Prisma Client)
```

## 🚢 Deployment

### Docker Deployment

1. Build the image:
   ```bash
   docker build -t dead-mans-switch-api .
   ```

2. Run with docker-compose:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Environment Setup

For production deployment:
- Use a process manager (PM2, systemd)
- Set up SSL/TLS certificates
- Configure proper logging and monitoring
- Set up automated backups for PostgreSQL
- Use a Redis cluster for high availability

## 🔒 Security

### Implemented Security Measures

- ✅ **Authentication** - JWT-based with refresh tokens
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **Rate Limiting** - Prevents brute force attacks
- ✅ **Input Validation** - Zod schemas for all inputs
- ✅ **SQL Injection Protection** - Prisma parameterized queries
- ✅ **XSS Protection** - Helmet security headers
- ✅ **CORS** - Configured allowed origins
- ✅ **Request Logging** - All requests logged
- ✅ **Error Handling** - No sensitive data in responses
- ✅ **Encryption** - Client-side message encryption

### Security Best Practices

1. Never commit `.env` file
2. Rotate secrets regularly
3. Use HTTPS in production
4. Keep dependencies updated
5. Enable 2FA for admin accounts
6. Regular security audits
7. Monitor error logs

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation
- Follow the existing code style
- Use meaningful commit messages

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Built with Clean Architecture principles
- Inspired by Domain-Driven Design
- Thanks to the open-source community

---

<div align="center">

**[⬆ back to top](#-dead-mans-switch---backend-api)**

Made with ❤️ using TypeScript

</div>
