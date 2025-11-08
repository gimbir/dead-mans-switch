/**
 * Switch Request Validators
 *
 * Zod schemas for validating switch-related HTTP requests.
 * Used with validation middleware to ensure type-safe request handling.
 *
 * Features:
 * - Params validation (UUIDs, etc.)
 * - Query string validation with type transformation
 * - Body validation using existing DTOs
 *
 * Usage:
 * router.get('/switches/:id',
 *   validate(switchValidators.getSwitch),
 *   switchController.getSwitch
 * );
 */

import { z } from 'zod';
import { CreateSwitchDtoSchema } from '@application/dtos/switch/CreateSwitchDto.js';
import { UpdateSwitchDtoSchema } from '@application/dtos/switch/UpdateSwitchDto.js';

/**
 * Validator for GET /switches/:id
 * Validates switch ID parameter
 */
export const getSwitchValidator = {
  params: z.object({
    id: z.string().uuid('Switch ID must be a valid UUID'),
  }),
};

/**
 * Validator for DELETE /switches/:id
 * Validates switch ID parameter
 */
export const deleteSwitchValidator = {
  params: z.object({
    id: z.string().uuid('Switch ID must be a valid UUID'),
  }),
};

/**
 * Validator for PUT /switches/:id
 * Validates switch ID parameter and update body
 */
export const updateSwitchValidator = {
  params: z.object({
    id: z.string().uuid('Switch ID must be a valid UUID'),
  }),
  body: UpdateSwitchDtoSchema.omit({ switchId: true }), // switchId comes from params
};

/**
 * Validator for GET /switches
 * Validates pagination and filter query parameters
 */
export const listSwitchesValidator = {
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .optional()
      .default('1')
      .transform(Number),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .optional()
      .default('10')
      .transform(Number)
      .refine((val: number) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
    includeDeleted: z
      .string()
      .optional()
      .default('false')
      .transform((val) => val === 'true'),
    isActive: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
};

/**
 * Validator for POST /switches
 * Validates switch creation body
 */
export const createSwitchValidator = {
  body: CreateSwitchDtoSchema,
};

/**
 * Validator for POST /switches/:id/checkin
 * Validates switch ID and check-in data
 */
export const performCheckInValidator = {
  params: z.object({
    id: z.string().uuid('Switch ID must be a valid UUID'),
  }),
  body: z.object({
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
};

/**
 * Validator for GET /switches/:id/checkins
 * Validates switch ID and pagination parameters
 */
export const getCheckInHistoryValidator = {
  params: z.object({
    id: z.string().uuid('Switch ID must be a valid UUID'),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .optional()
      .default('1')
      .transform(Number),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .optional()
      .default('20')
      .transform(Number)
      .refine((val: number) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
  }),
};

/**
 * Export all switch validators
 */
export const switchValidators = {
  getSwitch: getSwitchValidator,
  deleteSwitch: deleteSwitchValidator,
  updateSwitch: updateSwitchValidator,
  listSwitches: listSwitchesValidator,
  createSwitch: createSwitchValidator,
  performCheckIn: performCheckInValidator,
  getCheckInHistory: getCheckInHistoryValidator,
};
