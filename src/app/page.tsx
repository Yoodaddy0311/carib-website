'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'motion/react';
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

// Enhanced Typing Effect Component with character-by-character animation - Brandazine Style (Larger)
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
    <span className="inline-flex items-baseline text-[#3B82F6]" aria-live="polite" aria-atomic="true">
      <span aria-label={`Current keyword: ${currentWord}`} className="relative">
        {displayText.split('').map((char, idx) => (
          <motion.span
            key={`${currentIndex}-${idx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
            className="inline-block"
          >
            {char}
          </motion.span>
        ))}
      </span>
      <span
        className="ml-1 w-[2px] h-[0.85em] inline-block align-baseline bg-[#3B82F6] animate-pulse"
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

// Artience Style: Clean Background with Soft Blue
function EnhancedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Artience Soft Blue Background */}
      <div className="absolute inset-0 bg-[#E8F4FD]" />

      {/* Simple subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50" />

      {/* Clean dot pattern - Artience style */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #9CA3AF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}

// Artience Style Button - Clean with subtle hover
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
  // Artience Style Buttons - 14px, font-weight 600, rounded-lg (8px)
  const baseClasses = "relative overflow-hidden inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 py-3 px-6 text-sm rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variantClasses = variant === 'primary'
    ? "bg-[#1F2937] text-white hover:shadow-[0_4px_12px_rgba(31,41,55,0.3)] focus-visible:ring-[#1F2937]"
    : "bg-white border border-[#E5E7EB] text-[#1F2937] hover:border-[#1F2937] focus-visible:ring-[#E5E7EB]";

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
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

// Artience Style: Clean Trust Metric Component with simple hover
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

  // Artience colors
  const accentColor = '#3B82F6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 }
      }}
      className="group relative text-center p-6 rounded-2xl bg-white border border-[#E5E7EB] transition-all duration-200 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)] cursor-pointer"
    >
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className="relative text-2xl md:text-3xl font-bold tabular-nums transition-colors duration-200 tracking-tight text-[#111827]"
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
      <p className="relative text-sm text-[#4B5563] font-medium uppercase tracking-wider mt-2 transition-colors duration-200 group-hover:text-[#111827]">
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

// Brandazine Hero Image Component with Parallax and Reveal Animation
function HeroImage({ scrollYProgress }: { scrollYProgress: any }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Parallax: Image moves slower than scroll
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5], [1.05, 1]);
  const imageBlur = useTransform(scrollYProgress, [0, 0.2], [8, 0]);

  return (
    <motion.div
      className="relative w-full h-full"
      style={{ y: imageY }}
    >
      {/* Diagonal clip-path container */}
      <motion.div
        className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden"
        style={{
          clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
          scale: imageScale,
        }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Blur overlay that fades out */}
        <motion.div
          className="absolute inset-0 z-10 bg-white/30 backdrop-blur-md"
          initial={{ opacity: 1 }}
          animate={{ opacity: imageLoaded ? 0 : 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        <Image
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
          alt="Team collaboration"
          fill
          className="object-cover"
          priority
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, 40vw"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
      </motion.div>

      {/* Floating accent shapes */}
      <motion.div
        className="absolute -bottom-4 -left-4 w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#1a73e8]/10 backdrop-blur-sm"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      />
      <motion.div
        className="absolute top-1/4 -left-8 w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#34a853]/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      />
    </motion.div>
  );
}

export default function Home() {
  const { trackCoffeeChatClick, trackServiceClick } = useAnalytics();
  const tHero = useTranslations('hero');
  const tServices = useTranslations('services');
  const tCta = useTranslations('cta');

  // Scroll progress for parallax effects
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Text parallax: moves faster than image
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

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

  // Headline lines for stagger animation
  const headlineLines = [
    { content: <><TypewriterText />{tHero('headlineSuffix')}</>, delay: 0.2 },
    { content: tHero('headlineLine2'), delay: 0.35 },
  ];

  return (
    <div className="relative">
      {/* Hero Section - Brandazine Editorial Style */}
      <section
        ref={heroRef}
        className="relative min-h-screen overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Enhanced Background with subtle animations */}
        <EnhancedBackground />

        {/* Mouse-following glow effect */}
        <MouseGlow />

        <div className="container-custom relative z-10 pt-24 md:pt-32 lg:pt-40">
          {/* Asymmetric 2-Column Layout: 60% Text + 40% Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[80vh]">

            {/* Left Column - Text Content (60%) */}
            <motion.div
              className="lg:col-span-7 relative z-20"
              style={{ y: textY }}
            >
              {/* Badge - Artience Style */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F2937] text-white rounded-lg text-sm font-semibold mb-6"
              >
                <Sparkles className="w-4 h-4" />
                {tHero('badge')}
              </motion.div>

              {/* Headline - Artience Style: Reduced size, simple animation */}
              <h1
                id="hero-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6 leading-tight tracking-tight"
              >
                {headlineLines.map((line, index) => (
                  <motion.span
                    key={index}
                    className="block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: line.delay
                    }}
                  >
                    {line.content}
                  </motion.span>
                ))}
              </h1>

              {/* Subheadline - Artience Style: 14-16px */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="text-base md:text-lg text-[#4B5563] mb-8 max-w-xl leading-relaxed"
              >
                {tHero('subheadline')}
                <br className="hidden md:block" />
                {tHero('subheadlineLine2')}
              </motion.p>

              {/* CTA Buttons - Artience Style */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <HeroButton
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
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

              {/* Artience accent line */}
              <motion.div
                className="mt-8 w-16 h-0.5 bg-[#3B82F6]"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 64, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              />
            </motion.div>

            {/* Right Column - Hero Image (40%) */}
            <div className="lg:col-span-5 relative">
              <HeroImage scrollYProgress={scrollYProgress} />
            </div>
          </div>

          {/* Trust Metrics - Artience Style */}
          <div
            className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
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
        </div>

        {/* Editorial Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-8 lg:left-12"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-3"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#202124] to-transparent" />
            <p className="text-xs text-[#5f6368] uppercase tracking-widest font-medium writing-vertical-lr rotate-180" style={{ writingMode: 'vertical-lr' }}>
              {tHero('scrollIndicator')}
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section - Artience Style */}
      <section id="services" className="section-padding bg-[#F9FAFB]" aria-labelledby="services-heading">
        <div className="container-custom">
          {/* Section Header - Artience Style */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="inline-block text-sm font-semibold text-[#3B82F6] uppercase tracking-wider mb-3"
            >
              {tServices('badge')}
            </motion.span>
            <h2 id="services-heading" className="text-2xl md:text-3xl font-semibold text-[#1F2937] mb-4 leading-tight">
              {tServices('sectionTitle')}
            </h2>
            <p className="text-base text-[#4B5563] max-w-2xl leading-relaxed">
              {tServices('sectionSubtitle')}
            </p>
          </motion.div>

          {/* Artience Card Grid - Clean and Simple */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="list">
            {/* All service cards - Artience style */}
            {services.map((service, index) => (
              <motion.article
                key={service.title}
                role="listitem"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group cursor-pointer"
              >
                <div className="h-full p-6 bg-white border border-[#E5E7EB] rounded-2xl transition-all duration-200 hover:shadow-[0_12px_24px_rgba(0,0,0,0.12)]">
                  {/* Icon - Artience style */}
                  <div
                    className="w-12 h-12 rounded-lg bg-[#E8F4FD] flex items-center justify-center mb-4 transition-all duration-200 group-hover:bg-[#3B82F6]"
                    aria-hidden="true"
                  >
                    <service.icon className="w-6 h-6 text-[#3B82F6] transition-colors duration-200 group-hover:text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-[#1F2937] mb-2 transition-colors duration-200 group-hover:text-[#3B82F6]">
                    {service.title}
                  </h3>

                  <p className="text-sm text-[#4B5563] leading-relaxed">
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

      {/* CTA Section - Artience Style: Clean and simple */}
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
              className="text-2xl md:text-3xl font-semibold text-white mb-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {tCta('title')}
            </motion.h2>
            <motion.p
              className="text-base text-[#9CA3AF] mb-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {tCta('subtitle')}
            </motion.p>
            <motion.button
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-lg bg-white text-[#1F2937] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1F2937] focus-visible:ring-white"
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
