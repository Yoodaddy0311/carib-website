/**
 * Thread CRUD Cloud Functions
 *
 * Handles thread management operations for the admin dashboard.
 * All operations require admin authentication.
 *
 * Features:
 * - Create, update, delete threads
 * - Image upload URL generation for Firebase Storage
 * - Admin-only access via custom claims
 */

import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { requireAdmin, AdminAuthenticatedRequest } from './middleware/adminAuth';

// Thread interfaces
interface ThreadData {
  tweetId?: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  summary: string;
  category: ThreadCategory;
  tags: string[];
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  mediaUrls: string[];
  publishedAt: admin.firestore.Timestamp | Date;
  syncedAt: admin.firestore.Timestamp | Date;
  featured: boolean;
  published: boolean;
}

type ThreadCategory =
  | 'ai-automation'
  | 'no-code'
  | 'productivity'
  | 'case-study'
  | 'tutorial'
  | 'insight';

interface ThreadResponse {
  success: boolean;
  threadId?: string;
  thread?: ThreadData & { id: string };
  error?: string;
  message?: string;
}

interface UploadUrlResponse {
  success: boolean;
  uploadUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

// Valid categories
const VALID_CATEGORIES: ThreadCategory[] = [
  'ai-automation',
  'no-code',
  'productivity',
  'case-study',
  'tutorial',
  'insight',
];

/**
 * Sanitize string input
 */
function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*on\w+="[^"]*"[^>]*>/gi, ''); // Remove event handlers
}

/**
 * Validate thread data
 */
function validateThreadData(
  data: Partial<ThreadData>,
  isUpdate: boolean = false
): { valid: boolean; error?: string } {
  if (!isUpdate) {
    // Required fields for creation
    if (!data.content || typeof data.content !== 'string') {
      return { valid: false, error: 'Content is required.' };
    }
    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      return { valid: false, error: 'Valid category is required.' };
    }
    if (!data.authorName || typeof data.authorName !== 'string') {
      return { valid: false, error: 'Author name is required.' };
    }
    if (!data.authorHandle || typeof data.authorHandle !== 'string') {
      return { valid: false, error: 'Author handle is required.' };
    }
  }

  // Validate category if provided
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    return { valid: false, error: 'Invalid category.' };
  }

  // Validate tags if provided
  if (data.tags && !Array.isArray(data.tags)) {
    return { valid: false, error: 'Tags must be an array.' };
  }

  // Validate mediaUrls if provided
  if (data.mediaUrls && !Array.isArray(data.mediaUrls)) {
    return { valid: false, error: 'Media URLs must be an array.' };
  }

  return { valid: true };
}

/**
 * Create a new thread
 * Requires admin authentication
 */
export const createThread = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      } as ThreadResponse);
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdmin(req as AdminAuthenticatedRequest, res);
    if (!isAdmin) {
      return; // Response already sent by requireAdmin
    }

    try {
      const data = req.body;

      // Validate input
      const validation = validateThreadData(data, false);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: validation.error,
        } as ThreadResponse);
        return;
      }

      // Prepare thread data
      const threadData: ThreadData = {
        tweetId: sanitizeString(data.tweetId || '', 50),
        authorName: sanitizeString(data.authorName, 100),
        authorHandle: sanitizeString(data.authorHandle, 50),
        authorAvatar: sanitizeString(data.authorAvatar || '/images/avatar.png', 500),
        content: sanitizeString(data.content, 10000),
        summary: sanitizeString(data.summary || '', 500),
        category: data.category,
        tags: Array.isArray(data.tags)
          ? data.tags.map((t: string) => sanitizeString(t, 50)).filter(Boolean)
          : [],
        likeCount: parseInt(data.likeCount) || 0,
        retweetCount: parseInt(data.retweetCount) || 0,
        replyCount: parseInt(data.replyCount) || 0,
        mediaUrls: Array.isArray(data.mediaUrls)
          ? data.mediaUrls.map((u: string) => sanitizeString(u, 1000)).filter(Boolean)
          : [],
        publishedAt: data.publishedAt
          ? admin.firestore.Timestamp.fromDate(new Date(data.publishedAt))
          : admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        syncedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        featured: Boolean(data.featured),
        published: data.published !== false, // Default to true
      };

      // Store thread in Firestore
      const db = admin.firestore();
      const threadRef = await db.collection('threads').add({
        ...threadData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: (req as AdminAuthenticatedRequest).adminUser?.uid,
      });

      res.status(201).json({
        success: true,
        threadId: threadRef.id,
        message: 'Thread created successfully.',
      } as ThreadResponse);
    } catch (error) {
      console.error('Create thread error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as ThreadResponse);
    }
  }
);

