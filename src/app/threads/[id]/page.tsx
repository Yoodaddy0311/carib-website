import type { Metadata } from 'next';
import ThreadDetail from './ThreadDetail';

// Generate static params for static export
export function generateStaticParams() {
  // Return sample IDs for static export
  // In production, these would be fetched from your data source
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
  ];
}

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // In production, fetch actual thread data
  const threadTitles: Record<string, string> = {
    '1': 'ChatGPT로 업무 자동화하는 5가지 실전 방법',
    '2': 'Notion + Zapier로 만드는 자동화 시스템',
    '3': '하루 3시간 절약하는 AI 도구 조합',
    '4': '스타트업 A사의 AI 도입 성공 사례',
    '5': 'Make.com 완벽 가이드',
    '6': '2025년 AI 트렌드 예측',
    '7': 'Claude AI로 코드 리뷰 자동화하기',
    '8': 'Airtable + GPT API 연동 가이드',
    '9': 'AI 시대의 핵심 역량: 프롬프트 엔지니어링',
  };

  const title = threadTitles[id] || '스레드';

  return {
    title: `${title} | Carib`,
    description: 'AI 자동화, 노코드, 생산성 향상에 관한 인사이트',
    openGraph: {
      title: `${title} | Carib`,
      description: 'AI 자동화, 노코드, 생산성 향상에 관한 인사이트',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Carib`,
      description: 'AI 자동화, 노코드, 생산성 향상에 관한 인사이트',
    },
  };
}

// Server Component Page
export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ThreadDetail threadId={id} />;
}
