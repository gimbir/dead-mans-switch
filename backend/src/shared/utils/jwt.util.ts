/**
 * JWT Utility
 *
 * Provides JWT token generation and verification using jsonwebtoken.
 *
 * Token Types:
 * - Access Token: Short-lived (15 minutes), used for API requests
 * - Refresh Token: Long-lived (7 days), used to get new access tokens
 *
 * Environment Variables Required:
 * - JWT_ACCESS_SECRET: Secret key for access tokens
 * - JWT_REFRESH_SECRET: Secret key for refresh tokens
 * - JWT_ACCESS_EXPIRY: Access token expiry (default: 15m)
 * - JWT_REFRESH_EXPIRY: Refresh token expiry (default: 7d)
 *
 * Usage:
 * const accessToken = JwtUtil.generateAccessToken({ userId: '123', email: 'user@example.com' });
 * const payload = JwtUtil.verifyAccessToken(accessToken);
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { Result } from '@shared/types/Result.js';
import { env } from '@config/env.config.js';

/**
 * JWT payload for access tokens
 */
export interface AccessTokenPayload {
  userId: string;
  email: string;
  isVerified: boolean;
}

/**
 * JWT payload for refresh tokens
 */
export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number; // For token invalidation
}

/**
 * Decoded JWT token with standard claims
 */
export interface DecodedToken<T> {
  payload: T;
  iat: number; // Issued at
  exp: number; // Expiry
}

export class JwtUtil {
  // Access token configuration
  private static readonly ACCESS_SECRET = env.JWT_ACCESS_SECRET;
  private static readonly ACCESS_EXPIRY = env.JWT_ACCESS_EXPIRY;

  // Refresh token configuration
  private static readonly REFRESH_SECRET = env.JWT_REFRESH_SECRET;
  private static readonly REFRESH_EXPIRY = env.JWT_REFRESH_EXPIRY;

  /**
   * Generates an access token
   * @param payload Access token payload
   * @returns JWT access token
   */
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: this.ACCESS_EXPIRY,
      issuer: 'dead-mans-switch',
      audience: 'dead-mans-switch-api',
    } as SignOptions);
  }

  /**
   * Generates a refresh token
   * @param payload Refresh token payload
   * @returns JWT refresh token
   */
  static generateRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_EXPIRY,
      issuer: 'dead-mans-switch',
      audience: 'dead-mans-switch-api',
    } as SignOptions);
  }

  /**
   * Verifies an access token
   * @param token JWT access token
   * @returns Result with decoded payload or error
   */
  static verifyAccessToken(token: string): Result<DecodedToken<AccessTokenPayload>> {
    try {
      const decoded = jwt.verify(token, this.ACCESS_SECRET, {
        issuer: 'dead-mans-switch',
        audience: 'dead-mans-switch-api',
      }) as jwt.JwtPayload;

      return Result.ok<DecodedToken<AccessTokenPayload>>({
        payload: {
          userId: decoded['userId'] as string,
          email: decoded['email'] as string,
          isVerified: decoded['isVerified'] as boolean,
        },
        iat: decoded['iat'] as number,
        exp: decoded['exp'] as number,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return Result.fail<DecodedToken<AccessTokenPayload>>('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return Result.fail<DecodedToken<AccessTokenPayload>>('Invalid access token');
      }
      return Result.fail<DecodedToken<AccessTokenPayload>>(
        `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Verifies a refresh token
   * @param token JWT refresh token
   * @returns Result with decoded payload or error
   */
  static verifyRefreshToken(token: string): Result<DecodedToken<RefreshTokenPayload>> {
    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        issuer: 'dead-mans-switch',
        audience: 'dead-mans-switch-api',
      }) as jwt.JwtPayload;

      return Result.ok<DecodedToken<RefreshTokenPayload>>({
        payload: {
          userId: decoded['userId'] as string,
          tokenVersion: decoded['tokenVersion'] as number,
        },
        iat: decoded['iat'] as number,
        exp: decoded['exp'] as number,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return Result.fail<DecodedToken<RefreshTokenPayload>>('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return Result.fail<DecodedToken<RefreshTokenPayload>>('Invalid refresh token');
      }
      return Result.fail<DecodedToken<RefreshTokenPayload>>(
        `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decodes a token without verification (unsafe - for debugging only)
   * @param token JWT token
   * @returns Decoded payload or null
   */
  static decode<T>(token: string): T | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as T;
    } catch (_error) {
      return null;
    }
  }

  /**
   * Gets access token expiry in seconds
   * @returns Expiry time in seconds
   */
  static getAccessTokenExpiry(): number {
    // Parse expiry string (e.g., "15m" -> 900 seconds)
    const expiry = this.ACCESS_EXPIRY;
    if (expiry.endsWith('m')) {
      return parseInt(expiry) * 60;
    }
    if (expiry.endsWith('h')) {
      return parseInt(expiry) * 3600;
    }
    if (expiry.endsWith('d')) {
      return parseInt(expiry) * 86400;
    }
    return parseInt(expiry); // Assume seconds
  }

  /**
   * Gets refresh token expiry in seconds
   * @returns Expiry time in seconds
   */
  static getRefreshTokenExpiry(): number {
    const expiry = this.REFRESH_EXPIRY;
    if (expiry.endsWith('m')) {
      return parseInt(expiry) * 60;
    }
    if (expiry.endsWith('h')) {
      return parseInt(expiry) * 3600;
    }
    if (expiry.endsWith('d')) {
      return parseInt(expiry) * 86400;
    }
    return parseInt(expiry); // Assume seconds
  }

  /**
   * Extracts token from Authorization header
   * @param authHeader Authorization header value
   * @returns Token or null
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] ?? null;
  }
}
