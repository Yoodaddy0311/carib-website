'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageCircle, ExternalLink, Filter } from 'lucide-react';
import ThreadCard, { ThreadCardSkeleton } from '@/components/shared/ThreadCard';
import { Thread, ThreadCategory } from '@/types';
import { cn } from '@/lib/utils';

// Category type and data
type CategoryKey = 'all' | ThreadCategory;

interface Category {
  key: CategoryKey;
  label: string;
}

const categories: Category[] = [
  { key: 'all', label: '전체' },
  { key: 'ai-automation', label: 'AI 자동화' },
  { key: 'no-code', label: '노코드' },
  { key: 'productivity', label: '생산성' },
  { key: 'case-study', label: '사례 연구' },
  { key: 'tutorial', label: '튜토리얼' },
  { key: 'insight', label: '인사이트' },
];

// Mock thread data using the correct Thread type
const mockThreads: Thread[] = [
  {
    id: '1',
    tweetId: '1234567890',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: 'ChatGPT로 업무 자동화하는 5가지 실전 방법을 알려드립니다.',
    summary: '매일 반복되는 이메일 응답, 보고서 작성, 데이터 정리... ChatGPT를 활용하면 이 모든 것을 자동화할 수 있습니다. 실제 사례와 함께 알려드립니다.',
    category: 'ai-automation',
    tags: ['ChatGPT', '업무자동화', 'AI'],
    likeCount: 1234,
    retweetCount: 456,
    replyCount: 89,
    publishedAt: new Date('2025-01-15'),
    syncedAt: new Date('2025-01-15'),
    featured: true,
    published: true,
  },
  {
    id: '2',
    tweetId: '1234567891',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: 'Notion + Zapier로 만드는 자동화 시스템',
    summary: '노코드 도구만으로 고객 관리부터 프로젝트 진행까지 모든 것을 자동화한 방법을 공유합니다. 코딩 없이도 가능합니다.',
    category: 'no-code',
    tags: ['Notion', 'Zapier', '노코드'],
    likeCount: 892,
    retweetCount: 234,
    replyCount: 56,
    publishedAt: new Date('2025-01-12'),
    syncedAt: new Date('2025-01-12'),
    featured: false,
    published: true,
  },
  {
    id: '3',
    tweetId: '1234567892',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: '하루 3시간 절약하는 AI 도구 조합',
    summary: '여러 AI 도구를 조합해서 사용하면 생산성이 극대화됩니다. 실제로 제가 매일 사용하는 도구 조합과 워크플로우를 공개합니다.',
    category: 'productivity',
    tags: ['AI도구', '생산성', '워크플로우'],
    likeCount: 2156,
    retweetCount: 678,
    replyCount: 134,
    publishedAt: new Date('2025-01-10'),
    syncedAt: new Date('2025-01-10'),
    featured: true,
    published: true,
  },
  {
    id: '4',
    tweetId: '1234567893',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: '스타트업 A사의 AI 도입 성공 사례',
    summary: '직원 10명의 스타트업이 AI를 도입해 매출 200% 성장을 달성한 실제 사례입니다. 어떤 문제를 어떻게 해결했는지 상세히 분석합니다.',
    category: 'case-study',
    tags: ['사례연구', '스타트업', 'AI도입'],
    likeCount: 1567,
    retweetCount: 423,
    replyCount: 78,
    publishedAt: new Date('2025-01-08'),
    syncedAt: new Date('2025-01-08'),
    featured: false,
    published: true,
  },
  {
    id: '5',
    tweetId: '1234567894',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: 'Make.com 완벽 가이드: 초보자부터 고급까지',
    summary: 'Make.com(구 Integromat)을 처음 접하는 분들을 위한 단계별 가이드입니다. 기초부터 고급 시나리오 작성까지 모두 다룹니다.',
    category: 'tutorial',
    tags: ['Make.com', '튜토리얼', '자동화'],
    likeCount: 934,
    retweetCount: 312,
    replyCount: 67,
    publishedAt: new Date('2025-01-05'),
    syncedAt: new Date('2025-01-05'),
    featured: false,
    published: true,
  },
  {
    id: '6',
    tweetId: '1234567895',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: '2025년 AI 트렌드 예측: 업무 환경의 변화',
    summary: '2025년 AI가 가져올 업무 환경의 변화를 예측합니다. 어떻게 준비해야 할지, 무엇을 배워야 할지 인사이트를 공유합니다.',
    category: 'insight',
    tags: ['AI트렌드', '2025', '인사이트'],
    likeCount: 1823,
    retweetCount: 567,
    replyCount: 112,
    publishedAt: new Date('2025-01-02'),
    syncedAt: new Date('2025-01-02'),
    featured: true,
    published: true,
  },
  {
    id: '7',
    tweetId: '1234567896',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: 'Claude AI로 코드 리뷰 자동화하기',
    summary: '개발팀의 코드 리뷰 프로세스를 Claude AI로 자동화한 경험을 공유합니다. 품질은 올리고 시간은 줄인 방법입니다.',
    category: 'ai-automation',
    tags: ['Claude', '코드리뷰', 'AI자동화'],
    likeCount: 756,
    retweetCount: 189,
    replyCount: 45,
    publishedAt: new Date('2024-12-28'),
    syncedAt: new Date('2024-12-28'),
    featured: false,
    published: true,
  },
  {
    id: '8',
    tweetId: '1234567897',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: 'Airtable + GPT API 연동 가이드',
    summary: 'Airtable에 GPT API를 연동해서 자동으로 데이터를 분류하고 요약하는 시스템을 만드는 방법을 알려드립니다.',
    category: 'tutorial',
    tags: ['Airtable', 'GPT API', '튜토리얼'],
    likeCount: 645,
    retweetCount: 234,
    replyCount: 38,
    publishedAt: new Date('2024-12-25'),
    syncedAt: new Date('2024-12-25'),
    featured: false,
    published: true,
  },
  {
    id: '9',
    tweetId: '1234567898',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: 'AI 시대의 핵심 역량: 프롬프트 엔지니어링',
    summary: 'AI를 잘 활용하는 사람과 그렇지 못한 사람의 차이는 프롬프트에 있습니다. 효과적인 프롬프트 작성법을 공유합니다.',
    category: 'insight',
    tags: ['프롬프트', 'AI역량', '인사이트'],
    likeCount: 2341,
    retweetCount: 712,
    replyCount: 156,
    publishedAt: new Date('2024-12-20'),
    syncedAt: new Date('2024-12-20'),
    featured: true,
    published: true,
  },
];

