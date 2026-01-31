'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Thread, ThreadCategory } from '@/types';
import { ThreadCard, ThreadCardSkeleton } from '@/components/shared/ThreadCard';
import { cn } from '@/lib/utils';

// Category labels in Korean
const categoryLabels: Record<ThreadCategory, string> = {
  'ai-automation': 'AI 자동화',
  'no-code': '노코드',
  'productivity': '생산성',
  'case-study': '사례 연구',
  'tutorial': '튜토리얼',
  'insight': '인사이트',
};

// Mock data for threads
const mockThreads: Thread[] = [
  {
    id: '1',
    tweetId: '1234567890',
    authorName: '김카립',
    authorHandle: 'carib_ai',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carib',
    content: 'AI 자동화로 반복 업무 90% 줄이는 방법을 공유합니다. ChatGPT와 Zapier를 연동해서 이메일 자동 분류, 고객 응대, 리포트 생성까지 자동화했습니다.',
    summary: 'AI 자동화로 반복 업무 90% 줄이는 방법. ChatGPT + Zapier 연동으로 이메일 분류, 고객 응대, 리포트 생성 자동화 실전 가이드.',
    category: 'ai-automation',
    tags: ['AI', 'automation', 'ChatGPT', 'Zapier'],
    likeCount: 2453,
    retweetCount: 892,
    replyCount: 156,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    syncedAt: new Date(),
    featured: true,
    published: true,
  },
  {
    id: '2',
    tweetId: '1234567891',
    authorName: '박노코드',
    authorHandle: 'nocode_master',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nocode',
    content: 'Bubble로 2주만에 SaaS MVP 만든 과정을 상세히 공유합니다. 기획부터 배포까지, 코드 한 줄 없이 만드는 진짜 노코드 개발기.',
    summary: 'Bubble로 2주만에 SaaS MVP 완성! 기획부터 배포까지 노코드 개발 전 과정 공개.',
    category: 'no-code',
    tags: ['노코드', 'Bubble', 'SaaS', 'MVP'],
    likeCount: 1876,
    retweetCount: 634,
    replyCount: 98,
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    syncedAt: new Date(),
    featured: true,
    published: true,
  },
  {
    id: '3',
    tweetId: '1234567892',
    authorName: '이생산성',
    authorHandle: 'productivity_lee',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=productivity',
    content: '업무 생산성 200% 높인 Notion 시스템 공개합니다. 프로젝트 관리, 지식 관리, 팀 협업을 하나의 워크스페이스에서 해결하는 방법.',
    summary: 'Notion으로 업무 생산성 200% 향상! 프로젝트/지식/팀 협업 통합 시스템 구축 방법.',
    category: 'productivity',
    tags: ['Notion', '생산성', '프로젝트관리'],
    likeCount: 3201,
    retweetCount: 1205,
    replyCount: 234,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    syncedAt: new Date(),
    featured: true,
    published: true,
  },
  {
    id: '4',
    tweetId: '1234567893',
    authorName: '최사례',
    authorHandle: 'case_study_choi',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casestudy',
    content: '스타트업이 AI 도입 후 매출 3배 성장한 실제 사례를 분석합니다. 어떤 AI 도구를, 어떻게 도입했고, 어떤 결과를 얻었는지 상세 분석.',
    summary: 'AI 도입으로 매출 3배 성장! 스타트업 실제 사례 심층 분석.',
    category: 'case-study',
    tags: ['AI', '사례연구', '스타트업', '매출성장'],
    likeCount: 1543,
    retweetCount: 567,
    replyCount: 89,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    syncedAt: new Date(),
    featured: true,
    published: true,
  },
];

interface ThreadFeedProps {
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
}

export function ThreadFeed({
  showFilters = false,
  maxItems = 4,
  className,
}: ThreadFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThreadCategory | 'all'>('all');
  const [isLoading] = useState(false);

  // Filter threads by category
  const filteredThreads =
    selectedCategory === 'all'
      ? mockThreads.slice(0, maxItems)
      : mockThreads
          .filter((thread) => thread.category === selectedCategory)
          .slice(0, maxItems);

  const categories: (ThreadCategory | 'all')[] = [
    'all',
    'ai-automation',
    'no-code',
    'productivity',
    'case-study',
    'tutorial',
    'insight',
  ];

  return (
    <section className={cn('py-16 md:py-24 bg-white', className)}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <motion.span
              className="inline-block text-sm font-medium text-[#1a73e8] mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Twitter Threads
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-medium text-[#202124]"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Latest Insights
            </motion.h2>
            <motion.p
              className="text-lg text-[#5f6368] mt-2 max-w-2xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              AI와 노코드 분야의 최신 트렌드와 실전 노하우를 트위터 스레드로 만나보세요.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/threads"
              className="inline-flex items-center gap-2 text-[#1a73e8] font-medium hover:underline transition-colors group"
            >
              View All
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>

        {/* Category Filter Tabs */}
        {showFilters && (
          <motion.div
            className="flex flex-wrap gap-2 mb-8"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-[#202124] text-white'
                    : 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#e8eaed]'
                )}
              >
                {category === 'all' ? '전체' : categoryLabels[category]}
              </button>
            ))}
          </motion.div>
        )}

        {/* Thread Cards */}
        {isLoading ? (
          // Loading skeleton state
          <div className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible scrollbar-hide">
            {Array.from({ length: maxItems }).map((_, index) => (
              <ThreadCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          // Thread cards
          <motion.div
            className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible scrollbar-hide"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {filteredThreads.map((thread) => (
              <motion.div
                key={thread.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ThreadCard thread={thread} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredThreads.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-[#f1f3f4] rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#9aa0a6]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"
                />
              </svg>
            </div>
            <p className="text-[#5f6368]">
              해당 카테고리의 스레드가 없습니다.
            </p>
          </motion.div>
        )}
      </div>

      {/* Custom scrollbar hide styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

export default ThreadFeed;
