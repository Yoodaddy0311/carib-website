import type { PageContext, PageType } from '@/types';

/**
 * Page-specific system prompts for the AI chat assistant
 * These prompts help the AI understand the user's context and provide relevant responses
 */

export interface ContextualPromptConfig {
  pageType: PageType;
  basePrompt: string;
  contextHints: string[];
  suggestedTopics: string[];
}

/**
 * Get contextual prompt based on page type
 */
export function getContextualPrompt(pageType: PageType): ContextualPromptConfig {
  switch (pageType) {
    case 'home':
      return {
        pageType: 'home',
        basePrompt: `현재 사용자는 Carib 홈페이지를 방문 중입니다.

주요 안내 포인트:
- Carib의 AI 업무 자동화 서비스 전반에 대해 설명해주세요
- 사용자의 업무 자동화 니즈를 파악하고 적절한 솔루션을 제안하세요
- 무료 30분 커피챗 상담을 자연스럽게 권유하세요
- 성공 사례나 threads 페이지의 인사이트를 언급할 수 있습니다`,
        contextHints: [
          '서비스 개요 설명',
          'AI 자동화 도입 이점',
          '비용 절감 효과',
        ],
        suggestedTopics: [
          'AI 자동화란 무엇인가요?',
          '어떤 업무를 자동화할 수 있나요?',
          '도입 비용은 얼마나 드나요?',
        ],
      };

    case 'coffee-chat':
      return {
        pageType: 'coffee-chat',
        basePrompt: `현재 사용자는 커피챗(무료 상담) 예약 페이지를 방문 중입니다.

주요 안내 포인트:
- 커피챗 예약 프로세스를 친절하게 안내하세요
- 30분 무료 상담에서 어떤 내용을 다루는지 설명하세요
- 예약 전 궁금한 점을 해결해 드리세요
- 상담 준비 팁을 제공할 수 있습니다`,
        contextHints: [
          '예약 방법 안내',
          '상담 진행 방식',
          '준비 사항',
        ],
        suggestedTopics: [
          '커피챗에서 어떤 내용을 상담하나요?',
          '예약은 어떻게 하나요?',
          '상담 전 준비할 것이 있나요?',
        ],
      };

    case 'threads':
      return {
        pageType: 'threads',
        basePrompt: `현재 사용자는 Threads(인사이트/사례) 목록 페이지를 방문 중입니다.

주요 안내 포인트:
- AI 자동화 관련 인사이트와 사례 연구를 안내하세요
- 카테고리별 콘텐츠를 추천해주세요 (AI 자동화, 노코드, 생산성, 케이스 스터디, 튜토리얼, 인사이트)
- 관심 분야에 맞는 글을 찾는 것을 도와주세요
- 실제 도입 사례에 관심이 있다면 커피챗을 권유하세요`,
        contextHints: [
          '콘텐츠 카테고리 안내',
          '관련 사례 추천',
          '인사이트 요약',
        ],
        suggestedTopics: [
          '어떤 사례가 가장 인기 있나요?',
          '노코드 자동화 관련 글이 있나요?',
          '우리 회사에 맞는 사례를 추천해주세요',
        ],
      };

    case 'thread-detail':
      return {
        pageType: 'thread-detail',
        basePrompt: `현재 사용자는 특정 Thread(인사이트/사례) 상세 페이지를 보고 있습니다.

주요 안내 포인트:
- 현재 보고 있는 글과 관련된 추가 정보를 제공하세요
- 비슷한 주제의 다른 글을 추천해주세요
- 실제 도입에 관심이 있다면 커피챗을 권유하세요
- 질문에 대해 더 깊이 있는 설명을 제공하세요`,
        contextHints: [
          '글 내용 관련 질문 응대',
          '관련 글 추천',
          '도입 상담 연결',
        ],
        suggestedTopics: [
          '이 방법을 우리 회사에 적용하려면?',
          '비슷한 사례가 더 있나요?',
          '직접 상담받고 싶어요',
        ],
      };

    case 'legal':
      return {
        pageType: 'legal',
        basePrompt: `현재 사용자는 법적 문서(이용약관/개인정보처리방침) 페이지를 방문 중입니다.

주요 안내 포인트:
- 법적 문서에 대한 간단한 설명을 제공하세요
- 데이터 보안과 개인정보 보호에 대한 질문에 답변하세요
- 필요시 담당자 연락처를 안내하세요`,
        contextHints: [
          '법적 문서 설명',
          '데이터 보안',
          '개인정보 보호',
        ],
        suggestedTopics: [
          '수집하는 개인정보는 무엇인가요?',
          '데이터는 어떻게 보호되나요?',
          '문의는 어디로 하면 되나요?',
        ],
      };

    case 'admin':
      return {
        pageType: 'admin',
        basePrompt: `현재 사용자는 관리자 페이지에 있습니다. 관리 기능에 대한 질문에 답변하세요.`,
        contextHints: ['관리 기능'],
        suggestedTopics: [],
      };

    default:
      return {
        pageType: 'unknown',
        basePrompt: `사용자가 Carib 웹사이트를 탐색 중입니다. AI 업무 자동화에 대해 친절하게 안내해주세요.`,
        contextHints: ['일반 안내'],
        suggestedTopics: [
          'Carib은 어떤 회사인가요?',
          '어떤 서비스를 제공하나요?',
        ],
      };
  }
}

/**
 * Build the full contextual system prompt including page context
 */
export function buildContextualSystemPrompt(context: PageContext): string {
  const pageType = getPageTypeFromPath(context.pathname);
  const config = getContextualPrompt(pageType);

  // Build context summary
  const contextDetails: string[] = [];

  // Add scroll behavior insights
  if (context.scrollPercentage > 70) {
    contextDetails.push('사용자가 페이지를 충분히 살펴봄');
  }

  // Add session duration insights
  if (context.sessionDuration > 120) {
    contextDetails.push('2분 이상 사이트를 탐색함');
  } else if (context.sessionDuration > 60) {
    contextDetails.push('1분 이상 사이트를 탐색함');
  }

  // Add visited pages insights
  if (context.visitedPages.length > 2) {
    contextDetails.push(`여러 페이지 방문: ${context.visitedPages.join(', ')}`);
  }

  // Add viewed sections
  if (context.viewedSections.length > 0) {
    contextDetails.push(`확인한 섹션: ${context.viewedSections.join(', ')}`);
  }

  const contextSummary = contextDetails.length > 0
    ? `\n\n사용자 행동 컨텍스트:\n- ${contextDetails.join('\n- ')}`
    : '';

  return `${config.basePrompt}${contextSummary}`;
}

/**
 * Get page type from pathname
 */
function getPageTypeFromPath(pathname: string): PageType {
  if (pathname === '/') return 'home';
  if (pathname === '/coffee-chat') return 'coffee-chat';
  if (pathname === '/threads') return 'threads';
  if (pathname.startsWith('/threads/')) return 'thread-detail';
  if (pathname.startsWith('/legal')) return 'legal';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'unknown';
}

/**
 * Get suggested questions based on context
 */
export function getSuggestedQuestions(context: PageContext): string[] {
  const pageType = getPageTypeFromPath(context.pathname);
  const config = getContextualPrompt(pageType);
  return config.suggestedTopics;
}

export default {
  getContextualPrompt,
  buildContextualSystemPrompt,
  getSuggestedQuestions,
};
