/**
 * Routes Index
 *
 * Exports all route creators for easy import in the main application.
 * This provides a clean interface for setting up all API routes.
 *
 * Usage:
 * import { createAuthRouter, createSwitchRouter, ... } from '@presentation/http/routes/index.js';
 *
 * Or import individually:
 * import { createAuthRouter } from '@presentation/http/routes/auth.routes.js';
 */

export { createAuthRouter } from './auth.routes.js';
export { createSwitchRouter } from './switch.routes.js';
export { createMessageRouter } from './message.routes.js';
export { createHealthRouter } from './health.routes.js';
