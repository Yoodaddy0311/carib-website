// Thread Service - Firestore operations for threads
import { db } from './config';
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import type { Thread, ThreadCategory } from '@/types';

// Firestore converter for type-safe Thread documents
const threadConverter = {
  toFirestore(thread: Thread): DocumentData {
    return {
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
      publishedAt: Timestamp.fromDate(thread.publishedAt),
      syncedAt: Timestamp.fromDate(thread.syncedAt),
      featured: thread.featured,
      published: thread.published,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): Thread {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      tweetId: data.tweetId,
      authorName: data.authorName,
      authorHandle: data.authorHandle,
      authorAvatar: data.authorAvatar,
      content: data.content,
      summary: data.summary,
      category: data.category as ThreadCategory,
      tags: data.tags || [],
      likeCount: data.likeCount || 0,
      retweetCount: data.retweetCount || 0,
      replyCount: data.replyCount || 0,
      mediaUrls: data.mediaUrls || [],
      publishedAt: data.publishedAt?.toDate() || new Date(),
      syncedAt: data.syncedAt?.toDate() || new Date(),
      featured: data.featured || false,
      published: data.published !== false, // Default to true for backwards compatibility
    };
  },
};

// Collection reference with converter
const threadsCollection = collection(db, 'threads').withConverter(threadConverter);

/**
 * Get all threads with optional filtering
 * @param options - Filter options for category, limit, and featured status
 * @returns Promise<Thread[]> - Array of threads
 */
export async function getThreads(options?: {
  category?: ThreadCategory;
  limit?: number;
  featured?: boolean;
}): Promise<Thread[]> {
  try {
    const constraints = [];

    // Add category filter if specified
    if (options?.category) {
      constraints.push(where('category', '==', options.category));
    }

    // Add featured filter if specified
    if (options?.featured !== undefined) {
      constraints.push(where('featured', '==', options.featured));
    }

    // Order by published date (newest first)
    constraints.push(orderBy('publishedAt', 'desc'));

    // Add limit if specified
    if (options?.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    const q = query(threadsCollection, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching threads:', error);
    }
    return [];
  }
}

/**
 * Get a single thread by ID
 * @param id - Thread document ID
 * @returns Promise<Thread | null> - Thread or null if not found
 */
export async function getThread(id: string): Promise<Thread | null> {
  try {
    const docRef = doc(db, 'threads', id).withConverter(threadConverter);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching thread:', error);
    }
    return null;
  }
}

/**
 * Get featured threads for homepage display
 * @param count - Number of featured threads to fetch (default: 3)
 * @returns Promise<Thread[]> - Array of featured threads
 */
export async function getFeaturedThreads(count: number = 3): Promise<Thread[]> {
  try {
    const q = query(
      threadsCollection,
      where('featured', '==', true),
      orderBy('publishedAt', 'desc'),
      firestoreLimit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching featured threads:', error);
    }
    return [];
  }
}

// ==================== Admin Functions ====================

/**
 * Get all threads for admin management (includes unpublished)
 * @param options - Filter options for category
 * @returns Promise<Thread[]> - Array of all threads
 */
export async function getAllThreadsAdmin(options?: {
  category?: ThreadCategory;
}): Promise<Thread[]> {
  try {
    const constraints = [];

    // Add category filter if specified
    if (options?.category) {
      constraints.push(where('category', '==', options.category));
    }

    // Order by published date (newest first)
    constraints.push(orderBy('publishedAt', 'desc'));

    const q = query(threadsCollection, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Error fetching all threads for admin:', error);
    throw error;
  }
}

/**
 * Create a new thread
 * @param thread - Thread data without ID
 * @returns Promise<string> - Created thread ID
 */
export async function createThread(
  thread: Omit<Thread, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'threads'), {
      ...thread,
      publishedAt: Timestamp.fromDate(thread.publishedAt),
      syncedAt: Timestamp.fromDate(thread.syncedAt),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

/**
 * Update an existing thread
 * @param id - Thread document ID
 * @param updates - Partial thread data to update
 */
export async function updateThread(
  id: string,
  updates: Partial<Omit<Thread, 'id'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'threads', id);
    const updateData: Record<string, unknown> = { ...updates };

    // Convert dates to Timestamps if present
    if (updates.publishedAt) {
      updateData.publishedAt = Timestamp.fromDate(updates.publishedAt);
    }
    if (updates.syncedAt) {
      updateData.syncedAt = Timestamp.fromDate(updates.syncedAt);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating thread:', error);
    throw error;
  }
}

/**
 * Delete a thread
 * @param id - Thread document ID
 */
export async function deleteThread(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'threads', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw error;
  }
}

/**
 * Toggle thread published status
 * @param id - Thread document ID
 * @param published - New published status
 */
export async function toggleThreadPublished(
  id: string,
  published: boolean
): Promise<void> {
  try {
    const docRef = doc(db, 'threads', id);
    await updateDoc(docRef, { published });
  } catch (error) {
    console.error('Error toggling thread published status:', error);
    throw error;
  }
}

/**
 * Toggle thread featured status
 * @param id - Thread document ID
 * @param featured - New featured status
 */
export async function toggleThreadFeatured(
  id: string,
  featured: boolean
): Promise<void> {
  try {
    const docRef = doc(db, 'threads', id);
    await updateDoc(docRef, { featured });
  } catch (error) {
    console.error('Error toggling thread featured status:', error);
    throw error;
  }
}

/**
 * Search threads by content or summary
 * @param searchQuery - Search string
 * @returns Promise<Thread[]> - Matching threads
 */
export async function searchThreads(searchQuery: string): Promise<Thread[]> {
  try {
    // Firestore doesn't support full-text search, so we fetch all and filter client-side
    // For production, consider using Algolia or similar
    const q = query(threadsCollection, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);

    const searchLower = searchQuery.toLowerCase();
    return snapshot.docs
      .map((doc) => doc.data())
      .filter(
        (thread) =>
          thread.content.toLowerCase().includes(searchLower) ||
          thread.summary.toLowerCase().includes(searchLower) ||
          thread.authorName.toLowerCase().includes(searchLower) ||
          thread.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
  } catch (error) {
    console.error('Error searching threads:', error);
    throw error;
  }
}
