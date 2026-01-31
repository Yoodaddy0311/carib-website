/**
 * Gemini Function Calling Definitions
 *
 * Defines the functions that can be called by Gemini AI
 * to provide dynamic, actionable responses.
 *
 * Functions:
 * - schedule_coffee_chat: 커피챗 예약 페이지 안내
 * - show_case_study: 관련 사례 연구 표시
 * - calculate_roi: ROI 예상 계산
 */

import { FunctionDeclaration, SchemaType } from '@google/generative-ai';

/**
 * Function declaration for scheduling a coffee chat
 */
export const scheduleCoffeeChatDeclaration: FunctionDeclaration = {
  name: 'schedule_coffee_chat',
  description: '커피챗(무료 상담) 예약 페이지로 안내합니다. 사용자가 상담, 미팅, 예약, 문의 등을 원할 때 사용합니다.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      topic: {
        type: SchemaType.STRING,
        description: '상담하고 싶은 주제 (예: AI 자동화, 노코드, 업무 효율화 등)',
      },
      urgency: {
        type: SchemaType.STRING,
        enum: ['low', 'medium', 'high'],
        description: '상담의 긴급도 (low: 여유있음, medium: 보통, high: 급함)',
      },
      preferredTime: {
        type: SchemaType.STRING,
        description: '선호하는 상담 시간대 (예: 오전, 오후, 저녁)',
      },
    },
    required: ['topic'],
  },
};

/**
 * Function declaration for showing case studies
 */
export const showCaseStudyDeclaration: FunctionDeclaration = {
  name: 'show_case_study',
  description: '관련 사례 연구(Case Study)를 보여줍니다. 특정 산업, 기술, 또는 문제 해결 사례를 찾을 때 사용합니다.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      industry: {
        type: SchemaType.STRING,
        description: '산업 분야 (예: 이커머스, 제조업, 금융, 헬스케어, 교육 등)',
      },
      useCase: {
        type: SchemaType.STRING,
        description: '사용 사례 유형 (예: 고객 서비스 자동화, 데이터 분석, 업무 프로세스 자동화 등)',
      },
      technology: {
        type: SchemaType.STRING,
        description: '관심있는 기술 (예: AI, 노코드, RPA, 챗봇 등)',
      },
    },
    required: [],
  },
};

/**
 * Function declaration for calculating ROI
 */
export const calculateRoiDeclaration: FunctionDeclaration = {
  name: 'calculate_roi',
  description: 'AI 자동화 도입 시 예상 ROI(투자 대비 수익)를 계산합니다. 비용 절감, 시간 절약, 효율성 향상 등을 추정합니다.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      taskType: {
        type: SchemaType.STRING,
        description: '자동화하려는 업무 유형 (예: 고객 문의 응대, 데이터 입력, 보고서 작성, 이메일 처리 등)',
      },
      currentTimeSpent: {
        type: SchemaType.NUMBER,
        description: '현재 해당 업무에 소요되는 시간 (시간/주)',
      },
      employeeCount: {
        type: SchemaType.NUMBER,
        description: '해당 업무를 수행하는 직원 수',
      },
      averageHourlyRate: {
        type: SchemaType.NUMBER,
        description: '직원 평균 시급 (원화 기준, 없으면 기본값 사용)',
      },
    },
    required: ['taskType'],
  },
};

/**
 * All function declarations for Gemini
 */
export const chatFunctionDeclarations: FunctionDeclaration[] = [
  scheduleCoffeeChatDeclaration,
  showCaseStudyDeclaration,
  calculateRoiDeclaration,
];

/**
 * Function call result types
 */
export interface ScheduleCoffeeChatArgs {
  topic: string;
  urgency?: 'low' | 'medium' | 'high';
  preferredTime?: string;
}

export interface ShowCaseStudyArgs {
  industry?: string;
  useCase?: string;
  technology?: string;
}

export interface CalculateRoiArgs {
  taskType: string;
  currentTimeSpent?: number;
  employeeCount?: number;
  averageHourlyRate?: number;
}

/**
 * Function call result interface
 */
export interface FunctionCallResult {
  functionName: string;
  args: ScheduleCoffeeChatArgs | ShowCaseStudyArgs | CalculateRoiArgs;
  result: {
    type: 'coffee_chat' | 'case_study' | 'roi_calculation';
    data: CoffeeChatData | CaseStudyData | RoiCalculationData;
  };
}

export interface CoffeeChatData {
  bookingUrl: string;
  topic: string;
  urgency: string;
  preferredTime?: string;
  message: string;
  availableSlots?: string[];
}

