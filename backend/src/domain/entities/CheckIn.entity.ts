/**
 * CheckIn Domain Entity
 *
 * Represents a historical record of a check-in event for a switch.
 * This entity is mostly immutable - check-ins are historical facts that shouldn't be modified.
 *
 * Business Rules:
 * - Check-ins are immutable once created (historical record)
 * - Must be associated with a valid switch
 * - Timestamp is automatically set to creation time
 * - Metadata (IP, user agent, location) is optional but recommended for security
 * - Check-ins are never deleted (preserve audit trail)
 * - Notes field is optional and can be added/updated by user
 *
 * @example
 * const checkInOrError = CheckIn.create({
 *   switchId: 'switch_123',
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...',
 *   location: 'New York, USA',
 *   notes: 'Checked in from home'
 * });
 */

import { z } from 'zod';
import { Result } from '@shared/types/Result.js';

/**
 * Zod schema for validating persistence data
 */
const CheckInPersistenceSchema = z.object({
  id: z.string().min(1),
  switchId: z.string().min(1),
  timestamp: z.date(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().max(500).nullable(),
  location: z.string().max(200).nullable(),
  notes: z.string().max(1000).nullable(),
  version: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface CheckInProps {
  switchId: string;
  timestamp: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  location?: string | null;
  notes?: string | null;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCheckInProps {
  id?: string;
  switchId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  location?: string | undefined;
  notes?: string | undefined;
}

export class CheckIn {
  private readonly _id: string;
  private _props: CheckInProps;

  private constructor(id: string, props: CheckInProps) {
    this._id = id;
    this._props = {
      ...props,
      ipAddress: props.ipAddress ?? null,
      userAgent: props.userAgent ?? null,
      location: props.location ?? null,
      notes: props.notes ?? null,
      version: props.version ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  /**
   * Factory method to create a new CheckIn
   */
  public static create(props: CreateCheckInProps, id?: string): Result<CheckIn> {
    // Validate switch ID
    if (!props.switchId || props.switchId.trim().length === 0) {
      return Result.fail<CheckIn>('Switch ID is required');
    }

    // Validate IP address format if provided
    if (props.ipAddress && !this.isValidIPAddress(props.ipAddress)) {
      return Result.fail<CheckIn>('Invalid IP address format');
    }

    // Validate user agent length if provided
    if (props.userAgent && props.userAgent.length > 500) {
      return Result.fail<CheckIn>('User agent cannot exceed 500 characters');
    }

    // Validate location length if provided
    if (props.location && props.location.length > 200) {
      return Result.fail<CheckIn>('Location cannot exceed 200 characters');
    }

    // Validate notes length if provided
    if (props.notes && props.notes.length > 1000) {
      return Result.fail<CheckIn>('Notes cannot exceed 1000 characters');
    }

    const checkInId = id ?? this.generateId();
    const now = new Date();

    return Result.ok<CheckIn>(
      new CheckIn(checkInId, {
        switchId: props.switchId,
        timestamp: now,
        ipAddress: props.ipAddress?.trim() ?? null,
        userAgent: props.userAgent?.trim() ?? null,
        location: props.location?.trim() ?? null,
        notes: props.notes?.trim() ?? null,
        createdAt: now,
        updatedAt: now,
      })
    );
  }

  private static generateId(): string {
    return `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Basic IP address validation (supports IPv4 and IPv6)
   */
  private static isValidIPAddress(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    // IPv6 regex (simplified - matches basic format)
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  // ==================== Getters ====================

  public get id(): string {
    return this._id;
  }

  public get switchId(): string {
    return this._props.switchId;
  }

  public get timestamp(): Date {
    return this._props.timestamp;
  }

  public get ipAddress(): string | null {
    return this._props.ipAddress ?? null;
  }

  public get userAgent(): string | null {
    return this._props.userAgent ?? null;
  }

  public get location(): string | null {
    return this._props.location ?? null;
  }

  public get notes(): string | null {
    return this._props.notes ?? null;
  }

  public get version(): number {
    return this._props.version ?? 0;
  }

  public get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  // ==================== Business Logic Methods ====================

  /**
   * Updates the notes field
   * This is the only mutable field - allows user to add context after check-in
   */
  public updateNotes(notes: string): Result<void> {
    if (notes && notes.length > 1000) {
      return Result.fail<void>('Notes cannot exceed 1000 characters');
    }

    this._props.notes = notes?.trim() ?? null;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Checks if this check-in was made recently (within last N minutes)
   */
  public isRecent(withinMinutes: number = 5): boolean {
    const now = new Date();
    const diffMs = now.getTime() - this._props.timestamp.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes <= withinMinutes;
  }

  /**
   * Gets the age of this check-in in milliseconds
   */
  public getAge(): number {
    const now = new Date();
    return now.getTime() - this._props.timestamp.getTime();
  }

  /**
   * Checks if check-in has metadata (security tracking information)
   */
  public hasMetadata(): boolean {
    return (
      this._props.ipAddress !== null ||
      this._props.userAgent !== null ||
      this._props.location !== null
    );
  }

  /**
   * Gets a summary of metadata for display purposes
   */
  public getMetadataSummary(): string {
    const parts: string[] = [];

    if (this._props.ipAddress) {
      parts.push(`IP: ${this._props.ipAddress}`);
    }

    if (this._props.location) {
      parts.push(`Location: ${this._props.location}`);
    }

    if (this._props.userAgent) {
      // Truncate user agent for display
      const ua = this._props.userAgent;
      parts.push(`Agent: ${ua.length > 50 ? ua.substring(0, 50) + '...' : ua}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'No metadata';
  }

  /**
   * Returns a plain object representation (for database persistence)
   */
  public toPersistence(): Record<string, unknown> {
    return {
      id: this._id,
      switchId: this._props.switchId,
      timestamp: this._props.timestamp,
      ipAddress: this._props.ipAddress,
      userAgent: this._props.userAgent,
      location: this._props.location,
      notes: this._props.notes,
      version: this._props.version,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
    };
  }

  /**
   * Creates a CheckIn entity from persistence data
   * Validates data with Zod before creating entity
   */
  public static fromPersistence(data: Record<string, unknown>): Result<CheckIn> {
    // Validate persistence data with Zod
    const validationResult = CheckInPersistenceSchema.safeParse(data);

    if (!validationResult.success) {
      return Result.fail<CheckIn>(
        `Invalid check-in persistence data: ${validationResult.error.issues.map((e: z.core.$ZodIssue) => e.message).join(', ')}`
      );
    }

    const validData = validationResult.data;

    return Result.ok(
      new CheckIn(validData.id, {
        switchId: validData.switchId,
        timestamp: validData.timestamp,
        ipAddress: validData.ipAddress,
        userAgent: validData.userAgent,
        location: validData.location,
        notes: validData.notes,
        version: validData.version,
        createdAt: validData.createdAt,
        updatedAt: validData.updatedAt,
      })
    );
  }
}
