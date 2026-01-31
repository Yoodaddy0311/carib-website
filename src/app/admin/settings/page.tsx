'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Database,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Users,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  seedAllCollections,
  clearAllCollections,
  getCollectionCounts,
  type SeedProgress,
} from '@/lib/firebase/seeder';

interface CollectionCounts {
  threads: number;
  team: number;
  faq: number;
}

export default function AdminSettingsPage() {
  const [counts, setCounts] = useState<CollectionCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState<SeedProgress | null>(null);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Fetch current counts on mount
  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const currentCounts = await getCollectionCounts();
      setCounts(currentCounts);
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setResult(null);
    setProgress(null);

    try {
      const seedResult = await seedAllCollections({
        clearFirst: true,
        onProgress: setProgress,
      });

      if (seedResult.success) {
        setResult({
          type: 'success',
          message: `Database seeded successfully! Added ${seedResult.counts?.threads} threads, ${seedResult.counts?.team} team members, ${seedResult.counts?.faq} FAQs.`,
        });
        setCounts(seedResult.counts || null);
      } else {
        setResult({
          type: 'error',
          message: seedResult.error || 'Failed to seed database',
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSeeding(false);
      setProgress(null);
      fetchCounts();
    }
  };

  const handleClearDatabase = async () => {
    setIsClearing(true);
    setResult(null);
    setShowConfirmClear(false);

    try {
      const cleared = await clearAllCollections(setProgress);
      setResult({
        type: 'success',
        message: `Database cleared! Removed ${cleared.threads} threads, ${cleared.team} team members, ${cleared.faq} FAQs.`,
      });
      setCounts({ threads: 0, team: 0, faq: 0 });
    } catch (error) {
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsClearing(false);
      setProgress(null);
    }
  };

  const totalDocuments = counts ? counts.threads + counts.team + counts.faq : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-gray-900)]">Settings</h1>
        <p className="text-[var(--color-gray-500)] mt-1">
          Manage database and application settings
        </p>
      </div>

      {/* Database Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-[var(--shadow-2)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--color-gray-200)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary-100)] rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-[var(--color-primary-600)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-gray-900)]">
                Database Management
              </h2>
              <p className="text-sm text-[var(--color-gray-500)]">
                Seed or clear Firestore collections
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Database Status */}
          <div className="bg-[var(--color-gray-50)] rounded-xl p-4">
            <h3 className="text-sm font-medium text-[var(--color-gray-700)] mb-3">
              Current Database Status
            </h3>
            {isLoading ? (
              <div className="flex items-center gap-2 text-[var(--color-gray-500)]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--color-primary-100)] rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[var(--color-gray-900)]">
                      {counts?.threads || 0}
                    </p>
                    <p className="text-xs text-[var(--color-gray-500)]">Threads</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--color-accent-100)] rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-[var(--color-accent-600)]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[var(--color-gray-900)]">
                      {counts?.team || 0}
                    </p>
                    <p className="text-xs text-[var(--color-gray-500)]">Team Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--color-warning)]/20 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-[var(--color-warning)]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[var(--color-gray-900)]">
                      {counts?.faq || 0}
                    </p>
                    <p className="text-xs text-[var(--color-gray-500)]">FAQs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--color-success)]/20 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-[var(--color-success)]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[var(--color-gray-900)]">
                      {totalDocuments}
                    </p>
                    <p className="text-xs text-[var(--color-gray-500)]">Total Documents</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-[var(--color-primary-50)] rounded-xl">
            <Info className="w-5 h-5 text-[var(--color-primary-600)] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--color-primary-700)]">
              <p className="font-medium mb-1">Sample Data Information</p>
              <p>
                Seeding will add sample data to help test the website. This includes 10 AI
                automation threads, 4 team members with shark theme names, and 6 FAQs. Existing
                data in these collections will be replaced.
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          {progress && (
            <div className="p-4 bg-[var(--color-gray-50)] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[var(--color-primary-600)]" />
                <span className="text-sm font-medium text-[var(--color-gray-700)]">
                  {progress.step}
                </span>
              </div>
              <div className="w-full bg-[var(--color-gray-200)] rounded-full h-2">
                <div
                  className="bg-[var(--color-primary-600)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[var(--color-gray-500)] mt-1">
                {progress.current} / {progress.total}
              </p>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl ${
                result.type === 'success'
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'
              }`}
            >
              {result.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSeedDatabase}
              disabled={isSeeding || isClearing}
              className="flex-1"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Seed Database with Sample Data
                </>
              )}
            </Button>

            {!showConfirmClear ? (
              <Button
                variant="outline"
                onClick={() => setShowConfirmClear(true)}
                disabled={isSeeding || isClearing || totalDocuments === 0}
                className="text-[var(--color-error)] border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmClear(false)}
                  disabled={isClearing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleClearDatabase}
                  disabled={isClearing}
                  className="bg-[var(--color-error)] hover:bg-[var(--color-error)]/90"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Confirm Delete
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Firebase Console Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-[var(--color-gray-200)] shadow-[var(--shadow-2)] p-6"
      >
        <h2 className="text-lg font-semibold text-[var(--color-gray-900)] mb-3">
          External Resources
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://console.firebase.google.com/project/carib-b153b/firestore"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-gray-100)] rounded-lg text-[var(--color-gray-700)] hover:bg-[var(--color-gray-200)] transition-colors"
          >
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Open Firebase Console</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
