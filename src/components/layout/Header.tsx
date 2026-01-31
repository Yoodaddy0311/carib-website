'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
import { LanguageSwitcher } from '@/components/i18n';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';

// Navigation items with translation keys
const navItemKeys = [
  { key: 'services', href: '#services' },
  { key: 'process', href: '#process' },
  { key: 'team', href: '#team' },
  { key: 'threads', href: '/threads' },
  { key: 'faq', href: '#faq' },
] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { trackCoffeeChatClick, trackNavClick } = useAnalytics();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  // Generate nav items with translations
  const navItems = navItemKeys.map((item) => ({
    label: t(item.key),
    href: item.href,
  }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="skip-link focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
      >
        {tCommon('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(60,64,67,0.15)]'
            : 'bg-transparent'
        )}
        role="banner"
      >
        <nav className="container-custom h-16 md:h-20" aria-label={t('mainNavigation')}>
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-medium"
            >
              <span className="text-2xl">🦈</span>
              <span className="text-[#202124]">
                Carib
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#5f6368] hover:text-[#202124] transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* CTA Button & Language Switcher */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher size="sm" />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  trackCoffeeChatClick('header');
                  window.location.href = '/coffee-chat';
                }}
              >
                {t('coffeeChatButton')}
              </Button>
            </div>

            {/* Mobile Language Switcher & Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher size="sm" variant="minimal" />
              <button
                className="p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#202124]" aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6 text-[#202124]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('mobileNavigation')}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-6">
              <nav className="flex-1" aria-label={t('mobileNavigation')}>
                <ul className="space-y-2" role="list">
                  {navItems.map((item, index) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-4 text-xl font-medium text-[#202124] hover:text-[#1a73e8] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    trackCoffeeChatClick('mobile_header');
                    setIsMobileMenuOpen(false);
                    window.location.href = '/coffee-chat';
                  }}
                >
                  {t('coffeeChatButtonMobile')}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
