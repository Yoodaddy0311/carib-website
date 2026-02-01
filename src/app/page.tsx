'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCountUp } from '@/hooks/useCountUp';
import { useAnalytics } from '@/hooks/useAnalytics';

// Simple skeleton component for lazy-loaded sections
function SectionSkeleton() {
  return (
    <div className="section-padding" aria-hidden="true">
      <div className="container-custom">
        <div className="animate-pulse">
          <div className="h-8 bg-[#e8eaed] rounded w-1/4 mx-auto mb-4" />
          <div className="h-4 bg-[#e8eaed] rounded w-1/2 mx-auto mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-[#e8eaed] rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Lazy load below-the-fold sections to improve TBT and reduce initial bundle size
const Process = dynamic(() => import('@/components/sections/Process').then((mod) => mod.Process), {
  loading: () => <SectionSkeleton />,
  ssr: true,
});

const Team = dynamic(() => import('@/components/sections/Team').then((mod) => mod.Team), {
  loading: () => <SectionSkeleton />,
  ssr: true,
});

const FAQ = dynamic(() => import('@/components/sections/FAQ').then((mod) => mod.FAQ), {
  loading: () => <SectionSkeleton />,
  ssr: true,
});

const ThreadFeed = dynamic(() => import('@/components/sections/ThreadFeed').then((mod) => mod.ThreadFeed), {
  loading: () => <SectionSkeleton />,
  ssr: true,
});

// ChatWidget is not critical for initial render - defer loading completely
const ChatWidget = dynamic(() => import('@/components/sections/ChatWidget').then((mod) => mod.ChatWidget), {
  ssr: false,
  loading: () => null,
});

// Typing effect keywords - will be replaced with translated versions at runtime
const typingKeywordKeys = ['ai', 'automation', 'efficiency', 'innovation', 'growth'] as const;



// Enhanced Typing Effect Component with shimmer gradient - saas-scalable-hero-page (2) style
function TypewriterText() {
  const t = useTranslations('hero.keywords');
  const typingKeywords = useMemo(() => typingKeywordKeys.map((key) => t(key)), [t]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = typingKeywords[currentIndex];

  useEffect(() => {
    const typingSpeed = isDeleting ? 60 : 100;
    const pauseDuration = 2500;

    if (!isDeleting && displayText === currentWord) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayText === '') {
      const timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % typingKeywords.length);
      }, 0);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayText(currentWord.slice(0, displayText.length - 1));
      } else {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWord, typingKeywords.length]);

  return (
    <span className="inline-flex items-baseline" aria-live="polite" aria-atomic="true">
      <span
        aria-label={`Current keyword: ${currentWord}`}
        className="relative bg-clip-text text-transparent bg-linear-to-r from-indigo-300 via-white to-cyan-300 animate-shimmer-text"
      >
        {displayText}
      </span>
      <span
        className="ml-1 w-[3px] h-[0.85em] inline-block align-baseline animate-pulse bg-linear-to-b from-indigo-300 to-cyan-300"
        aria-hidden="true"
      />
    </span>
  );
}


// Hero Background - Advanced version with Parallax & Light Trails
function HeroBackground({ mousePos }: { mousePos: { x: number; y: number } }) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {/* Pure black base */}
      <div className="absolute inset-0 bg-[#000000]" />

      {/* Wave container - Full screen with Parallax */}
      <div
        className="absolute inset-0 h-full transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x / 60}px, ${mousePos.y / 60}px)` }}
      >
        <svg
          viewBox="0 0 1440 900"
          className="absolute bottom-[-15%] right-[-10%] w-[125%] h-[125%] object-cover scale-110 opacity-70"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
        >
          <defs>
            <linearGradient id="purple-primary" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
              <stop offset="15%" stopColor="#7c3aed" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#a855f7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="violet-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="5%" stopColor="#d946ef" stopOpacity="0" />
              <stop offset="40%" stopColor="#a855f7" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="cyan-accent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="30%" stopColor="#00f2ff" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="amber-sharp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="10%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>

            <filter id="crispGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
          </defs>

          <path
            d="M0 740 C 400 610 1000 860 1440 660 L 1440 900 L 0 900 Z"
            fill="url(#purple-primary)"
            filter="url(#crispGlow)"
          >
            <animate
              attributeName="d"
              dur="14s"
              repeatCount="indefinite"
              values="
                M0 740 C 400 610 1000 860 1440 660 L 1440 900 L 0 900 Z;
                M0 700 C 500 760 900 610 1440 740 L 1440 900 L 0 900 Z;
                M0 740 C 400 610 1000 860 1440 660 L 1440 900 L 0 900 Z
              "
            />
          </path>

          <path
            d="M0 810 C 350 710 900 510 1440 760 L 1440 900 L 0 900 Z"
            fill="url(#violet-glow)"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0 810 C 350 710 900 510 1440 760 L 1440 900 L 0 900 Z;
                M0 770 C 450 660 950 810 1440 690 L 1440 900 L 0 900 Z;
                M0 810 C 350 710 900 510 1440 760 L 1440 900 L 0 900 Z
              "
            />
          </path>

          <path
            d="M0 710 C 400 610 800 910 1440 600 L 1440 900 L 0 900 Z"
            fill="url(#cyan-accent)"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0 710 C 400 610 800 910 1440 600 L 1440 900 L 0 900 Z;
                M0 670 C 500 710 900 810 1440 540 L 1440 900 L 0 900 Z;
                M0 710 C 400 610 800 910 1440 600 L 1440 900 L 0 900 Z
              "
            />
          </path>

          <path
            d="M0 840 C 450 810 950 480 1440 780 L 1440 900 L 0 900 Z"
            fill="url(#amber-sharp)"
          >
            <animate
              attributeName="d"
              dur="12s"
              repeatCount="indefinite"
              values="
                M0 840 C 450 810 950 480 1440 780 L 1440 900 L 0 900 Z;
                M0 810 C 550 710 850 610 1440 710 L 1440 900 L 0 900 Z;
                M0 840 C 450 810 950 480 1440 780 L 1440 900 L 0 900 Z
              "
            />
          </path>

          {/* Light Trail Animation */}
          <path
            d="M0 700 C 400 590 800 890 1440 590"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            opacity="0.1"
            strokeDasharray="400 1200"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="7s"
              repeatCount="indefinite"
              from="1600"
              to="0"
            />
          </path>
        </svg>
      </div>

      {/* 3. Floating Light Glows - Parallax Effect */}
      <div
        className="absolute w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none z-10 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x / 20}px, ${mousePos.y / 20}px)`,
          top: '10%',
          left: '5%'
        }}
      />
    </div>
  );
}

