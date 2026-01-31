/**
 * Inquiry/Contact Form Handler
 *
 * Handles form submissions and saves to Firestore inquiries collection.
 *
 * Security Features:
 * - Firebase Auth token verification
 * - Rate limiting (IP-based, Firestore)
 * - Input validation (Zod schemas)
 * - XSS prevention
 * - Strict CORS policy
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from './middleware/auth';
import { rateLimit, RATE_LIMITS } from './middleware/rate-limiter';
import {
  validateRequest,
  validateQuery,
  inquirySchema,
  inquiryQuerySchema,
  InquiryInput,
  InquiryQueryInput,
  containsXssPatterns,
} from './middleware/validation';
import { getCorsConfig } from './middleware/cors';

// Response interface
interface InquiryResponse {
  success: boolean;
  inquiryId?: string;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Submit inquiry endpoint
 *
 * Security:
 * - Requires Firebase Auth token in Authorization header
 * - Rate limited: 5 requests per minute per IP
 * - Input validated with Zod schema
 * - XSS patterns blocked
 * - Strict CORS policy (production domains only)
 */
export const submitInquiry = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 50,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      } as InquiryResponse);
      return;
    }

    // Rate limiting check - stricter for inquiry submission
    const rateLimitAllowed = await rateLimit(req, res, 'inquiry', RATE_LIMITS.inquiry);
    if (!rateLimitAllowed) {
      return; // Response already sent by rateLimit
    }

    // Verify Firebase Auth token
    const isAuthenticated = await requireAuth(req as AuthenticatedRequest, res);
    if (!isAuthenticated) {
      return; // Response already sent by requireAuth
    }

    try {
      // Validate and sanitize input with Zod schema
      const validatedData = await validateRequest<InquiryInput>(
        req,
        res,
        inquirySchema
      );
      if (!validatedData) {
        return; // Response already sent by validateRequest
      }

      const { name, email, phone, company, subject, message, type, metadata } = validatedData;

      // Additional XSS pattern check on message content
      if (containsXssPatterns(message) || containsXssPatterns(subject)) {
        res.status(400).json({
          success: false,
          error: 'Message contains invalid content.',
        } as InquiryResponse);
        return;
      }

      // Store inquiry in Firestore
      const db = admin.firestore();
      const inquiryRef = await db.collection('inquiries').add({
        name,
        email,
        phone,
        company,
        subject,
        message,
        type,
        metadata,
        status: 'new',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const inquiryId = inquiryRef.id;

      res.status(200).json({
        success: true,
        inquiryId,
        message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
      } as InquiryResponse);
    } catch (error) {
      console.error('Inquiry submission error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as InquiryResponse);
    }
  }
);

/**
 * Get inquiries endpoint (for admin dashboard)
 *
 * Security:
 * - Requires Firebase Auth token in Authorization header
 * - Rate limited: 100 requests per minute per IP
 * - Query parameters validated with Zod schema
 * - Strict CORS policy (production domains only)
 */
export const getInquiries = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use GET.',
      });
      return;
    }

    // Rate limiting check
    const rateLimitAllowed = await rateLimit(req, res, 'getInquiries', RATE_LIMITS.default);
    if (!rateLimitAllowed) {
      return; // Response already sent by rateLimit
    }

    try {
      // Verify authentication using Firebase Auth
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized. Please provide a valid token.',
        });
        return;
      }

      const token = authHeader.split('Bearer ')[1];

      try {
        await admin.auth().verifyIdToken(token);
      } catch {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token.',
        });
        return;
      }

      // Validate query parameters with Zod schema
      const queryResult = validateQuery<InquiryQueryInput>(
        inquiryQuerySchema,
        req.query
      );

      if (!queryResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: queryResult.errors,
        });
        return;
      }

      const { limit, status, type } = queryResult.data!;

      // Build query
      const db = admin.firestore();
      let query: FirebaseFirestore.Query = db.collection('inquiries')
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (status) {
        query = query.where('status', '==', status);
      }

      if (type) {
        query = query.where('type', '==', type);
      }

      const snapshot = await query.get();
      const inquiries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({
        success: true,
        inquiries,
        count: inquiries.length,
      });
    } catch (error) {
      console.error('Get inquiries error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred.',
      });
    }
  }
);
