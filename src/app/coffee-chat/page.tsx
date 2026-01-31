'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Coffee, Clock, MessageSquare, Target } from 'lucide-react';
import { Card } from '@/components/ui';
import { BookingCalendar } from '@/components/booking';
import { useAnalytics } from '@/hooks/useAnalytics';

// Benefits list data
const benefits = [
  {
    icon: Target,
    text: '현재 업무 프로세스 진단',
  },
  {
    icon: MessageSquare,
    text: 'AI 자동화 가능 영역 파악',
  },
  {
    icon: Coffee,
    text: '맞춤 솔루션 제안',
  },
  {
    icon: Clock,
    text: '예상 ROI 분석',
  },
];

// Testimonials data
const testimonials = [
  {
    quote: '커피챗 후 업무 효율이 2배 이상 향상되었습니다.',
    author: '김OO',
    company: 'IT 스타트업 대표',
  },
  {
    quote: '막연했던 AI 도입이 구체적인 계획으로 바뀌었어요.',
    author: '이OO',
    company: '마케팅 에이전시 팀장',
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
    },
  },
};

export default function CoffeeChatPage() {
  const { trackEvent } = useAnalytics();

  // Track coffee chat page view
  useEffect(() => {
    trackEvent('coffee_chat_page_view', {
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      timestamp: new Date().toISOString(),
    });
  }, [trackEvent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-accent-50)] dark:from-[#0d1117] dark:via-[var(--background)] dark:to-[#0d1117]">
      <div className="container-custom section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-500)]/20 dark:text-[var(--color-primary-400)] rounded-full text-caption font-medium"
            >
              <Coffee className="w-4 h-4" />
              30분 무료 상담
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-display-2 md:text-display-1 font-bold text-[var(--foreground)]"
            >
              무료 커피챗 예약
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-body-1 md:text-heading-3 text-[var(--color-gray-600)]"
            >
              30분 무료 상담으로 AI 자동화 여정을 시작하세요
            </motion.p>

            {/* Benefits List */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  variants={itemVariants}
                  custom={index}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-[var(--color-success)]" />
                  </div>
                  <span className="text-body-1 text-[var(--color-gray-700)]">
                    {benefit.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Section / Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="pt-8 border-t border-[var(--color-gray-200)]"
            >
              <h3 className="text-heading-3 font-semibold text-[var(--foreground)] mb-6">
                고객 후기
              </h3>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.author}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  >
                    <Card variant="ghost" padding="md">
                      <p className="text-body-2 text-[var(--color-gray-600)] italic mb-3">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-caption font-medium text-[var(--foreground)]">
                          {testimonial.author}
                        </span>
                        <span className="text-caption text-[var(--color-gray-400)]">|</span>
                        <span className="text-caption text-[var(--color-gray-500)]">
                          {testimonial.company}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--color-gray-100)] rounded-full shadow-[var(--shadow-1)] border border-[var(--color-gray-100)] dark:border-[var(--color-gray-200)]">
                <span className="text-caption text-[var(--color-gray-600)]">50+ 프로젝트 완료</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--color-gray-100)] rounded-full shadow-[var(--shadow-1)] border border-[var(--color-gray-100)] dark:border-[var(--color-gray-200)]">
                <span className="text-caption text-[var(--color-gray-600)]">98% 고객 만족도</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Google Calendar Booking */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
            className="lg:sticky lg:top-24"
          >
            <BookingCalendar />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Metadata export for SEO (needs to be in a separate server component or use generateMetadata)
// Since this is a client component, we'll export metadata from a separate file or use the layout
