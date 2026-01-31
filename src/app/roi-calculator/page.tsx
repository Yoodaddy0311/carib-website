'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Mail,
  Download,
  Send,
  Plus,
  Trash2,
  BarChart3,
  PieChart,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { ROIChart } from './components/ROIChart';
import { ROISummaryCards } from './components/ROISummaryCards';
import { EmailReportModal } from './components/EmailReportModal';
import { generatePDFReport } from './utils/pdfGenerator';
import { SoftwareApplicationSchema, BreadcrumbSchema } from '@/components/StructuredData';

// Task types with automation rates
const TASK_TYPES = [
  { value: 'data-entry', label: '데이터 입력', automationRate: 0.85 },
  { value: 'report', label: '보고서 작성', automationRate: 0.70 },
  { value: 'email', label: '이메일 응대', automationRate: 0.75 },
  { value: 'scheduling', label: '일정 관리', automationRate: 0.80 },
  { value: 'document', label: '문서 정리', automationRate: 0.65 },
  { value: 'customer-service', label: '고객 응대', automationRate: 0.60 },
  { value: 'invoice', label: '청구서 처리', automationRate: 0.90 },
  { value: 'inventory', label: '재고 관리', automationRate: 0.75 },
  { value: 'other', label: '기타', automationRate: 0.50 },
] as const;

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: '매일', multiplier: 52 * 5 }, // 5 days per week
  { value: 'weekly', label: '매주', multiplier: 52 },
  { value: 'bi-weekly', label: '격주', multiplier: 26 },
  { value: 'monthly', label: '매월', multiplier: 12 },
] as const;

export interface TaskEntry {
  id: string;
  taskType: string;
  hoursPerWeek: number;
  frequency: string;
  staffCount: number;
}

export interface ROICalculationResult {
  totalCurrentHoursPerYear: number;
  automatedHoursPerYear: number;
  savedHoursPerYear: number;
  currentCostPerYear: number;
  savingsPerYear: number;
  implementationCost: number;
  paybackPeriodMonths: number;
  threeYearROI: number;
  fiveYearROI: number;
  monthlyBreakdown: { month: number; cumulative: number; savings: number }[];
}

