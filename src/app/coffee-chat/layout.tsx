import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '커피챗 예약',
  description: '30분 무료 상담으로 AI 자동화 여정을 시작하세요. 현재 업무 프로세스 진단, AI 자동화 가능 영역 파악, 맞춤 솔루션 제안, 예상 ROI 분석을 제공합니다.',
  openGraph: {
    title: '커피챗 예약 | Carib',
    description: '30분 무료 상담으로 AI 자동화 여정을 시작하세요.',
    type: 'website',
    images: [
      {
        url: '/coffee-chat/opengraph-image',
        width: 1200,
        height: 630,
        alt: '커피챗 예약 | Carib',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '커피챗 예약 | Carib',
    description: '30분 무료 상담으로 AI 자동화 여정을 시작하세요.',
    images: ['/coffee-chat/opengraph-image'],
  },
};

export default function CoffeeChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
