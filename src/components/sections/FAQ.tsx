'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Accordion, type AccordionItem } from '@/components/ui/Accordion';

// FAQ item keys for translation
const faqItemKeys = ['timeline', 'automation', 'pricing', 'integration', 'coffeeChat'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export interface FAQProps {
  className?: string;
}

export function FAQ({ className }: FAQProps) {
  const t = useTranslations('faq');

  // Generate FAQ items from translations
  const faqItems: AccordionItem[] = faqItemKeys.map((key) => ({
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  return (
    <section
      id="faq"
      className={`py-20 md:py-28 bg-[#f8f9fa] relative ${className || ''}`}
      aria-labelledby="faq-heading"
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="mx-auto max-w-3xl"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 id="faq-heading" className="text-3xl md:text-4xl font-medium text-[#202124] mb-4">
              {t('sectionTitle')}
            </h2>
            <p className="text-lg text-[#5f6368]">
              {t('sectionSubtitle')}
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div variants={itemVariants}>
            <Accordion items={faqItems} allowMultiple={false} />
          </motion.div>

          {/* Additional Help */}
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <p className="text-sm text-[#5f6368]">
              {t('moreQuestions')}{' '}
              <a
                href="/coffee-chat"
                className="text-[#1a73e8] hover:underline font-medium transition-colors"
              >
                {t('contactUs')}
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQ;
