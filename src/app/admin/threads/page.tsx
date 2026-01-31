'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllThreadsAdmin,
  createThread,
  updateThread,
  deleteThread,
  toggleThreadPublished,
  toggleThreadFeatured,
  searchThreads,
} from '@/lib/firebase/threads';
import { uploadThreadImage } from '@/lib/api/cloudFunctions';
import type { Thread, ThreadCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Select, type SelectOption } from '@/components/ui/Select';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui/Modal';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  Star,
  StarOff,
  RefreshCw,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';

// Category configuration
const CATEGORIES: { value: ThreadCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'ai-automation', label: 'AI Automation' },
  { value: 'no-code', label: 'No-Code' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'insight', label: 'Insight' },
];

const CATEGORY_OPTIONS: SelectOption<ThreadCategory>[] = [
  { value: 'ai-automation', label: 'AI Automation' },
  { value: 'no-code', label: 'No-Code' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'case-study', label: 'Case Study' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'insight', label: 'Insight' },
];

// Category badge variant mapping
const CATEGORY_BADGE_VARIANT: Record<
  ThreadCategory,
  'ai-automation' | 'no-code' | 'productivity' | 'case-study' | 'tutorial' | 'insight'
> = {
  'ai-automation': 'ai-automation',
  'no-code': 'no-code',
  productivity: 'productivity',
  'case-study': 'case-study',
  tutorial: 'tutorial',
  insight: 'insight',
};

// Items per page
const ITEMS_PER_PAGE = 10;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Initial form state for new thread
const initialFormState: Omit<Thread, 'id'> = {
  tweetId: '',
  authorName: 'Carib',
  authorHandle: '@carib_ai',
  authorAvatar: '/images/avatar.png',
  content: '',
  summary: '',
  category: 'ai-automation',
  tags: [],
  likeCount: 0,
  retweetCount: 0,
  replyCount: 0,
  mediaUrls: [],
  publishedAt: new Date(),
  syncedAt: new Date(),
  featured: false,
  published: true,
};

