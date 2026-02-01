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
        className="skip-link focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
      >
        {tCommon('skipToContent')}
      </a>

      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
          isScrolled
            ? 'bg-white/98 backdrop-blur-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] py-0'
            : 'bg-transparent py-2'
        )}
        role="banner"
      >
        <nav className="container-custom h-16 md:h-20" aria-label={t('mainNavigation')}>
          <div className="flex items-center justify-between h-full">
            {/* Logo with scroll animation - Artience Style */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-medium group"
            >
              <motion.span
                className="text-xl transition-transform duration-200"
                animate={{
                  scale: isScrolled ? 0.95 : 1,
                }}
              >
                🦈
              </motion.span>
              <motion.span
                className="text-[#1F2937] font-semibold tracking-tight"
                animate={{
                  fontSize: isScrolled ? '1rem' : '1.125rem',
                }}
                transition={{ duration: 0.2 }}
              >
                Carib
              </motion.span>
            </Link>

            {/* Desktop Navigation with underline animation - Artience Style */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm font-medium text-[#4B5563] hover:text-[#1F2937] transition-colors duration-200 py-2 group"
                >
                  {item.label}
                  {/* Animated underline - Artience Style */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#3B82F6] transition-all duration-200 ease-out group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* CTA Button & Language Switcher - Artience Style */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher size="sm" />
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="relative overflow-hidden bg-[#1F2937] hover:shadow-[0_4px_12px_rgba(31,41,55,0.3)] text-white font-semibold px-5 py-2 rounded-lg transition-all duration-200"
                  onClick={() => {
                    trackCoffeeChatClick('header');
                    window.location.href = '/coffee-chat';
                  }}
                >
                  <span className="relative z-10">{t('coffeeChatButton')}</span>
                </Button>
              </motion.div>
            </div>

            {/* Mobile Language Switcher & Menu Button - Artience Style */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher size="sm" variant="minimal" />
              <motion.button
                className="p-2 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-lg"
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
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5 text-[#1F2937]" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5 text-[#1F2937]" aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Artience Style */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                stiffness: 400,
                mass: 0.6
              }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[80%] max-w-xs bg-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={t('mobileNavigation')}
            >
              <div className="flex flex-col h-full pt-16 px-5 pb-5">
                <nav className="flex-1" aria-label={t('mobileNavigation')}>
                  <ul className="space-y-1" role="list">
                    {navItems.map((item, index) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.2
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-3 text-base font-medium text-[#1F2937] hover:text-[#3B82F6] transition-colors duration-200 relative group"
                        >
                          <span className="relative z-10">{item.label}</span>
                          {/* Hover background */}
                          <span className="absolute inset-0 bg-[#F3F4F6] rounded-lg scale-95 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 -z-0" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.2 }}
                >
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="bg-[#1F2937] hover:shadow-[0_4px_12px_rgba(31,41,55,0.3)] text-white font-semibold rounded-lg transition-all duration-200"
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
