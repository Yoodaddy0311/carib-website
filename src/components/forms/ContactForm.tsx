'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/hooks/useToast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { contactFormSchema, type ContactFormData } from '@/lib/validations';
import { submitInquiry } from '@/lib/api/cloudFunctions';

const inquiryTypeOptions = [
  { value: 'general', label: '일반 문의' },
  { value: 'project', label: '프로젝트 의뢰' },
  { value: 'coffee-chat', label: '커피챗 신청' },
] as const;

export function ContactForm() {
  const { toast } = useToast();
  const { trackFormSubmit } = useAnalytics();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      inquiryType: 'general',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await submitInquiry({
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        message: data.message,
        inquiryType: data.inquiryType,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit inquiry');
      }

      // Track form submission event
      trackFormSubmit('contact', {
        inquiry_type: data.inquiryType,
        has_company: !!data.company,
        has_phone: !!data.phone,
      });

      toast({
        type: 'success',
        title: '문의가 접수되었습니다',
        description: '빠른 시일 내에 답변드리겠습니다.',
      });

      reset();
    } catch (error) {
      console.error('Contact form submission error:', error);
      toast({
        type: 'error',
        title: '문의 접수에 실패했습니다',
        description: error instanceof Error ? error.message : '잠시 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <Label htmlFor="name" required>
            이름
          </Label>
          <Input
            id="name"
            placeholder="홍길동"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor="email" required>
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        {/* Company Field (Optional) */}
        <div>
          <Label htmlFor="company">회사/소속</Label>
          <Input
            id="company"
            placeholder="회사명 또는 소속"
            error={errors.company?.message}
            {...register('company')}
          />
        </div>

        {/* Phone Field (Optional) */}
        <div>
          <Label htmlFor="phone">연락처</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="010-1234-5678"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>
      </div>

      {/* Inquiry Type Dropdown */}
      <div>
        <Label htmlFor="inquiryType" required>
          문의 유형
        </Label>
        <select
          id="inquiryType"
          className="w-full h-11 px-4 text-base rounded-xl border border-[var(--color-gray-300)] bg-white dark:bg-[var(--color-gray-100)] text-[var(--foreground)] transition-all duration-300 outline-none focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
          {...register('inquiryType')}
        >
          {inquiryTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.inquiryType && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]" role="alert">
            {errors.inquiryType.message}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <Label htmlFor="message" required>
          문의 내용
        </Label>
        <Textarea
          id="message"
          placeholder="문의하실 내용을 자세히 작성해주세요."
          error={errors.message?.message}
          showCharacterCount
          maxCharacters={1000}
          {...register('message')}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? '전송 중...' : '문의하기'}
      </Button>
    </form>
  );
}
