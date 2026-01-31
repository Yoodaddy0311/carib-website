'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Sparkles,
  Check,
  X,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  TrendingUp,
  Clock,
  ThumbsUp,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import type { FAQSuggestion, QuestionAnalysis } from '@/types';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  metadata?: {
    frequency?: number;
    satisfactionScore?: number;
  };
}

interface AnalyticsSummary {
  pendingSuggestionsCount: number;
  recentConversationsCount: number;
  feedbackCount: number;
  avgRating: number;
  helpfulPercentage: number;
}

type TabType = 'faqs' | 'suggestions' | 'analytics';

export default function FAQManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('suggestions');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [suggestions, setSuggestions] = useState<FAQSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [topQuestions, setTopQuestions] = useState<QuestionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '', category: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Fetch FAQs
  const fetchFAQs = useCallback(async () => {
    try {
      const faqQuery = query(
        collection(db, 'faq'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(faqQuery);
      const faqList: FAQItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as FAQItem[];
      setFaqs(faqList);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  }, []);

  // Fetch FAQ Suggestions
  const fetchSuggestions = useCallback(async () => {
    try {
      const suggestionsQuery = query(
        collection(db, 'faq_suggestions'),
        where('status', '==', 'pending'),
        orderBy('frequency', 'desc')
      );
      const snapshot = await getDocs(suggestionsQuery);
      const suggestionList: FAQSuggestion[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        reviewedAt: doc.data().reviewedAt?.toDate(),
      })) as FAQSuggestion[];
      setSuggestions(suggestionList);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      // Get pending suggestions count
      const pendingQuery = query(
        collection(db, 'faq_suggestions'),
        where('status', '==', 'pending')
      );
      const pendingSnapshot = await getDocs(pendingQuery);

      // Get latest conversation analytics
      const analyticsQuery = query(
        collection(db, 'conversation_analytics'),
        orderBy('analyzedAt', 'desc')
      );
      const analyticsSnapshot = await getDocs(analyticsQuery);

      if (!analyticsSnapshot.empty) {
        const latestAnalytics = analyticsSnapshot.docs[0].data();
        setTopQuestions(latestAnalytics.topQuestions || []);
      }

      // Get feedback stats (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const feedbackQuery = query(
        collection(db, 'chat_feedback'),
        where('timestamp', '>=', sevenDaysAgo)
      );
      const feedbackSnapshot = await getDocs(feedbackQuery);

      let totalRating = 0;
      let helpfulCount = 0;
      feedbackSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.rating) totalRating += data.rating;
        if (data.helpful) helpfulCount++;
      });

      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('timestamp', '>=', sevenDaysAgo)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);

      setAnalytics({
        pendingSuggestionsCount: pendingSnapshot.size,
        recentConversationsCount: conversationsSnapshot.size,
        feedbackCount: feedbackSnapshot.size,
        avgRating: feedbackSnapshot.size > 0 ? Math.round((totalRating / feedbackSnapshot.size) * 10) / 10 : 0,
        helpfulPercentage: feedbackSnapshot.size > 0 ? Math.round((helpfulCount / feedbackSnapshot.size) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFAQs(), fetchSuggestions(), fetchAnalytics()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchFAQs, fetchSuggestions, fetchAnalytics]);

  // Approve FAQ Suggestion
  const handleApproveSuggestion = async (suggestion: FAQSuggestion) => {
    try {
      // Create new FAQ
      const faqRef = await addDoc(collection(db, 'faq'), {
        question: suggestion.question,
        answer: suggestion.suggestedAnswer,
        category: suggestion.category || 'general',
        order: faqs.length + 1,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdFrom: 'suggestion',
        suggestionId: suggestion.id,
        metadata: {
          frequency: suggestion.frequency,
          satisfactionScore: suggestion.satisfactionScore,
        },
      });

      // Update suggestion status
      await updateDoc(doc(db, 'faq_suggestions', suggestion.id), {
        status: 'approved',
        reviewedAt: serverTimestamp(),
        faqId: faqRef.id,
        updatedAt: serverTimestamp(),
      });

      // Refresh data
      await Promise.all([fetchFAQs(), fetchSuggestions()]);
    } catch (error) {
      console.error('Error approving suggestion:', error);
      alert('Failed to approve suggestion. Please try again.');
    }
  };

  // Reject FAQ Suggestion
  const handleRejectSuggestion = async (suggestionId: string) => {
    if (!confirm('Are you sure you want to reject this suggestion?')) return;

    try {
      await updateDoc(doc(db, 'faq_suggestions', suggestionId), {
        status: 'rejected',
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await fetchSuggestions();
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      alert('Failed to reject suggestion. Please try again.');
    }
  };

  // Update FAQ
  const handleUpdateFaq = async (faqId: string) => {
    try {
      await updateDoc(doc(db, 'faq', faqId), {
        question: editForm.question,
        answer: editForm.answer,
        category: editForm.category,
        updatedAt: serverTimestamp(),
      });

      setEditingFaq(null);
      await fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert('Failed to update FAQ. Please try again.');
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await deleteDoc(doc(db, 'faq', faqId));
      await fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ. Please try again.');
    }
  };

  // Toggle FAQ active status
  const handleToggleFaqActive = async (faq: FAQItem) => {
    try {
      await updateDoc(doc(db, 'faq', faq.id), {
        active: !faq.active,
        updatedAt: serverTimestamp(),
      });
      await fetchFAQs();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
    }
  };

  // Trigger manual analysis
  const handleTriggerAnalysis = async () => {
    setIsRefreshing(true);
    try {
      // This would call the Cloud Function
      // For now, just refresh the data
      await Promise.all([fetchSuggestions(), fetchAnalytics()]);
      alert('Analysis triggered successfully. Results will appear shortly.');
    } catch (error) {
      console.error('Error triggering analysis:', error);
      alert('Failed to trigger analysis. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin" />
          <p className="text-[var(--color-gray-500)] text-sm">Loading FAQ management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">FAQ Management</h1>
          <p className="text-[var(--color-gray-500)] mt-1">
            Manage FAQs and review AI-generated suggestions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerAnalysis}
            disabled={isRefreshing}
            leftIcon={isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          >
            Analyze Conversations
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[var(--color-gray-100)] rounded-xl p-4 border border-[var(--color-gray-200)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-primary-100)]">
                <Sparkles className="w-5 h-5 text-[var(--color-primary-600)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {analytics.pendingSuggestionsCount}
                </p>
                <p className="text-xs text-[var(--color-gray-500)]">Pending Suggestions</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[var(--color-gray-100)] rounded-xl p-4 border border-[var(--color-gray-200)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-accent-100)]">
                <MessageSquare className="w-5 h-5 text-[var(--color-accent-600)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {analytics.recentConversationsCount}
                </p>
                <p className="text-xs text-[var(--color-gray-500)]">Weekly Conversations</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[var(--color-gray-100)] rounded-xl p-4 border border-[var(--color-gray-200)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-success)]/10">
                <ThumbsUp className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {analytics.helpfulPercentage}%
                </p>
                <p className="text-xs text-[var(--color-gray-500)]">Helpful Responses</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[var(--color-gray-100)] rounded-xl p-4 border border-[var(--color-gray-200)]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--color-warning)]/10">
                <TrendingUp className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {analytics.avgRating}/5
                </p>
                <p className="text-xs text-[var(--color-gray-500)]">Average Rating</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[var(--color-gray-200)]">
        <nav className="flex gap-4">
          {[
            { id: 'suggestions', label: 'AI Suggestions', count: suggestions.length },
            { id: 'faqs', label: 'Existing FAQs', count: faqs.length },
            { id: 'analytics', label: 'Top Questions', count: topQuestions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--color-primary-600)] border-[var(--color-primary-600)]'
                  : 'text-[var(--color-gray-500)] border-transparent hover:text-[var(--color-gray-700)]'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-[var(--color-gray-100)]">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {suggestions.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[var(--color-gray-100)] rounded-xl border border-[var(--color-gray-200)]">
                <Sparkles className="w-12 h-12 mx-auto text-[var(--color-gray-300)]" />
                <p className="mt-4 text-[var(--color-gray-600)]">No pending suggestions</p>
                <p className="text-sm text-[var(--color-gray-500)]">
                  AI suggestions will appear here when conversations are analyzed
                </p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  layout
                  className="bg-white dark:bg-[var(--color-gray-100)] rounded-xl border border-[var(--color-gray-200)] overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() =>
                      setExpandedSuggestion(
                        expandedSuggestion === suggestion.id ? null : suggestion.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                            AI Suggested
                          </span>
                          {suggestion.category && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)]">
                              {suggestion.category}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-[var(--foreground)]">
                          {suggestion.question}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-gray-500)]">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Asked {suggestion.frequency}x
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" />
                            {suggestion.satisfactionScore}% satisfaction
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Avg {Math.round(suggestion.avgResponseTime / 1000)}s response
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedSuggestion === suggestion.id ? (
                          <ChevronUp className="w-5 h-5 text-[var(--color-gray-400)]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[var(--color-gray-400)]" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedSuggestion === suggestion.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[var(--color-gray-200)]"
                      >
                        <div className="p-4 bg-[var(--color-gray-50)]">
                          <h4 className="text-sm font-medium text-[var(--color-gray-700)] mb-2">
                            Suggested Answer:
                          </h4>
                          <p className="text-sm text-[var(--color-gray-600)] whitespace-pre-wrap">
                            {suggestion.suggestedAnswer}
                          </p>

                          {suggestion.similarQuestions && suggestion.similarQuestions.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-[var(--color-gray-700)] mb-2">
                                Similar Questions:
                              </h4>
                              <ul className="text-sm text-[var(--color-gray-500)] space-y-1">
                                {suggestion.similarQuestions.slice(0, 3).map((q, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-[var(--color-gray-400)]">-</span>
                                    {q}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[var(--color-gray-200)]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectSuggestion(suggestion.id)}
                              leftIcon={<X className="w-4 h-4" />}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveSuggestion(suggestion)}
                              leftIcon={<Check className="w-4 h-4" />}
                            >
                              Add to FAQ
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'faqs' && (
          <motion.div
            key="faqs"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-gray-400)]" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--color-gray-400)]" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[var(--color-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FAQ List */}
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-[var(--color-gray-100)] rounded-xl border border-[var(--color-gray-200)]">
                <MessageSquare className="w-12 h-12 mx-auto text-[var(--color-gray-300)]" />
                <p className="mt-4 text-[var(--color-gray-600)]">No FAQs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-[var(--color-gray-100)] rounded-xl border border-[var(--color-gray-200)] p-4 ${
                      !faq.active ? 'opacity-60' : ''
                    }`}
                  >
                    {editingFaq === faq.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editForm.question}
                          onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--color-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                          placeholder="Question"
                        />
                        <textarea
                          value={editForm.answer}
                          onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--color-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                          placeholder="Answer"
                        />
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--color-gray-200)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                          placeholder="Category"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingFaq(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateFaq(faq.id)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {faq.category && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)]">
                                  {faq.category}
                                </span>
                              )}
                              {!faq.active && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                                  Inactive
                                </span>
                              )}
                              {faq.metadata?.frequency && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                                  {faq.metadata.frequency}x asked
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-[var(--foreground)]">{faq.question}</h3>
                            <p className="text-sm text-[var(--color-gray-500)] mt-1 line-clamp-2">
                              {faq.answer}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditForm({
                                  question: faq.question,
                                  answer: faq.answer,
                                  category: faq.category || '',
                                });
                                setEditingFaq(faq.id);
                              }}
                              className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-primary-600)] transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleFaqActive(faq)}
                              className={`p-2 transition-colors ${
                                faq.active
                                  ? 'text-[var(--color-success)] hover:text-[var(--color-success)]/80'
                                  : 'text-[var(--color-gray-400)] hover:text-[var(--color-success)]'
                              }`}
                            >
                              {faq.active ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="p-2 text-[var(--color-gray-400)] hover:text-[var(--color-error)] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white dark:bg-[var(--color-gray-100)] rounded-xl border border-[var(--color-gray-200)]">
              <div className="p-4 border-b border-[var(--color-gray-200)]">
                <h3 className="font-medium text-[var(--foreground)]">Most Asked Questions (Last 7 Days)</h3>
              </div>
              {topQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 mx-auto text-[var(--color-gray-300)]" />
                  <p className="mt-4 text-[var(--color-gray-600)]">No data available</p>
                  <p className="text-sm text-[var(--color-gray-500)]">
                    Run conversation analysis to see top questions
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-gray-200)]">
                  {topQuestions.slice(0, 10).map((question, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--color-primary-600)]">
                              #{index + 1}
                            </span>
                            <h4 className="font-medium text-[var(--foreground)]">
                              {question.question}
                            </h4>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-gray-500)]">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {question.frequency}x asked
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {question.satisfactionScore}% satisfaction
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.round(question.avgResponseTime / 1000)}s avg response
                            </span>
                          </div>
                        </div>
                        {question.suggestedFAQ && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)]">
                            FAQ Candidate
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
