'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Thread, ThreadCategory } from '@/types';
import { ThreadCardSkeleton } from '@/components/shared/ThreadCard';
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

// Category colors for badges
const categoryColors: Record<ThreadCategory, string> = {
  'ai-automation': 'bg-blue-500',
  'no-code': 'bg-purple-500',
  'productivity': 'bg-green-500',
  'case-study': 'bg-orange-500',
  'tutorial': 'bg-pink-500',
  'insight': 'bg-cyan-500',
};

// Placeholder images for threads without images
const placeholderImages = [
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
];

// Mock data for threads with images
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
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
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
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
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
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    syncedAt: new Date(),
    featured: true,
    published: true,
  },
];

// Estimate reading time based on content length
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Format date to relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

  return new Date(date).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

// Get image for thread (use placeholder if no image)
function getThreadImage(thread: Thread, index: number): string {
  // If thread has an image property, use it; otherwise use placeholder
  return (thread as Thread & { image?: string }).image || placeholderImages[index % placeholderImages.length];
}

interface ThreadFeedProps {
  showFilters?: boolean;
  maxItems?: number;
  className?: string;
}

// Featured Card Component (Large)
function FeaturedCard({ thread, index }: { thread: Thread; index: number }) {
  const imageUrl = getThreadImage(thread, index);
  const readingTime = estimateReadingTime(thread.content);

  return (
    <motion.div
      className="col-span-2 row-span-2 relative group cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/threads/${thread.id}`} className="block h-full">
        <div className="relative h-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={imageUrl}
              alt={thread.summary || thread.content.slice(0, 50)}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold text-white uppercase tracking-wide',
              categoryColors[thread.category]
            )}>
              {categoryLabels[thread.category]}
            </span>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30">
                <Image
                  src={thread.authorAvatar}
                  alt={thread.authorName}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{thread.authorName}</p>
                <p className="text-white/70 text-xs">@{thread.authorHandle}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight line-clamp-3 group-hover:text-white/90 transition-colors">
              {thread.summary || thread.content.slice(0, 100)}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span>{formatRelativeTime(thread.publishedAt)}</span>
              <span className="w-1 h-1 rounded-full bg-white/50" />
              <span>{readingTime}분 읽기</span>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Regular Card Component
function RegularCard({ thread, index, size = 'medium' }: { thread: Thread; index: number; size?: 'small' | 'medium' | 'large' }) {
  const imageUrl = getThreadImage(thread, index);
  const readingTime = estimateReadingTime(thread.content);

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-1',
    large: 'col-span-1 row-span-2',
  };

  return (
    <motion.div
      className={cn('relative group cursor-pointer', sizeClasses[size])}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
    >
      <Link href={`/threads/${thread.id}`} className="block h-full">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
          {/* Image Container */}
          <div className={cn(
            'relative overflow-hidden',
            size === 'large' ? 'aspect-[4/5]' : 'aspect-[16/9]'
          )}>
            <Image
              src={imageUrl}
              alt={thread.summary || thread.content.slice(0, 50)}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <span className={cn(
                'px-2.5 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wide',
                categoryColors[thread.category]
              )}>
                {categoryLabels[thread.category]}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={thread.authorAvatar}
                  alt={thread.authorName}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{thread.authorName}</p>
              </div>
            </div>

            {/* Title */}
            <h3 className={cn(
              'font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors',
              size === 'large' ? 'text-xl line-clamp-3' : 'text-lg line-clamp-2'
            )}>
              {thread.summary || thread.content.slice(0, 80)}
            </h3>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatRelativeTime(thread.publishedAt)}</span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readingTime}분
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
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

  // Get featured thread and regular threads
  const featuredThread = filteredThreads[0];
  const regularThreads = filteredThreads.slice(1);

  return (
    <section className={cn('py-20 md:py-32 bg-gray-50', className)}>
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header - Magazine Style */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div>
            <motion.div
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-[2px] bg-blue-600" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">
                Featured Stories
              </span>
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Latest Insights
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-gray-600 mt-4 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              AI와 노코드 분야의 최신 트렌드와 실전 노하우를 만나보세요.
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
              className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors group"
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
            className="flex flex-wrap gap-2 mb-10"
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
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {category === 'all' ? '전체' : categoryLabels[category]}
              </button>
            ))}
          </motion.div>
        )}

        {/* Bento Grid Layout */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: maxItems }).map((_, index) => (
              <ThreadCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {/* Featured Card - Takes 2 columns and 2 rows */}
            {featuredThread && (
              <FeaturedCard thread={featuredThread} index={0} />
            )}

            {/* Regular Cards */}
            {regularThreads.map((thread, index) => (
              <RegularCard
                key={thread.id}
                thread={thread}
                index={index + 1}
                size={index === 0 ? 'large' : 'medium'}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredThreads.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <p className="text-gray-500 text-lg">
              해당 카테고리의 스레드가 없습니다.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default ThreadFeed;