/**
 * Update an existing thread
 * Requires admin authentication
 */
export const updateThread = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow PUT or PATCH requests
    if (req.method !== 'PUT' && req.method !== 'PATCH') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use PUT or PATCH.',
      } as ThreadResponse);
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdmin(req as AdminAuthenticatedRequest, res);
    if (!isAdmin) {
      return;
    }

    try {
      const { id, ...data } = req.body;

      // Validate thread ID
      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Thread ID is required.',
        } as ThreadResponse);
        return;
      }

      // Validate input
      const validation = validateThreadData(data, true);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: validation.error,
        } as ThreadResponse);
        return;
      }

      // Check if thread exists
      const db = admin.firestore();
      const threadRef = db.collection('threads').doc(id);
      const threadDoc = await threadRef.get();

      if (!threadDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Thread not found.',
        } as ThreadResponse);
        return;
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: (req as AdminAuthenticatedRequest).adminUser?.uid,
      };

      // Only update provided fields
      if (data.tweetId !== undefined) {
        updateData.tweetId = sanitizeString(data.tweetId, 50);
      }
      if (data.authorName !== undefined) {
        updateData.authorName = sanitizeString(data.authorName, 100);
      }
      if (data.authorHandle !== undefined) {
        updateData.authorHandle = sanitizeString(data.authorHandle, 50);
      }
      if (data.authorAvatar !== undefined) {
        updateData.authorAvatar = sanitizeString(data.authorAvatar, 500);
      }
      if (data.content !== undefined) {
        updateData.content = sanitizeString(data.content, 10000);
      }
      if (data.summary !== undefined) {
        updateData.summary = sanitizeString(data.summary, 500);
      }
      if (data.category !== undefined) {
        updateData.category = data.category;
      }
      if (data.tags !== undefined) {
        updateData.tags = Array.isArray(data.tags)
          ? data.tags.map((t: string) => sanitizeString(t, 50)).filter(Boolean)
          : [];
      }
      if (data.likeCount !== undefined) {
        updateData.likeCount = parseInt(data.likeCount) || 0;
      }
      if (data.retweetCount !== undefined) {
        updateData.retweetCount = parseInt(data.retweetCount) || 0;
      }
      if (data.replyCount !== undefined) {
        updateData.replyCount = parseInt(data.replyCount) || 0;
      }
      if (data.mediaUrls !== undefined) {
        updateData.mediaUrls = Array.isArray(data.mediaUrls)
          ? data.mediaUrls.map((u: string) => sanitizeString(u, 1000)).filter(Boolean)
          : [];
      }
      if (data.publishedAt !== undefined) {
        updateData.publishedAt = admin.firestore.Timestamp.fromDate(new Date(data.publishedAt));
      }
      if (data.featured !== undefined) {
        updateData.featured = Boolean(data.featured);
      }
      if (data.published !== undefined) {
        updateData.published = Boolean(data.published);
      }

      // Update sync time
      updateData.syncedAt = admin.firestore.FieldValue.serverTimestamp();

      // Update thread
      await threadRef.update(updateData);

      res.status(200).json({
        success: true,
        threadId: id,
        message: 'Thread updated successfully.',
      } as ThreadResponse);
    } catch (error) {
      console.error('Update thread error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as ThreadResponse);
    }
  }
);

/**
 * Delete a thread
 * Requires admin authentication
 */
