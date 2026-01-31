'use client';

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  AlertCircle,
  Calendar,
  FileText,
  Calculator,
  ArrowRight,
  TrendingUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/useChat';
import { usePageContext } from '@/hooks/usePageContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type {
  ChatMessage,
  FunctionCallResult,
  CoffeeChatData,
  CaseStudyData,
  RoiCalculationData,
} from '@/types';

// Format Korean Won currency
const formatKRW = (value: number): string => {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억원`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(0)}만원`;
  }
  return `${value.toLocaleString()}원`;
};

// Coffee Chat Card Component
interface CoffeeChatCardProps {
  data: CoffeeChatData;
}

const CoffeeChatCard = ({ data }: CoffeeChatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 p-4 bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] rounded-xl border border-[var(--color-primary-200)]"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-600)] flex items-center justify-center">
        <Calendar className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold text-[var(--color-primary-700)]">커피챗 예약</span>
    </div>
    <p className="text-sm text-[var(--color-gray-700)] mb-3">{data.message}</p>
    {data.availableSlots && data.availableSlots.length > 0 && (
      <div className="mb-3">
        <p className="text-xs text-[var(--color-gray-500)] mb-2">가능한 시간대:</p>
        <div className="flex flex-wrap gap-2">
          {data.availableSlots.slice(0, 3).map((slot, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-white rounded-md text-xs text-[var(--color-gray-600)] border border-[var(--color-gray-200)]"
            >
              {slot}
            </span>
          ))}
        </div>
      </div>
    )}
    <Link
      href={data.bookingUrl}
      className="flex items-center justify-center gap-2 w-full py-2.5 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-lg text-sm font-medium transition-colors"
    >
      <span>예약 페이지로 이동</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

// Case Study Card Component
interface CaseStudyCardProps {
  data: CaseStudyData;
}

const CaseStudyCard = ({ data }: CaseStudyCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 p-4 bg-gradient-to-br from-[var(--color-gray-50)] to-[var(--color-gray-100)] rounded-xl border border-[var(--color-gray-200)]"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-[var(--color-gray-600)] flex items-center justify-center">
        <FileText className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold text-[var(--color-gray-700)]">관련 사례 연구</span>
    </div>
    <div className="space-y-3">
      {data.caseStudies.map((caseStudy) => (
        <Link
          key={caseStudy.id}
          href={caseStudy.link}
          className="block p-3 bg-white rounded-lg border border-[var(--color-gray-200)] hover:border-[var(--color-primary-300)] hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-[var(--color-gray-800)] mb-1">
                {caseStudy.title}
              </h4>
              <p className="text-xs text-[var(--color-gray-500)] mb-2">{caseStudy.summary}</p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded text-xs">
                  {caseStudy.industry}
                </span>
                <span className="text-xs text-[var(--color-gray-400)]">{caseStudy.results}</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-gray-400)] flex-shrink-0" />
          </div>
        </Link>
      ))}
    </div>
  </motion.div>
);

// ROI Calculation Card Component
interface RoiCalculationCardProps {
  data: RoiCalculationData;
}

