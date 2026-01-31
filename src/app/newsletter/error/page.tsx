'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, RefreshCw, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Suspense } from 'react';

const errorMessages: Record<string, { title: string; description: string }> = {
  'invalid-token': {
    title: '유효하지 않은 링크',
    description: '이 확인 링크는 유효하지 않거나 만료되었습니다. 새로운 구독 신청을 해주세요.',
  },
  'server-error': {
    title: '서버 오류',
    description: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  'already-confirmed': {
    title: '이미 확인됨',
    description: '이 구독은 이미 확인되었습니다.',
  },
  'already-unsubscribed': {
    title: '이미 구독 취소됨',
    description: '이미 구독이 취소된 상태입니다.',
  },
  default: {
    title: '오류 발생',
    description: '뉴스레터 처리 중 문제가 발생했습니다. 다시 시도해주세요.',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const errorInfo = errorMessages[reason || 'default'] || errorMessages.default;

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-error)]/10 mb-6">
          <AlertCircle className="w-10 h-10 text-[var(--color-error)]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-4">
          {errorInfo.title}
        </h1>

        <p className="text-[var(--color-gray-500)] mb-8 leading-relaxed">
          {errorInfo.description}
        </p>

        <div className="bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-[var(--foreground)] mb-4">
            도움이 필요하신가요?
          </h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-[var(--color-gray-400)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-gray-600)]">
                문제가 계속되면 새로운 구독 신청을 해주세요.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--color-gray-400)] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--color-gray-600)]">
                도움이 필요하시면 <a href="mailto:support@artience.io" className="text-[var(--color-primary-600)] hover:underline">support@artience.io</a>로 연락해주세요.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/#newsletter">
            <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
              다시 구독하기
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function NewsletterErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">로딩 중...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
