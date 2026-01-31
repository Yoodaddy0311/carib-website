'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { Thread, ThreadCategory } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface ThreadCardProps {
  thread: Thread;
  className?: string;
  /** If true, links to internal detail page instead of Twitter */
  linkToDetail?: boolean;
}

// Category labels in Korean
const categoryLabels: Record<ThreadCategory, string> = {
  'ai-automation': 'AI 자동화',
  'no-code': '노코드',
  'productivity': '생산성',
  'case-study': '사례 연구',
  'tutorial': '튜토리얼',
  'insight': '인사이트',
};

// Format number with K suffix for thousands
function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
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

export function ThreadCard({ thread, className, linkToDetail = false }: ThreadCardProps) {
  const twitterUrl = `https://twitter.com/${thread.authorHandle}/status/${thread.tweetId}`;
  const detailUrl = `/threads/${thread.id}`;

  const cardClassName = cn(
    'block bg-white rounded-3xl border border-[#e8eaed] p-5 transition-all duration-200',
    'hover:border-[#dadce0] hover:shadow-[0_2px_6px_rgba(60,64,67,0.15)]',
    'min-w-[300px] md:min-w-0',
    className
  );

  const CardContent = () => (
    <>
      {/* Author Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#f1f3f4] flex-shrink-0">
            <Image
              src={thread.authorAvatar}
              alt={thread.authorName}
              width={40}
              height={40}
              className="object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#202124] truncate">
              {thread.authorName}
            </p>
            <p className="text-sm text-[#5f6368] truncate">
              @{thread.authorHandle}
            </p>
          </div>
        </div>
        <Badge variant={thread.category} size="sm">
          {categoryLabels[thread.category]}
        </Badge>
      </div>

      {/* Content Preview */}
      <p className="text-[#5f6368] text-sm line-clamp-3 mb-4 leading-relaxed">
        {thread.summary || thread.content}
      </p>

      {/* Engagement Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e8eaed]">
        <div className="flex items-center gap-4 text-sm text-[#9aa0a6]">
          {/* Likes */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{formatCount(thread.likeCount)}</span>
          </div>

          {/* Retweets */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{formatCount(thread.retweetCount)}</span>
          </div>

          {/* Replies */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{formatCount(thread.replyCount)}</span>
          </div>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-[#9aa0a6]">
          {formatRelativeTime(thread.publishedAt)}
        </span>
      </div>

      {/* External link indicator */}
      {!linkToDetail && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-4 h-4 text-[#9aa0a6]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      )}
    </>
  );

  // Render as internal Link or external anchor based on linkToDetail prop
  if (linkToDetail) {
    return (
      <Link href={detailUrl} className={cardClassName}>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <CardContent />
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.a
      href={twitterUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClassName}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <CardContent />
    </motion.a>
  );
}

// Skeleton loader for ThreadCard - Google Labs Style
export function ThreadCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-[#e8eaed] p-5 min-w-[300px] md:min-w-0 animate-pulse">
      {/* Author skeleton */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e8eaed]" />
          <div>
            <div className="w-24 h-4 bg-[#e8eaed] rounded mb-1" />
            <div className="w-16 h-3 bg-[#e8eaed] rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-[#e8eaed] rounded-full" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 mb-4">
        <div className="w-full h-4 bg-[#e8eaed] rounded" />
        <div className="w-full h-4 bg-[#e8eaed] rounded" />
        <div className="w-3/4 h-4 bg-[#e8eaed] rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-[#e8eaed]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-4 bg-[#e8eaed] rounded" />
          <div className="w-12 h-4 bg-[#e8eaed] rounded" />
          <div className="w-12 h-4 bg-[#e8eaed] rounded" />
        </div>
        <div className="w-16 h-3 bg-[#e8eaed] rounded" />
      </div>
    </div>
  );
}

export default ThreadCard;
