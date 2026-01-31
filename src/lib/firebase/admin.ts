// Admin-specific Firestore functions
import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { Inquiry, InquiryStatus } from '@/types';

// Admin Stats interface
export interface AdminStats {
  totalInquiries: number;
  newInquiries: number;
  contactedInquiries: number;
  scheduledInquiries: number;
  completedInquiries: number;
  archivedInquiries: number;
}

// Inquiry Note interface
export interface InquiryNote {
  content: string;
  createdAt: Date;
  author?: string;
}

// Extended Inquiry with notes
export interface InquiryWithNotes extends Inquiry {
  notes?: InquiryNote[];
}

// Pagination interface
export interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/**
 * Convert Firestore document to Inquiry type
 */
function convertToInquiry(doc: QueryDocumentSnapshot<DocumentData>): InquiryWithNotes {
  const data = doc.data();
  return {
    id: doc.id,
    type: data.type,
    status: data.status,
    data: {
      name: data.data.name,
      email: data.data.email,
      company: data.data.company,
      phone: data.data.phone,
      message: data.data.message,
      budget: data.data.budget,
      timeline: data.data.timeline,
      scheduledTime: data.data.scheduledTime?.toDate?.() || data.data.scheduledTime,
    },
    source: data.source,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    notes: data.notes?.map((note: { content: string; createdAt: Timestamp; author?: string }) => ({
      content: note.content,
      createdAt: note.createdAt?.toDate?.() || new Date(),
      author: note.author,
    })),
  };
}

/**
 * Get all inquiries with optional status filter
 * @param status - Optional status filter
 * @returns Promise<Inquiry[]> - Array of inquiries
 */
export async function getInquiries(status?: InquiryStatus): Promise<InquiryWithNotes[]> {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    let q;

    if (status) {
      q = query(
        inquiriesRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(inquiriesRef, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(convertToInquiry);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching inquiries:', error);
    }
    throw new Error('Failed to fetch inquiries');
  }
}

/**
 * Get paginated inquiries
 * @param status - Optional status filter
 * @param pageSize - Number of items per page
 * @param lastDoc - Last document from previous page
 * @returns Promise<PaginatedResult<InquiryWithNotes>> - Paginated inquiries
 */
export async function getInquiriesPaginated(
  status?: InquiryStatus,
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<PaginatedResult<InquiryWithNotes>> {
  try {
    const inquiriesRef = collection(db, 'inquiries');
    let constraints = [];

    if (status) {
      constraints.push(where('status', '==', status));
    }
    constraints.push(orderBy('createdAt', 'desc'));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize + 1)); // Fetch one extra to check hasMore

    const q = query(inquiriesRef, ...constraints);
    const snapshot = await getDocs(q);

    const hasMore = snapshot.docs.length > pageSize;
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

    return {
      items: docs.map(convertToInquiry),
      lastDoc: docs.length > 0 ? docs[docs.length - 1] : null,
      hasMore,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching paginated inquiries:', error);
    }
    throw new Error('Failed to fetch inquiries');
  }
}

/**
 * Get a single inquiry by ID
 * @param id - Inquiry ID
 * @returns Promise<InquiryWithNotes | null> - Inquiry or null if not found
 */
export async function getInquiry(id: string): Promise<InquiryWithNotes | null> {
  try {
    const docRef = doc(db, 'inquiries', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      type: data.type,
      status: data.status,
      data: {
        name: data.data.name,
        email: data.data.email,
        company: data.data.company,
        phone: data.data.phone,
        message: data.data.message,
        budget: data.data.budget,
        timeline: data.data.timeline,
        scheduledTime: data.data.scheduledTime?.toDate?.() || data.data.scheduledTime,
      },
      source: data.source,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      notes: data.notes?.map((note: { content: string; createdAt: Timestamp; author?: string }) => ({
        content: note.content,
        createdAt: note.createdAt?.toDate?.() || new Date(),
        author: note.author,
      })),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching inquiry:', error);
    }
    throw new Error('Failed to fetch inquiry');
  }
}

/**
 * Update inquiry status
 * @param id - Inquiry ID
 * @param status - New status
 * @returns Promise<void>
 */
export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<void> {
  try {
    const docRef = doc(db, 'inquiries', id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating inquiry status:', error);
    }
    throw new Error('Failed to update inquiry status');
  }
}

/**
 * Add a note to an inquiry
 * @param id - Inquiry ID
 * @param note - Note content
 * @param author - Optional author name
 * @returns Promise<void>
 */
export async function addInquiryNote(id: string, note: string, author?: string): Promise<void> {
  try {
    const docRef = doc(db, 'inquiries', id);
    await updateDoc(docRef, {
      notes: arrayUnion({
        content: note,
        createdAt: Timestamp.now(),
        author: author || 'Admin',
      }),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error adding inquiry note:', error);
    }
    throw new Error('Failed to add note');
  }
}

/**
 * Get admin dashboard statistics
 * @returns Promise<AdminStats> - Statistics for admin dashboard
 */
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const inquiriesRef = collection(db, 'inquiries');

    // Get all inquiries and count by status
    const snapshot = await getDocs(inquiriesRef);

    const stats: AdminStats = {
      totalInquiries: 0,
      newInquiries: 0,
      contactedInquiries: 0,
      scheduledInquiries: 0,
      completedInquiries: 0,
      archivedInquiries: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      stats.totalInquiries++;

      switch (data.status as InquiryStatus) {
        case 'new':
          stats.newInquiries++;
          break;
        case 'contacted':
          stats.contactedInquiries++;
          break;
        case 'scheduled':
          stats.scheduledInquiries++;
          break;
        case 'completed':
          stats.completedInquiries++;
          break;
        case 'archived':
          stats.archivedInquiries++;
          break;
      }
    });

    return stats;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching admin stats:', error);
    }
    throw new Error('Failed to fetch admin statistics');
  }
}

/**
 * Search inquiries by name or email
 * @param searchTerm - Search term
 * @returns Promise<InquiryWithNotes[]> - Matching inquiries
 */
export async function searchInquiries(searchTerm: string): Promise<InquiryWithNotes[]> {
  try {
    // Firestore doesn't support full-text search, so we fetch all and filter client-side
    // For production, consider using Algolia or Elasticsearch
    const inquiries = await getInquiries();
    const lowerSearchTerm = searchTerm.toLowerCase();

    return inquiries.filter((inquiry) => {
      const name = inquiry.data.name?.toLowerCase() || '';
      const email = inquiry.data.email?.toLowerCase() || '';
      const company = inquiry.data.company?.toLowerCase() || '';

      return (
        name.includes(lowerSearchTerm) ||
        email.includes(lowerSearchTerm) ||
        company.includes(lowerSearchTerm)
      );
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error searching inquiries:', error);
    }
    throw new Error('Failed to search inquiries');
  }
}
