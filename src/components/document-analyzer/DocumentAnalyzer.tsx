'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSearch,
  Sparkles,
  AlertCircle,
  Trash2,
  Settings,
  Save,
  Share2,
  Download,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter, Input, Label, Select } from '@/components/ui';
import { FileDropzone } from './FileDropzone';
import { AnalysisResults } from './AnalysisResults';
import { useDocumentAnalyzer } from '@/hooks/useDocumentAnalyzer';
import type { AnalysisOptions, AutomationTaskType } from '@/types/document-analyzer';

interface DocumentAnalyzerProps {
  className?: string;
  showHeader?: boolean;
  onAnalysisComplete?: () => void;
}

const FOCUS_AREA_OPTIONS: { value: AutomationTaskType; label: string }[] = [
  { value: 'data-entry', label: '데이터 입력' },
  { value: 'data-extraction', label: '데이터 추출' },
  { value: 'formatting', label: '형식 변환' },
  { value: 'calculation', label: '계산/집계' },
  { value: 'validation', label: '검증/확인' },
  { value: 'notification', label: '알림/통보' },
  { value: 'approval', label: '승인/결재' },
  { value: 'reporting', label: '보고서 생성' },
  { value: 'file-management', label: '파일 관리' },
  { value: 'communication', label: '커뮤니케이션' },
];

const INDUSTRY_OPTIONS = [
  { value: '', label: '전체 산업' },
  { value: 'finance', label: '금융/보험' },
  { value: 'healthcare', label: '의료/헬스케어' },
  { value: 'manufacturing', label: '제조업' },
  { value: 'retail', label: '유통/소매' },
  { value: 'logistics', label: '물류/운송' },
  { value: 'it', label: 'IT/소프트웨어' },
  { value: 'education', label: '교육' },
  { value: 'government', label: '공공/정부' },
  { value: 'other', label: '기타' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: '회사 규모 선택' },
  { value: 'startup', label: '스타트업 (1-10명)' },
  { value: 'small', label: '소규모 (11-50명)' },
  { value: 'medium', label: '중규모 (51-200명)' },
  { value: 'enterprise', label: '대기업 (200명 이상)' },
];

