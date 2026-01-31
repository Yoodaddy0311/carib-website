'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Mail,
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StatCard } from '@/components/admin/StatCard';
import { Button } from '@/components/ui/Button';
import type { InquiryStatus } from '@/types';

interface DashboardStats {
  totalInquiries: number;
  newInquiries: number;
  totalThreads: number;
  weeklyVisitors: number;
  pendingFAQSuggestions: number;
  activeSubscribers: number;
}

interface RecentInquiry {
  id: string;
  type: string;
  status: InquiryStatus;
  data: {
    name: string;
    email: string;
    company?: string;
  };
  createdAt: Date;
}

const statusConfig: Record<InquiryStatus, { label: string; color: string; icon: React.ReactNode }> =
  {
    new: {
      label: 'New',
      color: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    contacted: {
      label: 'Contacted',
      color: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    scheduled: {
      label: 'Scheduled',
      color: 'bg-[var(--color-accent-100)] text-[var(--color-accent-700)]',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    completed: {
      label: 'Completed',
      color: 'bg-[var(--color-success)]/20 text-[var(--color-success)]',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    archived: {
      label: 'Archived',
      color: 'bg-[var(--color-gray-200)] text-[var(--color-gray-600)]',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
  };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInquiries: 0,
    newInquiries: 0,
    totalThreads: 0,
    weeklyVisitors: 0,
    pendingFAQSuggestions: 0,
    activeSubscribers: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total inquiries
        const inquiriesSnapshot = await getDocs(collection(db, 'inquiries'));
        const totalInquiries = inquiriesSnapshot.size;

        // Fetch new inquiries
        const newInquiriesQuery = query(
          collection(db, 'inquiries'),
          where('status', '==', 'new')
        );
        const newInquiriesSnapshot = await getDocs(newInquiriesQuery);
        const newInquiries = newInquiriesSnapshot.size;

        // Fetch total threads
        const threadsSnapshot = await getDocs(collection(db, 'threads'));
        const totalThreads = threadsSnapshot.size;

        // Fetch weekly visitors (form submissions as proxy)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const visitorsQuery = query(
          collection(db, 'form_submissions'),
          where('timestamp', '>=', Timestamp.fromDate(oneWeekAgo))
        );
        const visitorsSnapshot = await getDocs(visitorsQuery);
        const weeklyVisitors = visitorsSnapshot.size;

        // Fetch pending FAQ suggestions (AI-003)
        let pendingFAQSuggestions = 0;
        try {
          const faqSuggestionsQuery = query(
            collection(db, 'faq_suggestions'),
            where('status', '==', 'pending')
          );
          const faqSuggestionsSnapshot = await getDocs(faqSuggestionsQuery);
          pendingFAQSuggestions = faqSuggestionsSnapshot.size;
        } catch {
          // faq_suggestions collection may not exist yet
          console.log('FAQ suggestions collection not found');
        }

        // Fetch active subscribers (BE-007)
        let activeSubscribers = 0;
        try {
          const subscribersQuery = query(
            collection(db, 'subscribers'),
            where('status', '==', 'active')
          );
          const subscribersSnapshot = await getDocs(subscribersQuery);
          activeSubscribers = subscribersSnapshot.size;
        } catch {
          // subscribers collection may not exist yet
          console.log('Subscribers collection not found');
        }

        setStats({
          totalInquiries,
          newInquiries,
          totalThreads,
          weeklyVisitors,
          pendingFAQSuggestions,
          activeSubscribers,
        });

        // Fetch recent inquiries
        const recentQuery = query(
          collection(db, 'inquiries'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentSnapshot = await getDocs(recentQuery);
        const recent: RecentInquiry[] = recentSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type,
            status: data.status,
            data: data.data,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setRecentInquiries(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
          <p className="text-[var(--color-gray-500)] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--color-gray-500)] mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          icon={<MessageSquare className="w-6 h-6" />}
          value={stats.totalInquiries}
          label="Total Inquiries"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          value={stats.newInquiries}
          label="New Inquiries"
          trend={{ value: 5, direction: 'up' }}
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          value={stats.totalThreads}
          label="Published Threads"
          trend={{ value: 3, direction: 'neutral' }}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          value={stats.weeklyVisitors}
          label="Weekly Submissions"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          icon={<Sparkles className="w-6 h-6" />}
          value={stats.pendingFAQSuggestions}
          label="FAQ Suggestions"
          trend={{ value: stats.pendingFAQSuggestions, direction: stats.pendingFAQSuggestions > 0 ? 'up' : 'neutral' }}
        />
        <StatCard
          icon={<Mail className="w-6 h-6" />}
          value={stats.activeSubscribers}
          label="Newsletter Subscribers"
          trend={{ value: stats.activeSubscribers, direction: stats.activeSubscribers > 0 ? 'up' : 'neutral' }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-[var(--color-gray-100)] rounded-2xl border border-[var(--color-gray-200)] shadow-[var(--shadow-2)]"
        >
          <div className="p-6 border-b border-[var(--color-gray-200)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Inquiries</h2>
            <Link href="/admin/inquiries">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-gray-100)]">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="p-4 hover:bg-[var(--color-gray-50)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--foreground)] truncate">
                          {inquiry.data.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusConfig[inquiry.status].color
                          }`}
                        >
                          {statusConfig[inquiry.status].icon}
                          {statusConfig[inquiry.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-gray-500)] truncate">
                        {inquiry.data.email}
                        {inquiry.data.company && ` - ${inquiry.data.company}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[var(--color-gray-400)] capitalize">
                        {inquiry.type.replace('-', ' ')}
                      </span>
                      <p className="text-xs text-[var(--color-gray-500)]">
                        {formatDate(inquiry.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-[var(--color-gray-300)]" />
                <p className="mt-3 text-[var(--color-gray-500)]">No inquiries yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-[var(--color-gray-100)] rounded-2xl border border-[var(--color-gray-200)] shadow-[var(--shadow-2)]"
        >
          <div className="p-6 border-b border-[var(--color-gray-200)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link href="/admin/inquiries?status=new">
              <Button variant="outline" fullWidth className="justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                View New Inquiries ({stats.newInquiries})
              </Button>
            </Link>
            <Link href="/admin/faq">
              <Button variant="outline" fullWidth className="justify-start">
                <Sparkles className="w-4 h-4 mr-2" />
                Review FAQ Suggestions ({stats.pendingFAQSuggestions})
              </Button>
            </Link>
            <Link href="/admin/threads/new">
              <Button variant="outline" fullWidth className="justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Add New Thread
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" fullWidth className="justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/subscribers">
              <Button variant="outline" fullWidth className="justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Manage Subscribers ({stats.activeSubscribers})
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" fullWidth className="justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
