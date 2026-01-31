/**
 * Carib Cloud Functions - Main Entry Point
 *
 * This file exports all Cloud Functions for the Carib website.
 * Functions are organized by feature/domain for maintainability.
 *
 * Security Features:
 * - Rate Limiting (IP-based, Firestore counters)
 * - Input Validation (Zod schemas)
 * - Strict CORS (production domains only)
 * - Firebase Auth verification
 * - XSS/Injection prevention
 */

// Initialize Firebase Admin SDK
import * as admin from 'firebase-admin';

// Initialize the app only once
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export AI Chat functions
export { chat, chatStream } from './chat';

// Export Inquiry/Contact form functions
export { submitInquiry, getInquiries } from './inquiry';

// Export Scheduled functions
export { dailyBackup, weeklyCleanup, healthCheck } from './scheduled';

// Export Email notification functions (SendGrid + Pub/Sub integration)
export {
  onInquiryCreated,
  onInquiryUpdated,
  resendInquiryEmail,
  testEmailConfig,
} from './email';

// Export Thread CRUD functions (Admin only)
export {
  createThread,
  updateThread,
  deleteThread,
  getThreadImageUploadUrl,
  getAdminThreads,
} from './threads';

// Export Pub/Sub subscriber functions for additional processing
export { processNewInquiry, processStatusChange } from './subscribers';

// Export notification management functions for Admin Dashboard
export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  registerFcmToken,
} from './api/notifications';

// Export Conversation Analytics & FAQ Auto-Generation functions (AI-003)
export {
  analyzeConversationsDaily,
  getFAQSuggestions,
  approveFAQSuggestion,
  rejectFAQSuggestion,
  getConversationAnalytics,
  onChatFeedbackCreated,
  triggerConversationAnalysis,
} from './conversationAnalytics';

// Export Newsletter Subscription functions (BE-007)
export {
  subscribe,
  confirmSubscription,
  unsubscribe,
  onSubscriberCreated,
  getSubscriberStats,
  listSubscribers,
} from './newsletter';

// Export Document Analyzer functions (AI-004)
export {
  analyzeDocuments,
  saveDocumentAnalysis,
  shareDocumentAnalysis,
  getSharedAnalysis,
} from './documentAnalyzer';

// Export middleware utilities for potential use by other functions
export { rateLimit, RATE_LIMITS, checkRateLimit } from './middleware/rate-limiter';
export { validateRequest, validateBody, chatMessageSchema, inquirySchema } from './middleware/validation';
export { getCorsConfig, isOriginAllowed } from './middleware/cors';
export { requireAuth, verifyAuthToken } from './middleware/auth';
