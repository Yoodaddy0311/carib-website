import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  company: z.string().optional(),
  phone: z.string().optional(),
  inquiryType: z.enum(['general', 'project', 'coffee-chat']),
  message: z.string().min(10, '메시지를 10자 이상 입력해주세요'),
});

export const newsletterSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
});

// Enhanced newsletter schema with interests (BE-007)
export const newsletterWithInterestsSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  interests: z.array(z.enum(['automation', 'ai', 'data-analysis'])).min(1, '최소 1개의 관심 분야를 선택해주세요'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type NewsletterWithInterestsFormData = z.infer<typeof newsletterWithInterestsSchema>;