// Loading skeleton grid
function LoadingSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ThreadCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Empty state component
function EmptyState({ searchQuery, category }: { searchQuery: string; category: CategoryKey }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--color-gray-100)] flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-[var(--color-gray-400)]" />
      </div>
      <h3 className="text-heading-3 font-semibold text-[var(--color-gray-900)] mb-2">
        검색 결과가 없습니다
      </h3>
      <p className="text-body-2 text-[var(--color-gray-500)] max-w-md">
        {searchQuery
          ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
          : category !== 'all'
          ? `"${categories.find((c) => c.key === category)?.label}" 카테고리에 스레드가 없습니다.`
          : '아직 등록된 스레드가 없습니다.'}
      </p>
      <p className="text-caption text-[var(--color-gray-400)] mt-2">
        다른 키워드나 카테고리로 검색해 보세요.
      </p>
    </motion.div>
  );
}

// Category Tab component
function CategoryTab({
  category,
  isActive,
  onClick,
}: {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 text-body-2 font-medium rounded-lg transition-colors duration-200',
        isActive
          ? 'text-[var(--color-primary-600)]'
          : 'text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)] hover:bg-[var(--color-gray-100)]'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {category.label}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-[var(--color-primary-50)] rounded-lg -z-10"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

// Main content component (uses searchParams)
function ThreadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get category from URL or default to 'all'
  const categoryParam = searchParams.get('category') as CategoryKey | null;
  const activeCategory = categoryParam && categories.some((c) => c.key === categoryParam)
    ? categoryParam
    : 'all';

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter threads based on category and search query
  const filteredThreads = useMemo(() => {
    return mockThreads.filter((thread) => {
      const matchesCategory = activeCategory === 'all' || thread.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Handle category change
  const handleCategoryChange = (category: CategoryKey) => {
    // Simulate loading for better UX
    setIsLoading(true);

    // Update URL with new category
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }

    router.push(`/threads${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });

    // Reset loading after a short delay
    setTimeout(() => setIsLoading(false), 300);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {/* Filters Section */}
      <section className="mb-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-[var(--color-gray-400)] mr-2" />
          {categories.map((category) => (
            <CategoryTab
              key={category.key}
              category={category}
              isActive={activeCategory === category.key}
              onClick={() => handleCategoryChange(category.key)}
            />
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-gray-400)]" />
          <input
            type="text"
            placeholder="스레드 검색..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--color-gray-200)] bg-white text-body-2 text-[var(--color-gray-900)] placeholder:text-[var(--color-gray-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all duration-200"
          />
        </div>
      </section>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-caption text-[var(--color-gray-500)]">
          총 <span className="font-semibold text-[var(--color-gray-700)]">{filteredThreads.length}</span>개의 스레드
        </p>
      </div>

      {/* Threads Grid */}
      {isLoading ? (
        <LoadingSkeletonGrid />
      ) : filteredThreads.length === 0 ? (
        <EmptyState searchQuery={searchQuery} category={activeCategory} />
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
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
          <AnimatePresence mode="popLayout">
            {filteredThreads.map((thread, index) => (
              <motion.div
                key={thread.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ThreadCard thread={thread} linkToDetail />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination Placeholder */}
      {filteredThreads.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-4 py-2 rounded-lg border border-[var(--color-gray-200)] text-[var(--color-gray-400)] text-body-2 cursor-not-allowed"
            >
              이전
            </button>
            <div className="flex items-center gap-1">
              <span className="w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--color-primary-600)] text-white text-body-2 font-medium">
                1
              </span>
              <span className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--color-gray-600)] text-body-2 hover:bg-[var(--color-gray-100)] cursor-pointer transition-colors">
                2
              </span>
              <span className="w-10 h-10 flex items-center justify-center rounded-lg text-[var(--color-gray-600)] text-body-2 hover:bg-[var(--color-gray-100)] cursor-pointer transition-colors">
                3
              </span>
            </div>
            <button className="px-4 py-2 rounded-lg border border-[var(--color-gray-200)] text-[var(--color-gray-600)] text-body-2 hover:bg-[var(--color-gray-50)] transition-colors">
              다음
            </button>
          </div>
        </motion.div>
      )}

      {/* Load More Placeholder (Alternative to Pagination) */}
      {/* Uncomment this section if you prefer infinite scroll pattern */}
      {/*
      {filteredThreads.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Button variant="outline" size="lg">
            더 보기
          </Button>
        </motion.div>
      )}
      */}
    </>
  );
}

// Main page component
export default function ThreadsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-gray-50)]">
      {/* Page Header */}
      <section className="bg-white border-b border-[var(--color-gray-200)]">
        <div className="container-custom section-padding">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] rounded-full text-caption font-medium mb-4">
              <MessageCircle className="w-4 h-4" />
              Twitter Threads
            </div>
            <h1 className="text-display-3 md:text-display-2 font-bold text-[var(--color-gray-900)] mb-4">
              스레드
            </h1>
            <p className="text-body-1 text-[var(--color-gray-600)] max-w-2xl">
              AI 자동화, 노코드, 생산성 향상에 관한 인사이트를 확인하세요.
              실전 경험과 노하우를 트위터 스레드로 공유합니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-custom py-8 md:py-12">
        <Suspense fallback={<LoadingSkeletonGrid />}>
          <ThreadsContent />
        </Suspense>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-heading-1 md:text-display-3 font-bold text-white mb-4">
              최신 인사이트를 놓치지 마세요
            </h2>
            <p className="text-body-1 text-[var(--color-primary-100)] mb-6 max-w-2xl mx-auto">
              트위터에서 Carib을 팔로우하고 AI 자동화와 생산성 향상에 대한
              실시간 인사이트를 받아보세요.
            </p>
            <motion.a
              href="https://twitter.com/carib_team"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary-600)] font-medium rounded-xl hover:bg-[var(--color-primary-50)] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-5 h-5" />
              트위터 팔로우하기
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
