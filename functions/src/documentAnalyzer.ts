import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types
interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'excel' | 'word' | 'image';
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: string;
  base64Data?: string;
}

interface AnalysisOptions {
  focusAreas?: string[];
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'enterprise';
  detailedAnalysis?: boolean;
}

interface AnalyzeDocumentRequest {
  documents: UploadedDocument[];
  analysisOptions?: AnalysisOptions;
}

interface AutomationOpportunity {
  id: string;
  taskName: string;
  description: string;
  taskType: string;
  frequency: string;
  currentTimePerTask: number;
  estimatedAutomationRate: number;
  automationScore: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'very-high';
    confidence: number;
  };
  suggestedTools: string[];
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: string;
  impact: string;
  effort: string;
  estimatedTimeSaving: {
    hoursPerWeek: number;
    hoursPerMonth: number;
    hoursPerYear: number;
    percentageImprovement: number;
  };
  suggestedSolution: string;
  implementationSteps: string[];
  tools: {
    name: string;
    category: string;
    description: string;
    url?: string;
    pricing?: string;
  }[];
}

interface DocumentAnalysisResult {
  id: string;
  documentId: string;
  documentName: string;
  analyzedAt: string;
  summary: {
    title: string;
    description: string;
    keyPoints: string[];
    documentType: string;
    language: string;
  };
  automationOpportunities: AutomationOpportunity[];
  recommendations: Recommendation[];
  overallScore: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'very-high';
    confidence: number;
  };
  metadata: {
    fileSize: number;
    processedAt: string;
    processingTime: number;
    modelUsed: string;
  };
}

interface AggregatedInsights {
  totalDocumentsAnalyzed: number;
  overallAutomationPotential: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'very-high';
    confidence: number;
  };
  topOpportunities: AutomationOpportunity[];
  totalEstimatedTimeSaving: {
    hoursPerWeek: number;
    hoursPerMonth: number;
    hoursPerYear: number;
    percentageImprovement: number;
  };
  prioritizedRecommendations: Recommendation[];
}

// Gemini AI 클라이언트 초기화
function getGeminiClient() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || functions.config().google?.ai_api_key;
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

// MIME 타입에 따른 Gemini 지원 형식으로 변환
function getGeminiMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'application/pdf',
    'image/png': 'image/png',
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/webp': 'image/webp',
    'image/gif': 'image/gif',
    // Excel/Word는 이미지로 변환하거나 텍스트 추출 필요
    'application/vnd.ms-excel': 'text/plain',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'text/plain',
    'application/msword': 'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'text/plain',
  };
  return mimeMap[mimeType] || 'text/plain';
}

