/**
 * AI Chat Handler using Gemini 1.5 Flash with Function Calling
 *
 * Provides chat functionality for the Carib AI assistant using
 * Google's Generative AI SDK with Gemini 1.5 Flash model.
 *
 * Function Calling Features:
 * - schedule_coffee_chat: 커피챗 예약 페이지 안내
 * - show_case_study: 관련 사례 연구 표시
 * - calculate_roi: ROI 예상 계산
 *
 * Security Features:
 * - Firebase Auth token verification
 * - Rate limiting (IP-based, Firestore)
 * - Input validation (Zod schemas)
 * - XSS prevention
 * - Strict CORS policy
 */

import { onRequest } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import * as admin from 'firebase-admin';
import { requireAuth, AuthenticatedRequest } from './middleware/auth';
import { rateLimit, RATE_LIMITS } from './middleware/rate-limiter';
import { validateRequest, chatMessageSchema, ChatMessageInput, containsXssPatterns } from './middleware/validation';
import { getCorsConfig } from './middleware/cors';
import {
  chatFunctionDeclarations,
  executeFunctionCall,
  FunctionCallResult,
} from './chat-functions';

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Get the Gemini 1.5 Flash model for fast responses with Function Calling
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  },
  // Enable Function Calling
  tools: [
    {
      functionDeclarations: chatFunctionDeclarations,
    },
  ],
});

// System prompt for Carib AI assistant (Korean)
const SYSTEM_PROMPT = `당신은 Carib의 친절하고 전문적인 AI 어시스턴트입니다.

역할:
- 사용자의 질문에 친절하고 도움이 되는 답변을 제공합니다
- Carib의 서비스와 제품에 대해 안내합니다
- 사용자가 필요한 정보를 쉽게 찾을 수 있도록 돕습니다
- 복잡한 질문이나 상담이 필요한 경우, 커피챗(Coffee Chat) 예약을 권유합니다

가이드라인:
- 항상 한국어로 응답합니다 (사용자가 다른 언어로 질문해도 한국어로 답변)
- 친근하면서도 전문적인 톤을 유지합니다
- 답변은 명확하고 간결하게 제공합니다
- 모르는 내용은 솔직히 인정하고, 커피챗을 통한 상담을 안내합니다
- 절대로 허위 정보를 제공하지 않습니다
- 개인정보를 요청하지 않습니다

Function Calling 사용 지침:
- 사용자가 상담, 미팅, 예약을 원하거나 복잡한 질문을 할 때: schedule_coffee_chat 함수를 호출합니다
- 사용자가 사례, 케이스 스터디, 성공 사례, 도입 사례를 물을 때: show_case_study 함수를 호출합니다
- 사용자가 비용 절감, ROI, 투자 대비 효과, 자동화 효과를 물을 때: calculate_roi 함수를 호출합니다
- 함수를 호출한 후에는 결과를 바탕으로 친절하게 요약하여 설명합니다

커피챗 안내:
- 더 자세한 상담이 필요하거나 복잡한 질문인 경우 schedule_coffee_chat 함수를 호출합니다
- 커피챗은 Carib 전문가와 1:1로 화상 또는 대면 상담을 할 수 있는 서비스입니다
- 상담 예약은 웹사이트의 커피챗 예약 페이지에서 가능합니다

응답 스타일:
- 이모지를 적절히 사용하여 친근감을 더합니다
- 긴 답변은 단락을 나누어 가독성을 높입니다
- 리스트나 번호를 활용하여 정보를 체계적으로 전달합니다`;

// Response interface
interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  sessionId?: string;
  details?: Array<{ field: string; message: string }>;
  functionCall?: FunctionCallResult;
}

/**
 * Main chat endpoint for handling user messages
 *
 * Security:
 * - Requires Firebase Auth token in Authorization header
 * - Rate limited: 30 requests per minute per IP
 * - Input validated with Zod schema
 * - XSS patterns blocked
 * - Strict CORS policy (production domains only)
 */
