/**
 * Authentication Middleware
 *
 * Protects routes by verifying JWT access tokens.
 * Extracts user information from valid tokens and attaches it to the request.
 *
 * This middleware should be applied to all protected routes that require
 * authentication (e.g., switch management, message management).
 *
 * Usage:
 * router.get('/protected', authenticate, controller.method);
 *
 * Request Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token signature and expiry
 * 3. Attach userId and user info to request
 * 4. Continue to next middleware/controller
 *
 * Error Cases:
 * - Missing Authorization header → 401 Unauthorized
 * - Invalid token format → 401 Unauthorized
 * - Expired token → 401 Unauthorized
 * - Invalid signature → 401 Unauthorized
 */

import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '@shared/utils/jwt.util.js';

/**
 * Extended Express Request interface with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isVerified?: boolean;
}

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user info to request
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract Authorization header
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide an access token.',
      });
      return;
    }

    // Extract token from "Bearer <token>" format
    const token = JwtUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization header format. Expected: Bearer <token>',
      });
      return;
    }

    // Verify token
    const result = JwtUtil.verifyAccessToken(token);

    if (result.isFailure) {
      res.status(401).json({
        success: false,
        error: result.error,
      });
      return;
    }

    // Attach user info to request
    const { payload } = result.value;
    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.isVerified = payload.isVerified;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication',
    });
  }
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't block if no token is provided.
 * Useful for routes that have different behavior for authenticated vs anonymous users.
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.get('Authorization');

    // No token provided - continue without authentication
    if (!authHeader) {
      next();
      return;
    }

    const token = JwtUtil.extractTokenFromHeader(authHeader);

    // Invalid format - continue without authentication
    if (!token) {
      next();
      return;
    }

    // Verify token
    const result = JwtUtil.verifyAccessToken(token);

    // Valid token - attach user info
    if (result.isSuccess) {
      const { payload } = result.value;
      req.userId = payload.userId;
      req.userEmail = payload.email;
      req.isVerified = payload.isVerified;
    }

    // Continue regardless of token validity
    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
}

/**
 * Require email verification middleware
 * Must be used after authenticate middleware.
 * Blocks requests from users who haven't verified their email.
 */
export function requireEmailVerification(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (!req.isVerified) {
    res.status(403).json({
      success: false,
      error: 'Email verification required. Please verify your email address to access this resource.',
    });
    return;
  }

  next();
}
