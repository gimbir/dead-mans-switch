/**
 * Switch Domain Entity
 *
 * The core entity of the Dead Man's Switch application.
 * Represents a monitoring switch that triggers when user fails to check in.
 *
 * Business Rules:
 * - User must check in before nextCheckInDue date
 * - Grace period provides extra time after due date
 * - Switch can be ACTIVE, PAUSED, TRIGGERED, or EXPIRED
 * - Once TRIGGERED, switch cannot be reactivated (security feature)
 * - Check-in interval must be between 1-365 days
 * - Grace period cannot exceed check-in interval
 *
 * @example
 * const switchOrError = Switch.create({
 *   userId: 'user_123',
 *   name: 'Emergency Switch',
 *   checkInInterval: TimeInterval.create(7).value,
 *   gracePeriod: TimeInterval.create(2).value
 * });
 */

import { z } from 'zod';
import { TimeInterval } from '@domain/value-objects/TimeInterval.vo.js';
import { Result } from '@shared/types/Result.js';

/**
 * Zod schema for validating persistence data
 */
const SwitchPersistenceSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  checkInInterval: z.number().int().min(1).max(365),
  gracePeriod: z.number().int().min(0).max(365),
  isActive: z.boolean(),
  status: z.enum(['ACTIVE', 'PAUSED', 'TRIGGERED', 'EXPIRED']),
  lastCheckIn: z.date().nullable(),
  nextCheckInDue: z.date().nullable(),
  triggeredAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  version: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export enum SwitchStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  TRIGGERED = 'TRIGGERED',
  EXPIRED = 'EXPIRED',
}

export interface SwitchProps {
  userId: string;
  name: string;
  description?: string | null;
  checkInInterval: TimeInterval;
  gracePeriod: TimeInterval;
  isActive?: boolean;
  status?: SwitchStatus;
  lastCheckIn?: Date | null;
  nextCheckInDue?: Date | null;
  triggeredAt?: Date | null;
  deletedAt?: Date | null;
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSwitchProps {
  id?: string;
  userId: string;
  name: string;
  description?: string | undefined;
  checkInInterval: TimeInterval;
  gracePeriod: TimeInterval;
}

export class Switch {
  private readonly _id: string;
  private _props: SwitchProps;

