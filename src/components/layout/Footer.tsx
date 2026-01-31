'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

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

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');

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

  return (
    <footer
      className="bg-[#202124] text-white"
      role="contentinfo"
      aria-label={t('ariaLabel')}
    >
      <div className="container-custom section-padding">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🦈</span>
              <span className="text-xl font-medium">{tCommon('brand')}</span>
            </Link>
            <p className="text-sm text-[#9aa0a6] mb-6 leading-relaxed">
              {t('tagline')}
              <br />
              {t('taglineLine2')}
            </p>
            <p className="text-xs text-[#80868b]">
              {tCommon('email')}
            </p>
          </div>

          {/* Services */}
          <nav aria-labelledby="footer-services">
            <h4 id="footer-services" className="text-sm font-medium mb-4">{t('servicesTitle')}</h4>
            <ul className="space-y-3" role="list">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9aa0a6] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-labelledby="footer-company">
            <h4 id="footer-company" className="text-sm font-medium mb-4">{t('companyTitle')}</h4>
            <ul className="space-y-3" role="list">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9aa0a6] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal & Social */}
          <div>
            <nav aria-labelledby="footer-legal">
              <h4 id="footer-legal" className="text-sm font-medium mb-4">{t('legalTitle')}</h4>
              <ul className="space-y-3 mb-6" role="list">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9aa0a6] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              </ul>
            </nav>

            {/* Social Links */}
            <div className="flex gap-3" role="list" aria-label="Social media links">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#3c4043] flex items-center justify-center text-[#9aa0a6] hover:bg-[#1a73e8] hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#202124]"
                  aria-label={t('socialLabel', { platform: link.label })}
                  role="listitem"
                >
                  <span aria-hidden="true" className="text-sm font-medium">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#3c4043] my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#80868b]">
            &copy; {currentYear} {t('copyright')}
          </p>
          <p className="text-xs text-[#80868b]">
            {t('description')}
          </p>
        </div>
      </div>
    </footer>
  );
}
