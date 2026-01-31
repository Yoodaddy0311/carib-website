import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '스레드',
  description: 'AI 자동화, 노코드, 생산성 향상에 관한 인사이트를 확인하세요.',
  openGraph: {
    title: '스레드 | Carib',
    description: 'AI 자동화, 노코드, 생산성 향상에 관한 인사이트를 확인하세요.',
    type: 'website',
    images: [
      {
        url: '/threads/opengraph-image',
        width: 1200,
        height: 630,
        alt: '스레드 | Carib',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '스레드 | Carib',
    description: 'AI 자동화, 노코드, 생산성 향상에 관한 인사이트를 확인하세요.',
    images: ['/threads/opengraph-image'],
  },
};

export default function ThreadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