const RoiCalculationCard = ({ data }: RoiCalculationCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200"
  >
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
        <Calculator className="w-4 h-4 text-white" />
      </div>
      <span className="font-semibold text-green-700">ROI 분석 결과</span>
    </div>
    <p className="text-sm text-[var(--color-gray-700)] mb-4">
      <strong>{data.taskType}</strong> 자동화 예상 효과
    </p>

    {/* Stats Grid */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="p-3 bg-white rounded-lg border border-green-200">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs text-[var(--color-gray-500)]">월간 절감액</span>
        </div>
        <p className="text-lg font-bold text-green-700">
          {formatKRW(data.calculations.estimatedMonthlySavings)}
        </p>
      </div>
      <div className="p-3 bg-white rounded-lg border border-green-200">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs text-[var(--color-gray-500)]">연간 절감액</span>
        </div>
        <p className="text-lg font-bold text-green-700">
          {formatKRW(data.calculations.estimatedAnnualSavings)}
        </p>
      </div>
      <div className="p-3 bg-white rounded-lg border border-green-200">
        <div className="flex items-center gap-1.5 mb-1">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs text-[var(--color-gray-500)]">투자 회수 기간</span>
        </div>
        <p className="text-lg font-bold text-blue-700">
          {data.calculations.paybackPeriodMonths}개월
        </p>
      </div>
      <div className="p-3 bg-white rounded-lg border border-green-200">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-xs text-[var(--color-gray-500)]">예상 절감율</span>
        </div>
        <p className="text-lg font-bold text-purple-700">
          {data.calculations.estimatedSavingsPercent}%
        </p>
      </div>
    </div>

    {/* Input Summary */}
    <div className="p-3 bg-white/60 rounded-lg text-xs text-[var(--color-gray-500)]">
      <p className="mb-1">분석 기준:</p>
      <ul className="space-y-0.5">
        <li>- 주당 {data.inputs.currentTimeSpent}시간 소요</li>
        <li>- {data.inputs.employeeCount}명 담당</li>
        <li>- 시급 {formatKRW(data.inputs.hourlyRate)} 기준</li>
      </ul>
    </div>

    <Link
      href="/coffee-chat"
      className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      <span>상세 분석 상담받기</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  </motion.div>
);

// Function Call Result Component
interface FunctionCallCardProps {
  functionCall: FunctionCallResult;
}

const FunctionCallCard = ({ functionCall }: FunctionCallCardProps) => {
  const { type, data } = functionCall.result;

  switch (type) {
    case 'coffee_chat':
      return <CoffeeChatCard data={data as CoffeeChatData} />;
    case 'case_study':
      return <CaseStudyCard data={data as CaseStudyData} />;
    case 'roi_calculation':
      return <RoiCalculationCard data={data as RoiCalculationData} />;
    default:
      return null;
  }
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3" role="status" aria-live="polite" aria-label="AI가 응답을 작성하고 있습니다">
    <div className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[var(--color-gray-400)]"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
    <span className="ml-2 text-sm text-[var(--color-gray-500)]">입력 중...</span>
  </div>
);

// Message bubble component
interface MessageBubbleProps {
  message: ChatMessage;
  isLast: boolean;
}

const MessageBubble = ({ message, isLast }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const hasFunctionCall = !isUser && message.functionCall;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-[var(--color-primary-600)] text-white'
            : 'bg-[var(--color-gray-200)] text-[var(--color-gray-600)]'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message content */}
      <div className={cn('max-w-[85%]', hasFunctionCall && 'max-w-[90%]')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-[var(--color-primary-600)] text-white rounded-br-md'
              : 'bg-[var(--color-gray-100)] text-[var(--color-gray-800)] rounded-bl-md'
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          <span
            className={cn(
              'block mt-1 text-xs',
              isUser ? 'text-white/70' : 'text-[var(--color-gray-400)]'
            )}
          >
            {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Function Call Card */}
        {hasFunctionCall && message.functionCall && (
          <FunctionCallCard functionCall={message.functionCall} />
        )}
      </div>
    </motion.div>
  );
};

// Error banner component
interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
  >
    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-sm text-red-700">{message}</p>
    </div>
    <button
      onClick={onDismiss}
      className="text-red-400 hover:text-red-600 transition-colors"
      aria-label="닫기"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

