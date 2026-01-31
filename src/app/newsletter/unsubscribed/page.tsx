/**
 * Newsletter Unsubscribed Page (BE-007)
 *
 * Displayed after successful unsubscription.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, MailX, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: '구독 취소 완료 | Carib',
  description: 'Carib 뉴스레터 구독이 취소되었습니다.',
  robots: { index: false, follow: false },
};

export default function NewsletterUnsubscribedPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-gray-100)] mb-6">
          <MailX className="w-10 h-10 text-[var(--color-gray-400)]" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
          구독이 취소되었습니다
        </h1>

        {/* Description */}
        <p className="text-[var(--color-gray-500)] mb-8 leading-relaxed">
          Carib 뉴스레터 구독이 취소되었습니다.
          <br />
          더 이상 뉴스레터를 받지 않으실 것입니다.
        </p>

        {/* Feedback Section */}
        <div className="bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-[var(--color-warning-dark)] mb-2">
            피드백을 환영합니다
          </h2>
          <p className="text-sm text-[var(--color-gray-600)]">
            구독을 취소하신 이유가 있으시다면 알려주세요.
            더 나은 콘텐츠를 제공하기 위해 노력하겠습니다.
          </p>
          <Link href="/contact" className="mt-4 inline-block">
            <Button variant="ghost" size="sm">
              피드백 보내기
            </Button>
          </Link>
        </div>

        {/* Re-subscribe Option */}
        <div className="bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] rounded-2xl p-6 mb-8">
          <p className="text-sm text-[var(--color-gray-600)] mb-4">
            혹시 실수로 구독을 취소하셨나요?
            <br />
            언제든지 다시 구독하실 수 있습니다.
          </p>
          <Link href="/#newsletter">
            <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              다시 구독하기
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
