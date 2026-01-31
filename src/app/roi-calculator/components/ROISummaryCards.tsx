'use client';

import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';
import type { ROICalculationResult } from '../page';

interface ROISummaryCardsProps {
  result: ROICalculationResult;
}

export function ROISummaryCards({ result }: ROISummaryCardsProps) {
  const cards = [
    {
      icon: Clock,
      title: '연간 절감 시간',
      value: `${Math.round(result.savedHoursPerYear).toLocaleString()}`,
      unit: '시간',
      description: `현재 ${Math.round(result.totalCurrentHoursPerYear).toLocaleString()}시간 중`,
      color: 'primary' as const,
    },
    {
      icon: DollarSign,
      title: '연간 절감 비용',
      value: `${Math.round(result.savingsPerYear / 10000).toLocaleString()}`,
      unit: '만원',
      description: '인건비 기준',
      color: 'success' as const,
    },
    {
      icon: Calendar,
      title: '투자 회수 기간',
      value: `${result.paybackPeriodMonths}`,
      unit: '개월',
      description: `예상 도입 비용: ${Math.round(result.implementationCost / 10000).toLocaleString()}만원`,
      color: 'warning' as const,
    },
    {
      icon: Target,
      title: '3년 ROI',
      value: `${Math.round(result.threeYearROI)}`,
      unit: '%',
      description: `5년 ROI: ${Math.round(result.fiveYearROI)}%`,
      color: 'accent' as const,
    },
    {
      icon: Zap,
      title: '자동화율',
      value: `${Math.round((result.automatedHoursPerYear / result.totalCurrentHoursPerYear) * 100)}`,
      unit: '%',
      description: '평균 업무 자동화',
      color: 'info' as const,
    },
    {
      icon: TrendingUp,
      title: '월간 절감액',
      value: `${Math.round(result.savingsPerYear / 12 / 10000).toLocaleString()}`,
      unit: '만원',
      description: '매월 절약되는 비용',
      color: 'primary' as const,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: {
        bg: 'bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-500)]/20',
        icon: 'text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]',
        value: 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]',
      },
      success: {
        bg: 'bg-green-100 dark:bg-green-500/20',
        icon: 'text-green-600 dark:text-green-400',
        value: 'text-green-700 dark:text-green-400',
      },
      warning: {
        bg: 'bg-amber-100 dark:bg-amber-500/20',
        icon: 'text-amber-600 dark:text-amber-400',
        value: 'text-amber-700 dark:text-amber-400',
      },
      accent: {
        bg: 'bg-[var(--color-accent-100)] dark:bg-[var(--color-accent-500)]/20',
        icon: 'text-[var(--color-accent-600)] dark:text-[var(--color-accent-400)]',
        value: 'text-[var(--color-accent-700)] dark:text-[var(--color-accent-400)]',
      },
      info: {
        bg: 'bg-blue-100 dark:bg-blue-500/20',
        icon: 'text-blue-600 dark:text-blue-400',
        value: 'text-blue-700 dark:text-blue-400',
      },
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card
              variant="default"
              padding="md"
              hover
              className="h-full"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                    colorClasses.bg
                  )}
                >
                  <Icon className={cn('w-6 h-6', colorClasses.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-gray-500)] mb-1">{card.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn('text-2xl font-bold', colorClasses.value)}>
                      {card.value}
                    </span>
                    <span className="text-sm text-[var(--color-gray-500)]">{card.unit}</span>
                  </div>
                  <p className="text-xs text-[var(--color-gray-400)] mt-1">{card.description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
