'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { PageContext, PageType } from '@/types';

/**
 * Hook for collecting page context information
 * Used to provide contextual information to the AI chat assistant
 */
export function usePageContext(): PageContext {
  const pathname = usePathname();
  const sessionStartRef = useRef<number>(Date.now());
  const viewedSectionsRef = useRef<Set<string>>(new Set());
  const visitedPagesRef = useRef<Set<string>>(new Set());

  const [context, setContext] = useState<PageContext>({
    url: '',
    pathname: pathname || '/',
    scrollPosition: 0,
    scrollPercentage: 0,
    viewedSections: [],
    sessionDuration: 0,
    pageTitle: '',
    referrer: '',
    visitedPages: [],
  });

  // Track visited pages
  useEffect(() => {
    if (pathname) {
      visitedPagesRef.current.add(pathname);
    }
  }, [pathname]);

  // Update scroll position and detect sections
  const updateScrollPosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    // Detect visible sections
    const sections = document.querySelectorAll('[data-section], section[id], [id^="section-"]');
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.5 && rect.bottom > 0;

      if (isVisible) {
        const sectionId = section.id || section.getAttribute('data-section') || '';
        if (sectionId) {
          viewedSectionsRef.current.add(sectionId);
        }
      }
    });

    setContext((prev) => ({
      ...prev,
      scrollPosition: scrollTop,
      scrollPercentage,
      viewedSections: Array.from(viewedSectionsRef.current),
    }));
  }, []);

  // Update session duration
  const updateSessionDuration = useCallback(() => {
    const duration = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    setContext((prev) => ({
      ...prev,
      sessionDuration: duration,
    }));
  }, []);

  // Initialize and update context
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial values
    setContext((prev) => ({
      ...prev,
      url: window.location.href,
      pathname: pathname || '/',
      pageTitle: document.title,
      referrer: document.referrer,
      visitedPages: Array.from(visitedPagesRef.current),
    }));

    // Add scroll listener
    window.addEventListener('scroll', updateScrollPosition, { passive: true });

    // Update session duration every 10 seconds
    const durationInterval = setInterval(updateSessionDuration, 10000);

    // Initial calls
    updateScrollPosition();
    updateSessionDuration();

    return () => {
      window.removeEventListener('scroll', updateScrollPosition);
      clearInterval(durationInterval);
    };
  }, [pathname, updateScrollPosition, updateSessionDuration]);

  // Update pathname when it changes
  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      pathname: pathname || '/',
      visitedPages: Array.from(visitedPagesRef.current),
    }));
  }, [pathname]);

  return context;
}

/**
 * Get the page type from pathname
 */
export function getPageType(pathname: string): PageType {
  if (pathname === '/') return 'home';
  if (pathname === '/coffee-chat') return 'coffee-chat';
  if (pathname === '/threads') return 'threads';
  if (pathname.startsWith('/threads/')) return 'thread-detail';
  if (pathname.startsWith('/legal')) return 'legal';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'unknown';
}

/**
 * Format context for display or debugging
 */
export function formatContextSummary(context: PageContext): string {
  const pageType = getPageType(context.pathname);
  const duration = formatDuration(context.sessionDuration);

  return `Page: ${pageType} (${context.pathname}), Scroll: ${context.scrollPercentage}%, Duration: ${duration}, Sections: ${context.viewedSections.length}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default usePageContext;
