'use client';

import { useCallback, useState, useRef, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import type {
  UploadedDocument,
  SupportedFileType,
  DocumentStatus,
} from '@/types/document-analyzer';
import {
  SUPPORTED_MIME_TYPES,
  SUPPORTED_EXTENSIONS,
} from '@/types/document-analyzer';

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  uploadedDocuments: UploadedDocument[];
  onRemoveDocument: (documentId: string) => void;
  isDisabled?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // MB 단위
  className?: string;
}

const FILE_TYPE_ICONS: Record<SupportedFileType, React.ReactNode> = {
  pdf: <FileText className="h-6 w-6 text-red-500" />,
  excel: <FileSpreadsheet className="h-6 w-6 text-green-600" />,
  word: <FileText className="h-6 w-6 text-blue-600" />,
  image: <ImageIcon className="h-6 w-6 text-purple-500" />,
};

const STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  uploading: <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary-500)]" />,
  uploaded: <CheckCircle className="h-4 w-4 text-green-500" />,
  analyzing: <Loader2 className="h-4 w-4 animate-spin text-[var(--color-accent-500)]" />,
  analyzed: <CheckCircle className="h-4 w-4 text-[var(--color-primary-500)]" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
};

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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FileDropzone({
  onFilesSelected,
  uploadedDocuments,
  onRemoveDocument,
  isDisabled = false,
  maxFiles = 10,
  maxFileSize = 20, // 20MB
  className,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errors: string[] = [];
      const currentCount = uploadedDocuments.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 파일 수 제한 확인
        if (currentCount + valid.length >= maxFiles) {
          errors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
          break;
        }

        // 파일 크기 확인
        if (file.size > maxFileSize * 1024 * 1024) {
          errors.push(`${file.name}: 파일 크기가 ${maxFileSize}MB를 초과합니다.`);
          continue;
        }

        // 파일 형식 확인
        const fileType = getFileType(file);
        if (!fileType) {
          errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
          continue;
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [uploadedDocuments.length, maxFiles, maxFileSize]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    setDragError(null);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (isDisabled) return;

      const files = Array.from(e.dataTransfer.files);
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setDragError(errors[0]);
        setTimeout(() => setDragError(null), 5000);
      }

      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [isDisabled, validateFiles, onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setDragError(errors[0]);
        setTimeout(() => setDragError(null), 5000);
      }

      if (valid.length > 0) {
        onFilesSelected(valid);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const allSupportedExtensions = Object.values(SUPPORTED_EXTENSIONS).flat().join(', ');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-8 transition-all duration-300',
          'bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)]',
          isDragOver
            ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10'
            : 'border-[var(--color-gray-300)] hover:border-[var(--color-primary-400)]',
          isDisabled && 'cursor-not-allowed opacity-50',
          dragError && 'border-red-400 bg-red-50 dark:bg-red-500/10'
        )}
        animate={{
          scale: isDragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={Object.values(SUPPORTED_MIME_TYPES).flat().join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={isDisabled}
          aria-label="파일 선택"
        />

        <div className="flex flex-col items-center text-center">
          <motion.div
            className={cn(
              'mb-4 rounded-full p-4',
              isDragOver
                ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
                : 'bg-[var(--color-gray-100)] text-[var(--color-gray-500)]'
            )}
            animate={{
              y: isDragOver ? -8 : 0,
            }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            <Upload className="h-8 w-8" />
          </motion.div>

          <h3 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
            {isDragOver ? '파일을 놓아주세요' : '문서를 업로드하세요'}
          </h3>

          <p className="mb-4 text-sm text-[var(--color-gray-500)]">
            드래그 앤 드롭하거나 클릭하여 파일을 선택하세요
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBrowseClick}
            disabled={isDisabled}
          >
            파일 찾아보기
          </Button>

          <p className="mt-4 text-xs text-[var(--color-gray-400)]">
            지원 형식: {allSupportedExtensions}
          </p>
          <p className="text-xs text-[var(--color-gray-400)]">
            최대 {maxFiles}개 파일, 각 {maxFileSize}MB 이하
          </p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {dragError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 bottom-2 mx-4"
            >
              <div className="flex items-center justify-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{dragError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {uploadedDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-[var(--foreground)]">
              업로드된 파일 ({uploadedDocuments.length}/{maxFiles})
            </h4>

            <div className="space-y-2">
              {uploadedDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3',
                    'bg-white dark:bg-[var(--color-gray-100)]',
                    'border-[var(--color-gray-200)] dark:border-[var(--color-gray-300)]',
                    doc.status === 'error' && 'border-red-300 bg-red-50 dark:bg-red-500/10'
                  )}
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {FILE_TYPE_ICONS[doc.fileType] || <File className="h-6 w-6" />}
                  </div>

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-[var(--color-gray-500)]">
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[doc.status]}
                    <span className="text-xs text-[var(--color-gray-500)]">
                      {doc.status === 'uploading' && '업로드 중...'}
                      {doc.status === 'uploaded' && '업로드 완료'}
                      {doc.status === 'analyzing' && '분석 중...'}
                      {doc.status === 'analyzed' && '분석 완료'}
                      {doc.status === 'error' && '오류 발생'}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveDocument(doc.id)}
                    className={cn(
                      'flex-shrink-0 rounded-lg p-1.5',
                      'text-[var(--color-gray-400)] hover:bg-[var(--color-gray-100)] hover:text-[var(--color-gray-600)]',
                      'transition-colors duration-200'
                    )}
                    aria-label={`${doc.fileName} 삭제`}
                    disabled={doc.status === 'analyzing'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileDropzone;
