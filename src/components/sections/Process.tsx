'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { Search, Map, Cog, Rocket, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProcessStep {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

// Process step keys for translation with Unsplash images
const processStepData = [
  {
    number: 1,
    icon: Search,
    key: 'discovery',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400'
  },
  {
    number: 2,
    icon: Map,
    key: 'planning',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
  },
  {
    number: 3,
    icon: Cog,
    key: 'execution',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400'
  },
  {
    number: 4,
    icon: Rocket,
    key: 'delivery',
    image: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=400'
  },
];

// Artience Animation Variants - Simplified
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      delay: 0.15,
    },
  },
};

interface ProcessStepCardProps {
  step: ProcessStep;
  index: number;
  isLast: boolean;
  isActive: boolean;
  onHover: (index: number | null) => void;
}

function ProcessStepCard({ step, index, isLast, isActive, onHover }: ProcessStepCardProps) {
  const Icon = step.icon;

  return (
    <motion.div
      variants={itemVariants}
      className="relative flex-shrink-0 w-[280px] md:w-[320px]"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Step Number - Artience Style (smaller) */}
      <div className="relative mb-4">
        <span
          className={cn(
            "text-4xl md:text-5xl font-bold leading-none transition-colors duration-200",
            isActive ? "text-[#1F2937]/30" : "text-[#E5E7EB]"
          )}
        >
          {String(step.number).padStart(2, '0')}
        </span>

        {/* Connector Line */}
        {!isLast && (
          <motion.div
            variants={lineVariants}
            className="absolute top-1/2 left-[90%] w-[calc(100%-20px)] h-[1px] origin-left hidden md:block"
            style={{
              background: isActive
                ? '#1F2937'
                : '#E5E7EB',
            }}
          />
        )}
      </div>

      {/* Card - Artience Style */}
      <motion.div
        className={cn(
          "relative bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] transition-all duration-200",
          isActive
            ? "shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
            : "shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        )}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Image */}
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={step.image}
            alt={step.title}
            fill
            className={cn(
              "object-cover transition-transform duration-200",
              isActive ? "scale-102" : "scale-100"
            )}
            sizes="(max-width: 768px) 280px, 320px"
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-200",
              isActive
                ? "bg-gradient-to-t from-[#1F2937]/20 to-transparent"
                : "bg-gradient-to-t from-black/10 to-transparent"
            )}
          />

          {/* Icon Badge - Artience Style */}
          <div
            className={cn(
              "absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
              isActive ? "bg-[#1F2937]" : "bg-white/90"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 transition-colors duration-200",
                isActive ? "text-white" : "text-[#1F2937]"
              )}
            />
          </div>
        </div>

        {/* Content - Artience Style */}
        <div className="p-5">
          <h3
            className={cn(
              "text-lg font-semibold mb-2 transition-colors duration-200",
              isActive ? "text-[#1F2937]" : "text-[#1F2937]"
            )}
          >
            {step.title}
          </h3>
          <p className="text-[#4B5563] leading-relaxed text-sm">
            {step.description}
          </p>

          {/* Progress Indicator - Artience Style */}
          <div className="mt-3 flex items-center gap-1.5">
            {processStepData.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-200",
                  i === index
                    ? "w-6 bg-[#1F2937]"
                    : i < index
                      ? "w-3 bg-[#4B5563]"
                      : "w-3 bg-[#E5E7EB]"
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Process() {
  const t = useTranslations('process');
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { scrollXProgress } = useScroll({
    container: scrollRef,
  });

  const progressWidth = useTransform(scrollXProgress, [0, 1], ['0%', '100%']);

  // Generate process steps from translations
  const processSteps: ProcessStep[] = processStepData.map((step) => ({
    number: step.number,
    icon: step.icon,
    title: t(`steps.${step.key}.title`),
    description: t(`steps.${step.key}.description`),
    image: step.image,
  }));

  return (
    <section
      id="process"
      className="py-16 md:py-24 bg-[#F9FAFB] relative overflow-hidden"
      aria-labelledby="process-heading"
      ref={containerRef}
    >
      {/* Subtle Background Pattern - Artience */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #E5E7EB 1px, transparent 1px),
            linear-gradient(180deg, #E5E7EB 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Section Header - Artience Style */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.3 }}
          className="container-custom text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="inline-block px-4 py-1.5 mb-4 rounded-lg text-sm font-semibold bg-[#F3F4F6] text-[#1F2937]"
          >
            {t('badge')}
          </motion.span>
          <h2
            id="process-heading"
            className="text-2xl md:text-3xl font-semibold text-[#1F2937] mb-4 tracking-tight"
          >
            {t('sectionTitle')}
          </h2>
          <p className="text-base text-[#4B5563] max-w-xl mx-auto leading-relaxed">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

        {/* Scroll Progress Bar - Artience Style */}
        <div className="container-custom mb-6">
          <div className="h-0.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#1F2937] rounded-full"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        {/* Horizontal Scroll Timeline */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide pb-8"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="flex gap-8 md:gap-12 px-8 md:px-16 lg:px-24"
            style={{ width: 'max-content' }}
            role="list"
            aria-label={t('ariaLabel')}
          >
            {processSteps.map((step, index) => (
              <ProcessStepCard
                key={step.number}
                step={step}
                index={index}
                isLast={index === processSteps.length - 1}
                isActive={activeIndex === index}
                onHover={setActiveIndex}
              />
            ))}
          </motion.div>
        </div>

        {/* Mobile Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="md:hidden flex items-center justify-center gap-2 mt-4 text-sm text-[#5f6368]"
        >
          <motion.span
            animate={{ x: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            &rarr;
          </motion.span>
          <span>{t('scrollHint')}</span>
        </motion.div>

        {/* Bottom Connector Dots - Artience Style */}
        <div className="container-custom mt-8">
          <div className="flex justify-center gap-2">
            {processSteps.map((_, index) => (
              <motion.button
                key={index}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer",
                  activeIndex === index
                    ? "bg-[#1F2937] scale-110"
                    : "bg-[#E5E7EB] hover:bg-[#9CA3AF]"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const scrollContainer = scrollRef.current;
                  if (scrollContainer) {
                    const cardWidth = window.innerWidth < 768 ? 280 : 320;
                    const gap = window.innerWidth < 768 ? 24 : 32;
                    scrollContainer.scrollTo({
                      left: index * (cardWidth + gap),
                      behavior: 'smooth',
                    });
                  }
                  setActiveIndex(index);
                }}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default Process;
