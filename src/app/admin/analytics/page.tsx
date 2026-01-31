'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  MessageSquare,
  FileText,
  Bot,
  TrendingUp,
  Calendar,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
} from 'lucide-react';
import {
  collection,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import type { InquiryStatus, ThreadCategory } from '@/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

interface AnalyticsStats {
  totalInquiries: number;
  weeklyInquiries: number;
  monthlyInquiries: number;
  totalThreads: number;
  totalChatSessions: number;
  totalChatMessages: number;
  avgMessagesPerSession: number;
}

interface TimeSeriesData {
  date: string;
  inquiries: number;
  chatSessions: number;
  visitors: number;
}

interface StatusDistribution {
  status: InquiryStatus;
  count: number;
  percentage: number;
}

interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

interface InquiryTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface FirestoreInquiry {
  id: string;
  type?: string;
  status?: InquiryStatus;
  data?: {
    name?: string;
    email?: string;
    company?: string;
  };
  createdAt: Date;
}

interface FirestoreThread {
  id: string;
  category?: ThreadCategory;
  summary?: string;
  content?: string;
  publishedAt: Date;
}

interface FirestoreChatSession {
  id: string;
  messageCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

type DateRangeType = '7days' | '30days' | '90days' | '1year';
type ViewMode = 'daily' | 'weekly' | 'monthly';

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<InquiryStatus, { label: string; color: string }> = {
  new: { label: 'New', color: '#6366f1' },
  contacted: { label: 'Contacted', color: '#f59e0b' },
  scheduled: { label: 'Scheduled', color: '#8b5cf6' },
  completed: { label: 'Completed', color: '#10b981' },
  archived: { label: 'Archived', color: '#6b7280' },
};

const CATEGORY_CONFIG: Record<ThreadCategory, { label: string; color: string }> = {
  'ai-automation': { label: 'AI Automation', color: '#6366f1' },
  'no-code': { label: 'No-Code', color: '#10b981' },
  productivity: { label: 'Productivity', color: '#f59e0b' },
  'case-study': { label: 'Case Study', color: '#ef4444' },
  tutorial: { label: 'Tutorial', color: '#8b5cf6' },
  insight: { label: 'Insight', color: '#06b6d4' },
};

const INQUIRY_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  'coffee-chat': { label: 'Coffee Chat', color: '#6366f1' },
  project: { label: 'Project', color: '#10b981' },
  general: { label: 'General', color: '#f59e0b' },
};

const DATE_RANGE_OPTIONS = [
  { value: '7days' as DateRangeType, label: 'Last 7 Days' },
  { value: '30days' as DateRangeType, label: 'Last 30 Days' },
  { value: '90days' as DateRangeType, label: 'Last 90 Days' },
  { value: '1year' as DateRangeType, label: 'Last Year' },
];

const VIEW_MODE_OPTIONS = [
  { value: 'daily' as ViewMode, label: 'Daily' },
  { value: 'weekly' as ViewMode, label: 'Weekly' },
  { value: 'monthly' as ViewMode, label: 'Monthly' },
];

// const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ============================================================================
// Helper Functions
// ============================================================================

function getDateRange(range: DateRangeType): Date {
  const now = new Date();
  switch (range) {
    case '7days':
      return new Date(now.setDate(now.getDate() - 7));
    case '30days':
      return new Date(now.setDate(now.getDate() - 30));
    case '90days':
      return new Date(now.setDate(now.getDate() - 90));
    case '1year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
  }
}

function formatDateLabel(date: Date, mode: ViewMode): string {
  switch (mode) {
    case 'daily':
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    case 'weekly':
      const weekNum = Math.ceil(date.getDate() / 7);
      return `${date.toLocaleDateString('ko-KR', { month: 'short' })} W${weekNum}`;
    case 'monthly':
      return date.toLocaleDateString('ko-KR', { year: '2-digit', month: 'short' });
  }
}

function getDateKey(date: Date, mode: ViewMode): string {
  switch (mode) {
    case 'daily':
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    case 'weekly':
      const weekNum = Math.ceil(date.getDate() / 7);
      return `${date.getFullYear()}-${date.getMonth()}-W${weekNum}`;
    case 'monthly':
      return `${date.getFullYear()}-${date.getMonth()}`;
  }
}

function generateDateRangeArray(startDate: Date, endDate: Date, mode: ViewMode): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    switch (mode) {
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return dates;
}

// ============================================================================
// Custom Tooltip Components
// ============================================================================

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[var(--color-gray-800)] p-3 rounded-lg shadow-lg border border-[var(--color-gray-200)]">
      <p className="text-sm font-medium text-[var(--color-gray-900)] mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--color-gray-600)]">{entry.name}:</span>
          <span className="font-medium text-[var(--color-gray-900)]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminAnalyticsPage() {
  // State
  const [stats, setStats] = useState<AnalyticsStats>({
    totalInquiries: 0,
    weeklyInquiries: 0,
    monthlyInquiries: 0,
    totalThreads: 0,
    totalChatSessions: 0,
    totalChatMessages: 0,
    avgMessagesPerSession: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [inquiryTypeDistribution, setInquiryTypeDistribution] = useState<InquiryTypeDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeType>('30days');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rangeStartDate = getDateRange(dateRange);
      const now = new Date();

      // Fetch all inquiries
      const inquiriesSnapshot = await getDocs(collection(db, 'inquiries'));
      const allInquiries: FirestoreInquiry[] = inquiriesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          status: data.status,
          data: data.data,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      // Filter inquiries by date range
      const filteredInquiries = allInquiries.filter(
        (inq) => inq.createdAt >= rangeStartDate
      );

      // Calculate inquiry stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const weeklyInquiries = allInquiries.filter(
        (inq) => inq.createdAt >= oneWeekAgo
      ).length;
      const monthlyInquiries = allInquiries.filter(
        (inq) => inq.createdAt >= oneMonthAgo
      ).length;

      // Fetch threads
      const threadsSnapshot = await getDocs(collection(db, 'threads'));
      const threads: FirestoreThread[] = threadsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          category: data.category,
          summary: data.summary,
          content: data.content,
          publishedAt: data.publishedAt?.toDate() || new Date(),
        };
      });

      // Fetch chat sessions
      let chatSessions: FirestoreChatSession[] = [];
      let totalMessages = 0;
      try {
        const chatSessionsSnapshot = await getDocs(collection(db, 'chat_sessions'));
        chatSessions = chatSessionsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            messageCount: data.messages?.length || data.messageCount || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate(),
          };
        });
        totalMessages = chatSessions.reduce((sum, session) => sum + (session.messageCount || 0), 0);
      } catch {
        // Collection might not exist
      }

      // Calculate average messages per session
      const avgMessages = chatSessions.length > 0 ? totalMessages / chatSessions.length : 0;

      // Update stats
      setStats({
        totalInquiries: allInquiries.length,
        weeklyInquiries,
        monthlyInquiries,
        totalThreads: threads.length,
        totalChatSessions: chatSessions.length,
        totalChatMessages: totalMessages,
        avgMessagesPerSession: Math.round(avgMessages * 10) / 10,
      });

      // Generate time series data
      const dateArray = generateDateRangeArray(rangeStartDate, now, viewMode);
      const timeSeriesMap = new Map<string, TimeSeriesData>();

      // Initialize all dates
      dateArray.forEach((date) => {
        const key = getDateKey(date, viewMode);
        timeSeriesMap.set(key, {
          date: formatDateLabel(date, viewMode),
          inquiries: 0,
          chatSessions: 0,
          visitors: 0,
        });
      });

      // Count inquiries per period
      filteredInquiries.forEach((inq) => {
        const key = getDateKey(inq.createdAt, viewMode);
        const existing = timeSeriesMap.get(key);
        if (existing) {
          existing.inquiries++;
          existing.visitors++; // Proxy for visitors
        }
      });

      // Count chat sessions per period
      chatSessions
        .filter((session) => session.createdAt >= rangeStartDate)
        .forEach((session) => {
          const key = getDateKey(session.createdAt, viewMode);
          const existing = timeSeriesMap.get(key);
          if (existing) {
            existing.chatSessions++;
          }
        });

      setTimeSeriesData(Array.from(timeSeriesMap.values()));

      // Calculate status distribution
      const statusMap = new Map<InquiryStatus, number>();
      const allStatuses: InquiryStatus[] = ['new', 'contacted', 'scheduled', 'completed', 'archived'];
      allStatuses.forEach((status) => statusMap.set(status, 0));

      filteredInquiries.forEach((inq) => {
        const status = inq.status as InquiryStatus;
        if (status) {
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        }
      });

      const totalForStatus = filteredInquiries.length;
      const statusData: StatusDistribution[] = allStatuses
        .map((status) => ({
          status,
          count: statusMap.get(status) || 0,
          percentage: totalForStatus > 0 ? ((statusMap.get(status) || 0) / totalForStatus) * 100 : 0,
        }))
        .filter((item) => item.count > 0);
      setStatusDistribution(statusData);

      // Calculate inquiry type distribution
      const typeMap = new Map<string, number>();
      filteredInquiries.forEach((inq) => {
        const type = inq.type || 'general';
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });

      const totalForType = filteredInquiries.length;
      const typeData: InquiryTypeDistribution[] = Array.from(typeMap.entries())
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalForType > 0 ? (count / totalForType) * 100 : 0,
        }))
        .filter((item) => item.count > 0);
      setInquiryTypeDistribution(typeData);

      // Calculate category distribution for threads
      const categoryMap = new Map<string, number>();
      threads.forEach((thread) => {
        const category = thread.category || 'insight';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const totalForCategory = threads.length;
      const categoryData: CategoryDistribution[] = Array.from(categoryMap.entries())
        .map(([category, count]) => ({
          category,
          count,
          percentage: totalForCategory > 0 ? (count / totalForCategory) * 100 : 0,
        }))
        .filter((item) => item.count > 0);
      setCategoryDistribution(categoryData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, viewMode]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Prepare chart data
  const statusChartData = useMemo(
    () =>
      statusDistribution.map((s) => ({
        name: STATUS_CONFIG[s.status]?.label || s.status,
        value: s.count,
        color: STATUS_CONFIG[s.status]?.color || '#6b7280',
      })),
    [statusDistribution]
  );

  const categoryChartData = useMemo(
    () =>
      categoryDistribution.map((c) => ({
        name: CATEGORY_CONFIG[c.category as ThreadCategory]?.label || c.category,
        value: c.count,
        color: CATEGORY_CONFIG[c.category as ThreadCategory]?.color || '#6b7280',
      })),
    [categoryDistribution]
  );

  const inquiryTypeChartData = useMemo(
    () =>
      inquiryTypeDistribution.map((t) => ({
        name: INQUIRY_TYPE_CONFIG[t.type]?.label || t.type,
        value: t.count,
        color: INQUIRY_TYPE_CONFIG[t.type]?.color || '#6b7280',
      })),
    [inquiryTypeDistribution]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
          <p className="text-[var(--color-gray-500)] text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-gray-900)]">Analytics</h1>
          <p className="text-[var(--color-gray-500)] mt-1">
            Track your website performance and engagement metrics.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-gray-400)]" />
            <Select
              options={DATE_RANGE_OPTIONS}
              value={dateRange}
              onChange={(value) => setDateRange(value)}
              selectSize="sm"
              className="w-36"
            />
          </div>
          <Select
            options={VIEW_MODE_OPTIONS}
            value={viewMode}
            onChange={(value) => setViewMode(value)}
            selectSize="sm"
            className="w-28"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare className="w-6 h-6" />}
          value={stats.totalInquiries}
          label="Total Inquiries"
          trend={{
            value: stats.weeklyInquiries > 0 ? Math.round((stats.weeklyInquiries / (stats.totalInquiries || 1)) * 100) : 0,
            direction: stats.weeklyInquiries > 0 ? 'up' : 'neutral',
          }}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          value={stats.monthlyInquiries}
          label="Monthly Inquiries"
          trend={{
            value: stats.monthlyInquiries > 0 ? 12 : 0,
            direction: stats.monthlyInquiries > 0 ? 'up' : 'neutral',
          }}
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          value={stats.totalThreads}
          label="Total Threads"
          trend={{ value: 0, direction: 'neutral' }}
        />
        <StatCard
          icon={<Bot className="w-6 h-6" />}
          value={stats.totalChatSessions}
          label="Chat Sessions"
          trend={{
            value: stats.totalChatSessions > 0 ? 8 : 0,
            direction: stats.totalChatSessions > 0 ? 'up' : 'neutral',
          }}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="inquiries">
            <MessageSquare className="w-4 h-4 mr-2" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="chatbot">
            <Bot className="w-4 h-4 mr-2" />
            Chatbot
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visitor Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Visitor & Inquiry Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="colorInquiries" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="inquiries"
                          name="Inquiries"
                          stroke="#6366f1"
                          fillOpacity={1}
                          fill="url(#colorInquiries)"
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          name="Visitors"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorVisitors)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No data available for the selected period
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Inquiry Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChartIcon className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Inquiry Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {statusChartData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {statusChartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[var(--color-gray-600)] flex-1">{item.name}</span>
                            <span className="font-medium text-[var(--color-gray-900)]">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No inquiry data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inquiry Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Inquiry Trends ({viewMode === 'daily' ? 'Daily' : viewMode === 'weekly' ? 'Weekly' : 'Monthly'})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="inquiries" name="Inquiries" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No inquiry data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Inquiry Type Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChartIcon className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Inquiry Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {inquiryTypeChartData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={250}>
                        <PieChart>
                          <Pie
                            data={inquiryTypeChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {inquiryTypeChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {inquiryTypeChartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[var(--color-gray-600)] flex-1">{item.name}</span>
                            <span className="font-medium text-[var(--color-gray-900)]">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No inquiry type data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Breakdown Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {statusChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={statusChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                        <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          width={100}
                        />
                        <Tooltip />
                        <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No status data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="p-4 bg-[var(--color-primary-50)] rounded-2xl mb-4">
                    <Bot className="w-8 h-8 text-[var(--color-primary-600)]" />
                  </div>
                  <p className="text-4xl font-bold text-[var(--color-gray-900)]">
                    {stats.totalChatSessions}
                  </p>
                  <p className="text-[var(--color-gray-500)] mt-1">Total Sessions</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="p-4 bg-[var(--color-success)]/20 rounded-2xl mb-4">
                    <MessageSquare className="w-8 h-8 text-[var(--color-success)]" />
                  </div>
                  <p className="text-4xl font-bold text-[var(--color-gray-900)]">
                    {stats.totalChatMessages}
                  </p>
                  <p className="text-[var(--color-gray-500)] mt-1">Total Messages</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="p-4 bg-[var(--color-warning)]/20 rounded-2xl mb-4">
                    <TrendingUp className="w-8 h-8 text-[var(--color-warning)]" />
                  </div>
                  <p className="text-4xl font-bold text-[var(--color-gray-900)]">
                    {stats.avgMessagesPerSession}
                  </p>
                  <p className="text-[var(--color-gray-500)] mt-1">Avg Messages/Session</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chat Session Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="lg:col-span-3"
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Chat Session Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {timeSeriesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="chatSessions"
                          name="Chat Sessions"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ fill: '#6366f1', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No chat session data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thread Category Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Thread Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {categoryChartData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={250}>
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {categoryChartData.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[var(--color-gray-600)] flex-1">{item.name}</span>
                            <span className="font-medium text-[var(--color-gray-900)]">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No thread data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Threads by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: 'var(--color-gray-500)' }}
                          axisLine={{ stroke: 'var(--color-gray-200)' }}
                        />
                        <Tooltip />
                        <Bar dataKey="value" name="Threads" radius={[4, 4, 0, 0]}>
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-16 text-[var(--color-gray-500)]">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-[var(--color-primary-600)]" />
                    Content Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[var(--color-primary-600)]">
                        {stats.totalThreads}
                      </p>
                      <p className="text-[var(--color-gray-500)] mt-1">Total Threads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[var(--color-success)]">
                        {categoryDistribution.length}
                      </p>
                      <p className="text-[var(--color-gray-500)] mt-1">Categories Used</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[var(--color-warning)]">
                        {categoryChartData.length > 0
                          ? categoryChartData.reduce((prev, current) =>
                              prev.value > current.value ? prev : current
                            ).name
                          : 'N/A'}
                      </p>
                      <p className="text-[var(--color-gray-500)] mt-1">Top Category</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
              <CardTitle className="text-base">Inquiry Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-gray-600)]">New Inquiries</span>
                <span className="font-semibold text-[var(--color-primary-600)]">
                  {statusDistribution.find((s) => s.status === 'new')?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-gray-600)]">Pending Contact</span>
                <span className="font-semibold text-[var(--color-warning)]">
                  {statusDistribution.find((s) => s.status === 'contacted')?.count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-gray-600)]">Completed</span>
                <span className="font-semibold text-[var(--color-success)]">
                  {statusDistribution.find((s) => s.status === 'completed')?.count || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
              <CardTitle className="text-base">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-[var(--color-primary-600)]">
                  {stats.totalInquiries > 0
                    ? (
                        ((statusDistribution.find((s) => s.status === 'completed')?.count || 0) /
                          stats.totalInquiries) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
                <p className="text-sm text-[var(--color-gray-500)] mt-2">
                  Inquiry to Completion Rate
                </p>
              </div>
              <div className="mt-4 h-2 bg-[var(--color-gray-100)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      stats.totalInquiries > 0
                        ? `${
                            ((statusDistribution.find((s) => s.status === 'completed')?.count || 0) /
                              stats.totalInquiries) *
                            100
                          }%`
                        : '0%',
                  }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-[var(--color-success)] to-emerald-400 rounded-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader className="border-b border-[var(--color-gray-200)] p-4">
              <CardTitle className="text-base">Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-gray-600)]">Chat Sessions</span>
                <span className="font-semibold text-[var(--color-gray-900)]">
                  {stats.totalChatSessions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-gray-600)]">Avg Messages</span>
                <span className="font-semibold text-[var(--color-gray-900)]">
                  {stats.avgMessagesPerSession}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-gray-600)]">Published Threads</span>
                <span className="font-semibold text-[var(--color-gray-900)]">
                  {stats.totalThreads}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