// 레벨 결정 함수
function getScoreLevel(score: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (score >= 80) return 'very-high';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

// UUID 생성
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 분석 프롬프트 생성
function createAnalysisPrompt(options?: AnalysisOptions): string {
  let prompt = `당신은 업무 자동화 전문가입니다. 주어진 문서를 분석하여 자동화 가능한 업무 영역을 식별하고,
구체적인 개선 방안을 제안해주세요.

다음 형식으로 JSON 응답을 제공해주세요:

{
  "summary": {
    "title": "문서 제목 또는 요약된 제목",
    "description": "문서 내용에 대한 간략한 설명 (2-3문장)",
    "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
    "documentType": "문서 유형 (예: 송장, 계약서, 보고서, 양식 등)",
    "language": "문서 언어"
  },
  "automationOpportunities": [
    {
      "taskName": "자동화 가능한 작업 이름",
      "description": "작업에 대한 상세 설명",
      "taskType": "작업 유형 (data-entry, data-extraction, formatting, calculation, validation, notification, approval, reporting, file-management, communication, other 중 하나)",
      "frequency": "작업 빈도 (hourly, daily, weekly, monthly, quarterly, yearly, on-demand 중 하나)",
      "currentTimePerTask": 예상 소요 시간(분, 숫자만),
      "estimatedAutomationRate": 자동화 가능 비율(0-100, 숫자만),
      "automationScore": 자동화 점수(0-100, 숫자만),
      "confidence": 분석 신뢰도(0-100, 숫자만),
      "suggestedTools": ["추천 도구 1", "추천 도구 2"],
      "complexity": "구현 복잡도 (low, medium, high 중 하나)",
      "priority": "우선순위 (low, medium, high, critical 중 하나)"
    }
  ],
  "recommendations": [
    {
      "title": "권장 사항 제목",
      "description": "권장 사항에 대한 상세 설명",
      "type": "유형 (quick-win, process-change, tool-adoption, integration, custom-solution 중 하나)",
      "impact": "영향도 (low, medium, high, transformative 중 하나)",
      "effort": "필요 노력 (minimal, moderate, significant, major 중 하나)",
      "estimatedTimeSaving": {
        "hoursPerWeek": 주간 절감 시간(숫자),
        "hoursPerMonth": 월간 절감 시간(숫자),
        "percentageImprovement": 효율성 개선율(0-100, 숫자)
      },
      "suggestedSolution": "구체적인 솔루션 설명",
      "implementationSteps": ["구현 단계 1", "구현 단계 2", "구현 단계 3"],
      "tools": [
        {
          "name": "도구 이름",
          "category": "도구 카테고리",
          "description": "도구 설명"
        }
      ]
    }
  ],
  "overallScore": 전체 자동화 점수(0-100, 숫자만),
  "overallConfidence": 전체 분석 신뢰도(0-100, 숫자만)
}`;

  if (options?.focusAreas && options.focusAreas.length > 0) {
    prompt += `\n\n특히 다음 영역에 집중하여 분석해주세요: ${options.focusAreas.join(', ')}`;
  }

  if (options?.industry) {
    prompt += `\n\n이 문서는 ${options.industry} 산업 분야의 문서입니다. 해당 산업의 특성을 고려하여 분석해주세요.`;
  }

  if (options?.companySize) {
    const sizeLabels: Record<string, string> = {
      startup: '스타트업 (1-10명)',
      small: '소규모 기업 (11-50명)',
      medium: '중규모 기업 (51-200명)',
      enterprise: '대기업 (200명 이상)',
    };
    prompt += `\n\n회사 규모: ${sizeLabels[options.companySize]}. 이 규모에 적합한 솔루션을 제안해주세요.`;
  }

  prompt += `\n\n중요: 반드시 유효한 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.`;

  return prompt;
}

// 단일 문서 분석 함수
async function analyzeDocument(
  document: UploadedDocument,
  options?: AnalysisOptions
): Promise<DocumentAnalysisResult> {
  const startTime = Date.now();
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = createAnalysisPrompt(options);

  let result;

  // 이미지나 PDF는 멀티모달 분석
  if (document.fileType === 'image' || document.fileType === 'pdf') {
    if (!document.base64Data) {
      throw new Error('문서 데이터가 없습니다.');
    }

    const imagePart = {
      inlineData: {
        mimeType: getGeminiMimeType(document.mimeType),
        data: document.base64Data,
      },
    };

    result = await model.generateContent([prompt, imagePart]);
  } else {
    // Excel/Word는 텍스트 기반 분석 (실제로는 텍스트 추출 필요)
    result = await model.generateContent([
      `${prompt}\n\n분석할 문서: ${document.fileName} (${document.fileType} 파일)`,
    ]);
  }

  const response = await result.response;
  const text = response.text();

  // JSON 파싱
  let analysisData;
  try {
    // JSON 블록 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 응답을 찾을 수 없습니다.');
    }
    analysisData = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('JSON 파싱 실패:', parseError, 'Response:', text);
    // 기본 응답 생성
    analysisData = {
      summary: {
        title: document.fileName,
        description: '문서 분석 결과를 생성할 수 없습니다.',
        keyPoints: [],
        documentType: 'unknown',
        language: 'ko',
      },
      automationOpportunities: [],
      recommendations: [],
      overallScore: 0,
      overallConfidence: 0,
    };
  }

  const processingTime = Date.now() - startTime;

  // 결과 구조화
  const automationOpportunities: AutomationOpportunity[] = (
    analysisData.automationOpportunities || []
  ).map((opp: Record<string, unknown>, index: number) => ({
    id: `opp-${generateId()}-${index}`,
    taskName: opp.taskName || '알 수 없는 작업',
    description: opp.description || '',
    taskType: opp.taskType || 'other',
    frequency: opp.frequency || 'on-demand',
    currentTimePerTask: Number(opp.currentTimePerTask) || 10,
    estimatedAutomationRate: Number(opp.estimatedAutomationRate) || 50,
    automationScore: {
      score: Number(opp.automationScore) || 50,
      level: getScoreLevel(Number(opp.automationScore) || 50),
      confidence: Number(opp.confidence) || 70,
    },
    suggestedTools: (opp.suggestedTools as string[]) || [],
    complexity: (opp.complexity as 'low' | 'medium' | 'high') || 'medium',
    priority: (opp.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
  }));

  const recommendations: Recommendation[] = (analysisData.recommendations || []).map(
    (rec: Record<string, unknown>, index: number) => {
      const timeSaving = (rec.estimatedTimeSaving as Record<string, number>) || {};
      return {
        id: `rec-${generateId()}-${index}`,
        title: rec.title || '권장 사항',
        description: rec.description || '',
        type: rec.type || 'quick-win',
        impact: rec.impact || 'medium',
        effort: rec.effort || 'moderate',
        estimatedTimeSaving: {
          hoursPerWeek: Number(timeSaving.hoursPerWeek) || 2,
          hoursPerMonth: Number(timeSaving.hoursPerMonth) || 8,
          hoursPerYear:
            Number(timeSaving.hoursPerMonth) * 12 || Number(timeSaving.hoursPerWeek) * 52 || 96,
          percentageImprovement: Number(timeSaving.percentageImprovement) || 20,
        },
        suggestedSolution: (rec.suggestedSolution as string) || '',
        implementationSteps: (rec.implementationSteps as string[]) || [],
        tools: ((rec.tools as Record<string, string>[]) || []).map((tool) => ({
          name: tool.name || '',
          category: tool.category || '',
          description: tool.description || '',
          url: tool.url,
          pricing: tool.pricing,
        })),
      };
    }
  );

  const overallScore = Number(analysisData.overallScore) || 50;

  return {
    id: `result-${generateId()}`,
    documentId: document.id,
    documentName: document.fileName,
    analyzedAt: new Date().toISOString(),
    summary: {
      title: analysisData.summary?.title || document.fileName,
      description: analysisData.summary?.description || '',
      keyPoints: analysisData.summary?.keyPoints || [],
      documentType: analysisData.summary?.documentType || 'unknown',
      language: analysisData.summary?.language || 'ko',
    },
    automationOpportunities,
    recommendations,
    overallScore: {
      score: overallScore,
      level: getScoreLevel(overallScore),
      confidence: Number(analysisData.overallConfidence) || 70,
    },
    metadata: {
      fileSize: document.fileSize,
      processedAt: new Date().toISOString(),
      processingTime,
      modelUsed: 'gemini-2.0-flash-exp',
    },
  };
}

// 집계된 인사이트 생성
function createAggregatedInsights(results: DocumentAnalysisResult[]): AggregatedInsights {
  const allOpportunities = results.flatMap((r) => r.automationOpportunities);
  const allRecommendations = results.flatMap((r) => r.recommendations);

  // 평균 점수 계산
  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.overallScore.score, 0) / results.length)
      : 0;

  const avgConfidence =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.overallScore.confidence, 0) / results.length)
      : 0;

  // 총 시간 절감 계산
  const totalWeeklyHours = allRecommendations.reduce(
    (sum, r) => sum + r.estimatedTimeSaving.hoursPerWeek,
    0
  );
  const totalMonthlyHours = allRecommendations.reduce(
    (sum, r) => sum + r.estimatedTimeSaving.hoursPerMonth,
    0
  );

  // 상위 기회 선택 (점수 기준 정렬)
  const topOpportunities = [...allOpportunities]
    .sort((a, b) => b.automationScore.score - a.automationScore.score)
    .slice(0, 5);

  // 우선순위가 높은 권장 사항
  const prioritizedRecommendations = [...allRecommendations]
    .sort((a, b) => {
      const impactOrder = { transformative: 0, high: 1, medium: 2, low: 3 };
      const effortOrder = { minimal: 0, moderate: 1, significant: 2, major: 3 };
      const aScore =
        (impactOrder[a.impact as keyof typeof impactOrder] || 2) * 2 +
        (effortOrder[a.effort as keyof typeof effortOrder] || 2);
      const bScore =
        (impactOrder[b.impact as keyof typeof impactOrder] || 2) * 2 +
        (effortOrder[b.effort as keyof typeof effortOrder] || 2);
      return aScore - bScore;
    })
    .slice(0, 5);

  return {
    totalDocumentsAnalyzed: results.length,
    overallAutomationPotential: {
      score: avgScore,
      level: getScoreLevel(avgScore),
      confidence: avgConfidence,
    },
    topOpportunities,
    totalEstimatedTimeSaving: {
      hoursPerWeek: totalWeeklyHours,
      hoursPerMonth: totalMonthlyHours,
      hoursPerYear: totalMonthlyHours * 12,
      percentageImprovement:
        allRecommendations.length > 0
          ? Math.round(
              allRecommendations.reduce(
                (sum, r) => sum + r.estimatedTimeSaving.percentageImprovement,
                0
              ) / allRecommendations.length
            )
          : 0,
    },
    prioritizedRecommendations,
  };
}

