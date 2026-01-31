/**
 * CORS Configuration for Cloud Functions
 *
 * Provides secure CORS settings for production environments.
 * Strictly restricts origins to approved domains only.
 *
 * SECURITY: Never allow all origins ('*') in production.
 */

import type { HttpsOptions } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';

/**
 * Production allowed origins - STRICTLY LIMITED
 * Only add domains that are verified and owned by your organization
 */
const PRODUCTION_ORIGINS: readonly string[] = [
  'https://carib.ai',
  'https://www.carib.ai',
  'https://carib-b153b.web.app',
  'https://carib-b153b.firebaseapp.com',
] as const;

/**
 * Development origins - ONLY enabled in non-production
 */
const DEVELOPMENT_ORIGINS: readonly string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
] as const;

/**
 * Check if running in production environment
 */
function isProduction(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.FUNCTIONS_EMULATOR !== 'true'
  );
}

/**
 * Get all allowed origins based on environment
 * SECURITY: In production, only production origins are allowed
 */
export function getAllowedOrigins(): string[] {
  if (isProduction()) {
    return [...PRODUCTION_ORIGINS];
  }
  return [...PRODUCTION_ORIGINS, ...DEVELOPMENT_ORIGINS];
}

/**
 * Get the CORS configuration based on environment
 * SECURITY: Never returns 'true' (allow all) in production
 * @returns Array of allowed origins
 */
export function getCorsConfig(): string[] {
  return getAllowedOrigins();
}

/**
 * Validate Origin header against allowed origins
 * @param origin - The origin header from the request
 * @returns Whether the origin is allowed
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return false;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

/**
 * Set CORS headers manually for more control
 * Use this when you need fine-grained CORS control
 */
export function setCorsHeaders(
  req: Request,
  res: Response,
  options?: {
    allowCredentials?: boolean;
    allowMethods?: string[];
    allowHeaders?: string[];
    maxAge?: number;
  }
): boolean {
  const origin = req.headers.origin;

  if (!origin || !isOriginAllowed(origin)) {
    // Origin not allowed - don't set CORS headers
    return false;
  }

  const {
    allowCredentials = true,
    allowMethods = ['GET', 'POST', 'OPTIONS'],
    allowHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge = 86400, // 24 hours
  } = options || {};

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', allowMethods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(', '));
  res.setHeader('Access-Control-Max-Age', maxAge.toString());

  if (allowCredentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Vary header to prevent caching issues
  res.setHeader('Vary', 'Origin');

  return true;
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(req: Request, res: Response): boolean {
  if (req.method === 'OPTIONS') {
    const corsSet = setCorsHeaders(req, res);
    if (corsSet) {
      res.status(204).end();
    } else {
      res.status(403).json({
        success: false,
        error: 'CORS: Origin not allowed',
      });
    }
    return true;
  }
  return false;
}

/**
 * Standard CORS options for API endpoints
 * SECURITY: Uses strict origin list, not 'true'
 */
export const secureCorsOptions: HttpsOptions = {
  cors: getCorsConfig(),
  maxInstances: 100,
  timeoutSeconds: 60,
  memory: '512MiB',
};

/**
 * Restricted CORS options for admin endpoints
 * Same as secureCorsOptions but with lower limits
 */
export const restrictedCorsOptions: HttpsOptions = {
  cors: getCorsConfig(),
  maxInstances: 20,
  timeoutSeconds: 30,
  memory: '256MiB',
};

/**
 * @deprecated Use secureCorsOptions instead
 * This alias exists for backward compatibility
 */
export const publicCorsOptions = secureCorsOptions;

export default {
  getCorsConfig,
  getAllowedOrigins,
  isOriginAllowed,
  setCorsHeaders,
  handlePreflight,
  secureCorsOptions,
  restrictedCorsOptions,
  PRODUCTION_ORIGINS,
};
