'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Heart,
  Repeat2,
  MessageCircle,
  ExternalLink,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Twitter,
  Linkedin,
  Link2,
  Check,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ThreadCard from '@/components/shared/ThreadCard';
import { Thread, ThreadCategory } from '@/types';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useAnalytics } from '@/hooks/useAnalytics';

// Category labels in Korean
const categoryLabels: Record<ThreadCategory, string> = {
  'ai-automation': 'AI 자동화',
  'no-code': '노코드',
  productivity: '생산성',
  'case-study': '사례 연구',
  tutorial: '튜토리얼',
  insight: '인사이트',
};

// Category descriptions
const categoryDescriptions: Record<ThreadCategory, string> = {
  'ai-automation': 'AI를 활용한 업무 자동화 관련 콘텐츠',
  'no-code': '코딩 없이 구현하는 솔루션',
  productivity: '생산성 향상을 위한 팁과 도구',
  'case-study': '실제 적용 사례와 결과 분석',
  tutorial: '단계별 가이드와 튜토리얼',
  insight: '업계 트렌드와 인사이트',
};

// Mock thread data
const mockThreads: Thread[] = [
  {
    id: '1',
    tweetId: '1234567890',
    authorName: 'Carib Team',
    authorHandle: 'carib_team',
    authorAvatar: '/images/avatars/carib.png',
    content: `ChatGPT로 업무 자동화하는 5가지 실전 방법을 알려드립니다.

1. 이메일 응답 자동화
매일 반복되는 고객 문의 이메일, ChatGPT가 대신 답변을 작성해드립니다.

2. 보고서 초안 작성
데이터만 입력하면 깔끔한 보고서 초안이 완성됩니다.

3. 미팅 노트 정리
회의 녹음 파일을 요약하고 액션 아이템을 추출합니다.

4. 콘텐츠 아이디어 생성
블로그, SNS 콘텐츠 아이디어를 무한대로 생성합니다.

5. 코드 리뷰 보조
개발팀의 코드 리뷰를 AI가 1차로 진행합니다.

실제로 이 방법들을 도입한 후 업무 시간이 40% 감소했습니다.`,
    summary:
      '매일 반복되는 이메일 응답, 보고서 작성, 데이터 정리... ChatGPT를 활용하면 이 모든 것을 자동화할 수 있습니다. 실제 사례와 함께 알려드립니다.',
    category: 'ai-automation',
    tags: ['ChatGPT', '업무자동화', 'AI', '생산성'],
    likeCount: 1234,
    retweetCount: 456,
    replyCount: 89,
    mediaUrls: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
      'https://images.unsplash.com/photo-1684163460310-e8f7c8d53c2c?w=800',
      'https://images.unsplash.com/photo-1686191128892-3b37add4b844?w=800',
    ],
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
    content: `Notion + Zapier로 만드는 자동화 시스템

노코드 도구만으로 고객 관리부터 프로젝트 진행까지 모든 것을 자동화한 방법을 공유합니다.

구현한 자동화:
- 새 고객 문의 -> Notion DB 자동 등록
- 계약 완료 -> 프로젝트 템플릿 자동 생성
- 일정 알림 -> Slack 자동 알림
- 결제 완료 -> 고객에게 자동 이메일 발송

총 10개의 워크플로우를 구축했고, 매주 약 15시간의 시간을 절약하고 있습니다.

코딩 지식이 전혀 없어도 가능합니다.`,
    summary:
      '노코드 도구만으로 고객 관리부터 프로젝트 진행까지 모든 것을 자동화한 방법을 공유합니다. 코딩 없이도 가능합니다.',
    category: 'no-code',
    tags: ['Notion', 'Zapier', '노코드', '자동화'],
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
    content: `하루 3시간 절약하는 AI 도구 조합

여러 AI 도구를 조합해서 사용하면 생산성이 극대화됩니다.

제가 매일 사용하는 도구 조합:

아침 루틴:
- Claude로 하루 계획 정리
- Notion AI로 전날 작업 요약

업무 중:
- GitHub Copilot으로 코딩
- Grammarly로 문서 검토
- Midjourney로 프레젠테이션 이미지

저녁:
- ChatGPT로 배운 것 정리
- Perplexity로 내일 리서치 준비

이 조합으로 매일 최소 3시간을 절약합니다.`,
    summary:
      '여러 AI 도구를 조합해서 사용하면 생산성이 극대화됩니다. 실제로 제가 매일 사용하는 도구 조합과 워크플로우를 공개합니다.',
    category: 'productivity',
    tags: ['AI도구', '생산성', '워크플로우'],
    likeCount: 2156,
    retweetCount: 678,
    replyCount: 134,
    mediaUrls: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    ],
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
    content: `스타트업 A사의 AI 도입 성공 사례

직원 10명의 스타트업이 AI를 도입해 매출 200% 성장을 달성했습니다.

문제 상황:
- 고객 응대에 하루 4시간 소요
- 데이터 분석 인력 부재
- 반복적인 마케팅 업무

도입한 솔루션:
- AI 챗봇으로 1차 고객 응대
- GPT-4 활용 데이터 분석 자동화
- 콘텐츠 생성 AI 도구 도입

결과:
- 고객 응대 시간 75% 감소
- 데이터 기반 의사결정 가능
- 콘텐츠 생산량 3배 증가
- 6개월 후 매출 200% 성장`,
    summary:
      '직원 10명의 스타트업이 AI를 도입해 매출 200% 성장을 달성한 실제 사례입니다. 어떤 문제를 어떻게 해결했는지 상세히 분석합니다.',
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
    content: `Make.com 완벽 가이드: 초보자부터 고급까지

Make.com(구 Integromat)을 처음 접하는 분들을 위한 단계별 가이드입니다.

1단계: 기초 이해
- Make.com이란?
- 모듈과 시나리오 개념
- 무료 플랜 활용법

2단계: 첫 자동화 만들기
- Gmail + Slack 연동
- Google Sheet 데이터 자동 수집
- 에러 핸들링 기초

3단계: 고급 기능
- 라우터와 필터 활용
- 변수와 함수 사용
- Webhook 연동

4단계: 실전 시나리오
- 리드 관리 자동화
- 결제 시스템 연동
- 고객 데이터 동기화`,
    summary:
      'Make.com(구 Integromat)을 처음 접하는 분들을 위한 단계별 가이드입니다. 기초부터 고급 시나리오 작성까지 모두 다룹니다.',
    category: 'tutorial',
    tags: ['Make.com', '튜토리얼', '자동화'],
    likeCount: 934,
    retweetCount: 312,
    replyCount: 67,
    mediaUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    ],
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
    content: `2025년 AI 트렌드 예측: 업무 환경의 변화

2025년 AI가 가져올 업무 환경의 변화를 예측합니다.

1. AI 에이전트의 부상
- 단순 챗봇을 넘어 실제 업무 수행
- 예약, 결제, 문서 작성까지 자동화

2. 멀티모달 AI 활용 확대
- 텍스트 + 이미지 + 영상 통합 분석
- 더 복잡한 업무 자동화 가능

3. 맞춤형 AI 도구 증가
- 산업별, 직무별 특화 AI
- 더 높은 정확도와 효율성

4. AI 리터러시의 필수화
- 프롬프트 엔지니어링이 기본 역량으로
- AI 활용 능력이 경쟁력의 핵심

지금부터 준비하세요!`,
    summary:
      '2025년 AI가 가져올 업무 환경의 변화를 예측합니다. 어떻게 준비해야 할지, 무엇을 배워야 할지 인사이트를 공유합니다.',
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
    content: `Claude AI로 코드 리뷰 자동화하기

개발팀의 코드 리뷰 프로세스를 Claude AI로 자동화한 경험을 공유합니다.

기존 문제:
- 시니어 개발자의 리뷰 시간 부족
- 리뷰 품질 불일치
- 피드백 지연

도입 방법:
1. GitHub Actions로 PR 감지
2. Claude API로 코드 분석
3. 자동 코멘트 생성

리뷰 항목:
- 코드 스타일 검사
- 버그 가능성 분석
- 성능 개선 제안
- 보안 취약점 체크

결과:
- 리뷰 시간 60% 감소
- 코드 품질 30% 향상
- 개발자 만족도 증가`,
    summary:
      '개발팀의 코드 리뷰 프로세스를 Claude AI로 자동화한 경험을 공유합니다. 품질은 올리고 시간은 줄인 방법입니다.',
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
    content: `Airtable + GPT API 연동 가이드

Airtable에 GPT API를 연동해서 자동으로 데이터를 분류하고 요약하는 시스템을 만드는 방법을 알려드립니다.

필요한 것:
- Airtable 계정
- OpenAI API 키
- Make.com 또는 Zapier

구현 단계:
1. Airtable 베이스 설정
2. OpenAI API 연결
3. 자동화 시나리오 작성
4. 테스트 및 배포

활용 예시:
- 고객 피드백 자동 분류
- 긴 문서 자동 요약
- 키워드 추출
- 감성 분석

코드 한 줄 없이 30분이면 완성!`,
    summary:
      'Airtable에 GPT API를 연동해서 자동으로 데이터를 분류하고 요약하는 시스템을 만드는 방법을 알려드립니다.',
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
    content: `AI 시대의 핵심 역량: 프롬프트 엔지니어링

AI를 잘 활용하는 사람과 그렇지 못한 사람의 차이는 프롬프트에 있습니다.

프롬프트 작성 핵심 원칙:

1. 명확한 역할 부여
"당신은 10년 경력의 마케터입니다"

2. 구체적인 맥락 제공
배경, 목적, 대상 청중 설명

3. 원하는 형식 지정
"글머리 기호로", "500자 이내로"

4. 예시 제공
원하는 결과의 예시를 보여주기

5. 제약 조건 명시
"전문 용어 사용 금지"

이 원칙만 지켜도 결과물 품질이 2배 이상 향상됩니다.

프롬프트 엔지니어링은 더 이상 선택이 아닌 필수입니다.`,
    summary:
      'AI를 잘 활용하는 사람과 그렇지 못한 사람의 차이는 프롬프트에 있습니다. 효과적인 프롬프트 작성법을 공유합니다.',
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

