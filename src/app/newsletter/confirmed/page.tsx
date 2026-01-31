/**
 * Newsletter Subscription Confirmed Page (BE-007)
 *
 * Displayed after successful email confirmation.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowRight, BookOpen, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '구독 확인 완료 | Carib',
  description: 'Carib 뉴스레터 구독이 확인되었습니다.',
  robots: { index: false, follow: false },
};

export default function NewsletterConfirmedPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-success)]/10 mb-6">
          <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
          구독이 확인되었습니다!
        </h1>

        {/* Description */}
        <p className="text-[var(--color-gray-500)] mb-8 leading-relaxed">
          Carib 뉴스레터 구독이 완료되었습니다.
          <br />
          비즈니스 자동화, AI 활용법 등 유용한 인사이트를
          <br />
          정기적으로 보내드리겠습니다.
        </p>

        {/* What's Next Section */}
        <div className="bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            다음 단계
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[var(--color-primary-600)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)] text-sm">
                  최신 글 읽어보기
                </p>
                <p className="text-xs text-[var(--color-gray-500)]">
                  비즈니스 자동화에 관한 인사이트를 확인하세요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent-100)] flex items-center justify-center">
                <Coffee className="w-4 h-4 text-[var(--color-accent-600)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--foreground)] text-sm">
                  커피챗 신청하기
                </p>
                <p className="text-xs text-[var(--color-gray-500)]">
                  전문가와 1:1 상담을 통해 맞춤형 조언을 받아보세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/threads">
            <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
              최신 글 보기
            </Button>
          </Link>
          <Link href="/coffee-chat">
            <Button variant="outline">
              커피챗 신청
            </Button>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-[var(--color-gray-400)] hover:text-[var(--color-gray-500)] transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
