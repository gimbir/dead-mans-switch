/**
 * Redis Cache Service Implementation
 *
 * Provides caching functionality using Redis (via ioredis).
 * Used for performance optimization and session management.
 *
 * Features:
 * - Key-value storage with TTL
 * - JSON serialization/deserialization
 * - Namespace support for key organization
 * - Connection pooling
 * - Health checks
 *
 * Environment Variables Required:
 * - REDIS_HOST: Redis server host (default: localhost)
 * - REDIS_PORT: Redis server port (default: 6379)
 * - REDIS_PASSWORD: Redis password (optional)
 * - REDIS_DB: Redis database number (default: 0)
 *
 * Common Use Cases:
 * - Session storage
 * - Rate limiting
 * - Temporary data caching
 * - API response caching
 *
 * Usage:
 * const cache = new CacheService();
 * await cache.set('user:123', userData, 3600); // 1 hour TTL
 * const user = await cache.get('user:123');
 */

import { Redis } from 'ioredis';
import { Result } from '@shared/types/Result.js';
import { env } from '@config/env.config.js';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Key prefix for organization
}

export class CacheService {
  private client: Redis;
  private defaultTTL: number = 3600; // 1 hour
  private defaultNamespace: string = 'dms'; // Dead Man's Switch

  constructor() {
    // Get configuration from environment
    const redisHost = env.REDIS_HOST;
    const redisPort = env.REDIS_PORT;
    const redisPassword = env.REDIS_PASSWORD;

    // Create Redis client
    this.client = new Redis({
      host: redisHost,
      port: redisPort,
      ...(redisPassword ? { password: redisPassword } : {}),
      retryStrategy: (times: number) => {
        // Reconnect after exponential backoff
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    // Handle connection events
    this.client.on('error', (error: Error) => {
      console.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis ready to accept commands');
    });
  }

  /**
   * Sets a value in cache
   * @param key Cache key
   * @param value Value to cache (will be JSON stringified)
   * @param ttl Time to live in seconds (optional)
   * @param namespace Key namespace (optional)
   */
  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    namespace?: string
  ): Promise<Result<void>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const serializedValue = JSON.stringify(value);
      const expirySeconds = ttl ?? this.defaultTTL;

      await this.client.setex(fullKey, expirySeconds, serializedValue);

      return Result.ok();
    } catch (error) {
      return Result.fail<void>(
        `Failed to set cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Gets a value from cache
   * @param key Cache key
   * @param namespace Key namespace (optional)
   * @returns Cached value or null if not found/expired
   */
  async get<T>(key: string, namespace?: string): Promise<Result<T | null>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const serializedValue = await this.client.get(fullKey);

      if (!serializedValue) {
        return Result.ok<T | null>(null);
      }

      const value = JSON.parse(serializedValue) as T;
      return Result.ok<T | null>(value);
    } catch (error) {
      return Result.fail<T | null>(
        `Failed to get cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Deletes a value from cache
   * @param key Cache key
   * @param namespace Key namespace (optional)
   */
  async delete(key: string, namespace?: string): Promise<Result<boolean>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.del(fullKey);

      return Result.ok<boolean>(result > 0);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to delete cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Checks if a key exists in cache
   * @param key Cache key
   * @param namespace Key namespace (optional)
   */
  async exists(key: string, namespace?: string): Promise<Result<boolean>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.exists(fullKey);

      return Result.ok<boolean>(result === 1);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to check cache existence: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sets expiry time for a key
   * @param key Cache key
   * @param ttl Time to live in seconds
   * @param namespace Key namespace (optional)
   */
  async expire(key: string, ttl: number, namespace?: string): Promise<Result<boolean>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.expire(fullKey, ttl);

      return Result.ok<boolean>(result === 1);
    } catch (error) {
      return Result.fail<boolean>(
        `Failed to set expiry: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Gets remaining TTL for a key
   * @param key Cache key
   * @param namespace Key namespace (optional)
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async getTTL(key: string, namespace?: string): Promise<Result<number>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const ttl = await this.client.ttl(fullKey);

      return Result.ok<number>(ttl);
    } catch (error) {
      return Result.fail<number>(
        `Failed to get TTL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Deletes all keys matching a pattern
   * WARNING: Use with caution in production
   * @param pattern Key pattern (e.g., "user:*")
   * @param namespace Key namespace (optional)
   */
  async deletePattern(pattern: string, namespace?: string): Promise<Result<number>> {
    try {
      const fullPattern = this.buildKey(pattern, namespace);
      const keys = await this.client.keys(fullPattern);

      if (keys.length === 0) {
        return Result.ok<number>(0);
      }

      const result = await this.client.del(...keys);
      return Result.ok<number>(result);
    } catch (error) {
      return Result.fail<number>(
        `Failed to delete pattern: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Increments a numeric value in cache
   * @param key Cache key
   * @param namespace Key namespace (optional)
   * @returns New value after increment
   */
  async increment(key: string, namespace?: string): Promise<Result<number>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.incr(fullKey);

      return Result.ok<number>(result);
    } catch (error) {
      return Result.fail<number>(
        `Failed to increment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Decrements a numeric value in cache
   * @param key Cache key
   * @param namespace Key namespace (optional)
   * @returns New value after decrement
   */
  async decrement(key: string, namespace?: string): Promise<Result<number>> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.client.decr(fullKey);

      return Result.ok<number>(result);
    } catch (error) {
      return Result.fail<number>(
        `Failed to decrement: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clears all cache (FLUSHDB)
   * WARNING: This will delete ALL keys in the current database
   */
  async clear(): Promise<Result<void>> {
    try {
      await this.client.flushdb();
      return Result.ok();
    } catch (error) {
      return Result.fail<void>(
        `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Checks Redis connection health
   */
  async healthCheck(): Promise<Result<boolean>> {
    try {
      const pong = await this.client.ping();
      return Result.ok<boolean>(pong === 'PONG');
    } catch (error) {
      return Result.fail<boolean>(
        `Redis health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Gets cache statistics
   */
  async getStats(): Promise<Result<Record<string, string>>> {
    try {
      const info = await this.client.info('stats');
      const stats: Record<string, string> = {};

      info.split('\r\n').forEach((line: string) => {
        const [key, value] = line.split(':');
        if (key && value) {
          stats[key] = value;
        }
      });

      return Result.ok<Record<string, string>>(stats);
    } catch (error) {
      return Result.fail<Record<string, string>>(
        `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Closes Redis connection
   * Call this during application shutdown
   */
  async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('✅ Redis disconnected');
  }

  /**
   * Builds full cache key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    const ns = namespace ?? this.defaultNamespace;
    return `${ns}:${key}`;
  }

  /**
   * Gets the raw Redis client
   * Use with caution - bypasses type safety
   */
  public getClient(): Redis {
    return this.client;
  }
}