// Format number with K suffix for thousands
function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Format date
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Image Gallery Modal Component
function ImageGalleryModal({
  images,
  currentIndex,
  onClose,
  onPrevious,
  onNext,
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrevious, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Close gallery"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          width={1200}
          height={800}
          className="object-contain max-h-[90vh] rounded-lg"
        />
      </motion.div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </motion.div>
  );
}

// Share Dropdown Component
interface ShareDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  threadTitle: string;
  threadUrl: string;
}

function ShareDropdown({ isOpen, onClose, threadTitle, threadUrl }: ShareDropdownProps) {
  const [copied, setCopied] = useState(false);
  const { trackExternalLinkClick } = useAnalytics();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(threadUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = threadUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    }
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(threadTitle)}&url=${encodeURIComponent(threadUrl)}`;
    trackExternalLinkClick(twitterUrl, 'Twitter Share');
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    onClose();
  };

  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(threadUrl)}`;
    trackExternalLinkClick(linkedInUrl, 'LinkedIn Share');
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
    onClose();
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-56 bg-white rounded-xl shadow-lg border border-[var(--color-gray-200)] overflow-hidden"
          >
            <div className="p-2">
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-[var(--color-gray-50)] transition-colors"
              >
                <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                <span className="text-[var(--color-gray-700)]">Twitter에 공유</span>
              </button>
              <button
                onClick={shareToLinkedIn}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-[var(--color-gray-50)] transition-colors"
              >
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                <span className="text-[var(--color-gray-700)]">LinkedIn에 공유</span>
              </button>
              <div className="border-t border-[var(--color-gray-100)] my-1" />
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg hover:bg-[var(--color-gray-50)] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">복사됨!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 text-[var(--color-gray-500)]" />
                    <span className="text-[var(--color-gray-700)]">링크 복사</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Thread Navigation Component
