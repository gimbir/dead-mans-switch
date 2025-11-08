/**
 * Request Logger Middleware
 *
 * Logs HTTP requests for monitoring and debugging.
 * Uses morgan for logging with custom format and environment-based configuration.
 *
 * Features:
 * - Different formats for development vs production
 * - Color-coded output in development
 * - Request timing
 * - Error highlighting
 *
 * Usage:
 * app.use(requestLogger);
 */

import morgan from 'morgan';
import { isDevelopment, env } from '@config/env.config.js';

/**
 * Custom token for response time with color coding
 */
morgan.token('status-colored', (_req: any, res: any) => {
  const status = res.statusCode;
  let color = '\x1b[32m'; // Green for 2xx

  if (status >= 500) {
    color = '\x1b[31m'; // Red for 5xx
  } else if (status >= 400) {
    color = '\x1b[33m'; // Yellow for 4xx
  } else if (status >= 300) {
    color = '\x1b[36m'; // Cyan for 3xx
  }

  return `${color}${status}\x1b[0m`;
});

/**
 * Development format with colors and detailed info
 */
const developmentFormat =
  ':method :url :status-colored :response-time ms - :res[content-length]';

/**
 * Production format (combined log format)
 * Logs to stdout for collection by logging services
 */
const productionFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Request logger middleware
 */
export const requestLogger = morgan(
  isDevelopment() ? developmentFormat : productionFormat,
  {
    // Skip logging for health check endpoints in production
    skip: (req: any, _res: any) => {
      if (env.NODE_ENV === 'production' && req.url.startsWith('/health')) {
        return true;
      }
      return false;
    },
  }
);

/**
 * Error logger middleware
 * Only logs requests that resulted in errors (4xx, 5xx)
 */
export const errorLogger = morgan(
  isDevelopment() ? developmentFormat : productionFormat,
  {
    skip: (_req: any, res: any) => res.statusCode < 400,
  }
);
