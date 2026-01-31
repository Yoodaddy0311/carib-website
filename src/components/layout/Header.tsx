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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/98 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] py-0'
            : 'bg-transparent py-2'
        )}
        role="banner"
      >
        <nav className="container-custom h-16 md:h-20" aria-label={t('mainNavigation')}>
          <div className="flex items-center justify-between h-full">
            {/* Logo with scroll animation */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-medium group"
            >
              <motion.span
                className="text-2xl transition-transform duration-300"
                animate={{
                  scale: isScrolled ? 0.9 : 1,
                }}
              >
                🦈
              </motion.span>
              <motion.span
                className="text-[#202124] font-semibold tracking-tight"
                animate={{
                  fontSize: isScrolled ? '1.125rem' : '1.25rem',
                }}
                transition={{ duration: 0.3 }}
              >
                Carib
              </motion.span>
            </Link>

            {/* Desktop Navigation with underline animation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-[#5f6368] hover:text-[#202124] transition-colors duration-200 py-2 group"
                >
                  {item.label}
                  {/* Animated underline - left to right */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1a73e8] transition-all duration-300 ease-out group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button & Language Switcher */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher size="sm" />
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="relative overflow-hidden bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(26,115,232,0.4)] hover:shadow-[0_6px_20px_rgba(26,115,232,0.5)] transition-all duration-300"
                  onClick={() => {
                    trackCoffeeChatClick('header');
                    window.location.href = '/coffee-chat';
                  }}
                >
                  <span className="relative z-10">{t('coffeeChatButton')}</span>
                </Button>
              </motion.div>
            </div>

            {/* Mobile Language Switcher & Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher size="sm" variant="minimal" />
              <motion.button
                className="p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-[#202124]" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-[#202124]" aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu with improved animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
                mass: 0.8
              }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t('mobileNavigation')}
            >
              <div className="flex flex-col h-full pt-20 px-6 pb-6">
                <nav className="flex-1" aria-label={t('mobileNavigation')}>
                  <ul className="space-y-1" role="list">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.08,
                          type: 'spring',
                          stiffness: 300,
                          damping: 30
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-4 text-xl font-medium text-[#202124] hover:text-[#1a73e8] transition-colors relative group"
                        >
                          <span className="relative z-10">{item.label}</span>
                          {/* Hover background */}
                          <span className="absolute inset-0 bg-[#f8f9fa] rounded-lg scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 -z-0" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold rounded-full shadow-[0_4px_14px_rgba(26,115,232,0.4)] hover:shadow-[0_6px_20px_rgba(26,115,232,0.5)] transition-all duration-300"
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
          </>
        )}
      </AnimatePresence>
    </>
  );
}