  private constructor(id: string, props: SwitchProps) {
    this._id = id;
    this._props = {
      ...props,
      isActive: props.isActive ?? true,
      status: props.status ?? SwitchStatus.ACTIVE,
      lastCheckIn: props.lastCheckIn ?? null,
      nextCheckInDue: props.nextCheckInDue ?? null,
      triggeredAt: props.triggeredAt ?? null,
      deletedAt: props.deletedAt ?? null,
      version: props.version ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  /**
   * Factory method to create a new Switch
   */
  public static create(props: CreateSwitchProps, id?: string): Result<Switch> {
    // Validate name
    if (!props.name || props.name.trim().length === 0) {
      return Result.fail<Switch>('Switch name cannot be empty');
    }

    if (props.name.trim().length < 3) {
      return Result.fail<Switch>('Switch name must be at least 3 characters');
    }

    if (props.name.trim().length > 100) {
      return Result.fail<Switch>('Switch name cannot exceed 100 characters');
    }

    // Validate description
    if (props.description && props.description.length > 500) {
      return Result.fail<Switch>('Switch description cannot exceed 500 characters');
    }

    // Validate grace period is not longer than check-in interval
    if (props.gracePeriod.isLongerThan(props.checkInInterval)) {
      return Result.fail<Switch>('Grace period cannot be longer than check-in interval');
    }

    // Validate user ID
    if (!props.userId || props.userId.trim().length === 0) {
      return Result.fail<Switch>('User ID is required');
    }

    const switchId = id ?? this.generateId();
    const now = new Date();

    return Result.ok<Switch>(
      new Switch(switchId, {
        userId: props.userId,
        name: props.name.trim(),
        description: props.description?.trim() ?? null,
        checkInInterval: props.checkInInterval,
        gracePeriod: props.gracePeriod,
        isActive: true,
        status: SwitchStatus.ACTIVE,
        lastCheckIn: now,
        nextCheckInDue: props.checkInInterval.addToDate(now),
        createdAt: now,
        updatedAt: now,
      })
    );
  }

  private static generateId(): string {
    return `switch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== Getters ====================

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._props.userId;
  }

  public get name(): string {
    return this._props.name;
  }

  public get description(): string | null {
    return this._props.description ?? null;
  }

  public get checkInInterval(): TimeInterval {
    return this._props.checkInInterval;
  }

  public get gracePeriod(): TimeInterval {
    return this._props.gracePeriod;
  }

  public get isActive(): boolean {
    return this._props.isActive ?? false;
  }

  public get status(): SwitchStatus {
    return this._props.status ?? SwitchStatus.ACTIVE;
  }

  public get lastCheckIn(): Date | null {
    return this._props.lastCheckIn ?? null;
  }

  public get nextCheckInDue(): Date | null {
    return this._props.nextCheckInDue ?? null;
  }

  public get triggeredAt(): Date | null {
    return this._props.triggeredAt ?? null;
  }

  public get deletedAt(): Date | null {
    return this._props.deletedAt ?? null;
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
   * Checks if the switch is past its due date (without grace period)
   */
  public isPastDue(): boolean {
    if (!this._props.nextCheckInDue) {
      return false;
    }
    return new Date() > this._props.nextCheckInDue;
  }

  /**
   * Checks if the grace period has expired
   */
  public isGracePeriodExpired(): boolean {
    if (!this._props.nextCheckInDue) {
      return false;
    }

    const gracePeriodEnd = this._props.gracePeriod.addToDate(this._props.nextCheckInDue);
    return new Date() > gracePeriodEnd;
  }

  /**
   * Checks if the switch should be triggered
   */
  public shouldTrigger(): boolean {
    return (
      this._props.status === SwitchStatus.ACTIVE &&
      this._props.isActive === true &&
      this.isGracePeriodExpired()
    );
  }

  /**
   * Checks if user can perform a check-in
   */
  public canCheckIn(): boolean {
    return (
      (this._props.status === SwitchStatus.ACTIVE || this._props.status === SwitchStatus.PAUSED) &&
      !this.isDeleted()
    );
  }

  /**
   * Performs a check-in
   */
  public checkIn(): Result<void> {
    if (!this.canCheckIn()) {
      return Result.fail<void>(
        'Cannot check in: Switch is either triggered, expired, or deleted'
      );
    }

    const now = new Date();
    this._props.lastCheckIn = now;
    this._props.nextCheckInDue = this._props.checkInInterval.addToDate(now);
    this._props.updatedAt = now;
    this._props.version = (this._props.version ?? 0) + 1;

    // If switch was paused, activate it
    if (this._props.status === SwitchStatus.PAUSED) {
      this._props.status = SwitchStatus.ACTIVE;
      this._props.isActive = true;
    }

    return Result.ok();
  }

  /**
   * Pauses the switch
   */
  public pause(): Result<void> {
    if (this._props.status === SwitchStatus.TRIGGERED) {
      return Result.fail<void>('Cannot pause a triggered switch');
    }

    if (this._props.status === SwitchStatus.EXPIRED) {
      return Result.fail<void>('Cannot pause an expired switch');
    }

    if (this._props.status === SwitchStatus.PAUSED) {
      return Result.fail<void>('Switch is already paused');
    }

    this._props.status = SwitchStatus.PAUSED;
    this._props.isActive = false;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Activates (resumes) the switch
   */
  public activate(): Result<void> {
    if (this._props.status === SwitchStatus.TRIGGERED) {
      return Result.fail<void>('Cannot activate a triggered switch');
    }

    if (this._props.status === SwitchStatus.EXPIRED) {
      return Result.fail<void>('Cannot activate an expired switch');
    }

    if (this._props.status === SwitchStatus.ACTIVE) {
      return Result.fail<void>('Switch is already active');
    }

    this._props.status = SwitchStatus.ACTIVE;
    this._props.isActive = true;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Triggers the switch (critical action!)
   */
  public trigger(): Result<void> {
    if (this._props.status === SwitchStatus.TRIGGERED) {
      return Result.fail<void>('Switch is already triggered');
    }

    if (!this.shouldTrigger()) {
      return Result.fail<void>('Switch does not meet trigger conditions');
    }

    const now = new Date();
    this._props.status = SwitchStatus.TRIGGERED;
    this._props.isActive = false;
    this._props.triggeredAt = now;
    this._props.updatedAt = now;
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Marks the switch as expired
   */
  public expire(): Result<void> {
    this._props.status = SwitchStatus.EXPIRED;
    this._props.isActive = false;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Updates switch configuration
   */
  public updateConfiguration(
    name?: string,
    description?: string,
    checkInInterval?: TimeInterval,
    gracePeriod?: TimeInterval
  ): Result<void> {
    if (this._props.status === SwitchStatus.TRIGGERED) {
      return Result.fail<void>('Cannot update configuration of a triggered switch');
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return Result.fail<void>('Switch name cannot be empty');
      }
      if (name.trim().length < 3 || name.trim().length > 100) {
        return Result.fail<void>('Switch name must be between 3-100 characters');
      }
      this._props.name = name.trim();
    }

    // Validate description if provided
    if (description !== undefined) {
      if (description && description.length > 500) {
        return Result.fail<void>('Switch description cannot exceed 500 characters');
      }
      this._props.description = description?.trim() ?? null;
    }

    // Validate intervals if provided
    if (gracePeriod !== undefined && checkInInterval !== undefined) {
      if (gracePeriod.isLongerThan(checkInInterval)) {
        return Result.fail<void>('Grace period cannot be longer than check-in interval');
      }
    }

    // Update intervals
    if (checkInInterval !== undefined) {
      this._props.checkInInterval = checkInInterval;
      // Recalculate next check-in due date
      if (this._props.lastCheckIn) {
        this._props.nextCheckInDue = checkInInterval.addToDate(this._props.lastCheckIn);
      }
    }

    if (gracePeriod !== undefined) {
      this._props.gracePeriod = gracePeriod;
    }

    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;

    return Result.ok();
  }

  /**
   * Soft deletes the switch
   */
  public delete(): void {
    this._props.deletedAt = new Date();
    this._props.isActive = false;
    this._props.updatedAt = new Date();
    this._props.version = (this._props.version ?? 0) + 1;
  }

  /**
   * Checks if the switch is deleted
   */
  public isDeleted(): boolean {
    return this._props.deletedAt !== null && this._props.deletedAt !== undefined;
  }

  /**
   * Gets time remaining until next check-in due
   */
  public getTimeUntilDue(): number | null {
    if (!this._props.nextCheckInDue) {
      return null;
    }
    return this._props.nextCheckInDue.getTime() - new Date().getTime();
  }

  /**
   * Returns a plain object representation (for database persistence)
   */
  public toPersistence(): Record<string, unknown> {
    return {
      id: this._id,
      userId: this._props.userId,
      name: this._props.name,
      description: this._props.description,
      checkInInterval: this._props.checkInInterval.toDays(),
      gracePeriod: this._props.gracePeriod.toDays(),
      isActive: this._props.isActive,
      status: this._props.status,
      lastCheckIn: this._props.lastCheckIn,
      nextCheckInDue: this._props.nextCheckInDue,
      triggeredAt: this._props.triggeredAt,
      deletedAt: this._props.deletedAt,
      version: this._props.version,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
    };
  }

  /**
   * Creates a Switch entity from persistence data
   * Validates data with Zod before creating entity
   */
  public static fromPersistence(data: Record<string, unknown>): Result<Switch> {
    // Validate persistence data with Zod
    const validationResult = SwitchPersistenceSchema.safeParse(data);

    if (!validationResult.success) {
      return Result.fail<Switch>(
        `Invalid switch persistence data: ${validationResult.error.issues.map((e: z.core.$ZodIssue) => e.message).join(', ')}`
      );
    }

    const validData = validationResult.data;

    // Create TimeInterval value objects
    const checkInIntervalOrError = TimeInterval.create(validData.checkInInterval);
    if (checkInIntervalOrError.isFailure) {
      return Result.fail<Switch>(checkInIntervalOrError.error as string);
    }

    const gracePeriodOrError = TimeInterval.create(validData.gracePeriod);
    if (gracePeriodOrError.isFailure) {
      return Result.fail<Switch>(gracePeriodOrError.error as string);
    }

    return Result.ok(
      new Switch(validData.id, {
        userId: validData.userId,
        name: validData.name,
        description: validData.description,
        checkInInterval: checkInIntervalOrError.value,
        gracePeriod: gracePeriodOrError.value,
        isActive: validData.isActive,
        status: validData.status as SwitchStatus,
        lastCheckIn: validData.lastCheckIn,
        nextCheckInDue: validData.nextCheckInDue,
        triggeredAt: validData.triggeredAt,
        deletedAt: validData.deletedAt,
        version: validData.version,
        createdAt: validData.createdAt,
        updatedAt: validData.updatedAt,
      })
    );
  }
}
