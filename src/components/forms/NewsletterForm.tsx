'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle, Sparkles, Brain, BarChart3 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Newsletter subscription interests
 */
type SubscriberInterest = 'automation' | 'ai' | 'data-analysis';

/**
 * Interest configuration
 */
const interestConfig: Record<SubscriberInterest, { label: string; icon: React.ReactNode; description: string }> = {
  automation: {
    label: '자동화',
    icon: <Sparkles className="w-4 h-4" />,
    description: '비즈니스 프로세스 자동화',
  },
  ai: {
    label: 'AI',
    icon: <Brain className="w-4 h-4" />,
    description: 'AI 활용법과 트렌드',
  },
  'data-analysis': {
    label: '데이터 분석',
    icon: <BarChart3 className="w-4 h-4" />,
    description: '데이터 기반 의사결정',
  },
};

/**
 * Newsletter form validation schema
 */
const newsletterSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  interests: z.array(z.enum(['automation', 'ai', 'data-analysis'])).min(1, '최소 1개의 관심 분야를 선택해주세요'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  className?: string;
  variant?: 'default' | 'compact' | 'full';
  showInterests?: boolean;
}

/**
 * Newsletter Subscription Form Component (BE-007)
 *
 * Features:
 * - Email input with validation
 * - Interest selection (automation, ai, data-analysis)
 * - Double opt-in support
 * - Loading states and success/error messages
 */
export function NewsletterForm({
  className,
  variant = 'default',
  showInterests = true
}: NewsletterFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      interests: ['automation', 'ai', 'data-analysis'], // Default: all selected
    },
  });

  const selectedInterests = watch('interests');

  const onSubmit = async (data: NewsletterFormData) => {
    setErrorMessage(null);

    try {
      // Call the Cloud Function API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          interests: data.interests,
          source: 'website',
          metadata: {
            page: window.location.pathname,
            referrer: document.referrer || undefined,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '구독 신청에 실패했습니다.');
      }

      setIsSuccess(true);
      setSuccessMessage(result.message || '이메일로 구독 확인 링크를 보내드렸습니다. 메일함을 확인해주세요.');
      reset();

      // Reset success message after 10 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setSuccessMessage('');
      }, 10000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '구독 신청에 실패했습니다. 다시 시도해주세요.'
      );
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('text-center py-4', className)}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-success)]/10 mb-3">
          <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
        </div>
        <p className="text-[var(--color-success)] font-medium">
          구독 신청이 완료되었습니다!
        </p>
        <p className="text-sm text-[var(--color-gray-400)] mt-1 max-w-xs mx-auto">
          {successMessage}
        </p>
      </motion.div>
    );
  }

  // Compact variant (email only)
  if (variant === 'compact' || !showInterests) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('space-y-3', className)}
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="이메일 주소를 입력하세요"
              inputSize="sm"
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            구독
          </Button>
        </div>
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-[var(--color-error)]"
              role="alert"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    );
  }

  // Default/Full variant with interests
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-4', className)}
    >
      {/* Email Input */}
      <div>
        <Input
          type="email"
          placeholder="이메일 주소를 입력하세요"
          error={errors.email?.message}
          leftIcon={<Mail className="w-4 h-4" />}
          {...register('email')}
        />
      </div>

      {/* Interest Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">
          관심 분야 선택
        </label>
        <Controller
          name="interests"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.entries(interestConfig) as [SubscriberInterest, typeof interestConfig[SubscriberInterest]][]).map(
                ([key, config]) => {
                  const isSelected = field.value.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value.filter((v) => v !== key)
                          : [...field.value, key];
                        field.onChange(newValue);
                      }}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 text-left',
                        isSelected
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20'
                          : 'border-[var(--color-gray-200)] hover:border-[var(--color-gray-300)]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                          isSelected
                            ? 'bg-[var(--color-primary-500)] text-white'
                            : 'bg-[var(--color-gray-100)] text-[var(--color-gray-500)]'
                        )}
                      >
                        {config.icon}
                      </span>
                      <div className="min-w-0">
                        <span
                          className={cn(
                            'block text-sm font-medium',
                            isSelected
                              ? 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]'
                              : 'text-[var(--foreground)]'
                          )}
                        >
                          {config.label}
                        </span>
                        {variant === 'full' && (
                          <span className="block text-xs text-[var(--color-gray-500)] truncate">
                            {config.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        />
        {errors.interests && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.interests.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting || selectedInterests.length === 0}
      >
        {isSubmitting ? '구독 중...' : '뉴스레터 구독하기'}
      </Button>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-[var(--color-error)] text-center"
            role="alert"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Privacy Note */}
      <p className="text-xs text-[var(--color-gray-400)] text-center">
        구독 시 <a href="/legal/privacy" className="underline hover:text-[var(--color-gray-500)]">개인정보처리방침</a>에 동의하게 됩니다.
        언제든지 구독을 취소할 수 있습니다.
      </p>
    </form>
  );
}
