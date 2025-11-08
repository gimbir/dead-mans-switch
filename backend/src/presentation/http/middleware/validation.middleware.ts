/**
 * Validation Middleware
 *
 * Validates incoming HTTP requests using Zod schemas.
 * Provides type-safe request parameters, query strings, and body data.
 *
 * Features:
 * - Runtime validation with Zod
 * - Type transformation (string to number, etc.)
 * - Detailed error messages
 * - Supports params, query, and body validation
 *
 * Usage:
 * router.get('/switches/:id',
 *   validate(switchValidators.getSwitch),
 *   switchController.getSwitch
 * );
 *
 * Benefits:
 * - Single source of truth for validation
 * - Type-safe controllers (no manual parsing)
 * - Consistent error responses
 * - Auto-transforms types (string → number, etc.)
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation schema interface
 * Define schemas for params, query, and/or body
 */
export interface ValidationSchema {
  params?: z.ZodSchema;
  query?: z.ZodSchema;
  body?: z.ZodSchema;
}

/**
 * Validation error response format
 */
interface ValidationErrorResponse {
  success: false;
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Creates a validation middleware for Express routes
 *
 * @param schema - Zod schemas for params, query, and/or body
 * @returns Express middleware function
 *
 * @example
 * const switchValidators = {
 *   getSwitch: {
 *     params: z.object({
 *       id: z.string().uuid(),
 *     }),
 *   },
 * };
 *
 * router.get('/switches/:id', validate(switchValidators.getSwitch), handler);
 */
export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate params
    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((err: z.core.$ZodIssue) => {
          errors.push({
            field: `params.${err.path.join('.')}`,
            message: err.message,
          });
        });
      } else {
        // Replace req.params with validated and transformed data
        req.params = result.data as any;
      }
    }

    // Validate query
    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((err: z.core.$ZodIssue) => {
          errors.push({
            field: `query.${err.path.join('.')}`,
            message: err.message,
          });
        });
      } else {
        // Replace req.query with validated and transformed data
        req.query = result.data as any;
      }
    }

    // Validate body
    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((err: z.core.$ZodIssue) => {
          errors.push({
            field: `body.${err.path.join('.')}`,
            message: err.message,
          });
        });
      } else {
        // Replace req.body with validated and transformed data
        req.body = result.data;
      }
    }

    // If validation errors exist, return 400
    if (errors.length > 0) {
      const errorResponse: ValidationErrorResponse = {
        success: false,
        error: 'Validation failed',
        details: errors,
      };

      res.status(400).json(errorResponse);
      return;
    }

    // Validation passed, proceed to next middleware/controller
    next();
  };
};

/**
 * Helper function to create a validation error response
 * Useful for custom validation in controllers
 */
export const createValidationError = (field: string, message: string): ValidationErrorResponse => {
  return {
    success: false,
    error: 'Validation failed',
    details: [{ field, message }],
  };
};
