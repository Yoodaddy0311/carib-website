/**
 * Firebase Auth Middleware for Cloud Functions
 *
 * Verifies Firebase ID tokens to authenticate requests.
 * This allows Cloud Functions to be protected without using
 * allUsers IAM binding (which is blocked by GCP org policy).
 */

import * as admin from 'firebase-admin';
import type { Request, Response } from 'express';

/**
 * Decoded token information from Firebase Auth
 */
export interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  phone_number?: string;
  name?: string;
  picture?: string;
  provider_id?: string;
  sign_in_provider?: string;
  firebase: {
    sign_in_provider: string;
    identities: Record<string, string[]>;
  };
}

/**
 * Extended request with authenticated user info
 */
export interface AuthenticatedRequest extends Request {
  user?: DecodedToken;
}

/**
 * Response type for auth verification
 */
export interface AuthVerifyResult {
  success: boolean;
  user?: DecodedToken;
  error?: string;
  statusCode?: number;
}

/**
 * Verify Firebase ID token from Authorization header
 * @param req - Express request object
 * @returns Verification result with decoded token or error
 */
export async function verifyAuthToken(req: Request): Promise<AuthVerifyResult> {
  const authHeader = req.headers.authorization;

  // Check for Authorization header
  if (!authHeader) {
    return {
      success: false,
      error: 'Missing Authorization header',
      statusCode: 401,
    };
  }

  // Check for Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      error: 'Invalid Authorization header format. Use "Bearer <token>"',
      statusCode: 401,
    };
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken || idToken.trim() === '') {
    return {
      success: false,
      error: 'Empty token provided',
      statusCode: 401,
    };
  }

  try {
    // Verify the ID token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      success: true,
      user: decodedToken as DecodedToken,
    };
  } catch (error) {
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return {
          success: false,
          error: 'Token has expired. Please refresh and try again.',
          statusCode: 401,
        };
      }

      if (error.message.includes('invalid') || error.message.includes('malformed')) {
        return {
          success: false,
          error: 'Invalid token provided.',
          statusCode: 401,
        };
      }

      if (error.message.includes('revoked')) {
        return {
          success: false,
          error: 'Token has been revoked. Please sign in again.',
          statusCode: 401,
        };
      }
    }

    console.error('Token verification failed:', error);
    return {
      success: false,
      error: 'Authentication failed. Please try again.',
      statusCode: 401,
    };
  }
}

/**
 * Middleware-style function to verify auth and attach user to request
 * @param req - Express request
 * @param res - Express response
 * @returns True if authenticated, false if response was sent
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response
): Promise<boolean> {
  const result = await verifyAuthToken(req);

  if (!result.success) {
    res.status(result.statusCode || 401).json({
      success: false,
      error: result.error,
    });
    return false;
  }

  // Attach user info to request
  req.user = result.user;
  return true;
}

/**
 * Optional auth - verifies if token present but doesn't require it
 * @param req - Express request
 * @returns Decoded token if present and valid, undefined otherwise
 */
export async function optionalAuth(
  req: AuthenticatedRequest
): Promise<DecodedToken | undefined> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined;
  }

  const result = await verifyAuthToken(req);
  if (result.success && result.user) {
    req.user = result.user;
    return result.user;
  }

  return undefined;
}
