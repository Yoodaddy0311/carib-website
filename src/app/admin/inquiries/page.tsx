'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getInquiries, getAdminStats, searchInquiries, type AdminStats, type InquiryWithNotes } from '@/lib/firebase/admin';
import type { InquiryStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// Status tab configuration
const STATUS_TABS: { label: string; value: InquiryStatus | 'all'; count?: keyof AdminStats }[] = [
  { label: '전체', value: 'all', count: 'totalInquiries' },
  { label: '신규', value: 'new', count: 'newInquiries' },
  { label: '연락완료', value: 'contacted', count: 'contactedInquiries' },
  { label: '미팅예정', value: 'scheduled', count: 'scheduledInquiries' },
  { label: '완료', value: 'completed', count: 'completedInquiries' },
];

// Status badge variant mapping
const STATUS_BADGE_VARIANT: Record<InquiryStatus, 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'> = {
  new: 'primary',
  contacted: 'warning',
  scheduled: 'accent',
  completed: 'success',
  archived: 'secondary',
};

// Status label mapping
const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: '신규',
  contacted: '연락완료',
  scheduled: '미팅예정',
  completed: '완료',
  archived: '보관',
};

// Type label mapping
const TYPE_LABELS: Record<string, string> = {
  'coffee-chat': '커피챗',
  project: '프로젝트',
  general: '일반문의',
};

// Items per page
const ITEMS_PER_PAGE = 10;

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<InquiryStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch admin stats
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  // Fetch inquiries
  const { data: inquiries, isLoading, error } = useQuery<InquiryWithNotes[]>({
    queryKey: ['inquiries', activeTab],
    queryFn: () => getInquiries(activeTab === 'all' ? undefined : activeTab),
  });

  // Search functionality
  const { data: searchResults, isLoading: isSearching } = useQuery<InquiryWithNotes[]>({
    queryKey: ['searchInquiries', searchQuery],
    queryFn: () => searchInquiries(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Determine which data to display
  const displayData = useMemo(() => {
    if (searchQuery.length >= 2 && searchResults) {
      return searchResults;
    }
    return inquiries || [];
  }, [searchQuery, searchResults, inquiries]);

  // Pagination
  const totalPages = Math.ceil(displayData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(start, start + ITEMS_PER_PAGE);
  }, [displayData, currentPage]);

  // Reset page when tab or search changes
  const handleTabChange = (tab: InquiryStatus | 'all') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-heading-1 text-[var(--color-gray-900)] mb-2">
            문의 관리
          </h1>
          <p className="text-body-1 text-[var(--color-gray-500)]">
            고객 문의를 확인하고 관리하세요
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {STATUS_TABS.map((tab) => (
            <Card
              key={tab.value}
              interactive
              className={cn(
                'cursor-pointer transition-all',
                activeTab === tab.value && 'ring-2 ring-[var(--color-primary-500)]'
              )}
              onClick={() => handleTabChange(tab.value)}
            >
              <CardContent className="p-4">
                <p className="text-sm text-[var(--color-gray-500)] mb-1">{tab.label}</p>
                <p className="text-2xl font-bold text-[var(--color-gray-900)]">
                  {stats && tab.count ? stats[tab.count] : '-'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="이름, 이메일, 회사명으로 검색"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  검색 초기화
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inquiries Table */}
        <Card>
          <CardHeader className="border-b border-[var(--color-gray-200)] p-6">
            <CardTitle className="flex items-center justify-between">
              <span>문의 목록</span>
              <span className="text-sm font-normal text-[var(--color-gray-500)]">
                총 {displayData.length}건
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading || isSearching ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-600)]" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 text-[var(--color-error)]">
                데이터를 불러오는 중 오류가 발생했습니다.
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--color-gray-500)]">
                <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p>문의가 없습니다</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-gray-50)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">이름</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">유형</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">이메일</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">회사</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">상태</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">접수일시</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-[var(--color-gray-500)]">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-gray-200)]">
                      {paginatedData.map((inquiry) => (
                        <tr
                          key={inquiry.id}
                          className="hover:bg-[var(--color-gray-50)] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-medium text-[var(--color-gray-900)]">
                              {inquiry.data.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" size="sm">
                              {TYPE_LABELS[inquiry.type] || inquiry.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-[var(--color-gray-600)]">
                            {inquiry.data.email}
                          </td>
                          <td className="px-6 py-4 text-[var(--color-gray-600)]">
                            {inquiry.data.company || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={STATUS_BADGE_VARIANT[inquiry.status]} size="sm">
                              {STATUS_LABELS[inquiry.status]}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-[var(--color-gray-500)] text-sm">
                            {formatDate(inquiry.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/admin/inquiries/${inquiry.id}`}>
                              <Button variant="ghost" size="sm">
                                상세보기
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-[var(--color-gray-200)]">
                  {paginatedData.map((inquiry) => (
                    <Link
                      key={inquiry.id}
                      href={`/admin/inquiries/${inquiry.id}`}
                      className="block p-4 hover:bg-[var(--color-gray-50)] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-[var(--color-gray-900)]">
                            {inquiry.data.name}
                          </span>
                          <span className="mx-2 text-[var(--color-gray-300)]">|</span>
                          <span className="text-sm text-[var(--color-gray-500)]">
                            {inquiry.data.company || '-'}
                          </span>
                        </div>
                        <Badge variant={STATUS_BADGE_VARIANT[inquiry.status]} size="sm">
                          {STATUS_LABELS[inquiry.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--color-gray-600)] mb-2">
                        {inquiry.data.email}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" size="sm">
                          {TYPE_LABELS[inquiry.type] || inquiry.type}
                        </Badge>
                        <span className="text-xs text-[var(--color-gray-400)]">
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              이전
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, current and adjacent pages
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => (
                  <span key={page} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2 text-[var(--color-gray-400)]">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  </span>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
