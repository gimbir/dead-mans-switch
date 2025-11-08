/**
 * API Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dms_access_token',
  REFRESH_TOKEN: 'dms_refresh_token',
  USER: 'dms_user',
} as const;

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SWITCHES: '/switches',
  SWITCH_DETAIL: '/switches/:id',
  SWITCH_CREATE: '/switches/create',
  SWITCH_EDIT: '/switches/:id/edit',
  THEME_DEMO: '/theme-demo',
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',

  // Switches
  SWITCHES: '/api/switches',
  SWITCH_DETAIL: (id: string) => `/api/switches/${id}`,
  SWITCH_CHECKIN: (id: string) => `/api/switches/${id}/checkin`,
  SWITCH_CHECKINS: (id: string) => `/api/switches/${id}/checkins`,

  // Messages
  SWITCH_MESSAGES: (switchId: string) => `/api/switches/${switchId}/messages`,
  MESSAGE_DETAIL: (id: string) => `/api/messages/${id}`,

  // Health
  HEALTH: '/health',
} as const;

/**
 * Query Keys for React Query
 */
export const QUERY_KEYS = {
  SWITCHES: 'switches',
  SWITCH_DETAIL: (id: string) => ['switch', id],
  SWITCH_CHECKINS: (id: string) => ['switch-checkins', id],
  MESSAGES: (switchId: string) => ['messages', switchId],
  MESSAGE_DETAIL: (id: string) => ['message', id],
  USER: 'user',
} as const;

/**
 * Toast Messages
 */
export const TOAST_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGIN_ERROR: 'Invalid email or password',
  REGISTER_SUCCESS: 'Account created successfully!',
  REGISTER_ERROR: 'Failed to create account',
  LOGOUT_SUCCESS: 'Successfully logged out',

  // Switches
  SWITCH_CREATED: 'Switch created successfully!',
  SWITCH_UPDATED: 'Switch updated successfully!',
  SWITCH_DELETED: 'Switch deleted successfully!',
  CHECKIN_SUCCESS: 'Check-in successful!',

  // Messages
  MESSAGE_CREATED: 'Message created successfully!',
  MESSAGE_UPDATED: 'Message updated successfully!',
  MESSAGE_DELETED: 'Message deleted successfully!',

  // Errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

/**
 * Switch Configuration
 */
export const SWITCH_CONFIG = {
  MIN_CHECK_IN_INTERVAL: 1,
  MAX_CHECK_IN_INTERVAL: 365,
  MIN_GRACE_PERIOD: 1,
  MAX_GRACE_PERIOD: 30,
} as const;
