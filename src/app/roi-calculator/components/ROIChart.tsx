'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { ROICalculationResult } from '../page';

interface ROIChartProps {
  data: ROICalculationResult;
  type: 'timeline' | 'breakdown';
}

const COLORS = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  success: '#10B981',
  warning: '#F59E0B',
  accent: '#EF4444',
  gray: '#6B7280',
};

export function ROIChart({ data, type }: ROIChartProps) {
  const timelineData = useMemo(() => {
    return data.monthlyBreakdown.filter((_, index) => index % 3 === 0 || index === data.monthlyBreakdown.length - 1);
  }, [data.monthlyBreakdown]);

  const breakdownData = useMemo(() => {
    return [
      {
        name: '현재 인건비',
        value: data.currentCostPerYear,
        color: COLORS.warning,
      },
      {
        name: 'AI 자동화 후 인건비',
        value: data.currentCostPerYear - data.savingsPerYear,
        color: COLORS.success,
      },
    ];
  }, [data]);

  const comparisonData = useMemo(() => {
    return [
      {
        name: '현재',
        cost: Math.round(data.currentCostPerYear / 10000),
        hours: Math.round(data.totalCurrentHoursPerYear),
      },
      {
        name: 'AI 도입 후',
        cost: Math.round((data.currentCostPerYear - data.savingsPerYear) / 10000),
        hours: Math.round(data.totalCurrentHoursPerYear - data.savedHoursPerYear),
      },
    ];
  }, [data]);

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 10000) {
      return `${(value / 10000).toFixed(0)}억`;
    }
    return `${value.toFixed(0)}만`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[var(--color-gray-100)] p-3 rounded-lg shadow-lg border border-[var(--color-gray-200)]">
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">
            {label}개월차
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value / 10000)}원
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[var(--color-gray-100)] p-3 rounded-lg shadow-lg border border-[var(--color-gray-200)]">
          <p className="text-sm font-medium text-[var(--foreground)] mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name === 'cost' ? '비용' : '시간'}: {entry.value.toLocaleString()}
              {entry.name === 'cost' ? '만원' : '시간'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'timeline') {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">누적 절감액 추이 (36개월)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => `${value}개월`}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => formatCurrency(value / 10000)}
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="누적 절감액"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#colorCumulative)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary-600)]" />
              <span className="text-[var(--color-gray-600)]">누적 절감액</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-[var(--color-gray-400)]" style={{ borderStyle: 'dashed' }} />
              <span className="text-[var(--color-gray-600)]">손익분기점</span>
            </div>
          </div>
        </div>

        {/* Payback point indicator */}
        <div className="p-4 rounded-xl bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 text-center">
          <p className="text-[var(--color-gray-600)]">
            <span className="font-semibold text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]">
              {data.paybackPeriodMonths}개월
            </span>
            째부터 투자 비용을 회수하기 시작합니다
          </p>
        </div>
      </div>
    );
  }

  // Breakdown view
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Cost Comparison Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">비용 비교 (연간)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                tickFormatter={(value) => `${value}만`}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="cost" name="cost" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-success)]/10 text-center">
          <p className="text-sm text-[var(--color-success)]">
            연간 <strong>{Math.round(data.savingsPerYear / 10000).toLocaleString()}만원</strong> 절감
          </p>
        </div>
      </div>

      {/* Hours Comparison */}
      <div>
        <h3 className="text-lg font-semibold mb-4">업무 시간 비교 (연간)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                tickFormatter={(value) => `${value}h`}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="hours" name="hours" fill={COLORS.success} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-500)]/10 text-center">
          <p className="text-sm text-[var(--color-primary-600)]">
            연간 <strong>{Math.round(data.savedHoursPerYear).toLocaleString()}시간</strong> 절감
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="md:col-span-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {Math.round((data.savedHoursPerYear / data.totalCurrentHoursPerYear) * 100)}%
            </p>
            <p className="text-sm text-[var(--color-gray-500)]">업무 시간 절감</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {Math.round(data.savedHoursPerYear / 52)}h
            </p>
            <p className="text-sm text-[var(--color-gray-500)]">주간 절감 시간</p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {Math.round(data.savedHoursPerYear / 2080 * 10) / 10}명
            </p>
            <p className="text-sm text-[var(--color-gray-500)]">FTE 환산</p>
          </div>
        </div>
      </div>
    </div>
  );
}
