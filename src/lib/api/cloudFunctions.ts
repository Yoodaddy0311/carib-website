/**
 * Cloud Functions API Client
 *
 * Provides a unified interface for calling Cloud Functions from the frontend.
 * Handles both production (Cloud Functions) and development (local API routes) environments.
 *
 * Authentication: Uses Firebase Auth anonymous login to authenticate requests.
 * GCP org policy blocks allUsers access, so we use Firebase Auth tokens.
 */

import { getAuthToken } from '@/lib/firebase/auth';

// Cloud Functions base URL from environment variable
const CLOUD_FUNCTIONS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Get the appropriate API endpoint URL
 * In production, uses Cloud Functions URL
 * In development without Cloud Functions URL, falls back to local API routes
 */
function getEndpointUrl(endpoint: string): string {
  if (CLOUD_FUNCTIONS_URL) {
    // Production: Use Cloud Functions
    return `${CLOUD_FUNCTIONS_URL}/${endpoint}`;
  }
  // Development fallback: Use local API routes
  return `/api/${endpoint}`;
}

/**
 * Get Firebase Auth token for authenticated requests
 * Returns empty string for local development without auth
 */
async function getAuthorizationHeader(): Promise<Record<string, string>> {
  // Only add auth header for Cloud Functions (production)
  if (!CLOUD_FUNCTIONS_URL) {
    return {};
  }

  try {
    const token = await getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error('Failed to get auth token:', error);
    // Don't throw - let the request proceed and fail with 401 if needed
    return {};
  }
}

/**
 * Generic fetch wrapper with error handling and Firebase Auth
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit,
  requiresAuth: boolean = true
): Promise<T> {
  // Get auth header if needed
  const authHeader = requiresAuth ? await getAuthorizationHeader() : {};

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: `HTTP ${response.status} error occurred`,
    }));

    // Handle specific auth errors
    if (response.status === 401) {
      throw new Error(errorData.error || 'Authentication failed. Please try again.');
    }

    throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ========================================
// Chat API
// ========================================

import type { PageContext, FunctionCallResult } from '@/types';

export interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'model'; content: string }>;
  conversationHistory?: Array<{ role: 'user' | 'model'; content: string }>;
  sessionId?: string;
  pageContext?: PageContext;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  message?: string;
  sessionId?: string;
  timestamp?: string;
  error?: string;
  functionCall?: FunctionCallResult;
}

/**
 * Send a chat message to the AI assistant
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const url = getEndpointUrl('chat');

  // Transform history format for Cloud Functions (uses conversationHistory)
  const body = {
    message: request.message,
    conversationHistory: request.history || request.conversationHistory,
    sessionId: request.sessionId,
    pageContext: request.pageContext,
  };

  const response = await fetchWithErrorHandling<ChatResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // Normalize response format (Cloud Functions uses 'response', API route uses 'message')
  return {
    ...response,
    message: response.response || response.message,
    response: response.response || response.message,
  };
}

// ========================================
// Inquiry API
// ========================================

export interface InquiryRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  type?: 'general' | 'support' | 'sales' | 'partnership' | 'coffee-chat' | 'project';
  inquiryType?: 'general' | 'project' | 'coffee-chat';
  metadata?: {
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
}

export interface InquiryResponse {
  success: boolean;
  inquiryId?: string;
  id?: string;
  message?: string;
  error?: string;
}

/**
 * Submit an inquiry/contact form
 */
export async function submitInquiry(request: InquiryRequest): Promise<InquiryResponse> {
  const url = getEndpointUrl('submitInquiry');

  // Transform request format for Cloud Functions
  const body: InquiryRequest = {
    name: request.name,
    email: request.email,
    phone: request.phone,
    company: request.company,
    subject: request.subject || `${request.inquiryType || request.type || 'general'} inquiry`,
    message: request.message,
    type: (request.inquiryType || request.type || 'general') as InquiryRequest['type'],
    metadata: request.metadata || {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    },
  };

  const response = await fetchWithErrorHandling<InquiryResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // Normalize response format
  return {
    ...response,
    id: response.inquiryId || response.id,
    inquiryId: response.inquiryId || response.id,
  };
}

// ========================================
// Newsletter API
// ========================================

export interface NewsletterRequest {
  email: string;
}

export interface NewsletterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Subscribe to the newsletter
 * Note: This function stores directly to Firestore since newsletter
 * doesn't require complex processing on the server side.
 * If a Cloud Function is needed in the future, update the endpoint.
 */
