/**
 * Seed Data for Carib Platform
 *
 * This file contains sample data for seeding Firestore collections:
 * - threads: 10 AI automation related Twitter threads
 * - team: 4 team members with sea creature/shark theme names
 * - faq: 6 frequently asked questions about AI automation
 */

import { Timestamp } from 'firebase/firestore';
import type { ThreadCategory } from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SeedThread {
  tweetId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  summary: string;
  category: ThreadCategory;
  tags: string[];
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  publishedAt: Date;
  syncedAt: Date;
  featured: boolean;
  published: boolean;
}

export interface SeedTeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  order: number;
}

export interface SeedFAQ {
  question: string;
  answer: string;
  category: string;
  order: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// ============================================================================
// Threads Collection (10 items)
// ============================================================================

export const seedThreads: SeedThread[] = [
  {
    tweetId: '1234567890123456789',
    authorName: '김자동화',
    authorHandle: 'automation_kim',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=automation_kim',
    content: `AI 자동화로 업무 시간을 80% 단축한 방법을 공유합니다.

1/ 반복적인 데이터 입력 작업을 GPT API와 연동하여 자동화했습니다. 기존에 하루 4시간 걸리던 작업이 30분으로 줄었습니다.

2/ 이메일 응답도 AI가 초안을 작성하고, 사람은 검토만 합니다. 응답 시간이 평균 2시간에서 15분으로 단축됐습니다.

3/ 보고서 작성도 자동화했습니다. 데이터 수집부터 시각화까지 전부 자동으로 처리됩니다.

4/ 중요한 건 완전 자동화가 아니라 '인간 검토'를 포함한 하이브리드 방식이라는 점입니다.

5/ 결과적으로 팀 전체의 생산성이 3배 이상 향상되었습니다. AI는 도구일 뿐, 핵심은 올바른 프로세스 설계입니다.`,
    summary: 'AI 자동화로 업무 시간 80% 단축: 데이터 입력, 이메일 응답, 보고서 작성을 자동화하고 인간 검토를 포함한 하이브리드 방식으로 생산성 3배 향상',
    category: 'ai-automation',
    tags: ['AI자동화', '생산성', 'GPT', '업무효율'],
    likeCount: 1523,
    retweetCount: 342,
    replyCount: 89,
    publishedAt: daysAgo(3),
    syncedAt: daysAgo(0),
    featured: true,
    published: true,
  },
  {
    tweetId: '1234567890123456790',
    authorName: '노코드마스터',
    authorHandle: 'nocode_master_kr',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nocode_master',
    content: `노코드로 SaaS를 만들어 월 500만원 수익을 달성한 이야기입니다.

1/ Bubble.io와 Zapier만으로 완전한 CRM 시스템을 구축했습니다. 개발 비용 0원.

2/ 처음에는 작은 기능부터 시작했습니다. MVP는 2주 만에 완성했고, 첫 유료 고객은 한 달 만에 확보했습니다.

3/ 가장 중요한 건 고객 피드백입니다. 매주 고객과 통화하고 필요한 기능을 바로 추가했습니다.

4/ 노코드의 한계? 분명히 있습니다. 하지만 90%의 비즈니스 로직은 충분히 구현 가능합니다.

5/ 수익 구조: 월 구독료 5만원 x 100명 = 500만원. 운영비는 월 30만원 정도입니다.`,
    summary: '노코드 도구(Bubble.io, Zapier)로 CRM SaaS를 구축하여 월 500만원 수익 달성. MVP 2주 개발, 고객 피드백 기반 성장 전략 공유',
    category: 'no-code',
    tags: ['노코드', 'SaaS', 'Bubble', '창업'],
    likeCount: 2341,
    retweetCount: 567,
    replyCount: 156,
    publishedAt: daysAgo(7),
    syncedAt: daysAgo(0),
    featured: true,
    published: true,
  },
  {
    tweetId: '1234567890123456791',
    authorName: 'AI튜토리얼',
    authorHandle: 'ai_tutorial_kr',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai_tutorial',
    content: `ChatGPT API를 활용한 고객 서비스 봇 만들기 튜토리얼입니다.

1/ 먼저 OpenAI API 키를 발급받습니다. https://platform.openai.com에서 가입 후 API 키를 생성하세요.

2/ 프롬프트 엔지니어링이 핵심입니다. 회사 정보와 FAQ를 시스템 프롬프트에 포함시켜 맥락을 제공합니다.

3/ 대화 히스토리를 관리하세요. 이전 대화를 기억해야 자연스러운 대화가 가능합니다.

4/ 에러 처리와 폴백을 반드시 구현하세요. API 오류 시 사람에게 연결되도록 합니다.

5/ 비용 관리도 중요합니다. 토큰 사용량을 모니터링하고, 필요시 응답 길이를 제한하세요.`,
    summary: 'ChatGPT API를 활용한 고객 서비스 봇 구축 가이드: API 설정, 프롬프트 엔지니어링, 대화 관리, 에러 처리, 비용 관리 방법 설명',
    category: 'tutorial',
    tags: ['ChatGPT', 'API', '튜토리얼', '챗봇'],
    likeCount: 987,
    retweetCount: 234,
    replyCount: 67,
    publishedAt: daysAgo(14),
    syncedAt: daysAgo(1),
    featured: false,
    published: true,
  },
  {
    tweetId: '1234567890123456792',
    authorName: '스타트업CEO',
    authorHandle: 'startup_ceo_ai',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=startup_ceo',
    content: `우리 스타트업이 AI로 인건비를 50% 절감한 실제 케이스입니다.

1/ 5명이서 하던 데이터 라벨링 작업을 AI가 1차 처리하고, 1명이 검수하는 방식으로 바꿨습니다.

2/ 고객 문의 중 70%는 AI 챗봇이 처리합니다. 복잡한 문의만 상담원에게 전달됩니다.

3/ 마케팅 콘텐츠 초안도 AI가 작성합니다. 마케터는 최종 편집과 전략에 집중합니다.

4/ 중요한 점: 해고가 아니라 업무 재배치입니다. 절감된 인력은 더 가치 있는 일에 투입됩니다.

5/ AI 도입 후 매출은 오히려 30% 증가했습니다. 효율성 향상이 성장으로 이어진 거죠.`,
    summary: '스타트업의 AI 도입 사례: 데이터 라벨링, 고객 문의, 마케팅 콘텐츠 작업에 AI를 활용하여 인건비 50% 절감, 매출 30% 증가 달성',
    category: 'case-study',
    tags: ['케이스스터디', '스타트업', '비용절감', 'AI도입'],
    likeCount: 1876,
    retweetCount: 423,
    replyCount: 112,
    publishedAt: daysAgo(21),
    syncedAt: daysAgo(2),
    featured: true,
    published: true,
  },
  {
    tweetId: '1234567890123456793',
    authorName: 'AI인사이트',
    authorHandle: 'ai_insight_kr',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai_insight',
    content: `2024년 AI 자동화 트렌드와 앞으로의 전망입니다.

1/ 멀티모달 AI의 시대가 왔습니다. 텍스트뿐 아니라 이미지, 음성, 영상까지 통합 처리가 가능해졌습니다.

2/ AI 에이전트가 주목받고 있습니다. 단순 응답이 아니라 스스로 계획하고 실행하는 AI가 등장했습니다.

3/ 로컬 AI의 성장도 눈여겨봐야 합니다. 개인 PC에서 돌아가는 AI 모델이 점점 강력해지고 있습니다.

4/ 규제와 윤리 이슈도 중요해졌습니다. EU AI Act 등 법적 규제에 대비해야 합니다.

5/ 결론: AI는 선택이 아닌 필수가 됐습니다. 지금 시작하지 않으면 경쟁에서 뒤처질 수 있습니다.`,
    summary: '2024년 AI 트렌드 분석: 멀티모달 AI, AI 에이전트, 로컬 AI 성장, 규제 이슈를 다루며 AI 도입의 필요성 강조',
    category: 'insight',
    tags: ['AI트렌드', '2024', '멀티모달', 'AI에이전트'],
    likeCount: 2156,
    retweetCount: 534,
    replyCount: 98,
    publishedAt: daysAgo(5),
    syncedAt: daysAgo(0),
    featured: false,
    published: true,
  },
  {
    tweetId: '1234567890123456794',
    authorName: '생산성해커',
    authorHandle: 'productivity_hacker',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=productivity_hacker',
    content: `AI 도구로 일하는 시간을 절반으로 줄이는 워크플로우를 공개합니다.

1/ 아침 루틴: Notion AI로 오늘의 할 일 정리. AI가 우선순위를 자동으로 제안해줍니다.

2/ 미팅 정리: Otter.ai로 회의 녹음 후 자동 요약. 회의록 작성 시간 90% 절감.

3/ 이메일 관리: Superhuman + AI 기능으로 이메일 응답 시간 75% 단축.

4/ 리서치: Perplexity AI로 빠른 정보 검색. 구글링보다 3배 빠릅니다.

5/ 문서 작성: Claude나 GPT로 초안 작성 후 수정. 작성 시간 60% 절감.`,
    summary: 'AI 도구를 활용한 생산성 향상 워크플로우: Notion AI, Otter.ai, Superhuman, Perplexity AI 등을 활용해 업무 시간 50% 절감',
    category: 'productivity',
    tags: ['생산성', 'AI도구', '워크플로우', '시간관리'],
    likeCount: 3421,
    retweetCount: 892,
    replyCount: 234,
    publishedAt: daysAgo(10),
    syncedAt: daysAgo(0),
    featured: true,
    published: true,
  },
  {
    tweetId: '1234567890123456795',
    authorName: '마케팅AI',
    authorHandle: 'marketing_ai_kr',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marketing_ai',
    content: `AI로 마케팅 콘텐츠 제작을 자동화한 결과를 공유합니다.

1/ 블로그 포스트: GPT-4로 초안 작성 후 인간이 편집. 제작 시간 70% 단축.

2/ SNS 콘텐츠: AI가 10개 버전 생성, 그 중 최고를 선택. A/B 테스트도 자동화.

3/ 이미지 제작: Midjourney + Canva로 디자인. 디자이너 외주 비용 80% 절감.

4/ 광고 카피: AI가 100개 카피 생성, 성과 기반으로 최적화. CTR 40% 향상.

5/ 주의점: AI 콘텐츠는 반드시 인간의 검토가 필요합니다. 브랜드 톤 유지가 핵심.`,
    summary: 'AI를 활용한 마케팅 콘텐츠 자동화: 블로그, SNS, 이미지, 광고 카피 제작을 AI로 효율화하여 비용과 시간 대폭 절감',
    category: 'case-study',
    tags: ['마케팅', 'AI콘텐츠', '자동화', 'GPT-4'],
    likeCount: 1654,
    retweetCount: 398,
    replyCount: 87,
    publishedAt: daysAgo(12),
    syncedAt: daysAgo(1),
    featured: false,
    published: true,
  },
  {
    tweetId: '1234567890123456796',
    authorName: '개발자민수',
    authorHandle: 'dev_minsu',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dev_minsu',
    content: `GitHub Copilot으로 개발 생산성 2배 올린 경험을 공유합니다.

1/ 보일러플레이트 코드 작성 시간 90% 절감. 반복적인 코드는 AI가 자동 완성.

2/ 테스트 코드 작성이 훨씬 쉬워졌습니다. 함수만 작성하면 테스트는 AI가 제안.

3/ 문서화도 간편해졌습니다. 주석과 README를 AI가 자동 생성해줍니다.

4/ 새로운 언어/프레임워크 학습 시간 단축. AI가 문법과 패턴을 즉시 알려줍니다.

5/ 단, AI 코드를 맹신하면 안 됩니다. 반드시 리뷰하고 테스트하세요.`,
    summary: 'GitHub Copilot을 활용한 개발 생산성 향상: 보일러플레이트, 테스트, 문서화 자동화로 개발 속도 2배 향상',
    category: 'tutorial',
    tags: ['개발', 'Copilot', 'AI코딩', 'GitHub'],
    likeCount: 2876,
    retweetCount: 654,
    replyCount: 189,
    publishedAt: daysAgo(8),
    syncedAt: daysAgo(0),
    featured: true,
    published: true,
  },
  {
    tweetId: '1234567890123456797',
    authorName: 'AI컨설턴트',
    authorHandle: 'ai_consultant_kr',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai_consultant',
    content: `기업에서 AI 도입 시 흔히 하는 실수 5가지입니다.

1/ 기술부터 도입하려 함. 문제 정의 없이 AI를 도입하면 실패합니다. 먼저 해결할 문제를 명확히.

2/ ROI 측정 무시. AI 프로젝트도 비용-효과 분석이 필수입니다. 성공 지표를 미리 정의하세요.

3/ 데이터 품질 무시. 쓰레기가 들어가면 쓰레기가 나옵니다. 데이터 정제가 80%입니다.

4/ 직원 교육 부재. 도구만 도입하면 끝? 사용법을 가르쳐야 실제 효과가 납니다.

5/ 한 번에 다 바꾸려 함. 작은 파일럿부터 시작하세요. 실패해도 배움이 됩니다.`,
    summary: '기업 AI 도입 시 주의사항: 문제 정의, ROI 측정, 데이터 품질, 직원 교육, 점진적 도입의 중요성 강조',
    category: 'insight',
    tags: ['AI도입', '컨설팅', '기업', '실수방지'],
    likeCount: 1432,
    retweetCount: 312,
    replyCount: 76,
    publishedAt: daysAgo(15),
    syncedAt: daysAgo(2),
    featured: false,
    published: true,
  },
  {
    tweetId: '1234567890123456798',
    authorName: '자동화마스터',
    authorHandle: 'automation_master',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=automation_master',
    content: `Make(구 Integromat)로 업무 자동화 100개 만든 경험담입니다.

1/ 가장 효과적인 자동화: 견적서 요청 → 자동 견적 생성 → 이메일 발송. 영업팀 시간 50% 절감.

2/ 고객 문의 자동 분류: 문의 내용을 AI가 분석해서 담당자에게 자동 배정.

3/ SNS 포스팅 자동화: 하나 작성하면 모든 채널에 자동 발행. 최적 시간대도 자동 선정.

4/ 리포트 자동 생성: 매주 월요일 아침, 지난 주 실적 리포트가 자동으로 생성됩니다.

5/ 시작하기: 먼저 반복 작업을 목록화하세요. 가장 시간 많이 드는 것부터 자동화.`,
    summary: 'Make를 활용한 업무 자동화 사례 100개 중 핵심 사례: 견적서, 문의 분류, SNS, 리포트 자동화로 대폭적인 시간 절감',
    category: 'no-code',
    tags: ['Make', '자동화', '노코드', '워크플로우'],
    likeCount: 1987,
    retweetCount: 445,
    replyCount: 134,
    publishedAt: daysAgo(6),
    syncedAt: daysAgo(0),
    featured: true,
    published: true,
  },
];

// ============================================================================
// Team Collection (4 members with sea creature/shark theme Korean names)
// ============================================================================

export const seedTeamMembers: SeedTeamMember[] = [
  {
    name: '백상어 (김민준)',
    role: 'CEO & Founder',
    bio: 'AI 자동화 분야에서 10년 이상의 경험을 보유한 전문가입니다. 대기업 IT 컨설팅을 거쳐 Carib을 창업했으며, "모든 비즈니스에 AI의 힘을"이라는 비전을 가지고 있습니다.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=white-shark&backgroundColor=b6e3f4',
    social: {
      twitter: 'carib_shark',
      linkedin: 'minjun-kim-carib',
      github: 'shark-ceo',
    },
    order: 1,
  },
  {
    name: '청상어 (이서연)',
    role: 'CTO',
    bio: '풀스택 개발자 출신으로 AI/ML 엔지니어링에 특화되어 있습니다. 카이스트 AI 석사 출신이며, 복잡한 기술을 쉽게 설명하는 능력으로 팀 내에서 인정받고 있습니다.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=blue-shark&backgroundColor=c0aede',
    social: {
      twitter: 'seoyeon_dev',
      linkedin: 'seoyeon-lee-tech',
      github: 'blue-shark-dev',
    },
    order: 2,
  },
  {
    name: '귀상어 (박지훈)',
    role: 'Head of Product',
    bio: '사용자 경험 디자인과 제품 전략 전문가입니다. 네이버, 카카오에서 PM으로 활동했으며, 고객 중심의 제품 개발 철학을 Carib에 적용하고 있습니다.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hammerhead&backgroundColor=ffd5dc',
    social: {
      twitter: 'jihoon_product',
      linkedin: 'jihoon-park-pm',
    },
    order: 3,
  },
  {
    name: '고래상어 (최수아)',
    role: 'Head of Marketing',
    bio: '디지털 마케팅과 그로스 해킹 전문가입니다. B2B SaaS 마케팅 경력 7년, 콘텐츠 마케팅을 통해 Carib의 브랜드 인지도를 구축하고 있습니다.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=whale-shark&backgroundColor=ffdfbf',
    social: {
      twitter: 'sua_growth',
      linkedin: 'sua-choi-marketing',
      github: 'whale-shark-mkt',
    },
    order: 4,
  },
];

// ============================================================================
// FAQ Collection (6 items in Korean)
// ============================================================================

export const seedFAQs: SeedFAQ[] = [
  {
    question: 'AI 자동화 서비스란 무엇인가요?',
    answer: 'AI 자동화 서비스는 인공지능 기술을 활용하여 반복적이고 시간 소모적인 업무를 자동화하는 솔루션입니다. 데이터 입력, 문서 처리, 고객 응대, 보고서 생성 등 다양한 업무에 적용할 수 있으며, 기존 업무 프로세스에 AI를 통합하여 생산성을 크게 향상시킵니다.',
    category: '서비스 소개',
    order: 1,
  },
  {
    question: '어떤 업종에서 AI 자동화를 활용할 수 있나요?',
    answer: '거의 모든 업종에서 AI 자동화를 활용할 수 있습니다. 특히 이커머스(주문 처리, 고객 문의), 금융(문서 검토, 리스크 분석), 제조(품질 검사, 재고 관리), 의료(예약 관리, 문서 정리), 마케팅(콘텐츠 생성, 데이터 분석) 분야에서 높은 효과를 보이고 있습니다.',
    category: '서비스 소개',
    order: 2,
  },
  {
    question: '도입 비용은 어떻게 되나요?',
    answer: '프로젝트 규모와 복잡도에 따라 비용이 달라집니다. 기본적인 자동화 솔루션은 월 50만원부터 시작하며, 맞춤형 엔터프라이즈 솔루션은 별도 상담이 필요합니다. 무료 컨설팅을 통해 정확한 견적을 받아보실 수 있습니다.',
    category: '비용 및 결제',
    order: 3,
  },
  {
    question: '기존 시스템과 연동이 가능한가요?',
    answer: '네, 대부분의 기존 시스템과 연동이 가능합니다. ERP, CRM, 그룹웨어 등 주요 비즈니스 소프트웨어와의 API 연동을 지원하며, 레거시 시스템의 경우에도 커스텀 연동 솔루션을 제공합니다. 기술팀이 연동 과정을 전담하여 진행합니다.',
    category: '기술 지원',
    order: 4,
  },
  {
    question: '데이터 보안은 어떻게 관리되나요?',
    answer: '데이터 보안은 Carib의 최우선 과제입니다. 모든 데이터는 AES-256 암호화로 보호되며, ISO 27001 보안 인증을 획득했습니다. 데이터는 국내 클라우드에 저장되어 법적 규정을 준수하며, 고객사 요청 시 온프레미스 설치도 가능합니다.',
    category: '보안 및 규정',
    order: 5,
  },
  {
    question: '도입 후 지원은 어떻게 받을 수 있나요?',
    answer: '전담 매니저가 배정되어 도입부터 운영까지 전 과정을 지원합니다. 24/7 기술 지원 핫라인을 운영하며, 월간 성과 리포트와 최적화 컨설팅을 제공합니다. 또한 정기적인 교육 세션을 통해 팀원들이 솔루션을 효과적으로 활용할 수 있도록 돕습니다.',
    category: '고객 지원',
    order: 6,
  },
];
