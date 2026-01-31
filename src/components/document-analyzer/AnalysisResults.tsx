'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Share2,
  FileText,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type {
  DocumentAnalysisResult,
  AggregatedInsights,
  AutomationOpportunity,
  Recommendation,
  AutomationTaskType,
  ChartData,
} from '@/types/document-analyzer';

interface AnalysisResultsProps {
  results: DocumentAnalysisResult[];
  aggregatedInsights: AggregatedInsights | null;
  onSaveAnalysis?: () => void;
  onShareAnalysis?: () => void;
  onExportPDF?: () => void;
  className?: string;
}

const AUTOMATION_TASK_LABELS: Record<AutomationTaskType, string> = {
  'data-entry': '데이터 입력',
  'data-extraction': '데이터 추출',
  'formatting': '형식 변환',
  'calculation': '계산/집계',
  'validation': '검증/확인',
  'notification': '알림/통보',
  'approval': '승인/결재',
  'reporting': '보고서 생성',
  'file-management': '파일 관리',
  'communication': '커뮤니케이션',
  'other': '기타',
};

const SCORE_COLORS = {
  low: '#ef4444',       // red-500
  medium: '#f59e0b',    // amber-500
  high: '#22c55e',      // green-500
  'very-high': '#06b6d4', // cyan-500
};

const PIE_COLORS = [
  'var(--color-primary-500)',
  'var(--color-accent-500)',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
];

function getScoreColor(score: number): string {
  if (score >= 80) return SCORE_COLORS['very-high'];
  if (score >= 60) return SCORE_COLORS.high;
  if (score >= 40) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return '매우 높음';
  if (score >= 60) return '높음';
  if (score >= 40) return '보통';
  return '낮음';
}

function getPriorityBadge(priority: string) {
  const variants: Record<string, { variant: 'default' | 'secondary'; className: string }> = {
    critical: { variant: 'default', className: 'bg-red-500' },
    high: { variant: 'default', className: 'bg-orange-500' },
    medium: { variant: 'secondary', className: 'bg-yellow-500 text-black' },
    low: { variant: 'secondary', className: '' },
  };
  const config = variants[priority] || variants.low;
  return (
    <Badge variant={config.variant} className={config.className}>
      {priority === 'critical' ? '긴급' : priority === 'high' ? '높음' : priority === 'medium' ? '보통' : '낮음'}
    </Badge>
  );
}

// Summary Stats Component
function SummaryStats({
  insights,
}: {
  insights: AggregatedInsights;
}) {
  const stats = [
    {
      icon: <FileText className="h-5 w-5" />,
      label: '분석 문서',
      value: insights.totalDocumentsAnalyzed,
      suffix: '개',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: '자동화 점수',
      value: insights.overallAutomationPotential.score,
      suffix: '점',
      color: getScoreColor(insights.overallAutomationPotential.score),
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: '예상 월간 절감',
      value: insights.totalEstimatedTimeSaving.hoursPerMonth,
      suffix: '시간',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: '효율성 개선',
      value: insights.totalEstimatedTimeSaving.percentageImprovement,
      suffix: '%',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'rounded-xl border p-4',
            'bg-white dark:bg-[var(--color-gray-100)]',
            'border-[var(--color-gray-200)]'
          )}
        >
          <div className="flex items-center gap-2 text-[var(--color-gray-500)]">
            {stat.icon}
            <span className="text-sm">{stat.label}</span>
          </div>
          <p
            className="mt-2 text-2xl font-bold"
            style={{ color: stat.color || 'var(--foreground)' }}
          >
            {stat.value}
            <span className="text-sm font-normal text-[var(--color-gray-500)]">
              {stat.suffix}
            </span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// Automation Score Gauge
function AutomationScoreGauge({
  score,
  confidence,
}: {
  score: number;
  confidence: number;
}) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90 transform">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="var(--color-gray-200)"
            strokeWidth="10"
            fill="none"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            stroke={getScoreColor(score)}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ color: getScoreColor(score) }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-[var(--color-gray-500)]">점</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="font-medium">{getScoreLabel(score)}</p>
        <p className="text-xs text-[var(--color-gray-500)]">
          신뢰도: {confidence}%
        </p>
      </div>
    </div>
  );
}