// Cloud Function: 문서 분석
export const analyzeDocuments = functions
  .region('asia-northeast3')
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onCall(async (data: AnalyzeDocumentRequest, context) => {
    // 인증 확인 (선택적)
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
    // }

    const { documents, analysisOptions } = data;

    if (!documents || documents.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', '분석할 문서가 없습니다.');
    }

    try {
      // 모든 문서 분석
      const results: DocumentAnalysisResult[] = [];

      for (const document of documents) {
        const result = await analyzeDocument(document, analysisOptions);
        results.push(result);
      }

      // 집계된 인사이트 생성
      const aggregatedInsights = createAggregatedInsights(results);

      // Firestore에 분석 결과 저장 (선택적)
      if (context.auth?.uid) {
        const db = admin.firestore();
        await db.collection('documentAnalyses').add({
          userId: context.auth.uid,
          documents: documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            fileType: d.fileType,
            fileSize: d.fileSize,
          })),
          results,
          aggregatedInsights,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        results,
        aggregatedInsights,
      };
    } catch (error) {
      console.error('Document analysis error:', error);
      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : '문서 분석 중 오류가 발생했습니다.'
      );
    }
  });

// Cloud Function: 분석 결과 저장
export const saveDocumentAnalysis = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
    }

    const { name, description, documents, results, aggregatedInsights } = data;

    if (!name || !results) {
      throw new functions.https.HttpsError('invalid-argument', '필수 데이터가 누락되었습니다.');
    }

    try {
      const db = admin.firestore();
      const docRef = await db.collection('savedAnalyses').add({
        userId: context.auth.uid,
        name,
        description,
        documents,
        results,
        aggregatedInsights,
        isShared: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Save analysis error:', error);
      throw new functions.https.HttpsError('internal', '저장 중 오류가 발생했습니다.');
    }
  });

