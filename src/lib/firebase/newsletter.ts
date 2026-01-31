/**
 * Newsletter Service (BE-007)
 *
 * Client-side utilities for newsletter subscription management.
 * Uses Cloud Functions for actual subscription processing (double opt-in).
 */

import type { SubscriberInterest } from '@/types';

const API_BASE = '/api/newsletter';

/**
 * Newsletter subscription data interface
 */
export interface NewsletterSubscriptionData {
  email: string;
  interests: SubscriberInterest[];
  source?: string;
  metadata?: {
    page?: string;
    referrer?: string;
    userAgent?: string;
  };
}

/**
 * Subscription result interface
 */
export interface SubscriptionResult {
  success: boolean;
  message?: string;
  error?: string;
  alreadySubscribed?: boolean;
  pending?: boolean;
}

/**
 * Subscribe to the newsletter with double opt-in
 *
 * @param data - Subscription data including email and interests
 * @returns Promise<SubscriptionResult>
 */
export async function subscribeToNewsletter(
  data: NewsletterSubscriptionData
): Promise<SubscriptionResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        success: false,
        error: '올바른 이메일 주소를 입력해주세요.',
      };
    }

    // Validate interests
    if (!data.interests || data.interests.length === 0) {
      return {
        success: false,
        error: '최소 1개의 관심 분야를 선택해주세요.',
      };
    }

    // Prepare request data
    const requestData = {
      email: data.email.trim().toLowerCase(),
      interests: data.interests,
      source: data.source || 'website',
      metadata: {
        page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        ...data.metadata,
      },
    };

    // Call the subscription API
    const response = await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result = await response.json();

    return {
      success: result.success,
      message: result.message,
      error: result.error,
      alreadySubscribed: result.alreadySubscribed,
      pending: result.pending,
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return {
      success: false,
      error: '구독 신청에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

/**
 * Subscribe with email only (uses default interests)
 *
 * @param email - Email address to subscribe
 * @returns Promise<SubscriptionResult>
 */
export async function subscribeEmailOnly(email: string): Promise<SubscriptionResult> {
  return subscribeToNewsletter({
    email,
    interests: ['automation', 'ai', 'data-analysis'], // Default: all interests
  });
}

/**
 * Get subscription confirmation status from URL token
 *
 * @param token - Confirmation token from email link
 * @returns Promise<{ confirmed: boolean; error?: string }>
 */
export async function checkConfirmationStatus(
  token: string
): Promise<{ confirmed: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/confirm?token=${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const result = await response.json();

    return {
      confirmed: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('Confirmation check error:', error);
    return {
      confirmed: false,
      error: '확인에 실패했습니다.',
    };
  }
}

/**
 * Process unsubscribe from URL token
 *
 * @param token - Unsubscribe token from email link
 * @returns Promise<{ unsubscribed: boolean; error?: string }>
 */
export async function processUnsubscribe(
  token: string
): Promise<{ unsubscribed: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/unsubscribe?token=${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const result = await response.json();

    return {
      unsubscribed: result.success,
      error: result.error,
    };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return {
      unsubscribed: false,
      error: '구독 취소에 실패했습니다.',
    };
  }
}
