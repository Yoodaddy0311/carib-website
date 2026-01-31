'use client';

import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { type TimeSlot } from '@/lib/google/calendar';
import { Skeleton } from '@/components/ui';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
  className?: string;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  className,
}: TimeSlotPickerProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[var(--color-gray-400)]" />
          <span className="text-body-2 text-[var(--color-gray-600)]">
            시간을 불러오는 중...
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="w-12 h-12 mx-auto mb-3 text-[var(--color-gray-300)]" />
        <p className="text-body-2 text-[var(--color-gray-500)]">
          먼저 날짜를 선택해주세요
        </p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="w-12 h-12 mx-auto mb-3 text-[var(--color-gray-300)]" />
        <p className="text-body-2 text-[var(--color-gray-500)]">
          선택한 날짜에 예약 가능한 시간이 없습니다
        </p>
        <p className="text-caption text-[var(--color-gray-400)] mt-1">
          다른 날짜를 선택해주세요
        </p>
      </div>
    );
  }

  return (
    <div className={cn('', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[var(--color-primary-500)]" />
        <span className="text-body-2 font-medium text-[var(--color-gray-700)]">
          예약 가능 시간 ({availableSlots.length}개)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {availableSlots.map((slot) => {
          const startTime = new Date(slot.startTime);
          const endTime = new Date(slot.endTime);
          const isSelected = selectedSlot?.id === slot.id;

          return (
            <motion.button
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className={cn(
                'relative px-4 py-3 rounded-lg text-body-2 font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
                'border',
                isSelected
                  ? 'bg-[var(--color-primary-600)] text-white border-transparent shadow-md'
                  : 'bg-white text-[var(--color-gray-700)] border-[var(--color-gray-200)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="block">
                {format(startTime, 'HH:mm', { locale: ko })}
              </span>
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-white/80' : 'text-[var(--color-gray-400)]'
                )}
              >
                ~ {format(endTime, 'HH:mm', { locale: ko })}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default TimeSlotPicker;
