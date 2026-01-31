'use client';

import { motion } from 'motion/react';
import { Search, Map, Cog, Rocket, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ProcessStep {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

// Process step keys for translation
const processStepData = [
  { number: 1, icon: Search, key: 'discovery' },
  { number: 2, icon: Map, key: 'planning' },
  { number: 3, icon: Cog, key: 'execution' },
  { number: 4, icon: Rocket, key: 'delivery' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

interface ProcessStepCardProps {
  step: ProcessStep;
  isLast: boolean;
}

function ProcessStepCard({ step, isLast }: ProcessStepCardProps) {
  const Icon = step.icon;

  return (
    <motion.li
      variants={itemVariants}
      className="relative flex flex-col items-center md:flex-1 list-none"
    >
      {/* Connector Line - Horizontal on desktop, vertical on mobile */}
      {!isLast && (
        <>
          {/* Desktop horizontal line */}
          <div
            className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[1px] bg-[#dadce0]"
          />
          {/* Mobile vertical line */}
          <div
            className="md:hidden absolute top-20 left-1/2 -translate-x-1/2 w-[1px] h-12 bg-[#dadce0]"
          />
        </>
      )}

      {/* Step Number Badge */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-[#202124]"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-white font-medium text-xl">{step.number}</span>
      </motion.div>

      {/* Card Content */}
      <div
        className={cn(
          'w-full max-w-[280px] text-center p-6 rounded-3xl bg-white border border-[#e8eaed]',
          'transition-all duration-200 hover:border-[#dadce0] hover:shadow-[0_2px_6px_rgba(60,64,67,0.15)]'
        )}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-[#e8f0fe]"
        >
          <Icon
            className="w-6 h-6 text-[#1a73e8]"
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-[#202124] mb-2">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#5f6368] leading-relaxed">
          {step.description}
        </p>
      </div>
    </motion.li>
  );
}

export function Process() {
  const t = useTranslations('process');

  // Generate process steps from translations
  const processSteps: ProcessStep[] = processStepData.map((step) => ({
    number: step.number,
    icon: step.icon,
    title: t(`steps.${step.key}.title`),
    description: t(`steps.${step.key}.description`),
  }));

  return (
    <section
      id="process"
      className="py-20 md:py-28 bg-[#f8f9fa] relative"
      aria-labelledby="process-heading"
    >
      {/* Subtle dot pattern background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #dadce0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-4 py-1.5 mb-4 rounded-full text-sm font-medium bg-[#f1f3f4] text-[#5f6368]"
          >
            {t('badge')}
          </span>
          <h2 id="process-heading" className="text-3xl md:text-4xl font-medium text-[#202124] mb-4">
            {t('sectionTitle')}
          </h2>
          <p className="text-lg text-[#5f6368] max-w-2xl mx-auto">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

        {/* Process Steps */}
        <motion.ol
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={cn(
            'flex flex-col items-center gap-16',
            'md:flex-row md:items-start md:justify-between md:gap-4'
          )}
          role="list"
          aria-label={t('ariaLabel')}
        >
          {processSteps.map((step, index) => (
            <ProcessStepCard
              key={step.number}
              step={step}
              isLast={index === processSteps.length - 1}
            />
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

export default Process;
