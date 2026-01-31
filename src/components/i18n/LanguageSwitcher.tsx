'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useI18n } from './I18nProvider';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  size?: 'sm' | 'md';
  variant?: 'default' | 'minimal';
  className?: string;
}

export function LanguageSwitcher({
  size = 'sm',
  variant = 'default',
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, isLoading } = useI18n();
  const t = useTranslations('languageSwitcher');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-lg bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-200)]',
          size === 'sm' ? 'w-20 h-8' : 'w-24 h-10',
          className
        )}
      />
    );
  }

  const sizeClasses = {
    sm: 'h-8 px-2 text-sm gap-1',
    md: 'h-10 px-3 text-base gap-2',
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('label')}
        className={cn(
          'flex items-center rounded-lg font-medium transition-all duration-200',
          'bg-transparent hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-200)]',
          'text-[var(--color-gray-600)] dark:text-[var(--color-gray-500)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)]',
          sizeClasses[size]
        )}
      >
        {variant === 'minimal' ? (
          <>
            <Globe className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            <span className="hidden sm:inline">{localeFlags[locale]}</span>
          </>
        ) : (
          <>
            <span className="text-base" aria-hidden="true">
              {localeFlags[locale]}
            </span>
            <span className="hidden sm:inline">{localeNames[locale]}</span>
            <ChevronDown
              className={cn(
                'transition-transform duration-200',
                size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 mt-2 w-40 z-50',
              'bg-white dark:bg-[var(--color-gray-100)]',
              'border border-[var(--color-gray-200)] dark:border-[var(--color-gray-200)]',
              'rounded-xl shadow-[var(--shadow-4)]',
              'overflow-hidden'
            )}
            role="listbox"
            aria-label={t('label')}
          >
            <div className="py-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  role="option"
                  aria-selected={locale === loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5',
                    'text-left text-sm transition-colors duration-150',
                    locale === loc
                      ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/20 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]'
                      : 'text-[var(--color-gray-700)] dark:text-[var(--color-gray-400)] hover:bg-[var(--color-gray-50)] dark:hover:bg-[var(--color-gray-200)]'
                  )}
                >
                  <span className="text-base" aria-hidden="true">
                    {localeFlags[loc]}
                  </span>
                  <span className="flex-1 font-medium">{localeNames[loc]}</span>
                  {locale === loc && (
                    <Check className="w-4 h-4 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
