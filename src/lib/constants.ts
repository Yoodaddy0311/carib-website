// Site metadata
export const SITE_CONFIG = {
  name: 'Carib',
  tagline: '반복되는 업무는 AI에게, 창의적인 일은 사람에게',
  description: 'AI 업무 자동화 전문 FDE 팀',
  url: 'https://carib.team',
  email: 'hello@carib.team',
  social: {
    twitter: 'https://twitter.com/carib_team',
    linkedin: 'https://linkedin.com/company/carib',
  },
};

// Navigation items
export const NAV_ITEMS = [
  { label: '서비스', href: '#services' },
  { label: '프로세스', href: '#process' },
  { label: '팀 소개', href: '#team' },
  { label: '스레드', href: '/threads' },
  { label: 'FAQ', href: '#faq' },
] as const;

// Services data
export const SERVICES = [
  {
    id: 'consulting',
    title: 'AI 자동화 컨설팅',
    description: '업무 프로세스 분석부터 AI 도입 전략 수립까지 전문 컨설팅을 제공합니다.',
    icon: 'Sparkles',
  },
  {
    id: 'optimization',
    title: '업무 프로세스 최적화',
    description: '반복적인 업무를 AI로 자동화하여 생산성을 극대화합니다.',
    icon: 'Zap',
  },
  {
    id: 'custom',
    title: '커스텀 AI 솔루션',
    description: '비즈니스에 최적화된 맞춤형 AI 솔루션을 개발합니다.',
    icon: 'Users',
  },
  {
    id: 'education',
    title: '교육 & 워크샵',
    description: 'AI 활용 역량을 강화하는 실무 중심 교육 프로그램을 운영합니다.',
    icon: 'TrendingUp',
  },
] as const;

// Trust metrics
export const TRUST_METRICS = [
  { value: '50+', label: '프로젝트 완료' },
  { value: '98%', label: '고객 만족도' },
  { value: '3배', label: '평균 업무 효율 향상' },
  { value: '24/7', label: 'AI 자동화 운영' },
] as const;

// Process steps
export const PROCESS_STEPS = [
  {
    number: 1,
    title: 'Discovery',
    description: '업무 프로세스 분석 및 자동화 기회 발굴',
    icon: 'Search',
  },
  {
    number: 2,
    title: 'Planning',
    description: 'AI 도입 전략 수립 및 로드맵 설계',
    icon: 'Map',
  },
  {
    number: 3,
    title: 'Execution',
    description: '맞춤형 AI 솔루션 개발 및 구현',
    icon: 'Cog',
  },
  {
    number: 4,
    title: 'Delivery',
    description: '배포, 교육 및 지속적인 최적화',
    icon: 'Rocket',
  },
] as const;

// FAQ items
export const FAQ_ITEMS = [
  {
    question: 'AI 자동화 도입에 얼마나 걸리나요?',
    answer:
      '프로젝트 규모에 따라 2주에서 2개월 정도 소요됩니다. 간단한 업무 자동화는 2주 내로 가능하며, 복잡한 시스템 구축은 더 오래 걸릴 수 있습니다.',
  },
  {
    question: '어떤 업무를 자동화할 수 있나요?',
    answer:
      '반복적인 데이터 입력, 보고서 생성, 고객 문의 응대, 일정 관리, 이메일 분류 등 규칙 기반의 반복 업무 대부분을 자동화할 수 있습니다.',
  },
  {
    question: '비용은 어떻게 책정되나요?',
    answer:
      '무료 커피챗을 통해 요구사항을 파악한 후, 프로젝트 범위에 맞는 맞춤 견적을 제공합니다. 고정 비용과 월 구독 모델 중 선택 가능합니다.',
  },
  {
    question: '기존 시스템과 연동이 가능한가요?',
    answer:
      '네, 대부분의 SaaS 서비스 및 사내 시스템과 API 연동이 가능합니다. Slack, Notion, Google Workspace, Salesforce 등 다양한 도구와 통합됩니다.',
  },
  {
    question: '커피챗은 어떻게 진행되나요?',
    answer:
      '30분간 화상 미팅으로 진행되며, 현재 업무 프로세스와 자동화 니즈를 파악합니다. 미팅 후 맞춤 제안서를 보내드립니다.',
  },
] as const;

// Team members
export const TEAM_MEMBERS = [
  {
    id: '1',
    name: '김상어',
    role: 'CEO & AI Strategist',
    bio: 'AI 자동화 전략 수립 10년 경력',
    socials: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    id: '2',
    name: '이돌고래',
    role: 'CTO & Lead Developer',
    bio: '풀스택 개발 및 AI 시스템 설계',
    socials: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    id: '3',
    name: '박문어',
    role: 'AI Engineer',
    bio: 'LLM 파인튜닝 및 프롬프트 엔지니어링 전문',
    socials: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    id: '4',
    name: '최해파리',
    role: 'UX Designer',
    bio: '사용자 중심 AI 인터페이스 설계',
    socials: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
] as const;

// Thread categories
export const THREAD_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'ai-automation', label: 'AI 자동화' },
  { key: 'no-code', label: '노코드' },
  { key: 'productivity', label: '생산성' },
  { key: 'case-study', label: '사례 연구' },
  { key: 'tutorial', label: '튜토리얼' },
  { key: 'insight', label: '인사이트' },
] as const;

// Category labels lookup (for quick access)
export const CATEGORY_LABELS: Record<string, string> = {
  'ai-automation': 'AI 자동화',
  'no-code': '노코드',
  productivity: '생산성',
  'case-study': '사례 연구',
  tutorial: '튜토리얼',
  insight: '인사이트',
};

// Footer links
export const FOOTER_LINKS = {
  services: [
    { label: 'AI 자동화 컨설팅', href: '#services' },
    { label: '업무 프로세스 최적화', href: '#services' },
    { label: '커스텀 AI 솔루션', href: '#services' },
    { label: '교육 & 워크샵', href: '#services' },
  ],
  company: [
    { label: '팀 소개', href: '#team' },
    { label: '커피챗', href: '/coffee-chat' },
    { label: '스레드', href: '/threads' },
  ],
  legal: [
    { label: '이용약관', href: '/legal/terms' },
    { label: '개인정보처리방침', href: '/legal/privacy' },
  ],
  social: [
    { label: 'Twitter', href: 'https://twitter.com/carib_team', icon: 'X' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/carib', icon: 'in' },
  ],
} as const;

// Type exports
export type NavItem = (typeof NAV_ITEMS)[number];
export type Service = (typeof SERVICES)[number];
export type TrustMetric = (typeof TRUST_METRICS)[number];
export type ProcessStep = (typeof PROCESS_STEPS)[number];
export type FAQItem = (typeof FAQ_ITEMS)[number];
export type TeamMember = (typeof TEAM_MEMBERS)[number];
export type ThreadCategory = (typeof THREAD_CATEGORIES)[number];