// Audio Waveform Component for voice visualization
const AudioWaveform = ({ audioLevel, isListening }: { audioLevel: number; isListening: boolean }) => {
  const bars = 5;
  const baseHeight = 4;
  const maxHeight = 20;

  return (
    <div className="flex items-center justify-center gap-0.5 h-6">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.1;
        const heightMultiplier = Math.sin((i / bars) * Math.PI) + 0.5;
        const targetHeight = isListening
          ? baseHeight + audioLevel * maxHeight * heightMultiplier
          : baseHeight;

        return (
          <motion.div
            key={i}
            className="w-0.5 rounded-full bg-white"
            animate={{
              height: targetHeight,
              opacity: isListening ? 0.6 + audioLevel * 0.4 : 0.4,
            }}
            transition={{
              duration: 0.1,
              delay: isListening ? delay : 0,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
};

// Main ChatWidget component
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showError, setShowError] = useState(false);
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false);
  const pageContext = usePageContext();
  const { messages, isLoading, error, sendMessage, clearMessages, submitFeedback } = useChat({ pageContext });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { trackChatOpen, trackChatMessageSent } = useAnalytics();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastSpokenMessageIdRef = useRef<string>('');

  // Speech Recognition Hook
  const {
    isSupported: isSttSupported,
    isListening,
    transcript,
    error: sttError,
    permissionStatus,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    language: 'ko-KR',
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal && text.trim()) {
        setInputValue(text.trim());
        // 자동으로 메시지 전송
        handleVoiceSubmit(text.trim());
      }
    },
    onEnd: () => {
      // 음성 인식 종료 시 처리
    },
  });

  // Speech Synthesis Hook
  const {
    isSupported: isTtsSupported,
    isSpeaking,
    isEnabled: isTtsEnabled,
    speak,
    cancel: cancelSpeech,
    toggleEnabled: toggleTts,
  } = useSpeechSynthesis({
    language: 'ko-KR',
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  // Show error banner when error occurs
  useEffect(() => {
    if (error || sttError) {
      setShowError(true);
    }
  }, [error, sttError]);

  // Track last assistant message for TTS
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.id !== lastSpokenMessageIdRef.current
    ) {
      lastSpokenMessageIdRef.current = lastMessage.id;

      // Auto-speak if voice mode is enabled
      if (isVoiceModeEnabled && isTtsEnabled && isTtsSupported && !isLoading) {
        setTimeout(() => {
          speak(lastMessage.content);
        }, 300);
      }
    }
  }, [messages, isVoiceModeEnabled, isTtsEnabled, isTtsSupported, isLoading, speak]);

  // Stop TTS when voice mode is disabled
  useEffect(() => {
    if (!isVoiceModeEnabled && isSpeaking) {
      cancelSpeech();
    }
  }, [isVoiceModeEnabled, isSpeaking, cancelSpeech]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');

    // Track chat message sent event
    trackChatMessageSent(message.length);

    await sendMessage(message);
  };

  // Handle voice message submission
  const handleVoiceSubmit = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInputValue('');
    trackChatMessageSent(text.length);
    await sendMessage(text);
  };

  // Toggle voice mode
  const toggleVoiceMode = () => {
    setIsVoiceModeEnabled((prev) => {
      if (prev) {
        // Turning off - stop listening and speaking
        stopListening();
        cancelSpeech();
      }
      return !prev;
    });
  };

  // Handle microphone button click
  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInputValue('');
      await startListening();
    }
  };

  // Handle TTS button click
  const handleTtsClick = () => {
    if (isSpeaking) {
      cancelSpeech();
    } else {
      toggleTts();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const toggleChat = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    // Track chat open event
    if (willOpen) {
      trackChatOpen();
    }
  };

  // Handle feedback submission
  const handleFeedback = async (helpful: boolean) => {
    if (feedbackSubmitted) return;

    await submitFeedback({ helpful, rating: helpful ? 5 : 2 });
    setFeedbackSubmitted(true);
  };

  // Reset feedback when messages are cleared
  useEffect(() => {
    if (messages.length <= 1) {
      setFeedbackSubmitted(false);
    }
  }, [messages.length]);

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-white dark:bg-[var(--color-gray-100)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-gray-200)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-widget-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="chat-widget-title" className="font-semibold text-base">Carib AI</h3>
                  <p className="text-xs text-white/80">AI 자동화 어시스턴트</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Voice Mode Toggle */}
                {(isSttSupported || isTtsSupported) && (
                  <button
                    onClick={toggleVoiceMode}
                    className={cn(
                      'p-2 rounded-lg transition-colors flex items-center gap-1',
                      isVoiceModeEnabled
                        ? 'bg-white/20 text-white'
                        : 'hover:bg-white/10 text-white/70'
                    )}
                    title={isVoiceModeEnabled ? '음성 모드 끄기' : '음성 모드 켜기'}
                    aria-label={isVoiceModeEnabled ? '음성 모드 끄기' : '음성 모드 켜기'}
                  >
                    {isVoiceModeEnabled ? (
                      <>
                        <Mic className="w-4 h-4" />
                        <span className="text-xs">ON</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span className="text-xs">OFF</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={clearMessages}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-xs"
                  title="대화 초기화"
                >
                  초기화
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {showError && error && (
                <ErrorBanner
                  message={error}
                  onDismiss={() => setShowError(false)}
                />
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div
              className="h-[400px] overflow-y-auto p-4 space-y-4 bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-50)]"
              role="log"
              aria-live="polite"
              aria-label="채팅 메시지"
            >
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-gray-200)] flex items-center justify-center text-[var(--color-gray-600)]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[var(--color-gray-100)] rounded-2xl rounded-bl-md">
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Feedback Banner - Show after a few messages */}
            {messages.length >= 3 && !feedbackSubmitted && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 bg-[var(--color-gray-100)] border-t border-[var(--color-gray-200)]"
              >
                <p className="text-xs text-center text-[var(--color-gray-500)] mb-2">
                  이 대화가 도움이 되었나요?
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    도움됨
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors text-sm"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    아쉬움
                  </button>
                </div>
              </motion.div>
            )}

            {/* Feedback Thank You Message */}
            {feedbackSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-2 bg-[var(--color-primary-50)] border-t border-[var(--color-gray-200)]"
              >
                <p className="text-xs text-center text-[var(--color-primary-700)]">
                  피드백 감사합니다! 더 나은 서비스를 위해 노력하겠습니다.
                </p>
              </motion.div>
            )}

            {/* Voice Recognition Status Bar */}
            <AnimatePresence>
              {isVoiceModeEnabled && isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-3 bg-red-50 border-t border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-3 h-3 rounded-full bg-red-500"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-sm font-medium text-red-700">듣는 중...</span>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <AudioWaveform audioLevel={audioLevel} isListening={isListening} />
                    </div>
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      중지
                    </button>
                  </div>
                  {transcript && (
                    <p className="mt-2 text-sm text-[var(--color-gray-600)] italic">
                      &ldquo;{transcript}&rdquo;
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* TTS Speaking Indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-[var(--color-primary-50)] border-t border-[var(--color-primary-200)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[var(--color-primary-600)]" />
                      <span className="text-sm text-[var(--color-primary-700)]">응답을 읽고 있습니다...</span>
                    </div>
                    <button
                      type="button"
                      onClick={cancelSpeech}
                      className="px-3 py-1 text-xs bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-lg hover:bg-[var(--color-primary-200)] transition-colors"
                    >
                      중지
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-white dark:bg-[var(--color-gray-100)] border-t border-[var(--color-gray-200)]"
            >
              <div className="flex items-end gap-2">
                {/* Voice Controls (when voice mode is enabled) */}
                {isVoiceModeEnabled && (
                  <div className="flex items-center gap-1">
                    {/* Microphone Button */}
                    {isSttSupported && (
                      <motion.button
                        type="button"
                        onClick={handleMicClick}
                        disabled={permissionStatus === 'denied'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isListening
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                            : permissionStatus === 'denied'
                            ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-400)] cursor-not-allowed'
                            : 'bg-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-600)]'
                        )}
                        aria-label={isListening ? '음성 입력 중지' : '음성 입력 시작'}
                        title={
                          permissionStatus === 'denied'
                            ? '마이크 권한이 거부됨'
                            : isListening
                            ? '음성 입력 중지'
                            : '음성 입력 시작'
                        }
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        {isListening && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-red-500"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    )}

                    {/* TTS Toggle Button */}
                    {isTtsSupported && (
                      <motion.button
                        type="button"
                        onClick={handleTtsClick}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                          isSpeaking
                            ? 'bg-[var(--color-primary-500)] text-white shadow-lg'
                            : isTtsEnabled
                            ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
                            : 'bg-[var(--color-gray-100)] text-[var(--color-gray-400)]'
                        )}
                        aria-label={isTtsEnabled ? 'TTS 끄기' : 'TTS 켜기'}
                        title={isSpeaking ? '음성 중지' : isTtsEnabled ? '음성 응답 끄기' : '음성 응답 켜기'}
                      >
                        {isTtsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                        {isSpeaking && (
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-[var(--color-primary-500)]"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    )}
                  </div>
                )}

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={isListening ? transcript : inputValue}
                    onChange={(e) => !isListening && setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? '말씀해주세요...' : '메시지를 입력하세요...'}
                    rows={1}
                    disabled={isListening}
                    aria-label="채팅 메시지 입력"
                    className={cn(
                      'w-full px-4 py-3 pr-12 bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-200)] text-[var(--foreground)] rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] resize-none text-sm placeholder:text-[var(--color-gray-400)]',
                      isListening && 'bg-red-50 border border-red-200'
                    )}
                    style={{
                      minHeight: '48px',
                      maxHeight: '120px',
                    }}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={(!inputValue.trim() && !transcript.trim()) || isLoading || isListening}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                    (inputValue.trim() || transcript.trim()) && !isLoading && !isListening
                      ? 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]'
                      : 'bg-[var(--color-gray-200)] text-[var(--color-gray-400)] cursor-not-allowed'
                  )}
                  aria-label="전송"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-center text-[var(--color-gray-400)]">
                {isVoiceModeEnabled
                  ? '마이크 버튼을 눌러 음성으로 입력하세요'
                  : 'Enter로 전송, Shift+Enter로 줄바꿈'}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
          isOpen
            ? 'bg-[var(--color-gray-700)] text-white'
            : 'bg-[var(--color-primary-600)] text-white'
        )}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[var(--color-primary-600)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>
    </>
  );
}

export default ChatWidget;
