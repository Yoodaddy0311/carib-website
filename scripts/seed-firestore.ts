/**
 * Firestore Seed Script for Carib Platform (Admin SDK Version)
 *
 * This script seeds the Firestore database with sample data for:
 * - threads: AI automation related Twitter threads (5 items)
 * - team: Team members with sea creature/shark theme names (4 members)
 * - faq: Frequently asked questions about AI automation (6 items)
 *
 * ============================================================================
 * ALTERNATIVE: Use the Admin Panel instead!
 * ============================================================================
 * You can seed the database directly from the Admin Panel without needing
 * a service account key:
 *
 * 1. Go to /admin/settings in your browser
 * 2. Login with your admin account
 * 3. Click "Seed Database with Sample Data" button
 *
 * This is recommended for most use cases as it doesn't require any setup.
 * ============================================================================
 *
 * If you prefer to use this script (for CI/CD or automation):
 *
 * Prerequisites:
 * 1. Install firebase-admin: pnpm add -D firebase-admin tsx
 * 2. Download service account key from Firebase Console:
 *    - Go to Project Settings > Service Accounts
 *    - Click "Generate new private key"
 *    - Save the file as `serviceAccountKey.json` in the project root
 *    - Add `serviceAccountKey.json` to .gitignore
 *
 * Usage:
 *   pnpm tsx scripts/seed-firestore.ts
 *
 * Or add to package.json scripts:
 *   "seed": "tsx scripts/seed-firestore.ts"
 * Then run: pnpm seed
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// ============================================================================
// Configuration
// ============================================================================

const PROJECT_ID = 'carib-b153b';

// Path to service account key file
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../serviceAccountKey.json');

// Check if service account key exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`
============================================================
ERROR: Service account key not found!
============================================================

Please follow these steps:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: ${PROJECT_ID}
3. Go to Project Settings (gear icon) > Service Accounts
4. Click "Generate new private key"
5. Save the downloaded file as:
   ${SERVICE_ACCOUNT_PATH}
6. Add 'serviceAccountKey.json' to your .gitignore file
7. Run this script again

============================================================
`);
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8')) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
  projectId: PROJECT_ID,
});

const db = getFirestore();

// ============================================================================
// Type Definitions
// ============================================================================

interface Thread {
  id: string;
  tweetId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  summary: string;
  category: 'ai-automation' | 'no-code' | 'productivity' | 'case-study' | 'tutorial' | 'insight';
  tags: string[];
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  publishedAt: Timestamp;
  syncedAt: Timestamp;
  featured: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  order: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

// ============================================================================
// Sample Data
// ============================================================================

// Helper to create timestamps (days ago from now)
const daysAgo = (days: number): Timestamp => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return Timestamp.fromDate(date);
};

// Threads Collection (5 items)
const threads: Omit<Thread, 'id'>[] = [
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
  },
];

// Team Collection (4 members with sea creature/shark theme Korean names)
const teamMembers: Omit<TeamMember, 'id'>[] = [
  {
    name: '백상어 (김민준)',
    role: 'CEO & Founder',
    bio: 'AI 자동화 분야에서 10년 이상의 경험을 보유한 전문가입니다. 대기업 IT 컨설팅을 거쳐 Carib을 창업했으며, "모든 비즈니스에 AI의 힘을"이라는 비전을 가지고 있습니다.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=white-shark&backgroundColor=b6e3f4',
    socials: {
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
    socials: {
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
    socials: {
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
    socials: {
      twitter: 'sua_growth',
      linkedin: 'sua-choi-marketing',
      github: 'whale-shark-mkt',
    },
    order: 4,
  },
];

// FAQ Collection (6 items in Korean)
const faqs: Omit<FAQ, 'id'>[] = [
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

// ============================================================================
// Seed Functions
// ============================================================================

async function seedThreads(): Promise<void> {
  console.log('\n📝 Seeding threads collection...');
  const threadsRef = db.collection('threads');

  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const id = `thread-${String(i + 1).padStart(3, '0')}`;
    await threadsRef.doc(id).set({
      id,
      ...thread,
    });
    console.log(`   ✓ Added thread: ${id} - ${thread.authorName}`);
  }

  console.log(`   ✅ Successfully seeded ${threads.length} threads`);
}

async function seedTeam(): Promise<void> {
  console.log('\n👥 Seeding team collection...');
  const teamRef = db.collection('team');

  for (let i = 0; i < teamMembers.length; i++) {
    const member = teamMembers[i];
    const id = `member-${String(i + 1).padStart(3, '0')}`;
    await teamRef.doc(id).set({
      id,
      ...member,
    });
    console.log(`   ✓ Added team member: ${id} - ${member.name}`);
  }

  console.log(`   ✅ Successfully seeded ${teamMembers.length} team members`);
}

async function seedFAQ(): Promise<void> {
  console.log('\n❓ Seeding faq collection...');
  const faqRef = db.collection('faq');

  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    const id = `faq-${String(i + 1).padStart(3, '0')}`;
    await faqRef.doc(id).set({
      id,
      ...faq,
    });
    console.log(`   ✓ Added FAQ: ${id} - ${faq.question.substring(0, 30)}...`);
  }

  console.log(`   ✅ Successfully seeded ${faqs.length} FAQs`);
}

async function clearCollections(): Promise<void> {
  console.log('\n🗑️  Clearing existing data...');

  const collections = ['threads', 'team', 'faq'];

  for (const collectionName of collections) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`   ✓ Cleared ${snapshot.size} documents from ${collectionName}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          Carib Firestore Seed Script                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nProject: ${PROJECT_ID}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    // Clear existing data
    await clearCollections();

    // Seed all collections
    await seedThreads();
    await seedTeam();
    await seedFAQ();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ Seeding completed successfully!                ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nSummary:');
    console.log(`  • Threads: ${threads.length} documents`);
    console.log(`  • Team members: ${teamMembers.length} documents`);
    console.log(`  • FAQs: ${faqs.length} documents`);
    console.log('\nYou can now view the data in Firebase Console:');
    console.log(`  https://console.firebase.google.com/project/${PROJECT_ID}/firestore\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
