'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  FileSearch,
  FileText,
  FileSpreadsheet,
  Image,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { DocumentAnalyzer } from '@/components/document-analyzer';
import { Card, CardContent, Button, Badge } from '@/components/ui';

export default function DocumentAnalyzerDemoPage() {
  const [showInfo, setShowInfo] = useState(true);

  const features = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'PDF 분석',
      description: '청구서, 계약서, 보고서 등 PDF 문서 분석',
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6" />,
      title: 'Excel/Word 지원',
      description: '스프레드시트 및 워드 문서 분석',
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: '이미지 분석',
      description: 'PNG, JPG 등 이미지 파일의 텍스트 인식',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'AI 기반 분석',
      description: 'Gemini Vision API로 자동화 기회 식별',
    },
  ];

  const benefits = [
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: '반복 작업 자동 식별',
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      text: '시간 절감 효과 예측',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
      text: '자동화 우선순위 제안',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)] dark:bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--color-gray-200)] bg-white dark:bg-[var(--color-gray-100)]">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/demo"
              className="flex items-center gap-2 text-[var(--color-gray-600)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>데모로 돌아가기</span>
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">AI-004</Badge>
              <Badge variant="default" className="bg-green-500">
                Beta
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Info Section */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-[var(--color-primary-200)] bg-gradient-to-r from-[var(--color-primary-50)] to-[var(--color-accent-50)] dark:from-[var(--color-primary-500)]/10 dark:to-[var(--color-accent-500)]/10">
              <CardContent className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-500)]">
                      <FileSearch className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[var(--foreground)]">
                        AI 문서 분석기에 오신 것을 환영합니다
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-gray-600)]">
                        업무 문서를 업로드하면 AI가 자동화 가능한 영역을 분석하고
                        구체적인 개선 방안을 제안합니다. 반복 작업을 식별하고
                        시간 절감 효과를 예측해 드립니다.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInfo(false)}
                    className="flex-shrink-0"
                  >
                    닫기
                  </Button>
                </div>

                {/* Features Grid */}
                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 rounded-lg bg-white/60 p-3 dark:bg-[var(--color-gray-100)]/60"
                    >
                      <div className="flex-shrink-0 text-[var(--color-primary-500)]">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-[var(--foreground)]">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-[var(--color-gray-500)]">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="mt-4 flex flex-wrap gap-4">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit.text}
                      className="flex items-center gap-2 text-sm text-[var(--color-gray-600)]"
                    >
                      {benefit.icon}
                      <span>{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Document Analyzer Component */}
        <DocumentAnalyzer showHeader={true} />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-gray-200)] bg-white py-6 dark:bg-[var(--color-gray-100)]">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-[var(--color-gray-500)]">
            Powered by Google Gemini Vision API |{' '}
            <Link href="/legal/privacy" className="hover:underline">
              개인정보처리방침
            </Link>
          </p>
          <p className="mt-2 text-xs text-[var(--color-gray-400)]">
            업로드된 문서는 분석 후 즉시 삭제되며, 서버에 저장되지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
