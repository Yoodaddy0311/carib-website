'use client';

import { useCallback } from 'react';
import {
  trackEvent as analyticsTrackEvent,
  trackPageView,
  trackCoffeeChatClick,
  trackChatOpen,
  trackChatMessageSent,
  trackThreadView,
  trackFormSubmit,
  trackNavClick,
  trackScrollDepth,
  trackExternalLinkClick,
  trackServiceClick,
  isAnalyticsEnabled,
} from '@/lib/analytics';

export interface UseAnalyticsReturn {
  /** Check if analytics is enabled */
  isEnabled: boolean;
  /** Track a custom event */
  trackEvent: (eventName: string, params?: Record<string, unknown>) => void;
  /** Track a page view */
  trackPageView: (url: string, title?: string) => void;
  /** Track coffee chat button click */
  trackCoffeeChatClick: (source: string) => void;
  /** Track chat widget open */
  trackChatOpen: () => void;
  /** Track chat message sent */
  trackChatMessageSent: (messageLength?: number) => void;
  /** Track thread view */
  trackThreadView: (threadId: string, threadTitle?: string) => void;
  /** Track form submission */
  trackFormSubmit: (formType: string, formData?: Record<string, unknown>) => void;
  /** Track navigation click */
  trackNavClick: (destination: string) => void;
  /** Track scroll depth */
  trackScrollDepth: (depth: number, pagePath: string) => void;
  /** Track external link click */
  trackExternalLinkClick: (url: string, linkText: string) => void;
  /** Track service click */
  trackServiceClick: (serviceName: string) => void;
}

/**
 * Custom hook for Google Analytics 4 tracking
 * Provides a convenient way to track events throughout the application
 *
 * @example
 * ```tsx
 * const { trackEvent, trackCoffeeChatClick } = useAnalytics();
 *
 * // Track custom event
 * trackEvent('button_click', { button_name: 'subscribe' });
 *
 * // Track coffee chat click
 * trackCoffeeChatClick('hero');
 * ```
 */
export function useAnalytics(): UseAnalyticsReturn {
  const trackEventCallback = useCallback(
    (eventName: string, params?: Record<string, unknown>) => {
      analyticsTrackEvent(eventName, params);
    },
    []
  );

  const trackPageViewCallback = useCallback((url: string, title?: string) => {
    trackPageView(url, title);
  }, []);

  const trackCoffeeChatClickCallback = useCallback((source: string) => {
    trackCoffeeChatClick(source);
  }, []);

  const trackChatOpenCallback = useCallback(() => {
    trackChatOpen();
  }, []);

  const trackChatMessageSentCallback = useCallback((messageLength?: number) => {
    trackChatMessageSent(messageLength);
  }, []);

  const trackThreadViewCallback = useCallback(
    (threadId: string, threadTitle?: string) => {
      trackThreadView(threadId, threadTitle);
    },
    []
  );

  const trackFormSubmitCallback = useCallback(
    (formType: string, formData?: Record<string, unknown>) => {
      trackFormSubmit(formType, formData);
    },
    []
  );

  const trackNavClickCallback = useCallback((destination: string) => {
    trackNavClick(destination);
  }, []);

  const trackScrollDepthCallback = useCallback(
    (depth: number, pagePath: string) => {
      trackScrollDepth(depth, pagePath);
    },
    []
  );

  const trackExternalLinkClickCallback = useCallback(
    (url: string, linkText: string) => {
      trackExternalLinkClick(url, linkText);
    },
    []
  );

  const trackServiceClickCallback = useCallback((serviceName: string) => {
    trackServiceClick(serviceName);
  }, []);

  return {
    isEnabled: isAnalyticsEnabled(),
    trackEvent: trackEventCallback,
    trackPageView: trackPageViewCallback,
    trackCoffeeChatClick: trackCoffeeChatClickCallback,
    trackChatOpen: trackChatOpenCallback,
    trackChatMessageSent: trackChatMessageSentCallback,
    trackThreadView: trackThreadViewCallback,
    trackFormSubmit: trackFormSubmitCallback,
    trackNavClick: trackNavClickCallback,
    trackScrollDepth: trackScrollDepthCallback,
    trackExternalLinkClick: trackExternalLinkClickCallback,
    trackServiceClick: trackServiceClickCallback,
  };
}
