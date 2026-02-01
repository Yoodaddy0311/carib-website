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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay: 0.3,
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
      className="relative flex-shrink-0 w-[320px] md:w-[380px]"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Large Step Number - Brandazine Style */}
      <div className="relative mb-6">
        <span
          className={cn(
            "text-8xl md:text-9xl font-bold leading-none transition-colors duration-300",
            isActive ? "text-[#1a73e8]/20" : "text-[#e8eaed]"
          )}
        >
          {String(step.number).padStart(2, '0')}
        </span>

        {/* Connector Line */}
        {!isLast && (
          <motion.div
            variants={lineVariants}
            className="absolute top-1/2 left-[90%] w-[calc(100%-20px)] h-[2px] origin-left hidden md:block"
            style={{
              background: isActive
                ? 'linear-gradient(90deg, #1a73e8 0%, #34a853 100%)'
                : 'linear-gradient(90deg, #dadce0 0%, transparent 100%)',
            }}
          />
        )}
      </div>

      {/* Card */}
      <motion.div
        className={cn(
          "relative bg-white rounded-2xl overflow-hidden transition-all duration-300",
          isActive
            ? "shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            : "shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
        )}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={step.image}
            alt={step.title}
            fill
            className={cn(
              "object-cover transition-transform duration-500",
              isActive ? "scale-105" : "scale-100"
            )}
            sizes="(max-width: 768px) 320px, 380px"
          />
          <div
            className={cn(
              "absolute inset-0 transition-opacity duration-300",
              isActive
                ? "bg-gradient-to-t from-[#1a73e8]/30 to-transparent"
                : "bg-gradient-to-t from-black/20 to-transparent"
            )}
          />

          {/* Icon Badge */}
          <div
            className={cn(
              "absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
              isActive ? "bg-[#1a73e8]" : "bg-white/90 backdrop-blur-sm"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 transition-colors duration-300",
                isActive ? "text-white" : "text-[#202124]"
              )}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3
            className={cn(
              "text-xl font-semibold mb-3 transition-colors duration-300",
              isActive ? "text-[#1a73e8]" : "text-[#202124]"
            )}
          >
            {step.title}
          </h3>
          <p className="text-[#5f6368] leading-relaxed text-sm">
            {step.description}
          </p>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-2">
            {processStepData.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === index
                    ? "w-8 bg-[#1a73e8]"
                    : i < index
                      ? "w-4 bg-[#34a853]"
                      : "w-4 bg-[#e8eaed]"
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
      className="py-20 md:py-32 bg-[#fafafa] relative overflow-hidden"
      aria-labelledby="process-heading"
      ref={containerRef}
    >
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #e8eaed 1px, transparent 1px),
            linear-gradient(180deg, #e8eaed 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="container-custom text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-block px-5 py-2 mb-6 rounded-full text-sm font-medium bg-[#1a73e8]/10 text-[#1a73e8]"
          >
            {t('badge')}
          </motion.span>
          <h2
            id="process-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#202124] mb-6 tracking-tight"
          >
            {t('sectionTitle')}
          </h2>
          <p className="text-lg md:text-xl text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

        {/* Scroll Progress Bar */}
        <div className="container-custom mb-8">
          <div className="h-1 bg-[#e8eaed] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1a73e8] to-[#34a853] rounded-full"
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

        {/* Bottom Connector Dots */}
        <div className="container-custom mt-12">
          <div className="flex justify-center gap-3">
            {processSteps.map((_, index) => (
              <motion.button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300 cursor-pointer",
                  activeIndex === index
                    ? "bg-[#1a73e8] scale-125"
                    : "bg-[#dadce0] hover:bg-[#bdc1c6]"
                )}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const scrollContainer = scrollRef.current;
                  if (scrollContainer) {
                    const cardWidth = window.innerWidth < 768 ? 320 : 380;
                    const gap = window.innerWidth < 768 ? 32 : 48;
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
