/**
 * Conversation Analytics & FAQ Auto-Generation (AI-003)
 *
 * Analyzes chat conversations to:
 * - Identify frequently asked questions
 * - Calculate satisfaction scores
 * - Suggest new FAQ entries
 * - Track question patterns over time
 */

import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCorsConfig } from './middleware/cors';
import { requireAdminAuth } from './middleware/adminAuth';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Interfaces
interface ConversationMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: admin.firestore.Timestamp;
}

interface ConversationDoc {
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: admin.firestore.Timestamp;
  responseTime?: number;
  feedback?: {
    rating?: number;
    helpful?: boolean;
  };
}

interface QuestionCluster {
  representative: string;
  questions: string[];
  count: number;
  avgResponseTime: number;
  satisfactionScore: number;
  responses: string[];
}

interface AnalysisResult {
  question: string;
  frequency: number;
  avgResponseTime: number;
  satisfactionScore: number;
  suggestedFAQ: boolean;
  category: string;
  similarQuestions: string[];
  sampleResponses: string[];
}

/**
 * Scheduled function to analyze conversations daily
 * Runs every day at 4:00 AM KST (7:00 PM UTC previous day)
 */
export const analyzeConversationsDaily = onSchedule(
  {
    schedule: '0 19 * * *', // 7:00 PM UTC = 4:00 AM KST next day
    timeZone: 'UTC',
    retryCount: 2,
    memory: '1GiB',
    timeoutSeconds: 540,
  },
  async () => {
    console.log('Starting daily conversation analysis...');

    const db = admin.firestore();

    try {
      // Get conversations from the last 7 days for analysis
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const conversationsSnapshot = await db
        .collection('conversations')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      if (conversationsSnapshot.empty) {
        console.log('No conversations found for analysis');
        return;
      }

      const conversations: ConversationDoc[] = conversationsSnapshot.docs.map(
        (doc) => doc.data() as ConversationDoc
      );

      console.log(`Analyzing ${conversations.length} conversations...`);

      // Extract and cluster similar questions
      const clusters = await clusterQuestions(conversations);

      // Calculate metrics for each cluster
      const analysisResults = calculateMetrics(clusters, conversations);

      // Identify FAQ candidates (frequency >= 3 and satisfaction >= 60)
      const faqCandidates = analysisResults.filter(
        (result) => result.frequency >= 3 && result.satisfactionScore >= 60 && result.suggestedFAQ
      );

      // Save analysis results
      const analysisRef = db.collection('conversation_analytics').doc();
      await analysisRef.set({
        id: analysisRef.id,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        periodStart: admin.firestore.Timestamp.fromDate(sevenDaysAgo),
        periodEnd: admin.firestore.FieldValue.serverTimestamp(),
        totalConversations: conversations.length,
        totalQuestions: analysisResults.length,
        faqCandidatesCount: faqCandidates.length,
        avgSatisfactionScore: calculateAvgSatisfaction(analysisResults),
        topQuestions: analysisResults.slice(0, 20),
      });

      // Create FAQ suggestions for candidates
      for (const candidate of faqCandidates) {
        // Check if this question already exists in suggestions or FAQs
        const existingSuggestion = await db
          .collection('faq_suggestions')
          .where('question', '==', candidate.question)
          .where('status', '==', 'pending')
          .limit(1)
          .get();

        if (!existingSuggestion.empty) {
          // Update frequency for existing suggestion
          const docRef = existingSuggestion.docs[0].ref;
          await docRef.update({
            frequency: admin.firestore.FieldValue.increment(candidate.frequency),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          continue;
        }

        // Generate suggested answer using AI
        const suggestedAnswer = await generateFAQAnswer(
          candidate.question,
          candidate.sampleResponses
        );

        const suggestionRef = db.collection('faq_suggestions').doc();
        await suggestionRef.set({
          id: suggestionRef.id,
          question: candidate.question,
          suggestedAnswer,
          frequency: candidate.frequency,
          satisfactionScore: candidate.satisfactionScore,
          avgResponseTime: candidate.avgResponseTime,
          similarQuestions: candidate.similarQuestions,
          category: candidate.category,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Create admin notification
      await db.collection('admin_notifications').add({
        type: 'faq_suggestions',
        title: 'New FAQ Suggestions Available',
        message: `${faqCandidates.length} new FAQ suggestions have been generated based on recent conversations.`,
        data: {
          suggestionsCount: faqCandidates.length,
          analysisId: analysisRef.id,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Analysis complete. Generated ${faqCandidates.length} FAQ suggestions.`);
    } catch (error) {
      console.error('Conversation analysis failed:', error);

      await db.collection('analysis_logs').add({
        type: 'conversation_analysis',
        status: 'failed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
);

/**
 * HTTP endpoint to get FAQ suggestions for admin dashboard
 */
export const getFAQSuggestions = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdminAuth(req, res);
    if (!isAdmin) {
      return;
    }

    try {
      const db = admin.firestore();
      const status = req.query.status as string || 'pending';
      const limitCount = parseInt(req.query.limit as string) || 20;

      let query = db.collection('faq_suggestions')
        .where('status', '==', status)
        .orderBy('frequency', 'desc')
        .orderBy('createdAt', 'desc');

      if (limitCount > 0) {
        query = query.limit(limitCount);
      }

      const snapshot = await query.get();

      const suggestions = snapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate().toISOString(),
        reviewedAt: doc.data().reviewedAt?.toDate()?.toISOString(),
      }));

      res.status(200).json({
        success: true,
        data: suggestions,
        total: suggestions.length,
      });
    } catch (error) {
      console.error('Error fetching FAQ suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch FAQ suggestions',
      });
    }
  }
);

/**
 * HTTP endpoint to approve FAQ suggestion and add to FAQs
 */
export const approveFAQSuggestion = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdminAuth(req, res);
    if (!isAdmin) {
      return;
    }

    try {
      const { suggestionId, question, answer, category } = req.body;

      if (!suggestionId) {
        res.status(400).json({
          success: false,
          error: 'suggestionId is required',
        });
        return;
      }

      const db = admin.firestore();

      // Get the suggestion
      const suggestionRef = db.collection('faq_suggestions').doc(suggestionId);
      const suggestionDoc = await suggestionRef.get();

      if (!suggestionDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Suggestion not found',
        });
        return;
      }

      const suggestionData = suggestionDoc.data();

      // Create new FAQ entry
      const faqRef = db.collection('faq').doc();
      const newFAQ = {
        id: faqRef.id,
        question: question || suggestionData?.question,
        answer: answer || suggestionData?.suggestedAnswer,
        category: category || suggestionData?.category || 'general',
        order: 999, // Will be at the end, can be reordered
        active: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdFrom: 'suggestion',
        suggestionId: suggestionId,
        metadata: {
          frequency: suggestionData?.frequency,
          satisfactionScore: suggestionData?.satisfactionScore,
        },
      };

      await faqRef.set(newFAQ);

      // Update suggestion status
      const adminEmail = (req as any).auth?.email || 'admin';
      await suggestionRef.update({
        status: 'approved',
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminEmail,
        faqId: faqRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success: true,
        data: {
          faqId: faqRef.id,
          message: 'FAQ created successfully',
        },
      });
    } catch (error) {
      console.error('Error approving FAQ suggestion:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to approve FAQ suggestion',
      });
    }
  }
);

/**
 * HTTP endpoint to reject FAQ suggestion
 */
export const rejectFAQSuggestion = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdminAuth(req, res);
    if (!isAdmin) {
      return;
    }

    try {
      const { suggestionId, reason } = req.body;

      if (!suggestionId) {
        res.status(400).json({
          success: false,
          error: 'suggestionId is required',
        });
        return;
      }

      const db = admin.firestore();
      const suggestionRef = db.collection('faq_suggestions').doc(suggestionId);

      const suggestionDoc = await suggestionRef.get();
      if (!suggestionDoc.exists) {
        res.status(404).json({
          success: false,
          error: 'Suggestion not found',
        });
        return;
      }

      const adminEmail = (req as any).auth?.email || 'admin';
      await suggestionRef.update({
        status: 'rejected',
        rejectionReason: reason || 'No reason provided',
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminEmail,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success: true,
        message: 'FAQ suggestion rejected',
      });
    } catch (error) {
      console.error('Error rejecting FAQ suggestion:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reject FAQ suggestion',
      });
    }
  }
);

/**
 * HTTP endpoint to get conversation analytics summary
 */
export const getConversationAnalytics = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 20,
    timeoutSeconds: 30,
    memory: '256MiB',
  },
  async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdminAuth(req, res);
    if (!isAdmin) {
      return;
    }

    try {
      const db = admin.firestore();

      // Get latest analysis
      const latestAnalysis = await db
        .collection('conversation_analytics')
        .orderBy('analyzedAt', 'desc')
        .limit(1)
        .get();

      // Get pending suggestions count
      const pendingSuggestions = await db
        .collection('faq_suggestions')
        .where('status', '==', 'pending')
        .count()
        .get();

      // Get recent conversations count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentConversations = await db
        .collection('conversations')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .count()
        .get();

      // Get feedback stats
      const feedbackSnapshot = await db
        .collection('chat_feedback')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
        .get();

      let totalRating = 0;
      let helpfulCount = 0;
      feedbackSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.rating) totalRating += data.rating;
        if (data.helpful) helpfulCount++;
      });

      const avgRating = feedbackSnapshot.size > 0 ? totalRating / feedbackSnapshot.size : 0;
      const helpfulPercentage = feedbackSnapshot.size > 0 ? (helpfulCount / feedbackSnapshot.size) * 100 : 0;

      const analysisData = latestAnalysis.empty ? null : latestAnalysis.docs[0].data();

      res.status(200).json({
        success: true,
        data: {
          latestAnalysis: analysisData
            ? {
                ...analysisData,
                analyzedAt: analysisData.analyzedAt?.toDate()?.toISOString(),
                periodStart: analysisData.periodStart?.toDate()?.toISOString(),
                periodEnd: analysisData.periodEnd?.toDate()?.toISOString(),
              }
            : null,
          stats: {
            pendingSuggestionsCount: pendingSuggestions.data().count,
            recentConversationsCount: recentConversations.data().count,
            feedbackCount: feedbackSnapshot.size,
            avgRating: Math.round(avgRating * 10) / 10,
            helpfulPercentage: Math.round(helpfulPercentage),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching conversation analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversation analytics',
      });
    }
  }
);

/**
 * Firestore trigger: Track feedback when conversation ends
 */
export const onChatFeedbackCreated = onDocumentCreated(
  {
    document: 'chat_feedback/{feedbackId}',
    region: 'asia-northeast3',
  },
  async (event) => {
    const feedbackData = event.data?.data();
    if (!feedbackData) return;

    const db = admin.firestore();
    const { sessionId, rating, helpful } = feedbackData;

    try {
      // Update session with feedback
      if (sessionId) {
        await db.collection('chat_sessions').doc(sessionId).update({
          feedback: {
            rating,
            helpful,
            feedbackAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Update aggregated stats
      const statsRef = db.collection('analytics_stats').doc('chat_feedback');
      await statsRef.set(
        {
          totalFeedback: admin.firestore.FieldValue.increment(1),
          totalRating: admin.firestore.FieldValue.increment(rating || 0),
          helpfulCount: admin.firestore.FieldValue.increment(helpful ? 1 : 0),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error processing chat feedback:', error);
    }
  }
);

/**
 * HTTP endpoint to manually trigger conversation analysis
 */
export const triggerConversationAnalysis = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 5,
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    // Verify admin authentication
    const isAdmin = await requireAdminAuth(req, res);
    if (!isAdmin) {
      return;
    }

    try {
      const days = parseInt(req.body.days as string) || 7;
      const db = admin.firestore();

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const conversationsSnapshot = await db
        .collection('conversations')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startDate))
        .orderBy('timestamp', 'desc')
        .limit(1000)
        .get();

      if (conversationsSnapshot.empty) {
        res.status(200).json({
          success: true,
          message: 'No conversations found for analysis',
          data: { totalConversations: 0, faqSuggestions: 0 },
        });
        return;
      }

      const conversations: ConversationDoc[] = conversationsSnapshot.docs.map(
        (doc) => doc.data() as ConversationDoc
      );

      // Cluster and analyze
      const clusters = await clusterQuestions(conversations);
      const analysisResults = calculateMetrics(clusters, conversations);
      const faqCandidates = analysisResults.filter(
        (result) => result.frequency >= 3 && result.satisfactionScore >= 60 && result.suggestedFAQ
      );

      // Save analysis
      const analysisRef = db.collection('conversation_analytics').doc();
      await analysisRef.set({
        id: analysisRef.id,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        periodStart: admin.firestore.Timestamp.fromDate(startDate),
        periodEnd: admin.firestore.FieldValue.serverTimestamp(),
        totalConversations: conversations.length,
        totalQuestions: analysisResults.length,
        faqCandidatesCount: faqCandidates.length,
        avgSatisfactionScore: calculateAvgSatisfaction(analysisResults),
        topQuestions: analysisResults.slice(0, 20),
        triggeredManually: true,
      });

      // Create FAQ suggestions
      let suggestionsCreated = 0;
      for (const candidate of faqCandidates) {
        const existingSuggestion = await db
          .collection('faq_suggestions')
          .where('question', '==', candidate.question)
          .where('status', '==', 'pending')
          .limit(1)
          .get();

        if (!existingSuggestion.empty) continue;

        const suggestedAnswer = await generateFAQAnswer(
          candidate.question,
          candidate.sampleResponses
        );

        const suggestionRef = db.collection('faq_suggestions').doc();
        await suggestionRef.set({
          id: suggestionRef.id,
          question: candidate.question,
          suggestedAnswer,
          frequency: candidate.frequency,
          satisfactionScore: candidate.satisfactionScore,
          avgResponseTime: candidate.avgResponseTime,
          similarQuestions: candidate.similarQuestions,
          category: candidate.category,
          status: 'pending',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        suggestionsCreated++;
      }

      res.status(200).json({
        success: true,
        message: 'Analysis completed',
        data: {
          totalConversations: conversations.length,
          totalQuestions: analysisResults.length,
          faqSuggestions: suggestionsCreated,
          analysisId: analysisRef.id,
        },
      });
    } catch (error) {
      console.error('Error triggering conversation analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger conversation analysis',
      });
    }
  }
);

// Helper Functions

/**
 * Cluster similar questions using AI
 */
async function clusterQuestions(conversations: ConversationDoc[]): Promise<QuestionCluster[]> {
  const questions = conversations.map((c) => ({
    question: c.userMessage,
    response: c.aiResponse,
    timestamp: c.timestamp,
    responseTime: c.responseTime,
    feedback: c.feedback,
  }));

  if (questions.length === 0) return [];

  try {
    // Use Gemini to cluster similar questions
    const prompt = `Analyze these user questions from a customer support chatbot and group similar questions together.
For each group, provide:
1. A representative question (the most common or clearest phrasing)
2. The category (e.g., "pricing", "service", "technical", "scheduling", "general")
3. Whether this would make a good FAQ entry (true/false)

Questions:
${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Respond in JSON format:
{
  "clusters": [
    {
      "representative": "What is the pricing?",
      "category": "pricing",
      "questionIndices": [1, 5, 12],
      "suggestFAQ": true
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse clustering response');
      return createSimpleClusters(questions);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Build clusters with metrics
    const clusters: QuestionCluster[] = parsed.clusters.map((cluster: any) => {
      const clusterQuestions = cluster.questionIndices.map(
        (i: number) => questions[i - 1]
      );

      const responses = clusterQuestions
        .filter((q: any) => q?.response)
        .map((q: any) => q.response)
        .slice(0, 3);

      let avgResponseTime = 0;
      let satisfactionSum = 0;
      let satisfactionCount = 0;

      clusterQuestions.forEach((q: any) => {
        if (q?.responseTime) avgResponseTime += q.responseTime;
        if (q?.feedback?.rating) {
          satisfactionSum += q.feedback.rating * 20; // Convert 1-5 to 0-100
          satisfactionCount++;
        }
      });

      return {
        representative: cluster.representative,
        questions: clusterQuestions.map((q: any) => q?.question).filter(Boolean),
        count: clusterQuestions.length,
        avgResponseTime: clusterQuestions.length > 0 ? avgResponseTime / clusterQuestions.length : 0,
        satisfactionScore: satisfactionCount > 0 ? satisfactionSum / satisfactionCount : 70, // Default 70
        responses,
        category: cluster.category,
        suggestFAQ: cluster.suggestFAQ,
      };
    });

    return clusters;
  } catch (error) {
    console.error('Error clustering questions with AI:', error);
    return createSimpleClusters(questions);
  }
}

/**
 * Simple fallback clustering without AI
 */
function createSimpleClusters(
  questions: { question: string; response: string; responseTime?: number; feedback?: any }[]
): QuestionCluster[] {
  const questionMap = new Map<string, QuestionCluster>();

  questions.forEach((q) => {
    const normalized = q.question.toLowerCase().trim();
    const existing = questionMap.get(normalized);

    if (existing) {
      existing.count++;
      existing.questions.push(q.question);
      if (q.response) existing.responses.push(q.response);
    } else {
      questionMap.set(normalized, {
        representative: q.question,
        questions: [q.question],
        count: 1,
        avgResponseTime: q.responseTime || 0,
        satisfactionScore: q.feedback?.rating ? q.feedback.rating * 20 : 70,
        responses: q.response ? [q.response] : [],
      });
    }
  });

  return Array.from(questionMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * Calculate metrics for each question cluster
 */
function calculateMetrics(
  clusters: QuestionCluster[],
  conversations: ConversationDoc[]
): AnalysisResult[] {
  return clusters.map((cluster) => ({
    question: cluster.representative,
    frequency: cluster.count,
    avgResponseTime: Math.round(cluster.avgResponseTime),
    satisfactionScore: Math.round(cluster.satisfactionScore),
    suggestedFAQ: cluster.count >= 2 && cluster.satisfactionScore >= 60,
    category: (cluster as any).category || 'general',
    similarQuestions: cluster.questions.slice(0, 5),
    sampleResponses: cluster.responses.slice(0, 3),
  }));
}

/**
 * Calculate average satisfaction score
 */
function calculateAvgSatisfaction(results: AnalysisResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.satisfactionScore, 0);
  return Math.round(sum / results.length);
}

/**
 * Generate FAQ answer using AI
 */
async function generateFAQAnswer(question: string, sampleResponses: string[]): Promise<string> {
  try {
    const prompt = `Based on the following question and sample AI responses, generate a concise, professional FAQ answer in Korean.

Question: ${question}

Sample responses from our AI:
${sampleResponses.map((r, i) => `${i + 1}. ${r.substring(0, 500)}`).join('\n\n')}

Generate a clear, helpful FAQ answer that:
1. Is written in polite Korean
2. Is concise but complete (2-4 sentences)
3. Includes relevant information from the samples
4. Maintains a professional but friendly tone

FAQ Answer:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return answer || sampleResponses[0]?.substring(0, 500) || 'Please contact us for more information.';
  } catch (error) {
    console.error('Error generating FAQ answer:', error);
    return sampleResponses[0]?.substring(0, 500) || 'Please contact us for more information.';
  }
}
