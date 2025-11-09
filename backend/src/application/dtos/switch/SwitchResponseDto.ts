/**
 * Switch Response DTO
 *
 * Data Transfer Object for returning switch data to clients.
 * Represents the complete switch state including status and timing.
 *
 * Fields:
 * - id: Switch unique identifier
 * - userId: Owner user ID
 * - name: Switch name
 * - description: Optional description
 * - checkInIntervalDays: Check-in frequency in days
 * - gracePeriodDays: Grace period before triggering in days
 * - isActive: Whether switch is active
 * - status: Current switch status (PENDING, ACTIVE, GRACE_PERIOD, TRIGGERED)
 * - lastCheckInAt: Last check-in timestamp
 * - nextCheckInDue: When next check-in is due
 * - createdAt: Switch creation timestamp
 * - updatedAt: Last update timestamp
 */

import { z } from 'zod';

/**
 * Switch status enum
 */
export enum SwitchStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  GRACE_PERIOD = 'GRACE_PERIOD',
  TRIGGERED = 'TRIGGERED',
}

/**
 * Zod validation schema for switch response
 */
export const SwitchResponseDtoSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  checkInIntervalDays: z.number().int(),
  gracePeriodDays: z.number().int(),
  isActive: z.boolean(),
  status: z.nativeEnum(SwitchStatus),
  lastCheckInAt: z.date().optional(),
  nextCheckInDue: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type SwitchResponseDto = z.infer<typeof SwitchResponseDtoSchema>;

/**
 * Paginated list response for switches
 */
export const PaginatedSwitchesResponseDtoSchema = z.object({
  switches: z.array(SwitchResponseDtoSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});

/**
 * TypeScript type for paginated switches
 */
export type PaginatedSwitchesResponseDto = z.infer<typeof PaginatedSwitchesResponseDtoSchema>;

/**
 * Factory function to create switch response DTO from Switch entity
 * @param switchEntity Switch entity from domain
 * @returns SwitchResponseDto
 */
export function createSwitchResponseDto(switchEntity: {
  id: string;
  userId: string;
  name: string;
  description?: string;
  checkInIntervalDays: number;
  gracePeriodDays: number;
  isActive: boolean;
  status: SwitchStatus;
  lastCheckInAt?: Date;
  nextCheckInDue?: Date;
  createdAt: Date;
  updatedAt: Date;
}): SwitchResponseDto {
  return {
    id: switchEntity.id,
    userId: switchEntity.userId,
    name: switchEntity.name,
    description: switchEntity.description,
    checkInIntervalDays: switchEntity.checkInIntervalDays,
    gracePeriodDays: switchEntity.gracePeriodDays,
    isActive: switchEntity.isActive,
    status: switchEntity.status,
    lastCheckInAt: switchEntity.lastCheckInAt,
    nextCheckInDue: switchEntity.nextCheckInDue,
    createdAt: switchEntity.createdAt,
    updatedAt: switchEntity.updatedAt,
  };
}

/**
 * Factory function to create paginated switches response
 * @param switches Array of switch entities
 * @param page Current page
 * @param limit Items per page
 * @param total Total count
 * @returns PaginatedSwitchesResponseDto
 */
export function createPaginatedSwitchesResponseDto(
  switches: SwitchResponseDto[],
  page: number,
  limit: number,
  total: number
): PaginatedSwitchesResponseDto {
  return {
    switches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