// Cloud Function: 분석 결과 공유
export const shareDocumentAnalysis = functions
  .region('asia-northeast3')
  .https.onCall(async (data, context) => {
    const { documents, results, aggregatedInsights } = data;

    if (!results) {
      throw new functions.https.HttpsError('invalid-argument', '공유할 데이터가 없습니다.');
    }

    try {
      const db = admin.firestore();
      const shareId = generateId();

      await db.collection('sharedAnalyses').doc(shareId).set({
        documents: documents.map((d: UploadedDocument) => ({
          id: d.id,
          fileName: d.fileName,
          fileType: d.fileType,
        })),
        results,
        aggregatedInsights,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
        ),
      });

      const baseUrl = process.env.APP_URL || 'https://carib.co.kr';
      const shareUrl = `${baseUrl}/demo/analysis/${shareId}`;

      return {
        success: true,
        shareId,
        shareUrl,
      };
    } catch (error) {
      console.error('Share analysis error:', error);
      throw new functions.https.HttpsError('internal', '공유 링크 생성 중 오류가 발생했습니다.');
    }
  });

// Cloud Function: 공유된 분석 결과 조회
export const getSharedAnalysis = functions
  .region('asia-northeast3')
  .https.onCall(async (data) => {
    const { shareId } = data;

    if (!shareId) {
      throw new functions.https.HttpsError('invalid-argument', '공유 ID가 필요합니다.');
    }

    try {
      const db = admin.firestore();
      const doc = await db.collection('sharedAnalyses').doc(shareId).get();

      if (!doc.exists) {
        throw new functions.https.HttpsError('not-found', '분석 결과를 찾을 수 없습니다.');
      }

      const data = doc.data();

      // 만료 확인
      if (data?.expiresAt && data.expiresAt.toDate() < new Date()) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          '공유 링크가 만료되었습니다.'
        );
      }

      return {
        success: true,
        documents: data?.documents,
        results: data?.results,
        aggregatedInsights: data?.aggregatedInsights,
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      console.error('Get shared analysis error:', error);
      throw new functions.https.HttpsError('internal', '조회 중 오류가 발생했습니다.');
    }
  });
