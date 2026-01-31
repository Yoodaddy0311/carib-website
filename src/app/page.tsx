'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowRight, Sparkles, Zap, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';
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

// Enhanced Typing Effect Component with character-by-character animation
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
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % typingKeywords.length);
      return;
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
    <span className="inline-flex items-baseline text-[#1a73e8]" aria-live="polite" aria-atomic="true">
      <span aria-label={`Current keyword: ${currentWord}`} className="relative">
        {displayText.split('').map((char, idx) => (
          <motion.span
            key={`${currentIndex}-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: idx * 0.02 }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </span>
      <span
        className="ml-0.5 w-[2px] h-[0.9em] inline-block align-baseline bg-[#1a73e8] animate-pulse"
        aria-hidden="true"
      />
    </span>
  );
}

// Mouse-following Glow Effect
function MouseGlow() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 opacity-50"
      aria-hidden="true"
    >
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(26, 115, 232, 0.08) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}

// Google Labs Style: Enhanced Background with subtle animations
function EnhancedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#fafbfc] to-[#f8f9fa]" />

      {/* Animated gradient blobs - very subtle */}
      <motion.div
        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.35]"
        style={{
          background: 'radial-gradient(circle, rgba(26, 115, 232, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.3]"
        style={{
          background: 'radial-gradient(circle, rgba(52, 168, 83, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -30, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full opacity-[0.25]"
        style={{
          background: 'radial-gradient(circle, rgba(251, 188, 4, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle dot pattern - Google Labs style */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #dadce0 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#1a73e8]/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Enhanced Button with Ripple Effect - Google Labs Style
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
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);

    onClick?.();
  }, [onClick]);

  // Google Labs Style Buttons
  const baseClasses = "relative overflow-hidden inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 h-12 px-6 text-base rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variantClasses = variant === 'primary'
    ? "bg-[#202124] text-white hover:bg-[#3c4043] focus-visible:ring-[#202124]"
    : "bg-white border border-[#dadce0] text-[#202124] hover:bg-[#f8f9fa] hover:border-[#202124] focus-visible:ring-[#dadce0]";

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses}`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-effect"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
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

// Animated Trust Metric Component - Enhanced with better interactions
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
    duration: 2500,
    startOnView: true,
    easing: 'ease-out-expo',
  });

  // Google colors for each metric
  const accentColors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'];
  const accentColor = accentColors[index % accentColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative text-center p-6 rounded-3xl bg-white border border-[#e8eaed] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(60,64,67,0.15)] hover:border-transparent cursor-pointer overflow-hidden"
    >
      {/* Colored top accent on hover */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: accentColor }}
      />

      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accentColor}08 0%, transparent 70%)`
        }}
      />

      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="relative text-3xl md:text-4xl font-medium tabular-nums transition-colors duration-300"
        style={{ color: hasStarted ? accentColor : '#202124' }}
        aria-live="polite"
      >
        {metric.isStatic ? (
          <motion.span
            className="tracking-tight"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {metric.value}
          </motion.span>
        ) : (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: hasStarted ? 1 : 0,
              scale: hasStarted ? 1 : 0.5,
            }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-block"
          >
            {hasStarted ? `${formattedCount}${metric.suffix}` : `0${metric.suffix}`}
          </motion.span>
        )}
      </p>
      <p className="relative text-sm text-[#5f6368] font-normal mt-2 transition-colors duration-300 group-hover:text-[#202124]">
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
  const { trackCoffeeChatClick, trackServiceClick } = useAnalytics();
  const tHero = useTranslations('hero');
  const tServices = useTranslations('services');
  const tCta = useTranslations('cta');

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
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Enhanced Background with subtle animations */}
        <EnhancedBackground />

        {/* Mouse-following glow effect */}
        <MouseGlow />

        <div className="container-custom relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge - Google Labs Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#f1f3f4] text-[#5f6368] rounded-full text-sm font-medium mb-10"
            >
              <Sparkles className="w-4 h-4" />
              {tHero('badge')}
            </motion.div>

            {/* Headline - Google Labs Style: Large, Medium weight, Dark */}
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[2.5rem] md:text-[3.5rem] lg:text-[4.5rem] font-medium text-[#202124] mb-6 leading-[1.1] tracking-tight"
            >
              <TypewriterText />
              {tHero('headlineSuffix')}
              <br />
              {tHero('headlineLine2')}
            </motion.h1>

            {/* Subheadline - Google Labs Style */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg md:text-xl text-[#5f6368] mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {tHero('subheadline')}
              <br className="hidden md:block" />
              {tHero('subheadlineLine2')}
            </motion.p>

            {/* CTA Buttons with Enhanced Effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <HeroButton
                variant="primary"
                rightIcon={<ArrowRight className="w-5 h-5" />}
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

          {/* Trust Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
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
          </motion.div>
        </div>

        {/* Minimal Scroll Indicator - Google Labs Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-5 h-8 rounded-full border-2 border-[#dadce0] flex items-start justify-center p-1.5">
              <motion.div
                className="w-1 h-1.5 rounded-full bg-[#5f6368]"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-xs text-[#9aa0a6]">{tHero('scrollIndicator')}</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section - Google Labs Style */}
      <section id="services" className="section-padding bg-white" aria-labelledby="services-heading">
        <div className="container-custom">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <h2 id="services-heading" className="text-3xl md:text-4xl font-medium text-[#202124] mb-4">
              {tServices('sectionTitle')}
            </h2>
            <p className="text-lg text-[#5f6368] max-w-2xl mx-auto">
              {tServices('sectionSubtitle')}
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                role="listitem"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group cursor-pointer"
              >
                <div className="h-full p-6 bg-white border border-[#e8eaed] rounded-3xl transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(60,64,67,0.12)] group-hover:border-[#1a73e8]/30 relative overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a73e8]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icon container with enhanced animation */}
                  <motion.div
                    className="relative w-12 h-12 rounded-full bg-[#e8f0fe] flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-[#1a73e8] group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <service.icon className="w-6 h-6 text-[#1a73e8] transition-colors duration-300 group-hover:text-white" />
                  </motion.div>

                  <h3 className="relative text-lg font-medium text-[#202124] mb-3 transition-colors duration-300 group-hover:text-[#1a73e8]">
                    {service.title}
                  </h3>

                  <p className="relative text-sm text-[#5f6368] leading-relaxed">
                    {service.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#1a73e8] to-[#34a853] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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

      {/* CTA Section - Enhanced with animated background */}
      <section
        className="section-padding bg-[#202124] relative overflow-hidden"
        aria-labelledby="cta-heading"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <motion.div
            className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, #1a73e8 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, #34a853 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h2
              id="cta-heading"
              className="text-3xl md:text-4xl font-medium text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {tCta('title')}
            </motion.h2>
            <motion.p
              className="text-lg text-[#9aa0a6] mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {tCta('subtitle')}
            </motion.p>
            <motion.button
              className="group relative inline-flex items-center justify-center gap-2 h-14 px-8 text-base font-medium rounded-full bg-white text-[#202124] overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#202124] focus-visible:ring-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                trackCoffeeChatClick('cta_section');
                window.location.href = '/coffee-chat';
              }}
            >
              {/* Shine effect on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative">{tCta('button')}</span>
              <motion.span
                className="relative"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
