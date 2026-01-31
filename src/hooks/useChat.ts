'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, PageContext, FunctionCallResult } from '@/types';
import { sendChatMessage } from '@/lib/api/cloudFunctions';

interface UseChatOptions {
  pageContext?: PageContext;
}

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  lastFunctionCall: FunctionCallResult | null;
  sessionId: string;
  submitFeedback: (feedback: { rating?: number; helpful?: boolean; comment?: string }) => Promise<void>;
}

interface ChatHistory {
  role: 'user' | 'model';
  content: string;
}

// Generate unique ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate session ID
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initial greeting message
const INITIAL_MESSAGE: ChatMessage = {
  id: generateId(),
  role: 'assistant',
  content: '안녕하세요! Carib AI 어시스턴트입니다. AI 업무 자동화에 대해 궁금한 점이 있으시면 편하게 물어봐주세요.',
  timestamp: new Date(),
};

// Chat API response with optional function call
interface ChatApiResponse {
  message: string;
  functionCall?: FunctionCallResult;
}

// Call the chat API using Cloud Functions client
const callChatApi = async (
  message: string,
  history: ChatHistory[],
  pageContext?: PageContext
): Promise<ChatApiResponse> => {
  const response = await sendChatMessage({
    message,
    history,
    pageContext,
  });

  if (!response.success && response.error) {
    throw new Error(response.error);
  }

  const responseMessage = response.message || response.response;
  if (!responseMessage) {
    throw new Error('서버 응답을 처리할 수 없습니다.');
  }

  return {
    message: responseMessage,
    functionCall: response.functionCall,
  };
};

// Convert messages to API history format
const messagesToHistory = (messages: ChatMessage[]): ChatHistory[] => {
  return messages
    .filter((msg) => msg.role !== 'assistant' || messages.indexOf(msg) !== 0) // Skip initial greeting
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      content: msg.content,
    }));
};

export function useChat(options?: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFunctionCall, setLastFunctionCall] = useState<FunctionCallResult | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId());
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageContextRef = useRef<PageContext | undefined>(options?.pageContext);

  // Update page context ref when it changes
  useEffect(() => {
    pageContextRef.current = options?.pageContext;
  }, [options?.pageContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isLoading) return;

    // Validate message length
    if (trimmedContent.length > 2000) {
      setError('메시지가 너무 깁니다. 2000자 이하로 입력해주세요.');
      return;
    }

    // Clear any previous error
    setError(null);

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmedContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Get conversation history for API
      const currentMessages = [...messages, userMessage];
      const history = messagesToHistory(currentMessages);

      // Call API with page context
      const apiResponse = await callChatApi(trimmedContent, history, pageContextRef.current);

      // Add assistant response with function call data if present
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: apiResponse.message,
        timestamp: new Date(),
        functionCall: apiResponse.functionCall,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update last function call state if present
      if (apiResponse.functionCall) {
        setLastFunctionCall(apiResponse.functionCall);
      }
    } catch (err) {
      console.error('Chat error:', err);

      // Don't show error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      // Set error state
      const errorMessage = err instanceof Error
        ? err.message
        : '죄송합니다. 일시적인 오류가 발생했습니다.';
      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, messages]);

  const clearMessages = useCallback(() => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset to initial state with new session
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: generateId(),
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setIsLoading(false);
    setLastFunctionCall(null);
    setSessionId(generateSessionId()); // Generate new session ID
  }, []);

  // Submit feedback for the chat session
  const submitFeedback = useCallback(async (feedback: { rating?: number; helpful?: boolean; comment?: string }) => {
    try {
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Don't set error state for feedback failures - it's not critical
    }
  }, [sessionId]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    lastFunctionCall,
    sessionId,
    submitFeedback,
  };
}

export default useChat;
