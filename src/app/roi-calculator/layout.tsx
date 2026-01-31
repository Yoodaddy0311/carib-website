import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROI 계산기 - AI 업무 자동화 투자수익률 분석',
  description:
    '반복 업무를 AI로 자동화했을 때 예상되는 비용 절감액과 투자 회수 기간을 계산해 보세요. 무료 ROI 분석 도구를 제공합니다.',
  keywords: [
    'ROI 계산기',
    'AI 자동화 ROI',
    '업무 자동화 비용',
    '투자수익률',
    'AI 도입 비용',
    '업무 효율화',
    '자동화 절감액',
  ],
  openGraph: {
    title: 'ROI 계산기 - AI 업무 자동화 투자수익률 분석 | Carib',
    description:
      '반복 업무를 AI로 자동화했을 때 예상되는 비용 절감액과 투자 회수 기간을 계산해 보세요.',
    url: 'https://carib.team/roi-calculator',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Carib ROI 계산기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ROI 계산기 - AI 업무 자동화 투자수익률 분석 | Carib',
    description:
      '반복 업무를 AI로 자동화했을 때 예상되는 비용 절감액과 투자 회수 기간을 계산해 보세요.',
  },
};

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