export interface CaseStudyData {
  caseStudies: CaseStudyItem[];
  query: {
    industry?: string;
    useCase?: string;
    technology?: string;
  };
  message: string;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  industry: string;
  summary: string;
  results: string;
  link: string;
}

export interface RoiCalculationData {
  taskType: string;
  inputs: {
    currentTimeSpent: number;
    employeeCount: number;
    hourlyRate: number;
  };
  calculations: {
    currentMonthlyCost: number;
    estimatedSavingsPercent: number;
    estimatedMonthlySavings: number;
    estimatedAnnualSavings: number;
    paybackPeriodMonths: number;
  };
  message: string;
}

/**
 * Execute schedule_coffee_chat function
 */
export function executeScheduleCoffeeChat(args: ScheduleCoffeeChatArgs): CoffeeChatData {
  const urgencyMessages: Record<string, string> = {
    low: '여유롭게 상담 일정을 잡아보세요.',
    medium: '빠른 시일 내에 상담을 잡아드릴 수 있습니다.',
    high: '긴급 상담 요청으로 처리해 드리겠습니다. 최대한 빨리 연락드리겠습니다.',
  };

  const urgency = args.urgency || 'medium';

  return {
    bookingUrl: '/coffee-chat',
    topic: args.topic,
    urgency: urgency,
    preferredTime: args.preferredTime,
    message: `"${args.topic}"에 대해 전문가와 1:1 커피챗을 예약하실 수 있습니다. ${urgencyMessages[urgency]}`,
    availableSlots: [
      '월요일 오전 10:00',
      '화요일 오후 2:00',
      '수요일 오전 11:00',
      '목요일 오후 3:00',
      '금요일 오전 10:00',
    ],
  };
}

/**
 * Execute show_case_study function
 */
export function executeShowCaseStudy(args: ShowCaseStudyArgs): CaseStudyData {
  // 실제 사례 연구 데이터 (데모 데이터)
  const allCaseStudies: CaseStudyItem[] = [
    {
      id: 'cs-1',
      title: '이커머스 고객 서비스 자동화',
      industry: '이커머스',
      summary: 'AI 챗봇 도입으로 고객 문의 응대 시간 80% 단축',
      results: '월 1,500시간 절약, 고객 만족도 35% 향상',
      link: '/threads?category=case-study&id=ecommerce-cs',
    },
    {
      id: 'cs-2',
      title: '제조업 품질 관리 자동화',
      industry: '제조업',
      summary: 'AI 비전 검사 시스템으로 불량률 90% 감소',
      results: '연간 5억원 비용 절감, 검사 시간 95% 단축',
      link: '/threads?category=case-study&id=manufacturing-qa',
    },
    {
      id: 'cs-3',
      title: '금융권 문서 처리 자동화',
      industry: '금융',
      summary: 'RPA와 AI OCR로 서류 처리 시간 70% 단축',
      results: '처리 정확도 99.9%, 직원 업무 부담 60% 감소',
      link: '/threads?category=case-study&id=finance-doc',
    },
    {
      id: 'cs-4',
      title: '헬스케어 예약 시스템 자동화',
      industry: '헬스케어',
      summary: 'AI 예약 봇으로 노쇼율 40% 감소',
      results: '예약 처리 시간 85% 단축, 환자 만족도 45% 향상',
      link: '/threads?category=case-study&id=healthcare-booking',
    },
    {
      id: 'cs-5',
      title: '교육 플랫폼 개인화 학습',
      industry: '교육',
      summary: 'AI 기반 맞춤형 학습 경로 추천',
      results: '학습 완료율 60% 향상, 학습 시간 30% 단축',
      link: '/threads?category=case-study&id=education-personalization',
    },
    {
      id: 'cs-6',
      title: '노코드 업무 프로세스 자동화',
      industry: '일반',
      summary: 'Zapier, Make 활용 반복 업무 자동화',
      results: '주당 20시간 절약, 오류율 95% 감소',
      link: '/threads?category=case-study&id=nocode-automation',
    },
  ];

  // Filter case studies based on arguments
  let filteredCaseStudies = allCaseStudies;

  if (args.industry) {
    const industryLower = args.industry.toLowerCase();
    filteredCaseStudies = filteredCaseStudies.filter(
      (cs) => cs.industry.toLowerCase().includes(industryLower)
    );
  }

  if (args.technology) {
    const techLower = args.technology.toLowerCase();
    filteredCaseStudies = filteredCaseStudies.filter(
      (cs) =>
        cs.summary.toLowerCase().includes(techLower) ||
        cs.title.toLowerCase().includes(techLower)
    );
  }

  if (args.useCase) {
    const useCaseLower = args.useCase.toLowerCase();
    filteredCaseStudies = filteredCaseStudies.filter(
      (cs) =>
        cs.summary.toLowerCase().includes(useCaseLower) ||
        cs.title.toLowerCase().includes(useCaseLower)
    );
  }

  // If no results, return top 3 general case studies
  if (filteredCaseStudies.length === 0) {
    filteredCaseStudies = allCaseStudies.slice(0, 3);
  }

  // Limit to 3 results
  filteredCaseStudies = filteredCaseStudies.slice(0, 3);

  const queryParts: string[] = [];
  if (args.industry) queryParts.push(args.industry);
  if (args.useCase) queryParts.push(args.useCase);
  if (args.technology) queryParts.push(args.technology);

  const queryString = queryParts.length > 0 ? queryParts.join(', ') : '전체';

  return {
    caseStudies: filteredCaseStudies,
    query: {
      industry: args.industry,
      useCase: args.useCase,
      technology: args.technology,
    },
    message: `"${queryString}" 관련 ${filteredCaseStudies.length}개의 사례 연구를 찾았습니다.`,
  };
}

