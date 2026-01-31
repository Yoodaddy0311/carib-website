'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  defaultLocale,
  locales,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from '@/i18n/config';

/**
 * Custom hook for managing locale state with cookie persistence
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from cookie on mount
  useEffect(() => {
    const savedLocale = getCookie(LOCALE_COOKIE_NAME) as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (locales.includes(browserLang)) {
        setLocaleState(browserLang);
        setCookie(LOCALE_COOKIE_NAME, browserLang, LOCALE_COOKIE_MAX_AGE);
      }
    }
    setIsLoading(false);
  }, []);

  // Update locale and persist to cookie
  const setLocale = useCallback((newLocale: Locale) => {
    if (!locales.includes(newLocale)) return;

    setLocaleState(newLocale);
    setCookie(LOCALE_COOKIE_NAME, newLocale, LOCALE_COOKIE_MAX_AGE);

    // Update html lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  return {
    locale,
    setLocale,
    isLoading,
    locales,
  };
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Set a cookie with optional max age
 */
function setCookie(name: string, value: string, maxAge?: number): void {
  if (typeof document === 'undefined') return;

  let cookie = `${name}=${value}; path=/; SameSite=Lax`;
  if (maxAge) {
    cookie += `; max-age=${maxAge}`;
  }
  document.cookie = cookie;
}

export default useLocale;
