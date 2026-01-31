'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates?: string[]; // YYYY-MM-DD 형식
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  availableDates = [],
  minDate,
  maxDate,
  className,
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 표시할 날짜 범위 계산
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 첫 주의 빈 칸 계산
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  // 예약 가능한 날짜 Set
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const today = startOfToday();

    // 과거 날짜 체크
    if (isBefore(date, today)) return false;

    // minDate/maxDate 체크
    if (minDate && isBefore(date, minDate)) return false;
    if (maxDate && isBefore(maxDate, date)) return false;

    // 예약 가능 목록이 있으면 체크
    if (availableDates.length > 0) {
      return availableDateSet.has(dateStr);
    }

    // 기본적으로 주말 제외 (토/일)
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  };

  return (
    <div className={cn('bg-white dark:bg-[var(--color-gray-100)] rounded-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-gray-200)]">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors"
          aria-label="이전 달"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--color-gray-600)]" />
        </button>

        <h3 className="text-heading-4 font-semibold text-[var(--color-gray-900)]">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors"
          aria-label="다음 달"
        >
          <ChevronRight className="w-5 h-5 text-[var(--color-gray-600)]" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-4 py-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-caption font-medium py-2',
              index === 0 ? 'text-red-500' : 'text-[var(--color-gray-500)]',
              index === 6 ? 'text-blue-500' : ''
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 px-4 pb-4 gap-1">
        {/* Empty cells for start of month */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}

        {/* Day cells */}
        {daysInMonth.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isAvailable = isDateAvailable(day);
          const isTodayDate = isToday(day);

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => isAvailable && onSelectDate(day)}
              disabled={!isAvailable}
              className={cn(
                'relative h-10 rounded-lg text-body-2 font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2',
                isSelected
                  ? 'bg-[var(--color-primary-600)] text-white shadow-md'
                  : isAvailable
                    ? 'hover:bg-[var(--color-primary-100)] text-[var(--color-gray-700)] cursor-pointer'
                    : 'text-[var(--color-gray-300)] cursor-not-allowed',
                isTodayDate && !isSelected && 'ring-2 ring-[var(--color-primary-300)]'
              )}
              whileHover={isAvailable ? { scale: 1.05 } : {}}
              whileTap={isAvailable ? { scale: 0.95 } : {}}
            >
              {format(day, 'd')}
              {isTodayDate && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-primary-500)]" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarPicker;
