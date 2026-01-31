'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Building2, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button, Input, Textarea, Label } from '@/components/ui';
import { type TimeSlot } from '@/lib/google/calendar';
import { cn } from '@/lib/utils';

// 폼 검증 스키마
const bookingFormSchema = z.object({
  name: z.string().min(2, '이름을 2자 이상 입력해주세요'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSuccess?: (data: { eventId?: string; meetLink?: string }) => void;
  onCancel?: () => void;
  className?: string;
}

export function BookingForm({
  selectedDate,
  selectedSlot,
  onSuccess,
  onCancel,
  className,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedSlot) {
      setSubmitError('예약 시간을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || '예약에 실패했습니다.');
      }

      setIsSuccess(true);
      reset();
      onSuccess?.({ eventId: result.eventId, meetLink: result.meetLink });
    } catch (error) {
      console.error('Booking error:', error);
      setSubmitError(
        error instanceof Error ? error.message : '예약 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'text-center py-12 px-6',
          className
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center"
        >
          <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
        </motion.div>

        <h3 className="text-heading-3 font-semibold text-[var(--color-gray-900)] mb-2">
          예약이 완료되었습니다!
        </h3>

        <p className="text-body-2 text-[var(--color-gray-600)] mb-2">
          {selectedDate && format(selectedDate, 'M월 d일 (EEE)', { locale: ko })}{' '}
          {selectedSlot && format(new Date(selectedSlot.startTime), 'HH:mm', { locale: ko })}
        </p>

        <p className="text-caption text-[var(--color-gray-500)] mb-6">
          확인 이메일이 발송되었습니다.
          <br />
          Google Meet 링크가 포함되어 있으니 확인해주세요.
        </p>

        <Button
          variant="outline"
          onClick={() => {
            setIsSuccess(false);
            onCancel?.();
          }}
        >
          돌아가기
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)}>
      {/* 선택된 시간 표시 */}
      {selectedDate && selectedSlot && (
        <div className="p-4 rounded-lg bg-[var(--color-primary-50)] border border-[var(--color-primary-200)]">
          <p className="text-caption text-[var(--color-primary-600)] font-medium mb-1">
            선택한 예약 시간
          </p>
          <p className="text-body-1 font-semibold text-[var(--color-primary-700)]">
            {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}{' '}
            {format(new Date(selectedSlot.startTime), 'HH:mm', { locale: ko })} ~{' '}
            {format(new Date(selectedSlot.endTime), 'HH:mm', { locale: ko })}
          </p>
        </div>
      )}

      {/* 이름 */}
      <div className="space-y-2">
        <Label htmlFor="name" required>
          이름
        </Label>
        <Input
          id="name"
          placeholder="홍길동"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      {/* 이메일 */}
      <div className="space-y-2">
        <Label htmlFor="email" required>
          이메일
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* 회사 */}
      <div className="space-y-2">
        <Label htmlFor="company">회사명</Label>
        <Input
          id="company"
          placeholder="회사명 (선택)"
          leftIcon={<Building2 className="w-4 h-4" />}
          {...register('company')}
        />
      </div>

      {/* 연락처 */}
      <div className="space-y-2">
        <Label htmlFor="phone">연락처</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="010-0000-0000 (선택)"
          leftIcon={<Phone className="w-4 h-4" />}
          {...register('phone')}
        />
      </div>

      {/* 메시지 */}
      <div className="space-y-2">
        <Label htmlFor="message">상담 내용</Label>
        <Textarea
          id="message"
          placeholder="상담하고 싶은 내용을 간단히 적어주세요 (선택)"
          rows={3}
          {...register('message')}
        />
      </div>

      {/* 에러 메시지 */}
      <AnimatePresence mode="wait">
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-50 border border-red-200"
          >
            <p className="text-body-2 text-red-600">{submitError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!selectedSlot}
          rightIcon={<Send className="w-4 h-4" />}
          className="flex-1"
        >
          예약 확정
        </Button>
      </div>

      <p className="text-caption text-[var(--color-gray-400)] text-center">
        예약 확정 시 입력하신 이메일로 확인 메일이 발송됩니다.
      </p>
    </form>
  );
}

export default BookingForm;
