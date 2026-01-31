/**
 * Internationalization Configuration
 *
 * Defines available locales and default settings for the multi-language support.
 */

export const locales = ['ko', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ko';

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
};

export const localeFlags: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
};

/**
 * Cookie name for storing the user's preferred locale
 */
export const LOCALE_COOKIE_NAME = 'carib-locale';

/**
 * Cookie max age in seconds (1 year)
 */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
