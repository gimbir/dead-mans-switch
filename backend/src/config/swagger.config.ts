/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dead Man\'s Switch API',
      version: '1.0.0',
      description: `
        Dead Man's Switch is a service that sends encrypted messages to designated recipients
        if you fail to check in within a specified time period. This is useful for:
        - Sharing important information in case of emergency
        - Password management for loved ones
        - Business continuity planning
        - Digital estate planning
      `,
      contact: {
        name: 'API Support',
        email: 'support@deadmansswitch.example.com',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.deadmansswitch.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer {token}',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Invalid input data',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            isVerified: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Switch: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Emergency Contacts',
            },
            description: {
              type: 'string',
              example: 'Important contacts and passwords',
            },
            checkInInterval: {
              type: 'integer',
              description: 'Check-in interval in days',
              example: 7,
            },
            gracePeriod: {
              type: 'integer',
              description: 'Grace period in days',
              example: 1,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            lastCheckIn: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            nextCheckInDue: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            switchId: {
              type: 'string',
              format: 'uuid',
            },
            recipientEmail: {
              type: 'string',
              format: 'email',
            },
            recipientName: {
              type: 'string',
            },
            subject: {
              type: 'string',
            },
            isSent: {
              type: 'boolean',
            },
            sentAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        CheckIn: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            switchId: {
              type: 'string',
              format: 'uuid',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            ipAddress: {
              type: 'string',
              nullable: true,
            },
            userAgent: {
              type: 'string',
              nullable: true,
            },
            location: {
              type: 'string',
              nullable: true,
            },
            notes: {
              type: 'string',
              nullable: true,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Switches',
        description: 'Dead man\'s switch management endpoints',
      },
      {
        name: 'Messages',
        description: 'Message management endpoints',
      },
      {
        name: 'Check-ins',
        description: 'Check-in endpoints',
      },
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../presentation/http/routes/**/*.ts'),
    path.join(__dirname, '../presentation/http/controllers/**/*.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

// Debug: Log the number of paths found
console.log('📚 Swagger paths found:', Object.keys(swaggerSpec.paths || {}).length);
if (Object.keys(swaggerSpec.paths || {}).length === 0) {
  console.log('⚠️  No Swagger paths found. Check your @swagger comments in route files.');
  console.log('📁 Looking for files in:', options.apis);
}
