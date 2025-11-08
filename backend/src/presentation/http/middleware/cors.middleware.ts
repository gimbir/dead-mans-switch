/**
 * CORS Middleware Configuration
 *
 * Configures Cross-Origin Resource Sharing (CORS) for the API.
 * Allows frontend applications from allowed origins to access the API.
 *
 * Features:
 * - Environment-based origin configuration
 * - Credential support
 * - Pre-flight request handling
 * - Custom headers support
 *
 * Usage:
 * app.use(corsMiddleware);
 */

import cors from 'cors';
import { env } from '@config/env.config.js';

/**
 * CORS configuration options
 */
const corsOptions: cors.CorsOptions = {
  // Allow frontend URL from environment
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allowed origins
    const allowedOrigins = [
      env.FRONTEND_URL,
      env.BACKEND_URL, // Backend itself (for Swagger UI)
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative dev port
      'http://localhost:5000', // Backend dev server
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  // Exposed headers (headers that the client can access)
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
};

/**
 * CORS middleware with configured options
 */
export const corsMiddleware = cors(corsOptions);
