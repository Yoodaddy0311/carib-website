/**
 * Firestore Seeder using Client SDK
 *
 * This module provides functions to seed Firestore with sample data
 * using the client SDK (no service account required).
 * Can be used from the Admin panel in the browser.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  seedThreads,
  seedTeamMembers,
  seedFAQs,
  type SeedThread,
  type SeedTeamMember,
  type SeedFAQ,
} from './seed-data';

// ============================================================================
// Types
// ============================================================================

export interface SeedResult {
  success: boolean;
  message: string;
  counts?: {
    threads: number;
    team: number;
    faq: number;
  };
  error?: string;
}

export interface SeedProgress {
  step: string;
  current: number;
  total: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clear all documents in a collection
 */
async function clearCollection(collectionName: string): Promise<number> {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);

  if (snapshot.empty) {
    return 0;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnapshot) => {
    batch.delete(docSnapshot.ref);
  });

  await batch.commit();
  return snapshot.size;
}

// ============================================================================
// Seed Functions
// ============================================================================

/**
 * Seed threads collection
 */
export async function seedThreadsCollection(
  onProgress?: (progress: SeedProgress) => void
): Promise<number> {
  const threadsRef = collection(db, 'threads');
  const total = seedThreads.length;

  for (let i = 0; i < total; i++) {
    const thread = seedThreads[i];
    const id = `thread-${String(i + 1).padStart(3, '0')}`;

    await setDoc(doc(threadsRef, id), {
      id,
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
      publishedAt: Timestamp.fromDate(thread.publishedAt),
      syncedAt: Timestamp.fromDate(thread.syncedAt),
      featured: thread.featured,
      published: thread.published,
    });

    onProgress?.({
      step: 'threads',
      current: i + 1,
      total,
    });
  }

  return total;
}

/**
 * Seed team collection
 */
export async function seedTeamCollection(
  onProgress?: (progress: SeedProgress) => void
): Promise<number> {
  const teamRef = collection(db, 'team');
  const total = seedTeamMembers.length;

  for (let i = 0; i < total; i++) {
    const member = seedTeamMembers[i];
    const id = `member-${String(i + 1).padStart(3, '0')}`;

    await setDoc(doc(teamRef, id), {
      id,
      name: member.name,
      role: member.role,
      bio: member.bio,
      avatar: member.avatar,
      social: member.social,
      order: member.order,
    });

    onProgress?.({
      step: 'team',
      current: i + 1,
      total,
    });
  }

  return total;
}

/**
 * Seed FAQ collection
 */
export async function seedFAQCollection(
  onProgress?: (progress: SeedProgress) => void
): Promise<number> {
  const faqRef = collection(db, 'faq');
  const total = seedFAQs.length;

  for (let i = 0; i < total; i++) {
    const faq = seedFAQs[i];
    const id = `faq-${String(i + 1).padStart(3, '0')}`;

    await setDoc(doc(faqRef, id), {
      id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
    });

    onProgress?.({
      step: 'faq',
      current: i + 1,
      total,
    });
  }

  return total;
}

/**
 * Clear all collections
 */
export async function clearAllCollections(
  onProgress?: (progress: SeedProgress) => void
): Promise<{ threads: number; team: number; faq: number }> {
  const collections = ['threads', 'team', 'faq'] as const;
  const results = { threads: 0, team: 0, faq: 0 };

  for (let i = 0; i < collections.length; i++) {
    const collectionName = collections[i];
    const count = await clearCollection(collectionName);
    results[collectionName] = count;

    onProgress?.({
      step: 'clearing',
      current: i + 1,
      total: collections.length,
    });
  }

  return results;
}

/**
 * Seed all collections
 * This is the main function to call for seeding the database
 */
export async function seedAllCollections(
  options: {
    clearFirst?: boolean;
    onProgress?: (progress: SeedProgress) => void;
  } = {}
): Promise<SeedResult> {
  const { clearFirst = true, onProgress } = options;

  try {
    // Clear existing data if requested
    if (clearFirst) {
      onProgress?.({ step: 'Clearing existing data...', current: 0, total: 3 });
      await clearAllCollections(onProgress);
    }

    // Seed threads
    onProgress?.({ step: 'Seeding threads...', current: 0, total: seedThreads.length });
    const threadsCount = await seedThreadsCollection(onProgress);

    // Seed team
    onProgress?.({ step: 'Seeding team...', current: 0, total: seedTeamMembers.length });
    const teamCount = await seedTeamCollection(onProgress);

    // Seed FAQ
    onProgress?.({ step: 'Seeding FAQ...', current: 0, total: seedFAQs.length });
    const faqCount = await seedFAQCollection(onProgress);

    return {
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        threads: threadsCount,
        team: teamCount,
        faq: faqCount,
      },
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    return {
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get current collection counts
 */
export async function getCollectionCounts(): Promise<{
  threads: number;
  team: number;
  faq: number;
}> {
  const [threadsSnapshot, teamSnapshot, faqSnapshot] = await Promise.all([
    getDocs(collection(db, 'threads')),
    getDocs(collection(db, 'team')),
    getDocs(collection(db, 'faq')),
  ]);

  return {
    threads: threadsSnapshot.size,
    team: teamSnapshot.size,
    faq: faqSnapshot.size,
  };
}