export default function AdminThreadsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // State
  const [activeCategory, setActiveCategory] = useState<ThreadCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Thread, 'id'>>(initialFormState);
  const [tagsInput, setTagsInput] = useState('');

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch threads
  const { data: threads, isLoading, error, refetch, isRefetching } = useQuery<Thread[]>({
    queryKey: ['adminThreads', activeCategory],
    queryFn: () =>
      getAllThreadsAdmin(activeCategory === 'all' ? undefined : { category: activeCategory }),
  });

  // Search threads
  const { data: searchResults, isLoading: isSearching } = useQuery<Thread[]>({
    queryKey: ['searchThreads', searchQuery],
    queryFn: () => searchThreads(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminThreads'] });
      toast({ type: 'success', title: 'Thread created successfully' });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Failed to create thread', description: String(error) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Thread, 'id'>> }) =>
      updateThread(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminThreads'] });
      toast({ type: 'success', title: 'Thread updated successfully' });
      setIsEditModalOpen(false);
      setSelectedThread(null);
      resetForm();
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Failed to update thread', description: String(error) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminThreads'] });
      toast({ type: 'success', title: 'Thread deleted successfully' });
      setIsDeleteDialogOpen(false);
      setSelectedThread(null);
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Failed to delete thread', description: String(error) });
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      toggleThreadPublished(id, published),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminThreads'] });
      toast({
        type: 'success',
        title: variables.published ? 'Thread published' : 'Thread unpublished',
      });
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Failed to update status', description: String(error) });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleThreadFeatured(id, featured),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminThreads'] });
      toast({
        type: 'success',
        title: variables.featured ? 'Thread featured' : 'Thread unfeatured',
      });
    },
    onError: (error) => {
      toast({ type: 'error', title: 'Failed to update featured status', description: String(error) });
    },
  });

  // Determine which data to display
  const displayData = useMemo(() => {
    if (searchQuery.length >= 2 && searchResults) {
      return searchResults;
    }
    return threads || [];
  }, [searchQuery, searchResults, threads]);

  // Statistics
  const stats = useMemo(() => {
    const allThreads = threads || [];
    return {
      total: allThreads.length,
      published: allThreads.filter((t) => t.published).length,
      draft: allThreads.filter((t) => !t.published).length,
      featured: allThreads.filter((t) => t.featured).length,
    };
  }, [threads]);

  // Pagination
  const totalPages = Math.ceil(displayData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayData.slice(start, start + ITEMS_PER_PAGE);
  }, [displayData, currentPage]);

  // Reset page when category or search changes
  const handleCategoryChange = (category: ThreadCategory | 'all') => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Form helpers
  const resetForm = () => {
    setFormData(initialFormState);
    setTagsInput('');
    setUploadProgress([]);
  };

  const openEditModal = (thread: Thread) => {
    setSelectedThread(thread);
    setFormData({
      tweetId: thread.tweetId,
      authorName: thread.authorName,
      authorHandle: thread.authorHandle,
      authorAvatar: thread.authorAvatar,
      content: thread.content,
      summary: thread.summary,
      category: thread.category,
      tags: thread.tags,
      likeCount: thread.likeCount,
      retweetCount: thread.retweetCount,
      replyCount: thread.replyCount,
      mediaUrls: thread.mediaUrls || [],
      publishedAt: thread.publishedAt,
      syncedAt: thread.syncedAt,
      featured: thread.featured,
      published: thread.published,
    });
    setTagsInput(thread.tags.join(', '));
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (thread: Thread) => {
    setSelectedThread(thread);
    setIsDeleteDialogOpen(true);
  };

  // Image upload handler
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    Array.from(files).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.`);
      } else if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast({
        type: 'error',
        title: 'Some files were rejected',
        description: errors.join('\n'),
      });
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(validFiles.map((f) => `Uploading ${f.name}...`));

    const uploadedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        setUploadProgress((prev) => {
          const newProgress = [...prev];
          newProgress[i] = `Uploading ${file.name}...`;
          return newProgress;
        });

        const result = await uploadThreadImage(file, selectedThread?.id);

        if (result.success && result.downloadUrl) {
          uploadedUrls.push(result.downloadUrl);
          setUploadProgress((prev) => {
            const newProgress = [...prev];
            newProgress[i] = `Uploaded ${file.name}`;
            return newProgress;
          });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        setUploadProgress((prev) => {
          const newProgress = [...prev];
          newProgress[i] = `Failed: ${file.name}`;
          return newProgress;
        });
        toast({
          type: 'error',
          title: `Failed to upload ${file.name}`,
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Update form data with new image URLs
    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        mediaUrls: [...(prev.mediaUrls || []), ...uploadedUrls],
      }));
      toast({
        type: 'success',
        title: `${uploadedUrls.length} image(s) uploaded successfully`,
      });
    }

    setIsUploading(false);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedThread?.id, toast]);

  // Remove image from form
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmitCreate = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    createMutation.mutate({
      ...formData,
      tags,
      publishedAt: new Date(),
      syncedAt: new Date(),
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedThread) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    updateMutation.mutate({
      id: selectedThread.id,
      updates: {
        ...formData,
        tags,
        syncedAt: new Date(),
      },
    });
  };

  const handleDelete = () => {
    if (!selectedThread) return;
    deleteMutation.mutate(selectedThread.id);
  };

  const handleTogglePublished = (thread: Thread) => {
    togglePublishedMutation.mutate({
      id: thread.id,
      published: !thread.published,
    });
  };

  const handleToggleFeatured = (thread: Thread) => {
    toggleFeaturedMutation.mutate({
      id: thread.id,
      featured: !thread.featured,
    });
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };

  // Thread Form Component (reused for Add and Edit)
  const ThreadForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div>
        <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
          Summary
        </label>
        <Input
          placeholder="Brief summary of the thread"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
          Content *
        </label>
        <Textarea
          placeholder="Thread content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          autoResize
          className="min-h-[150px]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
          Category *
        </label>
        <Select
          options={CATEGORY_OPTIONS}
          value={formData.category}
          onChange={(value) => setFormData({ ...formData, category: value })}
          placeholder="Select category"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
          Tags (comma separated)
        </label>
        <Input
          placeholder="ai, automation, productivity"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
        {tagsInput && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tagsInput.split(',').map((tag, index) => (
              tag.trim() && (
                <Badge key={index} variant="secondary" size="sm">
                  {tag.trim()}
                </Badge>
              )
            ))}
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="border-t border-[var(--color-gray-200)] pt-4">
        <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-2">
          Images
        </label>

        {/* Upload Button */}
        <div className="flex items-center gap-3 mb-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            multiple
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            leftIcon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </Button>
          <span className="text-xs text-[var(--color-gray-500)]">
            JPEG, PNG, GIF, WebP (max 5MB)
          </span>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="text-sm text-[var(--color-gray-600)] mb-3 space-y-1">
            {uploadProgress.map((progress, index) => (
              <p key={index} className={cn(
                progress.startsWith('Failed') && 'text-[var(--color-error)]',
                progress.startsWith('Uploaded') && 'text-[var(--color-success-600)]'
              )}>
                {progress}
              </p>
            ))}
          </div>
        )}

        {/* Image Preview Grid */}
        {formData.mediaUrls && formData.mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {formData.mediaUrls.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-lg overflow-hidden border border-[var(--color-gray-200)]"
              >
                <Image
                  src={url}
                  alt={`Thread image ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-[var(--color-error)] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(!formData.mediaUrls || formData.mediaUrls.length === 0) && !isUploading && (
          <div className="flex items-center justify-center py-8 border-2 border-dashed border-[var(--color-gray-200)] rounded-lg">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto text-[var(--color-gray-400)] mb-2" />
              <p className="text-sm text-[var(--color-gray-500)]">
                No images uploaded yet
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
          Tweet ID (optional)
        </label>
        <Input
          placeholder="Original tweet ID if synced from Twitter"
          value={formData.tweetId}
          onChange={(e) => setFormData({ ...formData, tweetId: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
            Author Name
          </label>
          <Input
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-gray-700)] mb-1">
            Author Handle
          </label>
          <Input
            value={formData.authorHandle}
            onChange={(e) => setFormData({ ...formData, authorHandle: e.target.value })}
          />
        </div>
      </div>
      <div className="border-t border-[var(--color-gray-200)] pt-4">
        <p className="text-sm font-medium text-[var(--color-gray-700)] mb-3">Status Options</p>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--color-gray-300)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
            />
            <span className="text-sm text-[var(--color-gray-700)]">Published</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--color-gray-300)] text-[var(--color-warning-500)] focus:ring-[var(--color-warning-500)]"
            />
            <span className="text-sm text-[var(--color-gray-700)] flex items-center gap-1">
              <Star className="w-4 h-4 text-[var(--color-warning-500)]" />
              Featured
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-heading-1 text-[var(--color-gray-900)] mb-2">Thread Management</h1>
            <p className="text-body-1 text-[var(--color-gray-500)]">
              Create, edit, and manage your content threads
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<RefreshCw className={cn("w-4 h-4", isRefetching && "animate-spin")} />}
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
            >
              Add Thread
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-[var(--color-gray-500)]">Total Threads</p>
            <p className="text-2xl font-bold text-[var(--color-gray-900)]">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-[var(--color-gray-500)]">Published</p>
            <p className="text-2xl font-bold text-[var(--color-success-600)]">{stats.published}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-[var(--color-gray-500)]">Draft</p>
            <p className="text-2xl font-bold text-[var(--color-gray-600)]">{stats.draft}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-[var(--color-gray-500)]">Featured</p>
            <p className="text-2xl font-bold text-[var(--color-warning-600)]">{stats.featured}</p>
          </Card>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={activeCategory === cat.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="w-full sm:w-80">
                <Input
                  placeholder="Search by content, summary, or tags"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  leftIcon={<Search className="w-5 h-5" />}
                />
              </div>
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-gray-500)]">
                    {displayData.length} results found
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Threads Table */}
        <Card>
          <CardHeader className="border-b border-[var(--color-gray-200)] p-6">
            <CardTitle className="flex items-center justify-between">
              <span>Threads</span>
              <span className="text-sm font-normal text-[var(--color-gray-500)]">
                Showing {paginatedData.length} of {displayData.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading || isSearching ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-600)]" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--color-error)]">
                <p>Failed to load threads</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--color-gray-500)]">
                <FileText className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No threads found</p>
                <p className="text-sm mt-1">
                  {searchQuery ? 'Try adjusting your search query' : 'Create your first thread to get started'}
                </p>
                {!searchQuery && (
                  <Button
                    className="mt-4"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(true);
                    }}
                  >
                    Create Thread
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-gray-50)]">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">
                          Title/Summary
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">
                          Media
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-[var(--color-gray-500)]">
                          Date
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-[var(--color-gray-500)]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-gray-200)]">
                      {paginatedData.map((thread) => (
                        <tr
                          key={thread.id}
                          className="hover:bg-[var(--color-gray-50)] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="max-w-md">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-[var(--color-gray-900)] truncate">
                                  {thread.summary || thread.content.slice(0, 60) + '...'}
                                </p>
                                {thread.featured && (
                                  <Star className="w-4 h-4 text-[var(--color-warning-500)] fill-current flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-[var(--color-gray-500)] truncate mt-1">
                                {thread.content.slice(0, 100)}...
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={CATEGORY_BADGE_VARIANT[thread.category]} size="sm">
                              {thread.category.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={thread.published ? 'success' : 'secondary'}
                                size="sm"
                              >
                                {thread.published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {thread.mediaUrls && thread.mediaUrls.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <ImageIcon className="w-4 h-4 text-[var(--color-gray-500)]" />
                                <span className="text-sm text-[var(--color-gray-500)]">
                                  {thread.mediaUrls.length}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-[var(--color-gray-400)]">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[var(--color-gray-500)] text-sm">
                            {formatDate(thread.publishedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleFeatured(thread)}
                                title={thread.featured ? 'Remove from featured' : 'Add to featured'}
                                className={cn(
                                  thread.featured && "text-[var(--color-warning-500)]"
                                )}
                              >
                                {thread.featured ? (
                                  <Star className="w-4 h-4 fill-current" />
                                ) : (
                                  <StarOff className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTogglePublished(thread)}
                                title={thread.published ? 'Unpublish' : 'Publish'}
                              >
                                {thread.published ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(thread)}
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(thread)}
                                title="Delete"
                                className="text-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-[var(--color-gray-200)]">
                  {paginatedData.map((thread) => (
                    <div key={thread.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--color-gray-900)] line-clamp-2">
                              {thread.summary || thread.content.slice(0, 60)}
                            </p>
                            {thread.featured && (
                              <Star className="w-4 h-4 text-[var(--color-warning-500)] fill-current flex-shrink-0" />
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={thread.published ? 'success' : 'secondary'}
                          size="sm"
                          className="ml-2"
                        >
                          {thread.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={CATEGORY_BADGE_VARIANT[thread.category]} size="sm">
                          {thread.category.replace('-', ' ')}
                        </Badge>
                        {thread.mediaUrls && thread.mediaUrls.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-[var(--color-gray-500)]" />
                            <span className="text-xs text-[var(--color-gray-500)]">
                              {thread.mediaUrls.length}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-[var(--color-gray-400)]">
                          {formatDate(thread.publishedAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFeatured(thread)}
                          className={cn(
                            thread.featured && "border-[var(--color-warning-500)] text-[var(--color-warning-500)]"
                          )}
                        >
                          {thread.featured ? (
                            <>
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Featured
                            </>
                          ) : (
                            <>
                              <StarOff className="w-3 h-3 mr-1" />
                              Feature
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublished(thread)}
                        >
                          {thread.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditModal(thread)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(thread)}
                          className="text-[var(--color-error)]"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
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
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
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
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Add Thread Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Add New Thread</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ThreadForm />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitCreate}
            isLoading={createMutation.isPending}
            disabled={!formData.content || !formData.category || isUploading}
          >
            Create Thread
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Thread Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Edit Thread</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <ThreadForm isEdit />
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitEdit}
            isLoading={updateMutation.isPending}
            disabled={!formData.content || !formData.category || isUploading}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Delete Thread"
        description={
          selectedThread
            ? `Are you sure you want to delete "${selectedThread.summary || selectedThread.content.slice(0, 50)}..."? This action cannot be undone.`
            : 'Are you sure you want to delete this thread? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