export default function ROICalculatorPage() {
  const [tasks, setTasks] = useState<TaskEntry[]>([
    { id: '1', taskType: 'data-entry', hoursPerWeek: 10, frequency: 'weekly', staffCount: 2 },
  ]);
  const [hourlyRate, setHourlyRate] = useState<number>(25000);
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Add new task
  const addTask = () => {
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        taskType: 'data-entry',
        hoursPerWeek: 5,
        frequency: 'weekly',
        staffCount: 1,
      },
    ]);
  };

  // Remove task
  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((task) => task.id !== id));
    }
  };

  // Update task
  const updateTask = (id: string, field: keyof TaskEntry, value: string | number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  // Calculate ROI
  const calculateROI = useMemo((): ROICalculationResult | null => {
    if (tasks.length === 0) return null;

    let totalCurrentHoursPerYear = 0;
    let automatedHoursPerYear = 0;

    tasks.forEach((task) => {
      const taskTypeData = TASK_TYPES.find((t) => t.value === task.taskType);
      const frequencyData = FREQUENCY_OPTIONS.find((f) => f.value === task.frequency);

      if (taskTypeData && frequencyData) {
        const yearlyHours = task.hoursPerWeek * frequencyData.multiplier * task.staffCount;
        totalCurrentHoursPerYear += yearlyHours;
        automatedHoursPerYear += yearlyHours * taskTypeData.automationRate;
      }
    });

    const savedHoursPerYear = automatedHoursPerYear;
    const currentCostPerYear = totalCurrentHoursPerYear * hourlyRate;
    const savingsPerYear = savedHoursPerYear * hourlyRate;

    // Implementation cost (estimated based on complexity)
    const implementationCost = Math.min(savingsPerYear * 0.5, 50000000); // Max 50M KRW

    // Payback period in months
    const paybackPeriodMonths = implementationCost > 0
      ? Math.ceil((implementationCost / savingsPerYear) * 12)
      : 0;

    // 3-year and 5-year ROI
    const threeYearROI = ((savingsPerYear * 3 - implementationCost) / implementationCost) * 100;
    const fiveYearROI = ((savingsPerYear * 5 - implementationCost) / implementationCost) * 100;

    // Monthly breakdown for chart
    const monthlyBreakdown = Array.from({ length: 36 }, (_, i) => {
      const month = i + 1;
      const cumulativeSavings = (savingsPerYear / 12) * month - implementationCost;
      return {
        month,
        cumulative: cumulativeSavings,
        savings: savingsPerYear / 12,
      };
    });

    return {
      totalCurrentHoursPerYear,
      automatedHoursPerYear,
      savedHoursPerYear,
      currentCostPerYear,
      savingsPerYear,
      implementationCost,
      paybackPeriodMonths,
      threeYearROI,
      fiveYearROI,
      monthlyBreakdown,
    };
  }, [tasks, hourlyRate]);

  // Handle calculate button click
  const handleCalculate = async () => {
    setIsCalculating(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate calculation
    setShowResults(true);
    setIsCalculating(false);

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!calculateROI) return;
    await generatePDFReport(tasks, calculateROI, hourlyRate, TASK_TYPES, FREQUENCY_OPTIONS);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Structured Data */}
      <SoftwareApplicationSchema />
      <BreadcrumbSchema
        items={[
          { name: '홈', url: 'https://carib.team' },
          { name: 'ROI 계산기', url: 'https://carib.team/roi-calculator' },
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden section-padding bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-primary-50)] dark:from-[var(--color-gray-100)] dark:via-[var(--background)] dark:to-[var(--color-gray-100)]">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-500)]/20 text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)] text-sm font-medium mb-6">
                <Calculator className="w-4 h-4" />
                AI 업무 자동화 ROI 계산기
              </div>
            </motion.div>

            <motion.h1
              className="text-display-2 md:text-display-1 font-bold text-[var(--foreground)] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              AI 자동화로{' '}
              <span className="gradient-text">얼마나 절약</span>할 수 있을까요?
            </motion.h1>

            <motion.p
              className="text-body-1 text-[var(--color-gray-600)] dark:text-[var(--color-gray-400)] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              반복되는 업무를 AI로 자동화했을 때 예상되는 비용 절감액과
              투자 회수 기간을 계산해 보세요.
            </motion.p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-[var(--color-primary-200)] dark:bg-[var(--color-primary-500)]/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-[var(--color-accent-200)] dark:bg-[var(--color-accent-500)]/10 rounded-full blur-3xl opacity-30" />
        </div>
      </section>

      {/* Calculator Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Input Form */}
            <div className="lg:col-span-3">
              <Card variant="default" padding="lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-primary-600)]" />
                    업무량 입력
                  </CardTitle>
                  <CardDescription>
                    자동화하고 싶은 반복 업무를 입력해주세요. 여러 업무를 추가할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Task Entries */}
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-[var(--color-gray-600)]">
                            업무 #{index + 1}
                          </span>
                          {tasks.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTask(task.id)}
                              aria-label="업무 삭제"
                            >
                              <Trash2 className="w-4 h-4 text-[var(--color-error)]" />
                            </Button>
                          )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`task-type-${task.id}`}>작업 유형</Label>
                            <Select
                              id={`task-type-${task.id}`}
                              options={TASK_TYPES.map((t) => ({
                                value: t.value,
                                label: t.label,
                              }))}
                              value={task.taskType}
                              onChange={(value) => updateTask(task.id, 'taskType', value)}
                              placeholder="업무 유형 선택"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`frequency-${task.id}`}>반복 주기</Label>
                            <Select
                              id={`frequency-${task.id}`}
                              options={FREQUENCY_OPTIONS.map((f) => ({
                                value: f.value,
                                label: f.label,
                              }))}
                              value={task.frequency}
                              onChange={(value) => updateTask(task.id, 'frequency', value)}
                              placeholder="반복 주기 선택"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`hours-${task.id}`}>주간 소요 시간 (시간)</Label>
                            <Input
                              id={`hours-${task.id}`}
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={task.hoursPerWeek}
                              onChange={(e) =>
                                updateTask(task.id, 'hoursPerWeek', parseFloat(e.target.value) || 0)
                              }
                              leftIcon={<Clock className="w-4 h-4" />}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`staff-${task.id}`}>담당 인력 수</Label>
                            <Input
                              id={`staff-${task.id}`}
                              type="number"
                              min="1"
                              value={task.staffCount}
                              onChange={(e) =>
                                updateTask(task.id, 'staffCount', parseInt(e.target.value) || 1)
                              }
                              leftIcon={<Users className="w-4 h-4" />}
                            />
                          </div>
                        </div>

                        {/* Automation rate indicator */}
                        <div className="mt-4 pt-4 border-t border-[var(--color-gray-200)]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--color-gray-500)]">예상 자동화율</span>
                            <span className="font-medium text-[var(--color-primary-600)]">
                              {Math.round(
                                (TASK_TYPES.find((t) => t.value === task.taskType)?.automationRate || 0) * 100
                              )}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 bg-[var(--color-gray-200)] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)]"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${
                                  (TASK_TYPES.find((t) => t.value === task.taskType)?.automationRate || 0) * 100
                                }%`,
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add task button */}
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={addTask}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    업무 추가
                  </Button>

                  {/* Hourly rate input */}
                  <div className="pt-4 border-t border-[var(--color-gray-200)]">
                    <Label htmlFor="hourly-rate">시간당 인건비 (원)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      min="0"
                      step="1000"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                    <p className="mt-1 text-sm text-[var(--color-gray-500)]">
                      평균 시급 기준으로 입력해주세요 (기본값: 25,000원)
                    </p>
                  </div>

                  {/* Calculate button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleCalculate}
                    isLoading={isCalculating}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    ROI 계산하기
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Summary */}
            <div className="lg:col-span-2">
              <Card variant="elevated" padding="lg" className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--color-accent-500)]" />
                    빠른 요약
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calculateROI ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10">
                        <div className="text-sm text-[var(--color-gray-600)] mb-1">연간 예상 절감액</div>
                        <div className="text-2xl font-bold text-[var(--color-primary-600)]">
                          {calculateROI.savingsPerYear.toLocaleString()}원
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)]">
                          <div className="text-xs text-[var(--color-gray-500)]">절감 시간/년</div>
                          <div className="text-lg font-semibold">
                            {Math.round(calculateROI.savedHoursPerYear).toLocaleString()}시간
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)]">
                          <div className="text-xs text-[var(--color-gray-500)]">투자 회수</div>
                          <div className="text-lg font-semibold">
                            {calculateROI.paybackPeriodMonths}개월
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[var(--color-gray-200)]">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-gray-600)]">
                          <TrendingUp className="w-4 h-4 text-[var(--color-success)]" />
                          <span>3년 ROI: <strong className="text-[var(--color-success)]">{Math.round(calculateROI.threeYearROI)}%</strong></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-[var(--color-gray-400)]">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>업무량을 입력하면<br />예상 절감액을 확인할 수 있습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {showResults && calculateROI && (
          <motion.section
            ref={resultsRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="section-padding bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)]"
          >
            <div className="container-custom">
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success)]/10 mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
                </motion.div>
                <h2 className="text-display-3 font-bold mb-4">ROI 분석 결과</h2>
                <p className="text-body-1 text-[var(--color-gray-600)] max-w-2xl mx-auto">
                  AI 자동화 도입 시 예상되는 비용 절감과 투자 수익률입니다.
                </p>
              </div>

              {/* Summary Cards */}
              <ROISummaryCards result={calculateROI} />

              {/* Charts */}
              <div className="mt-12">
                <Tabs defaultValue="timeline" variant="pills">
                  <TabsList className="justify-center mb-8">
                    <TabsTrigger value="timeline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      투자 회수 타임라인
                    </TabsTrigger>
                    <TabsTrigger value="breakdown">
                      <PieChart className="w-4 h-4 mr-2" />
                      비용 분석
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline">
                    <Card padding="lg">
                      <CardContent>
                        <ROIChart data={calculateROI} type="timeline" />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="breakdown">
                    <Card padding="lg">
                      <CardContent>
                        <ROIChart data={calculateROI} type="breakdown" />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownloadPDF}
                  leftIcon={<Download className="w-5 h-5" />}
                >
                  PDF 리포트 다운로드
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setEmailModalOpen(true)}
                  leftIcon={<Mail className="w-5 h-5" />}
                >
                  이메일로 리포트 발송
                </Button>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-center"
              >
                <Card variant="glass" padding="lg" className="max-w-2xl mx-auto">
                  <CardContent className="py-4">
                    <h3 className="text-heading-2 font-semibold mb-4">
                      AI 자동화 도입을 고민 중이신가요?
                    </h3>
                    <p className="text-[var(--color-gray-600)] mb-6">
                      Carib 전문가와 함께 귀사에 최적화된 AI 자동화 솔루션을 설계해 드립니다.
                      무료 상담을 통해 더 자세한 분석을 받아보세요.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => window.location.href = '/coffee-chat'}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      무료 상담 신청하기
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <EmailReportModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        tasks={tasks}
        result={calculateROI}
        hourlyRate={hourlyRate}
        taskTypes={TASK_TYPES}
        frequencyOptions={FREQUENCY_OPTIONS}
      />
    </div>
  );
}
