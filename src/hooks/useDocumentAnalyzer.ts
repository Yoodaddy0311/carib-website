'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  UploadedDocument,
  DocumentAnalysisResult,
  AggregatedInsights,
  SupportedFileType,
  AnalyzeDocumentRequest,
  AnalyzeDocumentResponse,
  SavedAnalysis,
  AnalysisOptions,
} from '@/types/document-analyzer';
import {
  SUPPORTED_MIME_TYPES,
  SUPPORTED_EXTENSIONS,
} from '@/types/document-analyzer';

interface UseDocumentAnalyzerOptions {
  onUploadComplete?: (document: UploadedDocument) => void;
  onAnalysisComplete?: (results: AnalyzeDocumentResponse) => void;
  onError?: (error: string) => void;
}

interface UseDocumentAnalyzerReturn {
  // State
  documents: UploadedDocument[];
  isUploading: boolean;
  isAnalyzing: boolean;
  analysisProgress: number;
  results: DocumentAnalysisResult[] | null;
  aggregatedInsights: AggregatedInsights | null;
  error: string | null;
  savedAnalyses: SavedAnalysis[];

  // Actions
  uploadFiles: (files: File[]) => Promise<void>;
  removeDocument: (documentId: string) => void;
  clearAll: () => void;
  analyzeDocuments: (options?: AnalysisOptions) => Promise<void>;
  saveAnalysis: (name: string, description?: string) => Promise<string | null>;
  loadAnalysis: (analysisId: string) => Promise<void>;
  shareAnalysis: () => Promise<string | null>;
}