export const chat = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 100,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      } as ChatResponse);
      return;
    }

    // Rate limiting check
    const rateLimitAllowed = await rateLimit(req, res, 'chat', RATE_LIMITS.chat);
    if (!rateLimitAllowed) {
      return; // Response already sent by rateLimit
    }

    // Verify Firebase Auth token
    const isAuthenticated = await requireAuth(req as AuthenticatedRequest, res);
    if (!isAuthenticated) {
      return; // Response already sent by requireAuth
    }

    try {
      // Validate and sanitize input with Zod schema
      const validatedData = await validateRequest<ChatMessageInput>(
        req,
        res,
        chatMessageSchema
      );
      if (!validatedData) {
        return; // Response already sent by validateRequest
      }

      const { message, conversationHistory, sessionId } = validatedData;

      // Additional XSS pattern check
      if (containsXssPatterns(message)) {
        res.status(400).json({
          success: false,
          error: 'Message contains invalid content.',
        } as ChatResponse);
        return;
      }

      // Build conversation history for Gemini
      const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add conversation history if provided
      if (conversationHistory && Array.isArray(conversationHistory)) {
        for (const entry of conversationHistory) {
          history.push({
            role: entry.role,
            parts: [{ text: entry.content }],
          });
        }
      }

      // Start chat with history and system instruction
      const chatSession = model.startChat({
        history,
        systemInstruction: SYSTEM_PROMPT,
      });

      // Generate response
      let result = await chatSession.sendMessage(message);
      let response = result.response;
      let textResponse = '';
      let functionCallResult: FunctionCallResult | null = null;

      // Check for function calls
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        const functionCall = functionCalls[0];
        const functionName = functionCall.name;
        const functionArgs = functionCall.args as Record<string, unknown>;

        console.log(`Function call detected: ${functionName}`, functionArgs);

        // Execute the function
        functionCallResult = executeFunctionCall(functionName, functionArgs);

        if (functionCallResult) {
          // Send function result back to the model
          const functionResultResponse = await chatSession.sendMessage([
            {
              functionResponse: {
                name: functionName,
                response: functionCallResult.result,
              },
            },
          ]);

          // Get the final text response after function execution
          textResponse = functionResultResponse.response.text();
        }
      } else {
        // No function call, use direct response
        textResponse = response.text();
      }

      if (!textResponse && !functionCallResult) {
        throw new Error('No response generated from AI model');
      }

      // Store conversation in Firestore
      const db = admin.firestore();
      const newSessionId = sessionId || db.collection('chat_sessions').doc().id;

      // Save to conversations collection
      await db.collection('conversations').add({
        sessionId: newSessionId,
        userMessage: message,
        aiResponse: textResponse,
        functionCall: functionCallResult ? {
          name: functionCallResult.functionName,
          args: functionCallResult.args,
          resultType: functionCallResult.result.type,
        } : null,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        model: 'gemini-1.5-flash',
      });

      // Update or create session document
      await db.collection('chat_sessions').doc(newSessionId).set(
        {
          lastMessage: message,
          lastResponse: textResponse,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          messageCount: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );

      // Build response object
      const chatResponse: ChatResponse = {
        success: true,
        response: textResponse,
        sessionId: newSessionId,
      };

      // Include function call result if present
      if (functionCallResult) {
        chatResponse.functionCall = functionCallResult;
      }

      res.status(200).json(chatResponse);
    } catch (error) {
      console.error('Chat error:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
          res.status(429).json({
            success: false,
            error: 'Service temporarily unavailable. Please try again later.',
          } as ChatResponse);
          return;
        }

        if (error.message.includes('safety') || error.message.includes('SAFETY')) {
          res.status(400).json({
            success: false,
            error:
              'Your message could not be processed. Please rephrase and try again.',
          } as ChatResponse);
          return;
        }

        if (error.message.includes('API_KEY') || error.message.includes('API key')) {
          console.error('API Key error - check GOOGLE_AI_API_KEY configuration');
          res.status(500).json({
            success: false,
            error: 'Service configuration error. Please contact support.',
          } as ChatResponse);
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      } as ChatResponse);
    }
  }
);

/**
 * Streaming chat endpoint for real-time responses
 *
 * Security:
 * - Requires Firebase Auth token in Authorization header
 * - Rate limited: 30 requests per minute per IP
 * - Input validated with Zod schema
 * - XSS patterns blocked
 * - Strict CORS policy (production domains only)
 */
export const chatStream = onRequest(
  {
    cors: getCorsConfig(),
    maxInstances: 50,
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        error: 'Method not allowed. Use POST.',
      });
      return;
    }

    // Rate limiting check
    const rateLimitAllowed = await rateLimit(req, res, 'chat', RATE_LIMITS.chat);
    if (!rateLimitAllowed) {
      return; // Response already sent by rateLimit
    }

    // Verify Firebase Auth token
    const isAuthenticated = await requireAuth(req as AuthenticatedRequest, res);
    if (!isAuthenticated) {
      return; // Response already sent by requireAuth
    }

    try {
      // Validate and sanitize input with Zod schema
      const validatedData = await validateRequest<ChatMessageInput>(
        req,
        res,
        chatMessageSchema
      );
      if (!validatedData) {
        return; // Response already sent by validateRequest
      }

      const { message, conversationHistory, sessionId } = validatedData;

      // Additional XSS pattern check
      if (containsXssPatterns(message)) {
        res.status(400).json({
          success: false,
          error: 'Message contains invalid content.',
        });
        return;
      }

      // Set headers for Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Build conversation history
      const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (conversationHistory && Array.isArray(conversationHistory)) {
        for (const entry of conversationHistory) {
          history.push({
            role: entry.role,
            parts: [{ text: entry.content }],
          });
        }
      }

      // Start chat with history and system instruction
      const chatSession = model.startChat({
        history,
        systemInstruction: SYSTEM_PROMPT,
      });

      // Generate streaming response
      const result = await chatSession.sendMessageStream(message);

      let fullResponse = '';

      // Stream chunks to client
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          fullResponse += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      // Store conversation in Firestore after streaming completes
      const db = admin.firestore();
      const newSessionId = sessionId || db.collection('chat_sessions').doc().id;

      await db.collection('conversations').add({
        sessionId: newSessionId,
        userMessage: message,
        aiResponse: fullResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        model: 'gemini-1.5-flash',
        streaming: true,
      });

      // Send completion signal with session ID
      res.write(`data: ${JSON.stringify({ done: true, sessionId: newSessionId })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Chat stream error:', error);
      res.write(
        `data: ${JSON.stringify({ error: 'An error occurred during streaming.' })}\n\n`
      );
      res.end();
    }
  }
);
