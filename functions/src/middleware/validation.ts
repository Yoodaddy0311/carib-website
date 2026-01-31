/**
 * Input Validation Middleware using Zod
 *
 * Provides type-safe validation schemas for all API endpoints.
 * Prevents XSS, SQL injection, and other malicious input attacks.
 */

import { z } from 'zod';
import type { Request, Response } from 'express';

/**
 * Sanitize string to prevent XSS attacks
 * Removes HTML tags, script content, and dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize string for potential SQL injection patterns
 * Note: Firestore uses NoSQL, but we still sanitize to prevent other attacks
 */
export function sanitizeSqlPatterns(input: string): string {
  return input
    // Remove common SQL injection patterns
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/\bUNION\b/gi, '')
    .replace(/\bSELECT\b/gi, '')
    .replace(/\bINSERT\b/gi, '')
    .replace(/\bUPDATE\b/gi, '')
    .replace(/\bDELETE\b/gi, '')
    .replace(/\bDROP\b/gi, '')
    .replace(/\bEXEC\b/gi, '')
    .trim();
}

/**
 * Custom Zod refinements for sanitized strings
 */
const sanitizedString = (maxLength: number = 1000) =>
  z.string().max(maxLength).transform(sanitizeString);

const strictSanitizedString = (maxLength: number = 1000) =>
  z
    .string()
    .max(maxLength)
    .transform((val) => sanitizeSqlPatterns(sanitizeString(val)));

/**
 * Email validation with strict format check
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254)
  .transform((val) => val.toLowerCase().trim());

/**
 * Phone number validation (Korean format support)
 */
const phoneSchema = z
  .string()
  .regex(
    /^(\+82|0)?[0-9]{2,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{4}$/,
    'Invalid phone number format'
  )
  .max(20)
  .optional()
  .transform((val) => (val ? val.replace(/[-.\s]/g, '') : undefined));

/**
 * Session ID validation (Firestore document ID format)
 */
const sessionIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid session ID format')
  .max(128)
  .optional();

/**
 * Chat message schema
 */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(4000, 'Message too long (max 4000 characters)')
    .transform(sanitizeString),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string().max(4000).transform(sanitizeString),
      })
    )
    .max(10, 'Conversation history too long')
    .optional(),
  sessionId: sessionIdSchema,
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

/**
 * Inquiry type enum
 */
export const inquiryTypeSchema = z.enum([
  'general',
  'support',
  'sales',
  'partnership',
  'coffee-chat',
]);

/**
 * Inquiry submission schema
 */
export const inquirySchema = z.object({
  name: sanitizedString(100).refine(
    (val) => val.length >= 1,
    'Name is required'
  ),
  email: emailSchema,
  phone: phoneSchema,
  company: sanitizedString(100).optional(),
  subject: sanitizedString(200).refine(
    (val) => val.length >= 1,
    'Subject is required'
  ),
  message: sanitizedString(5000).refine(
    (val) => val.length >= 10,
    'Message must be at least 10 characters'
  ),
  type: inquiryTypeSchema.default('general'),
  metadata: z
    .object({
      userAgent: z.string().max(500).optional(),
      referrer: z.string().max(500).optional(),
      page: z.string().max(500).optional(),
    })
    .optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/**
 * Inquiry query schema (for getInquiries endpoint)
 */
export const inquiryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50),
  status: z.enum(['new', 'in-progress', 'resolved', 'closed']).optional(),
  type: inquiryTypeSchema.optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
});

export type InquiryQueryInput = z.infer<typeof inquiryQuerySchema>;

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Validate request body against a Zod schema
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  query: unknown
): ValidationResult<T> {
  return validateBody(schema, query);
}

/**
 * Express middleware for body validation
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: () => void): void => {
    const result = validateBody(schema, req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.errors,
      });
      return;
    }

    // Replace body with validated/sanitized data
    req.body = result.data;
    next();
  };
}

/**
 * Validate and sanitize request body
 * Returns validated data or sends error response
 */
export async function validateRequest<T>(
  req: Request,
  res: Response,
  schema: z.ZodSchema<T>
): Promise<T | null> {
  const result = validateBody(schema, req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: result.errors,
    });
    return null;
  }

  return result.data!;
}

/**
 * Check for potential XSS patterns in a string
 */
export function containsXssPatterns(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /expression\s*\(/i,
    /url\s*\(/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Deep sanitize an object recursively
 */
export function deepSanitize<T extends object>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? deepSanitize(item)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = deepSanitize(value as object);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

export default {
  // Schemas
  chatMessageSchema,
  inquirySchema,
  inquiryQuerySchema,
  inquiryTypeSchema,
  // Validation functions
  validateBody,
  validateQuery,
  validateRequest,
  validateRequestBody,
  // Sanitization functions
  sanitizeString,
  sanitizeSqlPatterns,
  deepSanitize,
  containsXssPatterns,
};
