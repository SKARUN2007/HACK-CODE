import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logSecurityEvent } from '../utils/securityLogger';

// Password Strength Requirement Schema: Min 8 chars, at least 1 letter, at least 1 number
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter.')
  .regex(/\d/, 'Password must contain at least one number.');

// Login Schema
export const loginBodySchema = z.object({
  email: z.string().email('Invalid email address format.'),
  password: z.string().min(1, 'Password is required.'),
});

// Evidence Submission Notes Schema (Max 1000 chars)
export const evidenceNotesSchema = z
  .string()
  .max(1000, 'Notes comment cannot exceed 1000 characters.')
  .optional()
  .nullable();

// Coordinates Schema
export const coordinateSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90.')
    .max(90, 'Latitude must be between -90 and 90.')
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180.')
    .max(180, 'Longitude must be between -180 and 180.')
    .optional()
    .nullable(),
});

/**
 * Generic Zod Body Validation Middleware
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.errors.map((e) => e.message).join(' ');

      logSecurityEvent({
        type: 'MALFORMED_INPUT',
        severity: 'LOW',
        userId: (req as any).user?.id || null,
        endpoint: req.originalUrl,
        description: `Rejected malformed request payload: ${errorMsg}`,
      });

      return res.status(400).json({
        error: `Validation Error: ${errorMsg}`,
      });
    }
    req.body = result.data;
    next();
  };
}
