// Document Analyzer Types (AI-004)

// 지원 파일 형식
export type SupportedFileType = 'pdf' | 'excel' | 'word' | 'image';

export const SUPPORTED_MIME_TYPES: Record<SupportedFileType, string[]> = {
  pdf: ['application/pdf'],
  excel: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  word: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  image: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
};

export const SUPPORTED_EXTENSIONS: Record<SupportedFileType, string[]> = {
  pdf: ['.pdf'],
  excel: ['.xls', '.xlsx'],
  word: ['.doc', '.docx'],
  image: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
};

// 업로드된 문서 정보
export interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: SupportedFileType;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  status: DocumentStatus;
  base64Data?: string;
  url?: string;
}

export type DocumentStatus =
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'analyzed'
  | 'error';

// 분석 결과
export interface DocumentAnalysisResult {
  id: string;
  documentId: string;
  documentName: string;
  analyzedAt: Date;
  summary: DocumentSummary;
  automationOpportunities: AutomationOpportunity[];
  recommendations: Recommendation[];
  overallScore: AutomationScore;
  metadata: DocumentMetadata;
}

export interface DocumentSummary {
  title: string;
  description: string;
  keyPoints: string[];
  documentType: string; // 예: '송장', '계약서', '보고서', '양식' 등
  language: string;
  pageCount?: number;
  wordCount?: number;
}

export interface AutomationOpportunity {
  id: string;
  taskName: string;
  description: string;
  taskType: AutomationTaskType;
  frequency: TaskFrequency;
  currentTimePerTask: number; // 분 단위
  estimatedAutomationRate: number; // 0-100%
  automationScore: AutomationScore;
  suggestedTools: string[];
  complexity: ComplexityLevel;
  priority: PriorityLevel;
}

export type AutomationTaskType =
  | 'data-entry'        // 데이터 입력
  | 'data-extraction'   // 데이터 추출
  | 'formatting'        // 형식 변환/포맷팅
  | 'calculation'       // 계산/집계
  | 'validation'        // 검증/확인
  | 'notification'      // 알림/통보
  | 'approval'          // 승인/결재
  | 'reporting'         // 보고서 생성
  | 'file-management'   // 파일 관리
  | 'communication'     // 커뮤니케이션
  | 'other';

export type TaskFrequency =
  | 'hourly'      // 매시간
  | 'daily'       // 매일
  | 'weekly'      // 매주
  | 'monthly'     // 매월
  | 'quarterly'   // 분기별
  | 'yearly'      // 연간
  | 'on-demand';  // 필요시

export type ComplexityLevel = 'low' | 'medium' | 'high';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AutomationScore {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high' | 'very-high';
  confidence: number; // 0-100, AI 분석 신뢰도
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  impact: ImpactLevel;
  effort: EffortLevel;
  estimatedTimeSaving: TimeSaving;
  suggestedSolution: string;
  implementationSteps: string[];
  tools: RecommendedTool[];
}

export type RecommendationType =
  | 'quick-win'       // 빠른 개선
  | 'process-change'  // 프로세스 변경
  | 'tool-adoption'   // 도구 도입
  | 'integration'     // 시스템 연동
  | 'custom-solution'; // 맞춤 솔루션

export type ImpactLevel = 'low' | 'medium' | 'high' | 'transformative';
export type EffortLevel = 'minimal' | 'moderate' | 'significant' | 'major';

export interface TimeSaving {
  hoursPerWeek: number;
  hoursPerMonth: number;
  hoursPerYear: number;
  percentageImprovement: number;
}

export interface RecommendedTool {
  name: string;
  category: string;
  description: string;
  url?: string;
  pricing?: string;
}

export interface DocumentMetadata {
  fileSize: number;
  processedAt: Date;
  processingTime: number; // 밀리초
  modelUsed: string;
  tokenCount?: number;
}

// API 요청/응답
export interface AnalyzeDocumentRequest {
  documents: UploadedDocument[];
  analysisOptions?: AnalysisOptions;
}

export interface AnalysisOptions {
  focusAreas?: AutomationTaskType[];
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'enterprise';
  detailedAnalysis?: boolean;
}

export interface AnalyzeDocumentResponse {
  success: boolean;
  results: DocumentAnalysisResult[];
  aggregatedInsights?: AggregatedInsights;
  error?: string;
}

export interface AggregatedInsights {
  totalDocumentsAnalyzed: number;
  overallAutomationPotential: AutomationScore;
  topOpportunities: AutomationOpportunity[];
  totalEstimatedTimeSaving: TimeSaving;
  prioritizedRecommendations: Recommendation[];
  industryBenchmark?: IndustryBenchmark;
}

export interface IndustryBenchmark {
  industry: string;
  averageAutomationScore: number;
  topAutomatedTasks: string[];
  adoptionRate: number;
}

// 저장된 분석 결과
export interface SavedAnalysis {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  documents: UploadedDocument[];
  results: DocumentAnalysisResult[];
  aggregatedInsights?: AggregatedInsights;
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  shareId?: string;
}

// 차트 데이터
export interface ChartData {
  automationScoreDistribution: {
    label: string;
    value: number;
    color: string;
  }[];
  taskTypeBreakdown: {
    type: AutomationTaskType;
    count: number;
    avgScore: number;
  }[];
  timeSavingProjection: {
    month: string;
    current: number;
    projected: number;
  }[];
  priorityMatrix: {
    opportunity: string;
    impact: number;
    effort: number;
  }[];
}

// UI 상태
export interface DocumentAnalyzerState {
  documents: UploadedDocument[];
  isAnalyzing: boolean;
  analysisProgress: number;
  results: DocumentAnalysisResult[] | null;
  aggregatedInsights: AggregatedInsights | null;
  error: string | null;
  savedAnalyses: SavedAnalysis[];
}

// 이벤트 타입
export type DocumentAnalyzerEvent =
  | { type: 'UPLOAD_START'; documents: File[] }
  | { type: 'UPLOAD_PROGRESS'; documentId: string; progress: number }
  | { type: 'UPLOAD_COMPLETE'; document: UploadedDocument }
  | { type: 'UPLOAD_ERROR'; documentId: string; error: string }
  | { type: 'ANALYSIS_START' }
  | { type: 'ANALYSIS_PROGRESS'; progress: number }
  | { type: 'ANALYSIS_COMPLETE'; results: AnalyzeDocumentResponse }
  | { type: 'ANALYSIS_ERROR'; error: string }
  | { type: 'REMOVE_DOCUMENT'; documentId: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SAVE_ANALYSIS'; name: string }
  | { type: 'LOAD_ANALYSIS'; analysisId: string };
