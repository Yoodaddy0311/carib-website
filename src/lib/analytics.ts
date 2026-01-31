// Google Analytics 4 + Firebase Analytics event tracking
import { analytics } from '@/lib/firebase/config';
import { logEvent } from 'firebase/analytics';

// GA4 Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Type definitions for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Check if analytics should be enabled
 * Only loads in production or when GA_MEASUREMENT_ID is set
 */
export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return process.env.NODE_ENV === 'production' || !!GA_MEASUREMENT_ID;
}

/**
 * Track page view event (GA4 + Firebase)
 * @param url - The URL of the page being viewed
 * @param title - The title of the page being viewed
 */
export function trackPageView(url: string, title?: string): void {
  if (!isAnalyticsEnabled()) return;

  // GA4 gtag tracking
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    });
  }

  // Firebase Analytics tracking
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_path: url,
      page_title: title,
    });
  }
}

/**
 * Track custom event (GA4 + Firebase)
 * @param eventName - The name of the event
 * @param params - Optional parameters for the event
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;

  // GA4 gtag tracking
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, params);
  }

  // Firebase Analytics tracking
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

// ============================================
// Specific Event Tracking Functions
// ============================================

/**
 * Track coffee chat button click
 * @param source - Where the click originated from (e.g., 'hero', 'cta_section', 'header')
 */
export function trackCoffeeChatClick(source: string): void {
  trackEvent('coffee_chat_click', {
    source,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track chat widget open event
 */
export function trackChatOpen(): void {
  trackEvent('chat_open', {
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track chat message sent event
 * @param messageLength - Optional length of the message
 */
export function trackChatMessageSent(messageLength?: number): void {
  trackEvent('chat_message_sent', {
    message_length: messageLength,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track thread view
 * @param threadId - The ID of the thread
 * @param threadTitle - The title of the thread
 */
export function trackThreadView(threadId: string, threadTitle?: string): void {
  trackEvent('thread_view', {
    thread_id: threadId,
    thread_title: threadTitle,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track form submission event
 * @param formType - The type of form submitted (e.g., 'contact', 'newsletter', 'coffee_chat')
 * @param formData - Optional additional form data
 */
export function trackFormSubmit(formType: string, formData?: Record<string, unknown>): void {
  trackEvent('form_submit', {
    form_type: formType,
    ...formData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track navigation click
 * @param destination - The navigation destination
 */
export function trackNavClick(destination: string): void {
  trackEvent('navigation_click', {
    destination,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track scroll depth
 * @param depth - The scroll depth percentage (25, 50, 75, 100)
 * @param pagePath - The current page path
 */
export function trackScrollDepth(depth: number, pagePath: string): void {
  trackEvent('scroll_depth', {
    depth_percentage: depth,
    page_path: pagePath,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track external link click
 * @param url - The URL of the external link
 * @param linkText - The text of the link
 */
export function trackExternalLinkClick(url: string, linkText: string): void {
  trackEvent('external_link_click', {
    url,
    link_text: linkText,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track service card click
 * @param serviceName - The name of the service clicked
 */
export function trackServiceClick(serviceName: string): void {
  trackEvent('service_click', {
    service_name: serviceName,
    timestamp: new Date().toISOString(),
  });
}

// Legacy alias for backward compatibility
export const trackChatWidgetOpen = trackChatOpen;
