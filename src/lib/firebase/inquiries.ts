// Inquiry Service - Firestore operations for inquiries
import { db } from './config';
import {
  collection,
  addDoc,
  serverTimestamp,
  DocumentData,
  Timestamp,
} from 'firebase/firestore';
import type { InquiryData, InquiryStatus } from '@/types';

// Inquiry type for submission
type InquiryType = 'coffee-chat' | 'project' | 'general';

// Firestore inquiry document structure
interface InquiryDocument {
  type: InquiryType;
  status: InquiryStatus;
  data: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    message?: string;
    budget?: string;
    timeline?: string;
    scheduledTime?: Timestamp | null;
  };
  source: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

// Form submission tracking document
interface FormSubmissionDocument {
  formType: string;
  timestamp: ReturnType<typeof serverTimestamp>;
  userAgent?: string;
  referrer?: string;
}

/**
 * Convert InquiryData to Firestore-compatible format
 * @param data - Inquiry data from form
 * @returns Firestore-compatible data object
 */
function convertInquiryData(data: InquiryData): InquiryDocument['data'] {
  return {
    name: data.name,
    email: data.email,
    company: data.company || undefined,
    phone: data.phone || undefined,
    message: data.message || undefined,
    budget: data.budget || undefined,
    timeline: data.timeline || undefined,
    scheduledTime: data.scheduledTime
      ? Timestamp.fromDate(data.scheduledTime)
      : null,
  };
}

/**
 * Submit a new inquiry to Firestore
 * @param params - Inquiry submission parameters
 * @param params.type - Type of inquiry (coffee-chat, project, general)
 * @param params.data - Inquiry form data
 * @param params.source - Source of the inquiry (default: 'website')
 * @returns Promise<string> - Document ID of created inquiry
 * @throws Error if submission fails
 */
export async function submitInquiry(params: {
  type: InquiryType;
  data: InquiryData;
  source?: string;
}): Promise<string> {
  try {
    const { type, data, source = 'website' } = params;

    const inquiryDoc: InquiryDocument = {
      type,
      status: 'new' as InquiryStatus,
      data: convertInquiryData(data),
      source,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'inquiries'),
      inquiryDoc as DocumentData
    );

    // Track the form submission for analytics
    await trackFormSubmission(`inquiry-${type}`);

    return docRef.id;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error submitting inquiry:', error);
    }
    throw new Error('Failed to submit inquiry. Please try again.');
  }
}

/**
 * Track form submission for analytics purposes
 * @param formType - Type of form submitted
 * @returns Promise<void>
 */
export async function trackFormSubmission(formType: string): Promise<void> {
  try {
    const submissionDoc: FormSubmissionDocument = {
      formType,
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    };

    await addDoc(
      collection(db, 'form_submissions'),
      submissionDoc as DocumentData
    );
  } catch (error) {
    // Silently fail for analytics - don't disrupt user experience
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracking form submission:', error);
    }
  }
}