interface ThreadNavigationProps {
  previousThread: Thread | null;
  nextThread: Thread | null;
}

function ThreadNavigation({ previousThread, nextThread }: ThreadNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-4 md:p-6"
    >
      <h3 className="text-caption font-semibold text-[var(--color-gray-500)] uppercase tracking-wider mb-4">
        스레드 네비게이션
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Thread */}
        <div className={cn(!previousThread && 'opacity-50 pointer-events-none')}>
          {previousThread ? (
            <Link href={`/threads/${previousThread.id}`}>
              <motion.div
                whileHover={{ x: -4 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 mt-0.5 text-[var(--color-gray-400)] group-hover:text-[var(--color-primary-600)] transition-colors flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-caption text-[var(--color-gray-500)]">이전 스레드</span>
                  <p className="text-body-2 font-medium text-[var(--color-gray-800)] line-clamp-2 mt-1">
                    {previousThread.content.split('\n')[0].slice(0, 50)}...
                  </p>
                  <Badge variant={previousThread.category} size="sm" className="mt-2">
                    {categoryLabels[previousThread.category]}
                  </Badge>
                </div>
              </motion.div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-gray-50)]">
              <ChevronLeft className="w-5 h-5 text-[var(--color-gray-300)] flex-shrink-0" />
              <span className="text-body-2 text-[var(--color-gray-400)]">이전 스레드가 없습니다</span>
            </div>
          )}
        </div>

        {/* Next Thread */}
        <div className={cn(!nextThread && 'opacity-50 pointer-events-none')}>
          {nextThread ? (
            <Link href={`/threads/${nextThread.id}`}>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors group text-right"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-caption text-[var(--color-gray-500)]">다음 스레드</span>
                  <p className="text-body-2 font-medium text-[var(--color-gray-800)] line-clamp-2 mt-1">
                    {nextThread.content.split('\n')[0].slice(0, 50)}...
                  </p>
                  <Badge variant={nextThread.category} size="sm" className="mt-2">
                    {categoryLabels[nextThread.category]}
                  </Badge>
                </div>
                <ChevronRight className="w-5 h-5 mt-0.5 text-[var(--color-gray-400)] group-hover:text-[var(--color-primary-600)] transition-colors flex-shrink-0" />
              </motion.div>
            </Link>
          ) : (
            <div className="flex items-center justify-end gap-3 p-4 rounded-xl bg-[var(--color-gray-50)]">
              <span className="text-body-2 text-[var(--color-gray-400)]">다음 스레드가 없습니다</span>
              <ChevronRight className="w-5 h-5 text-[var(--color-gray-300)] flex-shrink-0" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ThreadDetailProps {
  threadId: string;
}

// Thread Detail Component
export default function ThreadDetail({ threadId }: ThreadDetailProps) {
  const router = useRouter();
  const { trackThreadView, trackExternalLinkClick } = useAnalytics();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);

  // Find the current thread
  const thread = useMemo(() => {
    return mockThreads.find((t) => t.id === threadId) || null;
  }, [threadId]);

  // Find current thread index for navigation
  const currentIndex = useMemo(() => {
    return mockThreads.findIndex((t) => t.id === threadId);
  }, [threadId]);

  // Get previous and next threads
  const previousThread = useMemo(() => {
    if (currentIndex <= 0) return null;
    return mockThreads[currentIndex - 1];
  }, [currentIndex]);

  const nextThread = useMemo(() => {
    if (currentIndex < 0 || currentIndex >= mockThreads.length - 1) return null;
    return mockThreads[currentIndex + 1];
  }, [currentIndex]);

  // Track thread view on mount
  useEffect(() => {
    if (thread) {
      trackThreadView(thread.id, thread.content.slice(0, 100));
    }
  }, [thread, trackThreadView]);

  // Get related threads (same category OR similar tags, excluding current)
  const relatedThreads = useMemo(() => {
    if (!thread) return [];

    // Score threads by relevance
    const scoredThreads = mockThreads
      .filter((t) => t.id !== thread.id)
      .map((t) => {
        let score = 0;

        // Same category = 10 points
        if (t.category === thread.category) {
          score += 10;
        }

        // Shared tags = 3 points each
        const sharedTags = t.tags.filter(tag => thread.tags.includes(tag));
        score += sharedTags.length * 3;

        // Featured threads get a small boost
        if (t.featured) {
          score += 2;
        }

        return { thread: t, score };
      })
      .filter(({ score }) => score > 0) // Only include related threads
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ thread }) => thread);

    // If not enough related threads, fill with recent threads
    if (scoredThreads.length < 3) {
      const remaining = mockThreads
        .filter((t) => t.id !== thread.id && !scoredThreads.some(st => st.id === t.id))
        .slice(0, 3 - scoredThreads.length);
      return [...scoredThreads, ...remaining];
    }

    return scoredThreads;
  }, [thread]);

  // Gallery navigation
  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = useCallback(() => {
    setGalleryOpen(false);
  }, []);

  const previousImage = useCallback(() => {
    if (!thread?.mediaUrls) return;
    setGalleryIndex((prev) =>
      prev === 0 ? thread.mediaUrls!.length - 1 : prev - 1
    );
  }, [thread?.mediaUrls]);

  const nextImage = useCallback(() => {
    if (!thread?.mediaUrls) return;
    setGalleryIndex((prev) =>
      prev === thread.mediaUrls!.length - 1 ? 0 : prev + 1
    );
  }, [thread?.mediaUrls]);

  // Handle native share API
  const handleNativeShare = async () => {
    if (!thread) return;

    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: thread.content.slice(0, 100),
          text: thread.summary,
          url,
        });
      } catch {
        // User cancelled or error - fallback to dropdown
        setShareDropdownOpen(true);
      }
    } else {
      // Fallback: show dropdown
      setShareDropdownOpen(true);
    }
  };

  // Not found state
  if (!thread) {
    return (
      <div className="min-h-screen bg-[var(--color-gray-50)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-gray-100)] flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-[var(--color-gray-400)]" />
          </div>
          <h1 className="text-heading-2 font-bold text-[var(--color-gray-900)] mb-3">
            스레드를 찾을 수 없습니다
          </h1>
          <p className="text-body-1 text-[var(--color-gray-600)] mb-6">
            요청하신 스레드가 존재하지 않거나 삭제되었습니다.
          </p>
          <Button variant="primary" onClick={() => router.push('/threads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            스레드 목록으로
          </Button>
        </motion.div>
      </div>
    );
  }

  const twitterUrl = `https://twitter.com/${thread.authorHandle}/status/${thread.tweetId}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://carib.co.kr/threads/${thread.id}`;

  return (
    <>
      <div className="min-h-screen bg-[var(--color-gray-50)]">
        {/* Back Navigation */}
        <div className="bg-white border-b border-[var(--color-gray-200)] sticky top-0 z-40">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-[var(--color-gray-600)] hover:text-[var(--color-gray-900)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">뒤로가기</span>
              </motion.button>

              {/* Quick Navigation */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                {previousThread && (
                  <Link href={`/threads/${previousThread.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:bg-[var(--color-gray-200)] transition-colors"
                      aria-label="Previous thread"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                  </Link>
                )}
                {nextThread && (
                  <Link href={`/threads/${nextThread.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:bg-[var(--color-gray-200)] transition-colors"
                      aria-label="Next thread"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <article className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Author Info */}
              <motion.div
                variants={staggerItem}
                className="flex items-center justify-between gap-4 mb-6"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-14 h-14 rounded-full overflow-hidden bg-[var(--color-gray-100)] flex-shrink-0"
                  >
                    <Image
                      src={thread.authorAvatar}
                      alt={thread.authorName}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-lg text-[var(--color-gray-900)]">
                      {thread.authorName}
                    </h2>
                    <a
                      href={`https://twitter.com/${thread.authorHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
                    >
                      @{thread.authorHandle}
                    </a>
                  </div>
                </div>

                {/* Share & External Link */}
                <div className="flex items-center gap-2 relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNativeShare}
                    className="p-2.5 rounded-full bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] text-[var(--color-gray-600)] transition-colors"
                    aria-label="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                  <ShareDropdown
                    isOpen={shareDropdownOpen}
                    onClose={() => setShareDropdownOpen(false)}
                    threadTitle={thread.content.slice(0, 100)}
                    threadUrl={currentUrl}
                  />
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white transition-colors"
                    aria-label="View on Twitter"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.a>
                </div>
              </motion.div>

              {/* Category Badge */}
              <motion.div variants={staggerItem} className="mb-6">
                <Link href={`/threads?category=${thread.category}`}>
                  <Badge
                    variant={thread.category}
                    size="lg"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {categoryLabels[thread.category]}
                  </Badge>
                </Link>
                <p className="text-caption text-[var(--color-gray-500)] mt-2">
                  {categoryDescriptions[thread.category]}
                </p>
              </motion.div>

              {/* Thread Content */}
              <motion.div
                variants={staggerItem}
                className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6 md:p-8 mb-6"
              >
                <div className="prose prose-lg max-w-none">
                  <p className="text-[var(--color-gray-800)] text-lg leading-relaxed whitespace-pre-wrap">
                    {thread.content}
                  </p>
                </div>

                {/* Tags */}
                {thread.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[var(--color-gray-100)]">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-[var(--color-gray-400)]" />
                      <span className="text-caption text-[var(--color-gray-500)]">태그</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {thread.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/threads?search=${encodeURIComponent(tag)}`}
                          className="group"
                        >
                          <span className="inline-flex items-center px-3 py-1.5 bg-[var(--color-gray-100)] text-[var(--color-gray-600)] text-sm rounded-full group-hover:bg-[var(--color-primary-50)] group-hover:text-[var(--color-primary-600)] transition-colors">
                            #{tag}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Image Gallery */}
              {thread.mediaUrls && thread.mediaUrls.length > 0 && (
                <motion.div variants={staggerItem} className="mb-6">
                  <h3 className="text-heading-4 font-semibold text-[var(--color-gray-900)] mb-4">
                    이미지
                  </h3>
                  <div
                    className={cn(
                      'grid gap-3',
                      thread.mediaUrls.length === 1
                        ? 'grid-cols-1'
                        : thread.mediaUrls.length === 2
                        ? 'grid-cols-2'
                        : 'grid-cols-2 md:grid-cols-3'
                    )}
                  >
                    {thread.mediaUrls.map((url, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openGallery(index)}
                        className="relative aspect-video rounded-xl overflow-hidden bg-[var(--color-gray-100)] group"
                      >
                        <Image
                          src={url}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">
                            확대 보기
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Engagement Stats */}
              <motion.div
                variants={staggerItem}
                className="bg-white rounded-2xl border border-[var(--color-gray-200)] p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[var(--color-gray-600)]">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span className="font-semibold">
                        {formatCount(thread.likeCount)}
                      </span>
                      <span className="text-[var(--color-gray-500)]">
                        좋아요
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--color-gray-600)]">
                      <Repeat2 className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">
                        {formatCount(thread.retweetCount)}
                      </span>
                      <span className="text-[var(--color-gray-500)]">
                        리포스트
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--color-gray-600)]">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">
                        {formatCount(thread.replyCount)}
                      </span>
                      <span className="text-[var(--color-gray-500)]">댓글</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-[var(--color-gray-500)]">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(thread.publishedAt)}</span>
                  </div>
                </div>

                {/* SNS Share Buttons */}
                <div className="mt-6 pt-6 border-t border-[var(--color-gray-100)]">
                  <p className="text-caption text-[var(--color-gray-500)] mb-3">공유하기</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(thread.content.slice(0, 100) + '...')}&url=${encodeURIComponent(currentUrl)}`;
                        trackExternalLinkClick(twitterShareUrl, 'Twitter Share Button');
                        window.open(twitterShareUrl, '_blank', 'width=550,height=420');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      <span className="text-sm font-medium">Twitter</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
                        trackExternalLinkClick(linkedInShareUrl, 'LinkedIn Share Button');
                        window.open(linkedInShareUrl, '_blank', 'width=550,height=420');
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#095196] transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(currentUrl);
                          // Could add a toast notification here
                        } catch {
                          // Fallback
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-gray-200)] text-[var(--color-gray-700)] rounded-lg hover:bg-[var(--color-gray-300)] transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                      <span className="text-sm font-medium">링크 복사</span>
                    </motion.button>
                  </div>
                </div>

                {/* Original Link Button */}
                <div className="mt-6 pt-6 border-t border-[var(--color-gray-100)]">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      trackExternalLinkClick(twitterUrl, 'View on Twitter');
                      window.open(twitterUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    트위터에서 원본 보기
                  </Button>
                </div>
              </motion.div>

              {/* Thread Navigation */}
              <motion.div variants={staggerItem} className="mt-6">
                <ThreadNavigation
                  previousThread={previousThread}
                  nextThread={nextThread}
                />
              </motion.div>
            </motion.div>
          </div>
        </article>

        {/* Related Threads */}
        {relatedThreads.length > 0 && (
          <section className="bg-white border-t border-[var(--color-gray-200)] py-12">
            <div className="container-custom">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
              >
                <h2 className="text-heading-2 font-bold text-[var(--color-gray-900)] mb-2">
                  관련 스레드
                </h2>
                <p className="text-body-1 text-[var(--color-gray-600)] mb-8">
                  비슷한 주제의 다른 콘텐츠를 확인해보세요.
                </p>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {relatedThreads.map((relatedThread) => (
                    <motion.div key={relatedThread.id} variants={staggerItem}>
                      <ThreadCard thread={relatedThread} linkToDetail />
                    </motion.div>
                  ))}
                </motion.div>

                {/* View All Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 text-center"
                >
                  <Link href={`/threads?category=${thread.category}`}>
                    <Button variant="secondary">
                      {categoryLabels[thread.category]} 더 보기
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] py-16">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-heading-1 md:text-display-3 font-bold text-white mb-4">
                더 많은 인사이트를 원하시나요?
              </h2>
              <p className="text-body-1 text-[var(--color-primary-100)] mb-6">
                트위터에서 Carib을 팔로우하고 AI 자동화와 생산성 향상에 대한
                실시간 인사이트를 받아보세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="https://twitter.com/carib_team"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary-600)] font-medium rounded-xl hover:bg-[var(--color-primary-50)] transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  트위터 팔로우하기
                </motion.a>
                <Link href="/threads">
                  <motion.span
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    모든 스레드 보기
                  </motion.span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {galleryOpen && thread.mediaUrls && (
          <ImageGalleryModal
            images={thread.mediaUrls}
            currentIndex={galleryIndex}
            onClose={closeGallery}
            onPrevious={previousImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </>
  );
}