// Opportunities List
function OpportunitiesList({
  opportunities,
}: {
  opportunities: AutomationOpportunity[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedOpportunities = useMemo(
    () =>
      [...opportunities].sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (
          (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)
        );
      }),
    [opportunities]
  );

  return (
    <div className="space-y-3">
      {sortedOpportunities.map((opp, index) => (
        <motion.div
          key={opp.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'rounded-xl border overflow-hidden',
            'bg-white dark:bg-[var(--color-gray-100)]',
            'border-[var(--color-gray-200)]'
          )}
        >
          <button
            onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
            className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-[var(--color-gray-50)]"
          >
            {/* Score Indicator */}
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white font-bold"
              style={{ backgroundColor: getScoreColor(opp.automationScore.score) }}
            >
              {opp.automationScore.score}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-[var(--foreground)] truncate">
                  {opp.taskName}
                </h4>
                {getPriorityBadge(opp.priority)}
              </div>
              <p className="text-sm text-[var(--color-gray-500)] truncate">
                {AUTOMATION_TASK_LABELS[opp.taskType]} |
                예상 절감: {opp.currentTimePerTask}분/건
              </p>
            </div>

            {/* Chevron */}
            {expandedId === opp.id ? (
              <ChevronUp className="h-5 w-5 flex-shrink-0 text-[var(--color-gray-400)]" />
            ) : (
              <ChevronDown className="h-5 w-5 flex-shrink-0 text-[var(--color-gray-400)]" />
            )}
          </button>

          <AnimatePresence>
            {expandedId === opp.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-[var(--color-gray-200)]"
              >
                <div className="space-y-4 p-4">
                  <p className="text-sm text-[var(--color-gray-600)]">
                    {opp.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--color-gray-500)]">자동화 가능률:</span>
                      <span className="ml-2 font-medium">{opp.estimatedAutomationRate}%</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-gray-500)]">복잡도:</span>
                      <span className="ml-2 font-medium">
                        {opp.complexity === 'low' ? '낮음' : opp.complexity === 'medium' ? '보통' : '높음'}
                      </span>
                    </div>
                  </div>

                  {opp.suggestedTools.length > 0 && (
                    <div>
                      <span className="text-sm text-[var(--color-gray-500)]">추천 도구:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {opp.suggestedTools.map((tool) => (
                          <Badge key={tool} variant="secondary">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// Recommendations List
function RecommendationsList({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'transformative':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'rounded-xl border overflow-hidden',
            'bg-white dark:bg-[var(--color-gray-100)]',
            'border-[var(--color-gray-200)]'
          )}
        >
          <button
            onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
            className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-[var(--color-gray-50)]"
          >
            <div className="flex-shrink-0">
              {getImpactIcon(rec.impact)}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-[var(--foreground)]">{rec.title}</h4>
              <p className="text-sm text-[var(--color-gray-500)]">
                월 {rec.estimatedTimeSaving.hoursPerMonth}시간 절감 예상
              </p>
            </div>

            <Badge
              variant={rec.type === 'quick-win' ? 'default' : 'secondary'}
              className={rec.type === 'quick-win' ? 'bg-green-500' : ''}
            >
              {rec.type === 'quick-win'
                ? '빠른 개선'
                : rec.type === 'process-change'
                ? '프로세스 변경'
                : rec.type === 'tool-adoption'
                ? '도구 도입'
                : rec.type === 'integration'
                ? '시스템 연동'
                : '맞춤 솔루션'}
            </Badge>

            {expandedId === rec.id ? (
              <ChevronUp className="h-5 w-5 flex-shrink-0 text-[var(--color-gray-400)]" />
            ) : (
              <ChevronDown className="h-5 w-5 flex-shrink-0 text-[var(--color-gray-400)]" />
            )}
          </button>

          <AnimatePresence>
            {expandedId === rec.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-[var(--color-gray-200)]"
              >
                <div className="space-y-4 p-4">
                  <p className="text-sm text-[var(--color-gray-600)]">
                    {rec.description}
                  </p>

                  <div className="rounded-lg bg-[var(--color-primary-50)] p-3 dark:bg-[var(--color-primary-500)]/10">
                    <h5 className="mb-2 text-sm font-medium text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]">
                      추천 솔루션
                    </h5>
                    <p className="text-sm text-[var(--color-primary-600)] dark:text-[var(--color-primary-300)]">
                      {rec.suggestedSolution}
                    </p>
                  </div>

                  {rec.implementationSteps.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium">구현 단계</h5>
                      <ol className="space-y-2">
                        {rec.implementationSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-medium text-[var(--color-primary-600)]">
                              {i + 1}
                            </span>
                            <span className="text-[var(--color-gray-600)]">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {rec.tools.length > 0 && (
                    <div>
                      <h5 className="mb-2 text-sm font-medium">추천 도구</h5>
                      <div className="space-y-2">
                        {rec.tools.map((tool) => (
                          <div
                            key={tool.name}
                            className="flex items-center justify-between rounded-lg border border-[var(--color-gray-200)] p-2"
                          >
                            <div>
                              <p className="text-sm font-medium">{tool.name}</p>
                              <p className="text-xs text-[var(--color-gray-500)]">
                                {tool.category}
                              </p>
                            </div>
                            {tool.pricing && (
                              <span className="text-xs text-[var(--color-gray-500)]">
                                {tool.pricing}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// Charts Component
function AnalysisCharts({
  insights,
  results,
}: {
  insights: AggregatedInsights;
  results: DocumentAnalysisResult[];
}) {
  // Prepare chart data
  const taskTypeData = useMemo(() => {
    const taskCounts: Record<AutomationTaskType, { count: number; totalScore: number }> = {} as Record<AutomationTaskType, { count: number; totalScore: number }>;

    results.forEach((result) => {
      result.automationOpportunities.forEach((opp) => {
        if (!taskCounts[opp.taskType]) {
          taskCounts[opp.taskType] = { count: 0, totalScore: 0 };
        }
        taskCounts[opp.taskType].count++;
        taskCounts[opp.taskType].totalScore += opp.automationScore.score;
      });
    });

    return Object.entries(taskCounts).map(([type, data]) => ({
      name: AUTOMATION_TASK_LABELS[type as AutomationTaskType],
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
    }));
  }, [results]);

  const scoreDistribution = useMemo(() => {
    const distribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    results.forEach((result) => {
      result.automationOpportunities.forEach((opp) => {
        const score = opp.automationScore.score;
        if (score <= 20) distribution['0-20']++;
        else if (score <= 40) distribution['21-40']++;
        else if (score <= 60) distribution['41-60']++;
        else if (score <= 80) distribution['61-80']++;
        else distribution['81-100']++;
      });
    });

    return Object.entries(distribution).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  }, [results]);

  const projectionData = useMemo(() => {
    const monthlyHours = insights.totalEstimatedTimeSaving.hoursPerMonth;
    const months = ['1월', '2월', '3월', '4월', '5월', '6월'];
    const baseHours = 160; // 월 기본 업무 시간

    return months.map((month, index) => ({
      month,
      current: baseHours,
      projected: Math.max(0, baseHours - monthlyHours * (0.2 * (index + 1))),
    }));
  }, [insights.totalEstimatedTimeSaving.hoursPerMonth]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Task Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-5 w-5" />
            작업 유형별 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            자동화 점수 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={scoreDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
              >
                {scoreDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Saving Projection */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5" />
            시간 절감 예상 (6개월)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--color-gray-400)"
                strokeDasharray="5 5"
                name="현재 업무량"
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="var(--color-primary-500)"
                strokeWidth={2}
                name="자동화 후 예상"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Component
export function AnalysisResults({
  results,
  aggregatedInsights,
  onSaveAnalysis,
  onShareAnalysis,
  onExportPDF,
  className,
}: AnalysisResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'recommendations' | 'charts'>(
    'overview'
  );

  if (!aggregatedInsights || results.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <FileText className="mx-auto h-12 w-12 text-[var(--color-gray-300)]" />
        <p className="mt-4 text-[var(--color-gray-500)]">분석 결과가 없습니다.</p>
      </div>
    );
  }

  const allOpportunities = results.flatMap((r) => r.automationOpportunities);
  const allRecommendations = results.flatMap((r) => r.recommendations);

  const tabs = [
    { id: 'overview', label: '개요' },
    { id: 'opportunities', label: `자동화 기회 (${allOpportunities.length})` },
    { id: 'recommendations', label: `권장 사항 (${allRecommendations.length})` },
    { id: 'charts', label: '차트' },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">분석 결과</h2>
        <div className="flex gap-2">
          {onSaveAnalysis && (
            <Button variant="outline" size="sm" onClick={onSaveAnalysis}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              저장
            </Button>
          )}
          {onShareAnalysis && (
            <Button variant="outline" size="sm" onClick={onShareAnalysis}>
              <Share2 className="mr-2 h-4 w-4" />
              공유
            </Button>
          )}
          {onExportPDF && (
            <Button variant="primary" size="sm" onClick={onExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF 내보내기
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <SummaryStats insights={aggregatedInsights} />

      {/* Tabs */}
      <div className="border-b border-[var(--color-gray-200)]">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-[var(--color-primary-500)] text-[var(--color-primary-600)]'
                  : 'border-transparent text-[var(--color-gray-500)] hover:text-[var(--color-gray-700)]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Score Gauge */}
              <Card className="flex items-center justify-center p-6">
                <AutomationScoreGauge
                  score={aggregatedInsights.overallAutomationPotential.score}
                  confidence={aggregatedInsights.overallAutomationPotential.confidence}
                />
              </Card>

              {/* Top Opportunities */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">상위 자동화 기회</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aggregatedInsights.topOpportunities.slice(0, 3).map((opp) => (
                      <div
                        key={opp.id}
                        className="flex items-center gap-3 rounded-lg border border-[var(--color-gray-200)] p-3"
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ backgroundColor: getScoreColor(opp.automationScore.score) }}
                        >
                          {opp.automationScore.score}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{opp.taskName}</p>
                          <p className="text-sm text-[var(--color-gray-500)]">
                            {opp.currentTimePerTask}분/건 절감 가능
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[var(--color-gray-400)]" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Document Summaries */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">문서별 분석 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className="rounded-lg border border-[var(--color-gray-200)] p-4"
                      >
                        <h4 className="mb-2 font-medium truncate">{result.documentName}</h4>
                        <p className="mb-3 text-sm text-[var(--color-gray-500)] line-clamp-2">
                          {result.summary.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-gray-500)]">
                            자동화 기회: {result.automationOpportunities.length}개
                          </span>
                          <Badge
                            style={{
                              backgroundColor: getScoreColor(result.overallScore.score),
                              color: 'white',
                            }}
                          >
                            {result.overallScore.score}점
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <OpportunitiesList opportunities={allOpportunities} />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsList recommendations={allRecommendations} />
          )}

          {activeTab === 'charts' && (
            <AnalysisCharts insights={aggregatedInsights} results={results} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AnalysisResults;
