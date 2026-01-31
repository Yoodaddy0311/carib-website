// Thread Types
export interface Thread {
  id: string;
  tweetId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  summary: string;
  category: ThreadCategory;
  tags: string[];
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  mediaUrls?: string[];
  publishedAt: Date;
  syncedAt: Date;
  featured: boolean;
  published: boolean;
}

export type ThreadCategory =
  | 'ai-automation'
  | 'no-code'
  | 'productivity'
  | 'case-study'
  | 'tutorial'
  | 'insight';

// Inquiry Types
export interface Inquiry {
  id: string;
  type: 'coffee-chat' | 'project' | 'general';
  status: InquiryStatus;
  data: InquiryData;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InquiryStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'archived';

export interface InquiryData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  budget?: string;
  timeline?: string;
  scheduledTime?: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: FunctionCallResult;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Function Calling Types (AI-002)
export type FunctionCallType = 'coffee_chat' | 'case_study' | 'roi_calculation';

export interface FunctionCallResult {
  functionName: string;
  args: Record<string, unknown>;
  result: {
    type: FunctionCallType;
    data: CoffeeChatData | CaseStudyData | RoiCalculationData;
  };
}

export interface CoffeeChatData {
  bookingUrl: string;
  topic: string;
  urgency: string;
  preferredTime?: string;
  message: string;
  availableSlots?: string[];
}

export interface CaseStudyData {
  caseStudies: CaseStudyItem[];
  query: {
    industry?: string;
    useCase?: string;
    technology?: string;
  };
  message: string;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  industry: string;
  summary: string;
  results: string;
  link: string;
}

export interface RoiCalculationData {
  taskType: string;
  inputs: {
    currentTimeSpent: number;
    employeeCount: number;
    hourlyRate: number;
  };
  calculations: {
    currentMonthlyCost: number;
    estimatedSavingsPercent: number;
    estimatedMonthlySavings: number;
    estimatedAnnualSavings: number;
    paybackPeriodMonths: number;
  };
  message: string;
}

// Team Member Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

// Service Types
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

// Stats Types
export interface TrustMetric {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

// Page Context Types
export interface PageContext {
  url: string;
  pathname: string;
  scrollPosition: number;
  scrollPercentage: number;
  viewedSections: string[];
  sessionDuration: number; // in seconds
  pageTitle: string;
  referrer: string;
  visitedPages: string[];
}

export type PageType = 'home' | 'coffee-chat' | 'threads' | 'thread-detail' | 'legal' | 'admin' | 'unknown';

// Question Analysis Types (AI-003)
export interface QuestionAnalysis {
  id: string;
  question: string;
  frequency: number;
  avgResponseTime: number; // in milliseconds
  satisfactionScore: number; // 0-100
  suggestedFAQ: boolean;
  category?: string;
  similarQuestions?: string[];
  sampleResponses?: string[];
  lastAsked: Date;
  firstAsked: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQSuggestion {
  id: string;
  question: string;
  suggestedAnswer: string;
  frequency: number;
  satisfactionScore: number;
  avgResponseTime: number;
  similarQuestions: string[];
  status: 'pending' | 'approved' | 'rejected';
  category?: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface ConversationAnalytics {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  avgResponseTime: number;
  satisfactionScore: number;
  topQuestions: QuestionAnalysis[];
  faqSuggestions: FAQSuggestion[];
  periodStart: Date;
  periodEnd: Date;
}

export interface ChatFeedback {
  sessionId: string;
  messageId?: string;
  rating: number; // 1-5
  helpful: boolean;
  comment?: string;
  timestamp: Date;
}

// Booking Types
export * from './booking';

// Document Analyzer Types (AI-004)
export * from './document-analyzer';

// Newsletter Subscriber Types (BE-007)
export type SubscriberInterest = 'automation' | 'ai' | 'data-analysis';
export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed';

export interface Subscriber {
  id: string;
  email: string;
  interests: SubscriberInterest[];
  status: SubscriberStatus;
  source?: string;
  confirmToken?: string;
  unsubscribeToken: string;
  sendGridContactId?: string;
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  metadata?: {
    userAgent?: string;
    referrer?: string;
    page?: string;
  };
}

export interface SubscriberStats {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  byInterest?: {
    automation: number;
    ai: number;
    'data-analysis': number;
  };
}
