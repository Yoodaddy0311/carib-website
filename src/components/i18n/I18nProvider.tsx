'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { IntlProvider } from 'next-intl';
import {
  defaultLocale,
  locales,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from '@/i18n/config';

// Import all message files statically for client-side use
import koMessages from '../../../messages/ko.json';
import enMessages from '../../../messages/en.json';
import jaMessages from '../../../messages/ja.json';

const messages: Record<Locale, typeof koMessages> = {
  ko: koMessages,
  en: enMessages,
  ja: jaMessages,
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  isLoading: true,
});

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  children: ReactNode;
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

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize locale from cookie on mount
  useEffect(() => {
    const savedLocale = getCookie(LOCALE_COOKIE_NAME) as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
      document.documentElement.lang = savedLocale;
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (locales.includes(browserLang)) {
        setLocaleState(browserLang);
        setCookie(LOCALE_COOKIE_NAME, browserLang, LOCALE_COOKIE_MAX_AGE);
        document.documentElement.lang = browserLang;
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

  return (
    <I18nContext.Provider value={{ locale, setLocale, isLoading }}>
      <IntlProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Asia/Seoul"
        now={new Date()}
      >
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}

export default I18nProvider;