export async function subscribeNewsletter(request: NewsletterRequest): Promise<NewsletterResponse> {
  // For newsletter, we can use Cloud Functions if available,
  // or fall back to direct Firestore write
  const url = getEndpointUrl('subscribeNewsletter');

  try {
    const response = await fetchWithErrorHandling<NewsletterResponse>(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  } catch (error) {
    // If Cloud Function doesn't exist, return error
    // The component should handle this and potentially use direct Firestore
    console.error('Newsletter subscription error:', error);
    throw error;
  }
}

// ========================================
// Thread Admin API
// ========================================

export type ThreadCategory =
  | 'ai-automation'
  | 'no-code'
  | 'productivity'
  | 'case-study'
  | 'tutorial'
  | 'insight';

export interface ThreadRequest {
  id?: string;
  tweetId?: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  content: string;
  summary?: string;
  category: ThreadCategory;
  tags?: string[];
  likeCount?: number;
  retweetCount?: number;
  replyCount?: number;
  mediaUrls?: string[];
  publishedAt?: string | Date;
  featured?: boolean;
  published?: boolean;
}

export interface ThreadResponse {
  success: boolean;
  threadId?: string;
  message?: string;
  error?: string;
}

export interface UploadUrlRequest {
  fileName: string;
  contentType: string;
  threadId?: string;
}

export interface UploadUrlResponse {
  success: boolean;
  uploadUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  error?: string;
}

export interface AdminThreadsResponse {
  success: boolean;
  threads?: Array<ThreadRequest & { id: string }>;
  count?: number;
  error?: string;
}

/**
 * Create a new thread (Admin only)
 */
export async function createThreadApi(request: ThreadRequest): Promise<ThreadResponse> {
  const url = getEndpointUrl('createThread');

  const response = await fetchWithErrorHandling<ThreadResponse>(url, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response;
}

/**
 * Update an existing thread (Admin only)
 */
export async function updateThreadApi(request: ThreadRequest): Promise<ThreadResponse> {
  const url = getEndpointUrl('updateThread');

  const response = await fetchWithErrorHandling<ThreadResponse>(url, {
    method: 'PUT',
    body: JSON.stringify(request),
  });

  return response;
}

/**
 * Delete a thread (Admin only)
 */
export async function deleteThreadApi(threadId: string): Promise<ThreadResponse> {
  const url = getEndpointUrl('deleteThread');

  const response = await fetchWithErrorHandling<ThreadResponse>(url, {
    method: 'DELETE',
    body: JSON.stringify({ id: threadId }),
  });

  return response;
}

/**
 * Get signed URL for image upload (Admin only)
 */
export async function getThreadImageUploadUrlApi(
  request: UploadUrlRequest
): Promise<UploadUrlResponse> {
  const url = getEndpointUrl('getThreadImageUploadUrl');

  const response = await fetchWithErrorHandling<UploadUrlResponse>(url, {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return response;
}

/**
 * Upload image to Firebase Storage using signed URL
 */
export async function uploadThreadImage(
  file: File,
  threadId?: string
): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
  try {
    // Get signed upload URL
    const uploadUrlResponse = await getThreadImageUploadUrlApi({
      fileName: file.name,
      contentType: file.type,
      threadId,
    });

    if (!uploadUrlResponse.success || !uploadUrlResponse.uploadUrl) {
      return {
        success: false,
        error: uploadUrlResponse.error || 'Failed to get upload URL',
      };
    }

    // Upload file to signed URL
    const uploadResponse = await fetch(uploadUrlResponse.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      return {
        success: false,
        error: 'Failed to upload file',
      };
    }

    return {
      success: true,
      downloadUrl: uploadUrlResponse.downloadUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get all threads for admin dashboard (Admin only)
 */
export async function getAdminThreadsApi(options?: {
  category?: ThreadCategory;
  published?: boolean;
  limit?: number;
}): Promise<AdminThreadsResponse> {
  const params = new URLSearchParams();
  if (options?.category) params.append('category', options.category);
  if (options?.published !== undefined) params.append('published', String(options.published));
  if (options?.limit) params.append('limit', String(options.limit));

  const url = `${getEndpointUrl('getAdminThreads')}${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetchWithErrorHandling<AdminThreadsResponse>(url, {
    method: 'GET',
  });

  return response;
}

// ========================================
// Export all functions
// ========================================

export const cloudFunctionsApi = {
  chat: sendChatMessage,
  submitInquiry,
  subscribeNewsletter,
  getEndpointUrl,
  // Thread Admin APIs
  createThread: createThreadApi,
  updateThread: updateThreadApi,
  deleteThread: deleteThreadApi,
  getThreadImageUploadUrl: getThreadImageUploadUrlApi,
  uploadThreadImage,
  getAdminThreads: getAdminThreadsApi,
};

export default cloudFunctionsApi;