function getFileType(file: File): SupportedFileType | null {
  const mimeType = file.type.toLowerCase();
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  for (const [type, mimeTypes] of Object.entries(SUPPORTED_MIME_TYPES)) {
    if (mimeTypes.includes(mimeType)) {
      return type as SupportedFileType;
    }
  }

  for (const [type, extensions] of Object.entries(SUPPORTED_EXTENSIONS)) {
    if (extensions.includes(extension)) {
      return type as SupportedFileType;
    }
  }

  return null;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function useDocumentAnalyzer(
  options: UseDocumentAnalyzerOptions = {}
): UseDocumentAnalyzerReturn {
  const { onUploadComplete, onAnalysisComplete, onError } = options;

  // State
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<DocumentAnalysisResult[] | null>(null);
  const [aggregatedInsights, setAggregatedInsights] = useState<AggregatedInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);

  // Upload files
  const uploadFiles = useCallback(
    async (files: File[]) => {
      setIsUploading(true);
      setError(null);

      try {
        const uploadPromises = files.map(async (file) => {
          const fileType = getFileType(file);
          if (!fileType) {
            throw new Error(`지원하지 않는 파일 형식: ${file.name}`);
          }

          const id = generateId();

          // Add document with 'uploading' status
          const newDoc: UploadedDocument = {
            id,
            fileName: file.name,
            fileType,
            fileSize: file.size,
            mimeType: file.type,
            uploadedAt: new Date(),
            status: 'uploading',
          };

          setDocuments((prev) => [...prev, newDoc]);

          // Convert to base64
          try {
            const base64Data = await fileToBase64(file);

            // Update document with base64 data
            const uploadedDoc: UploadedDocument = {
              ...newDoc,
              status: 'uploaded',
              base64Data,
            };

            setDocuments((prev) =>
              prev.map((doc) => (doc.id === id ? uploadedDoc : doc))
            );

            onUploadComplete?.(uploadedDoc);
            return uploadedDoc;
          } catch (err) {
            // Update document with error status
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === id ? { ...doc, status: 'error' } : doc
              )
            );
            throw err;
          }
        });

        await Promise.all(uploadPromises);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete, onError]
  );

  // Remove document
  const removeDocument = useCallback((documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    // Clear results if all documents are removed
    setDocuments((prev) => {
      if (prev.length === 0) {
        setResults(null);
        setAggregatedInsights(null);
      }
      return prev;
    });
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    // Abort any ongoing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setDocuments([]);
    setResults(null);
    setAggregatedInsights(null);
    setError(null);
    setAnalysisProgress(0);
    setIsAnalyzing(false);
    setIsUploading(false);
  }, []);

  // Analyze documents
  const analyzeDocuments = useCallback(
    async (analysisOptions?: AnalysisOptions) => {
      if (documents.length === 0) {
        setError('분석할 문서가 없습니다.');
        return;
      }

      const uploadedDocs = documents.filter((doc) => doc.status === 'uploaded');
      if (uploadedDocs.length === 0) {
        setError('업로드가 완료된 문서가 없습니다.');
        return;
      }

      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setError(null);

      // Update document status to 'analyzing'
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.status === 'uploaded' ? { ...doc, status: 'analyzing' } : doc
        )
      );

      // Create abort controller
      abortControllerRef.current = new AbortController();

      try {
        const request: AnalyzeDocumentRequest = {
          documents: uploadedDocs,
          analysisOptions,
        };

        const response = await fetch('/api/document-analyzer/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || '문서 분석 중 오류가 발생했습니다.');
        }

        // Handle streaming response for progress
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('스트림 응답을 읽을 수 없습니다.');
        }

        let analysisResponse: AnalyzeDocumentResponse | null = null;
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Try to parse complete JSON objects from buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.type === 'progress') {
                  setAnalysisProgress(data.progress);
                } else if (data.type === 'complete') {
                  analysisResponse = data.data;
                }
              } catch {
                // Ignore parsing errors for incomplete JSON
              }
            }
          }
        }

        // Parse any remaining buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.type === 'complete') {
              analysisResponse = data.data;
            } else if (data.success !== undefined) {
              // Direct response without streaming
              analysisResponse = data;
            }
          } catch {
            // If buffer isn't JSON, try parsing the full response
          }
        }

        if (!analysisResponse) {
          throw new Error('분석 결과를 받지 못했습니다.');
        }

        if (!analysisResponse.success) {
          throw new Error(analysisResponse.error || '분석에 실패했습니다.');
        }

        // Update state with results
        setResults(analysisResponse.results);
        setAggregatedInsights(analysisResponse.aggregatedInsights || null);
        setAnalysisProgress(100);

        // Update document status to 'analyzed'
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.status === 'analyzing' ? { ...doc, status: 'analyzed' } : doc
          )
        );

        onAnalysisComplete?.(analysisResponse);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('분석이 취소되었습니다.');
        } else {
          const errorMessage =
            err instanceof Error ? err.message : '문서 분석 중 오류가 발생했습니다.';
          setError(errorMessage);
          onError?.(errorMessage);
        }

        // Reset document status on error
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.status === 'analyzing' ? { ...doc, status: 'uploaded' } : doc
          )
        );
      } finally {
        setIsAnalyzing(false);
        abortControllerRef.current = null;
      }
    },
    [documents, onAnalysisComplete, onError]
  );

  // Save analysis
  const saveAnalysis = useCallback(
    async (name: string, description?: string): Promise<string | null> => {
      if (!results || results.length === 0) {
        setError('저장할 분석 결과가 없습니다.');
        return null;
      }

      try {
        const analysis: SavedAnalysis = {
          id: generateId(),
          name,
          description,
          documents,
          results,
          aggregatedInsights: aggregatedInsights || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          isShared: false,
        };

        const response = await fetch('/api/document-analyzer/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(analysis),
        });

        if (!response.ok) {
          throw new Error('분석 결과 저장에 실패했습니다.');
        }

        const savedData = await response.json();
        setSavedAnalyses((prev) => [...prev, savedData]);

        return savedData.id;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      }
    },
    [documents, results, aggregatedInsights, onError]
  );

  // Load analysis
  const loadAnalysis = useCallback(
    async (analysisId: string) => {
      try {
        const response = await fetch(`/api/document-analyzer/load/${analysisId}`);

        if (!response.ok) {
          throw new Error('분석 결과를 불러오는 데 실패했습니다.');
        }

        const analysis: SavedAnalysis = await response.json();

        setDocuments(analysis.documents);
        setResults(analysis.results);
        setAggregatedInsights(analysis.aggregatedInsights || null);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '불러오기 중 오류가 발생했습니다.';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [onError]
  );

  // Share analysis
  const shareAnalysis = useCallback(async (): Promise<string | null> => {
    if (!results || results.length === 0) {
      setError('공유할 분석 결과가 없습니다.');
      return null;
    }

    try {
      const response = await fetch('/api/document-analyzer/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documents,
          results,
          aggregatedInsights,
        }),
      });

      if (!response.ok) {
        throw new Error('공유 링크 생성에 실패했습니다.');
      }

      const { shareUrl } = await response.json();
      return shareUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '공유 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [documents, results, aggregatedInsights, onError]);

  return {
    documents,
    isUploading,
    isAnalyzing,
    analysisProgress,
    results,
    aggregatedInsights,
    error,
    savedAnalyses,
    uploadFiles,
    removeDocument,
    clearAll,
    analyzeDocuments,
    saveAnalysis,
    loadAnalysis,
    shareAnalysis,
  };
}

export default useDocumentAnalyzer;