// Hero Button - Artience Guide (12px 24px padding, 8px radius)
function HeroButton({
  children,
  variant = 'primary',
  onClick,
  rightIcon,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  onClick?: () => void;
  rightIcon?: React.ReactNode;
}) {
  const baseClasses = "relative overflow-hidden inline-flex items-center justify-center gap-2 font-semibold py-3 px-6 text-[15px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-200";

  const variantClasses = variant === 'primary'
    ? "bg-white text-black hover:bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.1)] focus-visible:ring-white"
    : "bg-transparent border border-white/20 text-white hover:border-white/40 hover:bg-white/5 focus-visible:ring-white/20";

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>
    </motion.button>
  );
}

// Trust metrics data with animation config - labels will be translated
const trustMetricsData = [
  { value: '50+', labelKey: 'projects', countTo: 50, suffix: '+' },
  { value: '98%', labelKey: 'satisfaction', countTo: 98, suffix: '%' },
  { value: '3x', labelKey: 'efficiency', countTo: 3, suffix: 'x' },
  { value: '24/7', labelKey: 'operation', countTo: null, suffix: '', isStatic: true },
];

// Artience Style: Clean Trust Metric Component - 16px radius, 16px padding
function AnimatedTrustMetric({
  metric,
  index,
  label,
}: {
  metric: typeof trustMetricsData[number];
  index: number;
  label: string;
}) {
  const { formattedCount, ref, hasStarted } = useCountUp(metric.countTo || 0, {
    duration: 2000,
    startOnView: true,
    easing: 'ease-out-expo',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.05 + index * 0.05 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      className="group relative text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:bg-white/15 hover:border-white/40"
    >
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="relative text-xl sm:text-2xl font-bold tabular-nums transition-colors duration-200 tracking-tight text-white"
        aria-live="polite"
      >
        {metric.isStatic ? (
          <span className="tracking-tight">
            {metric.value}
          </span>
        ) : (
          <span className="inline-block">
            {hasStarted ? `${formattedCount}${metric.suffix}` : `0${metric.suffix}`}
          </span>
        )}
      </p>
      <p className="relative text-xs sm:text-[13px] text-white/70 font-medium uppercase tracking-wider mt-1 transition-colors duration-200 group-hover:text-white">
        {label}
      </p>
    </motion.div>
  );
}

// Services data - will be translated
const servicesData = [
  { icon: Sparkles, key: 'aiConsulting' },
  { icon: Zap, key: 'processOptimization' },
  { icon: Users, key: 'customSolution' },
  { icon: TrendingUp, key: 'education' },
];


export default function Home() {
  const { trackCoffeeChatClick } = useAnalytics();
  const tHero = useTranslations('hero');
  const tServices = useTranslations('services');
  const tCta = useTranslations('cta');

  // Mouse Parallax State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate services with translations
  const services = servicesData.map((service) => ({
    icon: service.icon,
    title: tServices(`${service.key}.title`),
    description: tServices(`${service.key}.description`),
  }));

  // Generate trust metrics with translations
  const trustMetrics = trustMetricsData.map((metric) => ({
    ...metric,
    label: tHero(`trustMetrics.${metric.labelKey}`),
  }));



  return (
    <div className="relative">
      {/* Hero Section - Clean Professional Design relative to mouse movement */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="hero-heading"
      >
        <HeroBackground mousePos={mousePos} />

        <div className="container-custom relative z-30 px-6 sm:px-8 lg:px-12">
          {/* Left-aligned Text Layout */}
          <div className="flex flex-col justify-center pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">

            {/* Text Content - Left aligned */}
            <div className="relative z-20 max-w-4xl">
              {/* Announcement Badge with Glass Effect */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 sm:mb-8 hover:border-white/30 transition-all cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.8)] animate-pulse" />
                <span className="text-[11px] font-bold text-zinc-300 tracking-widest uppercase">
                  {tHero('badge')}
                </span>
              </motion.div>

              {/* Main Headline - Artience Typography */}
              <motion.h1
                id="hero-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[28px] sm:text-[32px] md:text-[36px] lg:text-[42px] xl:text-[48px] font-bold leading-[1.2] tracking-[-0.02em] mb-4 sm:mb-6 text-white"
              >
                <TypewriterText />
                {tHero('headlineSuffix')}
                <br />
                <span className="text-white">{tHero('headlineLine2')}</span>
              </motion.h1>

              {/* Subheadline - Artience Body */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15px] sm:text-base md:text-lg text-zinc-400 max-w-xl mb-6 leading-relaxed font-medium"
              >
                {tHero('subheadline')}
                <span className="hidden sm:inline"> </span>
                <span className="sm:hidden"><br /></span>
                {tHero('subheadlineLine2')}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
              >
                <HeroButton
                  variant="primary"
                  rightIcon={<ArrowRight className="w-[18px] h-[18px]" />}
                  onClick={() => {
                    trackCoffeeChatClick('hero');
                    window.location.href = '/coffee-chat';
                  }}
                >
                  {tHero('ctaPrimary')}
                </HeroButton>
                <HeroButton
                  variant="outline"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {tHero('ctaSecondary')}
                </HeroButton>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Trust Metrics - Social Proof Section */}
        <div className="container-custom relative z-30 pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 pt-8 sm:pt-10"
          >
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mx-auto"
              role="list"
              aria-label="Trust Metrics"
            >
              {trustMetrics.map((metric, index) => (
                <AnimatedTrustMetric
                  key={metric.labelKey}
                  metric={metric}
                  index={index}
                  label={metric.label}
                />
              ))}
            </div>
          </motion.div>
        </div>

      </section>

      {/* Services Section - Artience: 16px card radius, compact spacing */}
      <section id="services" className="section-padding bg-[#F9FAFB]" aria-labelledby="services-heading">
        <div className="container-custom">
          {/* Section Header - Heading 2: 24px */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="mb-8 sm:mb-10"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="inline-block text-[13px] font-semibold text-[#1F2937] uppercase tracking-wider mb-2"
            >
              {tServices('badge')}
            </motion.span>
            <h2 id="services-heading" className="text-[22px] sm:text-2xl md:text-[28px] font-semibold text-[#1F2937] mb-3 leading-tight">
              {tServices('sectionTitle')}
            </h2>
            <p className="text-[15px] text-[#4B5563] max-w-2xl leading-relaxed">
              {tServices('sectionSubtitle')}
            </p>
          </motion.div>

          {/* Card Grid - 16px radius, 24px padding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                role="listitem"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group cursor-pointer"
              >
                <div className="h-full p-5 sm:p-6 bg-white border border-[#E5E7EB] rounded-xl transition-all duration-200 hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
                  {/* Icon - 8px radius */}
                  <div
                    className="w-11 h-11 rounded-lg bg-[#F3F4F6] flex items-center justify-center mb-4 transition-all duration-200 group-hover:bg-[#1F2937]"
                    aria-hidden="true"
                  >
                    <service.icon className="w-5 h-5 text-[#1F2937] transition-colors duration-200 group-hover:text-white" />
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-[#1F2937] mb-2 transition-colors duration-200 group-hover:text-[#111827]">
                    {service.title}
                  </h3>

                  <p className="text-[14px] text-[#4B5563] leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <Process />

      {/* Thread Feed Section - Homepage Preview */}
      <ThreadFeed maxItems={3} />

      {/* Team Section */}
      <Team />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section - Artience Style: Heading 2, Body 2, 8px button radius */}
      <section
        className="section-padding bg-[#1F2937] relative overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              id="cta-heading"
              className="text-[22px] sm:text-2xl md:text-[28px] font-semibold text-white mb-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {tCta('title')}
            </motion.h2>
            <motion.p
              className="text-[15px] sm:text-base text-[#9CA3AF] mb-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {tCta('subtitle')}
            </motion.p>
            <motion.button
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-[15px] font-semibold rounded-lg bg-white text-[#1F2937] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2937] focus-visible:ring-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                trackCoffeeChatClick('cta_section');
                window.location.href = '/coffee-chat';
              }}
            >
              <span>{tCta('button')}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
