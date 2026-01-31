'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, Button } from '@/components/ui';
import { CalendarPicker } from './CalendarPicker';
import { TimeSlotPicker } from './TimeSlotPicker';
import { BookingForm } from './BookingForm';
import { type TimeSlot } from '@/lib/google/calendar';
import { cn } from '@/lib/utils';

type BookingStep = 'date' | 'time' | 'form';

interface BookingCalendarProps {
  className?: string;
}

export function BookingCalendar({ className }: BookingCalendarProps) {
  const [step, setStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // 예약 가능한 날짜 목록 로드
  useEffect(() => {
    const fetchDates = async () => {
      try {
        const response = await fetch('/api/booking/slots?dates=true');
        const data = await response.json();
        if (data.success) {
          setAvailableDates(data.dates);
        }
      } catch (error) {
        console.error('Failed to fetch available dates:', error);
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchDates();
  }, []);

  // 선택한 날짜의 시간 슬롯 로드
  const fetchTimeSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    setTimeSlots([]);

    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/booking/slots?date=${dateStr}`);
      const data = await response.json();

      if (data.success) {
        setTimeSlots(data.slots);
      }
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchTimeSlots(date);
    setStep('time');
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmTime = () => {
    if (selectedSlot) {
      setStep('form');
    }
  };

  const handleBack = () => {
    if (step === 'time') {
      setStep('date');
      setSelectedSlot(null);
    } else if (step === 'form') {
      setStep('time');
    }
  };

  const handleSuccess = () => {
    // 예약 성공 후 초기화
    setTimeout(() => {
      setStep('date');
      setSelectedDate(null);
      setSelectedSlot(null);
      setTimeSlots([]);
    }, 3000);
  };

  const handleReset = () => {
    setStep('date');
    setSelectedDate(null);
    setSelectedSlot(null);
    setTimeSlots([]);
  };

  // 스텝 표시기
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['date', 'time', 'form'] as const).map((s, index) => (
        <div key={s} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-caption font-medium transition-all',
              step === s
                ? 'bg-[var(--color-primary-600)] dark:bg-[var(--color-primary-500)] text-white'
                : index < ['date', 'time', 'form'].indexOf(step)
                  ? 'bg-[var(--color-primary-200)] dark:bg-[var(--color-primary-500)]/30 text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]'
                  : 'bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-200)] text-[var(--color-gray-400)]'
            )}
          >
            {index + 1}
          </div>
          {index < 2 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-1 transition-all',
                index < ['date', 'time', 'form'].indexOf(step)
                  ? 'bg-[var(--color-primary-300)] dark:bg-[var(--color-primary-500)]/50'
                  : 'bg-[var(--color-gray-200)]'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card variant="elevated" padding="none" className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-[var(--color-primary-600)] px-6 py-4">
        <h2 className="text-heading-3 font-semibold text-white">
          커피챗 예약
        </h2>
        <p className="text-caption text-[var(--color-primary-100)]">
          {step === 'date' && '날짜를 선택해주세요'}
          {step === 'time' && '시간을 선택해주세요'}
          {step === 'form' && '예약 정보를 입력해주세요'}
        </p>
      </div>

      <div className="p-6">
        <StepIndicator />

        <AnimatePresence mode="wait">
          {/* Step 1: 날짜 선택 */}
          {step === 'date' && (
            <motion.div
              key="date"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoadingDates ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)] mb-3" />
                  <p className="text-body-2 text-[var(--color-gray-500)]">
                    예약 가능한 날짜를 불러오는 중...
                  </p>
                </div>
              ) : (
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  availableDates={availableDates}
                />
              )}
            </motion.div>
          )}

          {/* Step 2: 시간 선택 */}
          {step === 'time' && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* 선택된 날짜 표시 */}
              <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-200)]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-primary-500)]" />
                  <span className="text-body-2 font-medium text-[var(--color-gray-700)] dark:text-[var(--color-gray-800)]">
                    {selectedDate && format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  날짜 변경
                </Button>
              </div>

              <TimeSlotPicker
                slots={timeSlots}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSlotSelect}
                isLoading={isLoadingSlots}
              />

              <div className="mt-6 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleConfirmTime}
                  disabled={!selectedSlot}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  다음
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: 예약 정보 입력 */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BookingForm
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSuccess={handleSuccess}
                onCancel={handleBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export default BookingCalendar;