/**
 * Execute calculate_roi function
 */
export function executeCalculateRoi(args: CalculateRoiArgs): RoiCalculationData {
  // Default values
  const currentTimeSpent = args.currentTimeSpent || 10; // hours per week
  const employeeCount = args.employeeCount || 1;
  const hourlyRate = args.averageHourlyRate || 30000; // 30,000 KRW default

  // Estimated automation savings percentage based on task type
  const savingsPercentByTask: Record<string, number> = {
    '고객 문의 응대': 70,
    '데이터 입력': 85,
    '보고서 작성': 60,
    '이메일 처리': 75,
    '스케줄 관리': 80,
    '문서 처리': 70,
    '주문 처리': 75,
    default: 65,
  };

  const taskLower = args.taskType.toLowerCase();
  let savingsPercent = savingsPercentByTask.default;

  for (const [task, percent] of Object.entries(savingsPercentByTask)) {
    if (taskLower.includes(task.toLowerCase()) || task.toLowerCase().includes(taskLower)) {
      savingsPercent = percent;
      break;
    }
  }

  // Calculations
  const weeklyHours = currentTimeSpent * employeeCount;
  const monthlyHours = weeklyHours * 4;
  const currentMonthlyCost = monthlyHours * hourlyRate;
  const estimatedMonthlySavings = Math.round(currentMonthlyCost * (savingsPercent / 100));
  const estimatedAnnualSavings = estimatedMonthlySavings * 12;

  // Estimated implementation cost (simplified)
  const estimatedImplementationCost = Math.max(estimatedMonthlySavings * 3, 3000000); // Minimum 3M KRW
  const paybackPeriodMonths = Math.ceil(estimatedImplementationCost / estimatedMonthlySavings);

  return {
    taskType: args.taskType,
    inputs: {
      currentTimeSpent,
      employeeCount,
      hourlyRate,
    },
    calculations: {
      currentMonthlyCost,
      estimatedSavingsPercent: savingsPercent,
      estimatedMonthlySavings,
      estimatedAnnualSavings,
      paybackPeriodMonths: Math.min(paybackPeriodMonths, 24), // Cap at 24 months
    },
    message: `"${args.taskType}" 자동화 시 예상 ROI 분석 결과입니다.`,
  };
}

/**
 * Execute a function call based on function name
 */
export function executeFunctionCall(
  functionName: string,
  args: Record<string, unknown>
): FunctionCallResult | null {
  switch (functionName) {
    case 'schedule_coffee_chat': {
      const coffeeChatArgs = args as unknown as ScheduleCoffeeChatArgs;
      return {
        functionName,
        args: coffeeChatArgs,
        result: {
          type: 'coffee_chat',
          data: executeScheduleCoffeeChat(coffeeChatArgs),
        },
      };
    }
    case 'show_case_study': {
      const caseStudyArgs = args as unknown as ShowCaseStudyArgs;
      return {
        functionName,
        args: caseStudyArgs,
        result: {
          type: 'case_study',
          data: executeShowCaseStudy(caseStudyArgs),
        },
      };
    }
    case 'calculate_roi': {
      const roiArgs = args as unknown as CalculateRoiArgs;
      return {
        functionName,
        args: roiArgs,
        result: {
          type: 'roi_calculation',
          data: executeCalculateRoi(roiArgs),
        },
      };
    }
    default:
      console.warn(`Unknown function: ${functionName}`);
      return null;
  }
}

export default {
  declarations: chatFunctionDeclarations,
  execute: executeFunctionCall,
  executeScheduleCoffeeChat,
  executeShowCaseStudy,
  executeCalculateRoi,
};
