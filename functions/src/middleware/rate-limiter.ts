/**
 * Rate Limiting Middleware using Firestore
 *
 * IP-based rate limiting with configurable limits per endpoint.
 * Uses Firestore for distributed state across function instances.
 */

import * as admin from 'firebase-admin';
import type { Request, Response } from 'express';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the time window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Collection name for storing rate limit data */
  collectionName?: string;
  /** Custom identifier function (defaults to IP) */
  getIdentifier?: (req: Request) => string;
  /** Skip rate limiting for certain conditions */
  skip?: (req: Request) => boolean;
}

/**
 * Default rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  /** Chat endpoint - 30 requests per minute */
  chat: {
    maxRequests: 30,
    windowSeconds: 60,
  },
  /** Inquiry submission - 5 requests per minute */
  inquiry: {
    maxRequests: 5,
    windowSeconds: 60,
  },
  /** Health check - 60 requests per minute */
  healthCheck: {
    maxRequests: 60,
    windowSeconds: 60,
  },
  /** Default - 100 requests per minute */
  default: {
    maxRequests: 100,
    windowSeconds: 60,
  },
} as const;

/**
 * Rate limit response
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Get client IP address from request
 * Handles various proxy headers for accurate IP detection
 */
export function getClientIp(req: Request): string {
  // Check for forwarded headers (common with load balancers/proxies)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0];
    return ips.trim();
  }

  // Cloud Functions specific header
  const clientIp = req.headers['x-appengine-user-ip'] as string;
  if (clientIp) {
    return clientIp;
  }

  // Firebase Functions / Cloud Run
  const cloudRunIp = req.headers['x-client-ip'] as string;
  if (cloudRunIp) {
    return cloudRunIp;
  }

  // Direct connection IP
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/**
 * Generate rate limit key for Firestore
 */
function getRateLimitKey(identifier: string, endpoint: string): string {
  // Sanitize identifier to be valid Firestore document ID
  const sanitizedId = identifier.replace(/[./[\]#]/g, '_');
  return `${sanitizedId}_${endpoint}`;
}

/**
 * Check rate limit for a request
 * Uses Firestore transactions for atomic counter updates
 */
export async function checkRateLimit(
  req: Request,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const db = admin.firestore();
  const collectionName = config.collectionName || 'rate_limits';

  // Get identifier (default to IP)
  const identifier = config.getIdentifier
    ? config.getIdentifier(req)
    : getClientIp(req);

  const docId = getRateLimitKey(identifier, endpoint);
  const docRef = db.collection(collectionName).doc(docId);

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      const data = doc.data();

      // Check if window has expired
      if (!data || (data.windowStart && now - data.windowStart >= windowMs)) {
        // Start new window
        transaction.set(docRef, {
          identifier,
          endpoint,
          count: 1,
          windowStart: now,
          lastRequest: now,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetAt: new Date(now + windowMs),
        };
      }

      // Check if limit exceeded
      const currentCount = data.count || 0;
      const windowStart = data.windowStart || now;
      const resetAt = new Date(windowStart + windowMs);

      if (currentCount >= config.maxRequests) {
        const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfter,
        };
      }

      // Increment counter
      transaction.update(docRef, {
        count: admin.firestore.FieldValue.increment(1),
        lastRequest: now,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        resetAt,
      };
    });

    return result;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: -1, // Unknown
      resetAt: new Date(now + windowMs),
    };
  }
}

/**
 * Rate limiting middleware
 * Returns true if request is allowed, false if rate limited
 */
export async function rateLimit(
  req: Request,
  res: Response,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.default
): Promise<boolean> {
  // Check if rate limiting should be skipped
  if (config.skip && config.skip(req)) {
    return true;
  }

  const result = await checkRateLimit(req, endpoint, config);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining).toString());
  res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt.getTime() / 1000).toString());

  if (!result.allowed) {
    res.setHeader('Retry-After', (result.retryAfter || config.windowSeconds).toString());
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: result.retryAfter,
    });
    return false;
  }

  return true;
}

/**
 * Create a rate limiter with custom configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, endpoint: string): Promise<boolean> => {
    return rateLimit(req, res, endpoint, config);
  };
}

/**
 * Clean up expired rate limit documents
 * Should be called periodically (e.g., by a scheduled function)
 */
export async function cleanupExpiredRateLimits(
  collectionName: string = 'rate_limits',
  maxAgeSeconds: number = 3600
): Promise<number> {
  const db = admin.firestore();
  const cutoff = Date.now() - maxAgeSeconds * 1000;

  const snapshot = await db
    .collection(collectionName)
    .where('windowStart', '<', cutoff)
    .limit(500)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return snapshot.size;
}

export default {
  rateLimit,
  checkRateLimit,
  createRateLimiter,
  getClientIp,
  cleanupExpiredRateLimits,
  RATE_LIMITS,
};
