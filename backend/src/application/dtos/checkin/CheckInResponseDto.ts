/**
 * Check-In Response DTO
 *
 * Data Transfer Object for returning check-in data to clients.
 * Represents a single check-in record with metadata.
 *
 * Fields:
 * - id: Check-in unique identifier
 * - switchId: Switch ID this check-in belongs to
 * - timestamp: When the check-in occurred
 * - ipAddress: Optional IP address of check-in
 * - userAgent: Optional user agent of check-in
 * - location: Optional geolocation data
 * - notes: Optional user notes
 * - createdAt: Check-in creation timestamp
 */

import { z } from 'zod';

/**
 * Zod validation schema for check-in response
 */
export const CheckInResponseDtoSchema = z.object({
  id: z.uuid(),
  switchId: z.uuid(),
  timestamp: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type CheckInResponseDto = z.infer<typeof CheckInResponseDtoSchema>;

/**
 * Paginated list response for check-ins
 */
export const PaginatedCheckInsResponseDtoSchema = z.object({
  checkIns: z.array(CheckInResponseDtoSchema),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});

/**
 * TypeScript type for paginated check-ins
 */
export type PaginatedCheckInsResponseDto = z.infer<typeof PaginatedCheckInsResponseDtoSchema>;

/**
 * Factory function to create check-in response DTO from CheckIn entity
 * @param checkInEntity CheckIn entity from domain
 * @returns CheckInResponseDto
 */
export function createCheckInResponseDto(checkInEntity: {
  id: string;
  switchId: string;
  timestamp: Date;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  location?: string | undefined;
  notes?: string | undefined;
  createdAt: Date;
}): CheckInResponseDto {
  return {
    id: checkInEntity.id,
    switchId: checkInEntity.switchId,
    timestamp: checkInEntity.timestamp,
    ipAddress: checkInEntity.ipAddress,
    userAgent: checkInEntity.userAgent,
    location: checkInEntity.location,
    notes: checkInEntity.notes,
    createdAt: checkInEntity.createdAt,
  };
}

/**
 * Factory function to create paginated check-ins response
 * @param checkIns Array of check-in entities
 * @param page Current page
 * @param limit Items per page
 * @param total Total count
 * @returns PaginatedCheckInsResponseDto
 */
export function createPaginatedCheckInsResponseDto(
  checkIns: CheckInResponseDto[],
  page: number,
  limit: number,
  total: number
): PaginatedCheckInsResponseDto {
  return {
    checkIns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