export const deleteThread = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Allow DELETE or POST with _method=DELETE
    if (req.method !== 'DELETE' && !(req.method === 'POST' && req.body._method === 'DELETE')) {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use DELETE.',
      } as ThreadResponse);
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdmin(req as AdminAuthenticatedRequest, res);
    if (!isAdmin) {
      return;
    }

    try {
      // Get thread ID from query params or body
      const id = req.query.id as string || req.body.id;

      if (!id || typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Thread ID is required.',
        } as ThreadResponse);
        return;
      }

      const db = admin.firestore();
      const threadRef = db.collection('threads').doc(id);
      const threadDoc = await threadRef.get();

      if (!threadDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Thread not found.',
        } as ThreadResponse);
        return;
      }

      // Delete associated images from Storage (optional - images may be reused)
      const threadData = threadDoc.data();
      if (threadData?.mediaUrls && Array.isArray(threadData.mediaUrls)) {
        const bucket = admin.storage().bucket();
        for (const url of threadData.mediaUrls) {
          // Extract file path from URL
          const match = url.match(/threads\/[^?]+/);
          if (match) {
            try {
              await bucket.file(match[0]).delete();
            } catch (deleteError) {
              // Ignore errors - file may not exist
              console.log('Could not delete file:', match[0]);
            }
          }
        }
      }

      // Delete thread
      await threadRef.delete();

      res.status(200).json({
        success: true,
        threadId: id,
        message: 'Thread deleted successfully.',
      } as ThreadResponse);
    } catch (error) {
      console.error('Delete thread error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as ThreadResponse);
    }
  }
);

/**
 * Get signed upload URL for thread images
 * Requires admin authentication
 */
export const getThreadImageUploadUrl = onRequest(
  {
    cors: true,
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      } as UploadUrlResponse);
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdmin(req as AdminAuthenticatedRequest, res);
    if (!isAdmin) {
      return;
    }

    try {
      const { fileName, contentType, threadId } = req.body;

      // Validate input
      if (!fileName || typeof fileName !== 'string') {
        res.status(400).json({
          success: false,
          error: 'File name is required.',
        } as UploadUrlResponse);
        return;
      }

      // Validate content type (only images allowed)
      const validContentTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!contentType || !validContentTypes.includes(contentType)) {
        res.status(400).json({
          success: false,
          error: 'Invalid content type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        } as UploadUrlResponse);
        return;
      }

      // Generate unique file name
      const ext = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = threadId
        ? `threads/${threadId}/${uniqueFileName}`
        : `threads/temp/${uniqueFileName}`;

      // Get signed URL for upload
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);

      const [uploadUrl] = await file.getSignedUrl({
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        contentType,
      });

      // Generate the public download URL
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      res.status(200).json({
        success: true,
        uploadUrl,
        downloadUrl,
        fileName: uniqueFileName,
      } as UploadUrlResponse);
    } catch (error) {
      console.error('Get upload URL error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as UploadUrlResponse);
    }
  }
);

/**
 * Get all threads for admin dashboard
 * Requires admin authentication
 */
export const getAdminThreads = onRequest(
  {
    cors: true,
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

    // Verify admin authentication
    const isAdmin = await requireAdmin(req as AdminAuthenticatedRequest, res);
    if (!isAdmin) {
      return;
    }

    try {
      // Parse query parameters
      const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
      const category = req.query.category as string;
      const published = req.query.published as string;

      // Build query
      const db = admin.firestore();
      let query: FirebaseFirestore.Query = db.collection('threads')
        .orderBy('publishedAt', 'desc')
        .limit(limit);

      if (category && VALID_CATEGORIES.includes(category as ThreadCategory)) {
        query = query.where('category', '==', category);
      }

      if (published !== undefined) {
        query = query.where('published', '==', published === 'true');
      }

      const snapshot = await query.get();
      const threads = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Convert Timestamps to ISO strings for JSON response
        publishedAt: doc.data().publishedAt?.toDate?.()?.toISOString() || null,
        syncedAt: doc.data().syncedAt?.toDate?.()?.toISOString() || null,
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      }));

      res.status(200).json({
        success: true,
        threads,
        count: threads.length,
      });
    } catch (error) {
      console.error('Get admin threads error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred.',
      });
    }
  }
);
