'use client';

import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function StatCard({ icon, value, label, trend, className }: StatCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    switch (trend.direction) {
      case 'up':
        return 'text-[var(--color-success)]';
      case 'down':
        return 'text-[var(--color-error)]';
      default:
        return 'text-[var(--color-gray-500)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white dark:bg-[var(--color-gray-100)] rounded-2xl border border-[var(--color-gray-200)] p-6 shadow-[var(--shadow-2)]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-shrink-0 p-3 bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/20 rounded-xl text-[var(--color-primary-600)]">
          {icon}
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
        <p className="mt-1 text-sm text-[var(--color-gray-500)]">{label}</p>
      </div>
    </motion.div>
  );
}