export function DocumentAnalyzer({
  className,
  showHeader = true,
  onAnalysisComplete,
}: DocumentAnalyzerProps) {
  const {
    documents,
    isUploading,
    isAnalyzing,
    analysisProgress,
    results,
    aggregatedInsights,
    error,
    uploadFiles,
    removeDocument,
    clearAll,
    analyzeDocuments,
    saveAnalysis,
    shareAnalysis,
  } = useDocumentAnalyzer({
    onAnalysisComplete: () => {
      onAnalysisComplete?.();
    },
  });

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Analysis Options
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>({
    focusAreas: [],
    industry: '',
    companySize: undefined,
    detailedAnalysis: true,
  });

  const hasUploadedDocuments = documents.some((doc) => doc.status === 'uploaded' || doc.status === 'analyzed');
  const hasResults = results && results.length > 0;

  const handleAnalyze = useCallback(() => {
    analyzeDocuments(analysisOptions);
  }, [analyzeDocuments, analysisOptions]);

  const handleSaveAnalysis = useCallback(async () => {
    if (!saveName.trim()) return;
    const id = await saveAnalysis(saveName.trim());
    if (id) {
      setShowSaveModal(false);
      setSaveName('');
    }
  }, [saveName, saveAnalysis]);

  const handleShareAnalysis = useCallback(async () => {
    const url = await shareAnalysis();
    if (url) {
      setShareUrl(url);
      setShowShareModal(true);
    }
  }, [shareAnalysis]);

  const handleCopyShareUrl = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  }, [shareUrl]);

  const handleExportPDF = useCallback(() => {
    // PDF 내보내기 기능 (추후 구현)
    console.log('PDF 내보내기');
  }, []);

  const handleFocusAreaChange = useCallback((value: string) => {
    const areas = value ? value.split(',') as AutomationTaskType[] : [];
    setAnalysisOptions((prev) => ({ ...prev, focusAreas: areas }));
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)]">
              <FileSearch className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">AI 문서 분석기</h1>
              <p className="text-sm text-[var(--color-gray-500)]">
                문서를 업로드하면 AI가 자동화 가능 영역을 분석해드립니다
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="분석 설정"
            >
              <Settings className="h-5 w-5" />
            </Button>
            {hasUploadedDocuments && (
              <Button variant="ghost" size="icon" onClick={clearAll} aria-label="모두 삭제">
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-5 w-5" />
                  분석 설정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="industry">산업 분야</Label>
                    <Select
                      options={INDUSTRY_OPTIONS}
                      value={analysisOptions.industry || ''}
                      onChange={(value) =>
                        setAnalysisOptions((prev) => ({ ...prev, industry: value }))
                      }
                      placeholder="산업 분야 선택"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companySize">회사 규모</Label>
                    <Select
                      options={COMPANY_SIZE_OPTIONS}
                      value={analysisOptions.companySize || ''}
                      onChange={(value) =>
                        setAnalysisOptions((prev) => ({
                          ...prev,
                          companySize: value as AnalysisOptions['companySize'],
                        }))
                      }
                      placeholder="회사 규모 선택"
                    />
                  </div>
                  <div>
                    <Label htmlFor="focusAreas">집중 분석 영역</Label>
                    <Select
                      options={FOCUS_AREA_OPTIONS}
                      value={analysisOptions.focusAreas?.join(',') || ''}
                      onChange={handleFocusAreaChange}
                      placeholder="분석 영역 선택"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => clearAll()}
              className="ml-auto text-sm text-red-500 hover:underline"
            >
              다시 시도
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Upload Area */}
      {!hasResults && (
        <FileDropzone
          onFilesSelected={uploadFiles}
          uploadedDocuments={documents}
          onRemoveDocument={removeDocument}
          isDisabled={isAnalyzing}
          maxFiles={10}
          maxFileSize={20}
        />
      )}

      {/* Analysis Button */}
      {hasUploadedDocuments && !hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={isUploading || isAnalyzing}
            leftIcon={<Sparkles className="h-5 w-5" />}
          >
            {isAnalyzing ? `분석 중... (${analysisProgress}%)` : 'AI 분석 시작'}
          </Button>
        </motion.div>
      )}

      {/* Analysis Progress */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="mb-4"
                  >
                    <Sparkles className="h-10 w-10 text-[var(--color-primary-500)]" />
                  </motion.div>
                  <h3 className="mb-2 text-lg font-semibold">문서 분석 중...</h3>
                  <p className="mb-4 text-sm text-[var(--color-gray-500)]">
                    AI가 문서를 분석하고 자동화 기회를 찾고 있습니다
                  </p>
                  <div className="w-full max-w-md">
                    <div className="mb-2 flex justify-between text-sm">
                      <span>진행률</span>
                      <span>{analysisProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-gray-200)]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Results */}
      {hasResults && (
        <>
          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--color-gray-200)] bg-white p-4 dark:bg-[var(--color-gray-100)]">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                분석 완료
              </Badge>
              <span className="text-sm text-[var(--color-gray-500)]">
                {documents.length}개 문서 분석됨
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                새로 분석
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSaveModal(true)}>
                <Save className="mr-2 h-4 w-4" />
                저장
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareAnalysis}>
                <Share2 className="mr-2 h-4 w-4" />
                공유
              </Button>
              <Button variant="primary" size="sm" onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <AnalysisResults
            results={results}
            aggregatedInsights={aggregatedInsights}
            onSaveAnalysis={() => setShowSaveModal(true)}
            onShareAnalysis={handleShareAnalysis}
            onExportPDF={handleExportPDF}
          />
        </>
      )}

      {/* Save Modal */}
      <Modal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <ModalHeader>
          <ModalTitle>분석 결과 저장</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="saveName">저장 이름</Label>
              <Input
                id="saveName"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="분석 결과 이름을 입력하세요"
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowSaveModal(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAnalysis}
            disabled={!saveName.trim()}
          >
            저장
          </Button>
        </ModalFooter>
      </Modal>

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)}>
        <ModalHeader>
          <ModalTitle>분석 결과 공유</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-gray-500)]">
              아래 링크를 공유하면 다른 사람도 분석 결과를 볼 수 있습니다.
            </p>
            {shareUrl && (
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button variant="outline" onClick={handleCopyShareUrl}>
                  복사
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setShowShareModal(false)}>
            확인
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default DocumentAnalyzer;
