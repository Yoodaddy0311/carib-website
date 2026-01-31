/**
 * Admin Authentication Middleware
 *
 * Verifies Firebase Auth tokens and checks for admin custom claims.
 * Admin users must have { admin: true } custom claim set.
 */

import * as admin from 'firebase-admin';
import type { Request, Response } from 'express';

/**
 * Decoded token with admin claim
 */
export interface AdminDecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  admin?: boolean;
  name?: string;
  picture?: string;
  firebase: {
    sign_in_provider: string;
    identities: Record<string, string[]>;
  };
}

/**
 * Extended request with admin user info
 */
export interface AdminAuthenticatedRequest extends Request {
  adminUser?: AdminDecodedToken;
}

/**
 * Response type for admin auth verification
 */
export interface AdminAuthVerifyResult {
  success: boolean;
  user?: AdminDecodedToken;
  error?: string;
  statusCode?: number;
}

/**
 * Verify Firebase ID token and check admin custom claim
 * @param req - Express request object
 * @returns Verification result with decoded token or error
 */
export async function verifyAdminToken(req: Request): Promise<AdminAuthVerifyResult> {
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

    // Check for admin custom claim
    if (!decodedToken.admin) {
      // Also check Firestore admins collection as fallback
      const db = admin.firestore();
      const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();

      if (!adminDoc.exists) {
        return {
          success: false,
          error: 'Access denied. Admin privileges required.',
          statusCode: 403,
        };
      }
    }

    return {
      success: true,
      user: decodedToken as AdminDecodedToken,
    };
  } catch (error) {
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return {
          success: false,
          error: 'Token has expired. Please sign in again.',
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

    console.error('Admin token verification failed:', error);
    return {
      success: false,
      error: 'Authentication failed. Please try again.',
      statusCode: 401,
    };
  }
}

/**
 * Middleware-style function to verify admin auth and attach user to request
 * @param req - Express request
 * @param res - Express response
 * @returns True if authenticated as admin, false if response was sent
 */
export async function requireAdmin(
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<boolean> {
  const result = await verifyAdminToken(req);

  if (!result.success) {
    res.status(result.statusCode || 401).json({
      success: false,
      error: result.error,
    });
    return false;
  }

  // Attach admin user info to request
  req.adminUser = result.user;
  return true;
}

/**
 * Set admin custom claim for a user
 * This should only be called from a secure context (e.g., Firebase Console, CLI)
 * @param uid - User ID to set as admin
 */
export async function setAdminClaim(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, { admin: true });

  // Also add to admins collection for storage rules
  const db = admin.firestore();
  await db.collection('admins').doc(uid).set({
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    role: 'admin',
  });
}

/**
 * Remove admin custom claim from a user
 * @param uid - User ID to remove admin from
 */
export async function removeAdminClaim(uid: string): Promise<void> {
  await admin.auth().setCustomUserClaims(uid, { admin: null });

  // Also remove from admins collection
  const db = admin.firestore();
  await db.collection('admins').doc(uid).delete();
}

/**
 * Alias for requireAdmin - Middleware to verify admin auth for HTTP functions
 * @param req - Express request
 * @param res - Express response
 * @returns True if authenticated as admin, false if response was sent
 */
export async function requireAdminAuth(
  req: AdminAuthenticatedRequest,
  res: Response
): Promise<boolean> {
  return requireAdmin(req, res);
}
