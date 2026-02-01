'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { Send, ArrowRight } from 'lucide-react';

// Link structure without labels (labels come from translations)
const footerLinkStructure = {
  services: [
    { key: 'aiConsulting', href: '#services' },
    { key: 'processOptimization', href: '#services' },
    { key: 'customSolution', href: '#services' },
    { key: 'education', href: '#services' },
  ],
  company: [
    { key: 'team', href: '#team' },
    { key: 'coffeeChat', href: '/coffee-chat' },
    { key: 'threads', href: '/threads' },
  ],
  legal: [
    { key: 'terms', href: '/legal/terms' },
    { key: 'privacy', href: '/legal/privacy' },
  ],
  social: [
    { platform: 'Twitter', href: 'https://twitter.com/carib_team', icon: 'X' },
    { platform: 'LinkedIn', href: 'https://linkedin.com/company/carib', icon: 'in' },
  ],
};

// Animation variants - Artience Style
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Generate footer links with translations
  const footerLinks = {
    services: footerLinkStructure.services.map((item) => ({
      label: t(`services.${item.key}`),
      href: item.href,
    })),
    company: footerLinkStructure.company.map((item) => ({
      label: t(`company.${item.key}`),
      href: item.href,
    })),
    legal: footerLinkStructure.legal.map((item) => ({
      label: t(`legal.${item.key}`),
      href: item.href,
    })),
    social: footerLinkStructure.social.map((item) => ({
      label: item.platform,
      href: item.href,
      icon: item.icon,
    })),
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Simulate subscription
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer
      ref={footerRef}
      className="bg-[#1F2937] text-white overflow-hidden"
      role="contentinfo"
      aria-label={t('ariaLabel')}
    >
      <div className="container-custom section-padding">
        {/* Main Footer Content - 4 Column Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Column 1: Brand & Description - Artience Style */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <span className="text-2xl">
                🦈
              </span>
              <span className="text-lg font-semibold tracking-tight group-hover:text-[#3B82F6] transition-colors duration-200">
                {tCommon('brand')}
              </span>
            </Link>
            <p className="text-sm text-[#9CA3AF] mb-5 leading-relaxed max-w-xs">
              {t('tagline')}
              <br />
              {t('taglineLine2')}
            </p>
            <p className="text-sm text-[#6B7280] hover:text-[#3B82F6] transition-colors duration-200 cursor-pointer">
              {tCommon('email')}
            </p>
          </motion.div>

          {/* Column 2: Quick Links - Artience Style */}
          <motion.div variants={itemVariants}>
            <nav aria-labelledby="footer-services">
              <h4 id="footer-services" className="text-sm font-semibold mb-4 text-white/90">
                {t('servicesTitle')}
              </h4>
              <ul className="space-y-2.5" role="list">
                {footerLinks.services.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -5 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.15 + index * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="group text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-company" className="mt-6">
              <h4 id="footer-company" className="text-sm font-semibold mb-4 text-white/90">
                {t('companyTitle')}
              </h4>
              <ul className="space-y-2.5" role="list">
                {footerLinks.company.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -5 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.2 + index * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="group text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Column 3: Contact & Legal - Artience Style */}
          <motion.div variants={itemVariants}>
            <nav aria-labelledby="footer-legal">
              <h4 id="footer-legal" className="text-sm font-semibold mb-4 text-white/90">
                {t('legalTitle')}
              </h4>
              <ul className="space-y-2.5" role="list">
                {footerLinks.legal.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -5 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.25 + index * 0.03, duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="group text-sm text-[#9CA3AF] hover:text-white transition-colors duration-200 inline-flex items-center gap-1"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Social Links - Artience Style */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-4 text-white/90">
                {t('socialTitle') || 'Follow Us'}
              </h4>
              <div className="flex gap-2" role="list" aria-label="Social media links">
                {footerLinks.social.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-[#374151] flex items-center justify-center text-[#9CA3AF] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2937]"
                    aria-label={t('socialLabel', { platform: link.label })}
                    role="listitem"
                    whileHover={{
                      y: -2,
                      backgroundColor: '#3B82F6',
                      color: '#ffffff',
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                  >
                    <span aria-hidden="true" className="text-sm font-semibold">{link.icon}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Column 4: Newsletter - Artience Style */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold mb-4 text-white/90">
              {t('newsletterTitle') || 'Stay Updated'}
            </h4>
            <p className="text-sm text-[#9CA3AF] mb-4 leading-relaxed">
              {t('newsletterDescription') || 'Subscribe to our newsletter for the latest AI insights and updates.'}
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletterPlaceholder') || 'Enter your email'}
                  className="w-full px-4 py-2.5 bg-[#374151] rounded-lg text-sm text-white placeholder-[#9CA3AF] border border-transparent focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubscribed ? (
                  <>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      ✓
                    </motion.span>
                    {t('newsletterSuccess') || 'Subscribed!'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t('newsletterButton') || 'Subscribe'}
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        {/* Divider with gradient - Artience Style */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-[#374151] to-transparent my-8"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.3 }}
        />

        {/* Bottom Bar - Artience Style */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-3"
          initial={{ opacity: 0, y: 5 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <p className="text-xs text-[#6B7280]">
            &copy; {currentYear} {t('copyright')}
          </p>
          <p className="text-xs text-[#6B7280]">
            {t('description')}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
