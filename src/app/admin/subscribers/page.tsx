'use client';

/**
 * Admin Subscribers Management Page (BE-007)
 *
 * Features:
 * - View all subscribers with filtering
 * - Export subscriber list
 * - View subscription statistics
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  Brain,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/admin/StatCard';

type SubscriberStatus = 'active' | 'pending' | 'unsubscribed';
type SubscriberInterest = 'automation' | 'ai' | 'data-analysis';

interface Subscriber {
  id: string;
  email: string;
  interests: SubscriberInterest[];
  status: SubscriberStatus;
  source?: string;
  subscribedAt: string | null;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
}

interface SubscriberStats {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
}

const statusConfig: Record<SubscriberStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: {
    label: 'Active',
    color: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  pending: {
    label: 'Pending',
    color: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  unsubscribed: {
    label: 'Unsubscribed',
    color: 'bg-[var(--color-gray-200)] text-[var(--color-gray-500)]',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const interestConfig: Record<SubscriberInterest, { label: string; icon: React.ReactNode }> = {
  automation: { label: '자동화', icon: <Sparkles className="w-3 h-3" /> },
  ai: { label: 'AI', icon: <Brain className="w-3 h-3" /> },
  'data-analysis': { label: '데이터', icon: <BarChart3 className="w-3 h-3" /> },
};

const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_URL || 'https://asia-northeast3-carib-dev.cloudfunctions.net';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | 'all'>('all');
  const [interestFilter, setInterestFilter] = useState<SubscriberInterest | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [lastId, setLastId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchSubscribers = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const token = await user.getIdToken();

      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (interestFilter !== 'all') params.set('interest', interestFilter);
      params.set('limit', '20');
      if (!reset && lastId) params.set('startAfter', lastId);

      const response = await fetch(`${FUNCTIONS_BASE_URL}/listSubscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subscribers');

      const data = await response.json();

      if (reset) {
        setSubscribers(data.subscribers);
        setPage(1);
      } else {
        setSubscribers((prev) => [...prev, ...data.subscribers]);
      }

      setLastId(data.lastId);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, interestFilter, lastId]);

  const fetchStats = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const response = await fetch(`${FUNCTIONS_BASE_URL}/getSubscriberStats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers(true);
    fetchStats();
  }, [statusFilter, interestFilter]);

  const handleRefresh = () => {
    fetchSubscribers(true);
    fetchStats();
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchSubscribers(false);
      setPage((p) => p + 1);
    }
  };

  const handleExport = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const token = await user.getIdToken();

      // Fetch all subscribers for export
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '1000');

      const response = await fetch(`${FUNCTIONS_BASE_URL}/listSubscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subscribers');

      const data = await response.json();

      // Convert to CSV
      const headers = ['Email', 'Status', 'Interests', 'Source', 'Subscribed At', 'Confirmed At'];
      const rows = data.subscribers.map((s: Subscriber) => [
        s.email,
        s.status,
        s.interests.join('; '),
        s.source || '',
        s.subscribedAt || '',
        s.confirmedAt || '',
      ]);

      const csv = [headers, ...rows].map((row) => row.map((cell: string) => `"${cell}"`).join(',')).join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export subscribers');
    }
  };

  // Filter subscribers by search query
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Subscribers</h1>
          <p className="text-[var(--color-gray-500)] mt-1">
            Manage newsletter subscribers
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value={stats.total}
          label="Total Subscribers"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          value={stats.active}
          label="Active"
          trend={{ value: 0, direction: 'neutral' }}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          value={stats.pending}
          label="Pending Confirmation"
        />
        <StatCard
          icon={<XCircle className="w-6 h-6" />}
          value={stats.unsubscribed}
          label="Unsubscribed"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SubscriberStatus | 'all')}
            className="px-3 py-2 rounded-lg border border-[var(--color-gray-200)] bg-white dark:bg-[var(--color-gray-100)] text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value as SubscriberInterest | 'all')}
            className="px-3 py-2 rounded-lg border border-[var(--color-gray-200)] bg-white dark:bg-[var(--color-gray-100)] text-sm"
          >
            <option value="all">All Interests</option>
            <option value="automation">Automation</option>
            <option value="ai">AI</option>
            <option value="data-analysis">Data Analysis</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg">
          <p className="text-[var(--color-error)] text-sm">{error}</p>
        </div>
      )}

      {/* Subscribers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[var(--color-gray-100)] rounded-2xl border border-[var(--color-gray-200)] shadow-[var(--shadow-2)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-gray-200)]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
                  Interests
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-gray-500)] uppercase tracking-wider">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-gray-100)]">
              {isLoading && subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
                      <p className="text-[var(--color-gray-500)] text-sm">Loading subscribers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Mail className="w-10 h-10 mx-auto text-[var(--color-gray-300)] mb-3" />
                    <p className="text-[var(--color-gray-500)]">No subscribers found</p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr
                    key={subscriber.id}
                    className="hover:bg-[var(--color-gray-50)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {subscriber.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          statusConfig[subscriber.status].color
                        }`}
                      >
                        {statusConfig[subscriber.status].icon}
                        {statusConfig[subscriber.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {subscriber.interests.map((interest) => (
                          <span
                            key={interest}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-primary-50)] text-[var(--color-primary-700)] text-xs"
                          >
                            {interestConfig[interest].icon}
                            {interestConfig[interest].label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--color-gray-500)]">
                        {subscriber.source || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[var(--color-gray-500)]">
                        {formatDate(subscriber.subscribedAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(hasMore || page > 1) && (
          <div className="px-6 py-4 border-t border-[var(--color-gray-200)] flex items-center justify-between">
            <p className="text-sm text-[var(--color-gray-500)]">
              Showing {filteredSubscribers.length} subscribers
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => {
                  setPage(1);
                  fetchSubscribers(true);
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore || isLoading}
                onClick={handleLoadMore}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
