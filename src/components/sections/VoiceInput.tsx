'use client';

import { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Settings,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useSpeechRecognition,
  type UseSpeechRecognitionReturn,
} from '@/hooks/useSpeechRecognition';
import {
  useSpeechSynthesis,
  type UseSpeechSynthesisReturn,
} from '@/hooks/useSpeechSynthesis';

// 지원 언어 목록
const SUPPORTED_LANGUAGES = [
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
];

// 음성 파형 시각화 컴포넌트
interface AudioWaveformProps {
  audioLevel: number;
  isListening: boolean;
}

const AudioWaveform = memo(({ audioLevel, isListening }: AudioWaveformProps) => {
  const bars = 5;
  const baseHeight = 4;
  const maxHeight = 24;

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => {
        // 각 바에 다른 딜레이와 높이 계산
        const delay = i * 0.1;
        const heightMultiplier = Math.sin((i / bars) * Math.PI) + 0.5;
        const targetHeight = isListening
          ? baseHeight + audioLevel * maxHeight * heightMultiplier
          : baseHeight;

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full bg-[var(--color-primary-500)]"
            animate={{
              height: targetHeight,
              opacity: isListening ? 0.5 + audioLevel * 0.5 : 0.3,
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
});

AudioWaveform.displayName = 'AudioWaveform';

// 마이크 버튼 컴포넌트
interface MicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  permissionStatus: string;
  onClick: () => void;
  disabled?: boolean;
}

const MicButton = memo(({
  isListening,
  isSupported,
  permissionStatus,
  onClick,
  disabled,
}: MicButtonProps) => {
  const isPermissionDenied = permissionStatus === 'denied';
  const isDisabled = disabled || !isSupported || isPermissionDenied;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.05 } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
        isListening
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          : isDisabled
          ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-400)] cursor-not-allowed'
          : 'bg-[var(--color-gray-100)] text-[var(--color-gray-600)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-600)]'
      )}
      aria-label={isListening ? '음성 입력 중지' : '음성 입력 시작'}
      title={
        !isSupported
          ? '이 브라우저는 음성 인식을 지원하지 않습니다'
          : isPermissionDenied
          ? '마이크 권한이 거부되었습니다'
          : isListening
          ? '음성 입력 중지'
          : '음성 입력 시작'
      }
    >
      {isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}

      {/* 녹음 중 펄스 애니메이션 */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-red-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
});

MicButton.displayName = 'MicButton';

// 스피커 버튼 컴포넌트
interface SpeakerButtonProps {
  isEnabled: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  onClick: () => void;
}

const SpeakerButton = memo(({
  isEnabled,
  isSpeaking,
  isSupported,
  onClick,
}: SpeakerButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!isSupported}
      whileHover={isSupported ? { scale: 1.05 } : undefined}
      whileTap={isSupported ? { scale: 0.95 } : undefined}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
        !isSupported
          ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-400)] cursor-not-allowed'
          : isEnabled
          ? isSpeaking
            ? 'bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/30'
            : 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]'
          : 'bg-[var(--color-gray-100)] text-[var(--color-gray-400)] hover:bg-[var(--color-gray-200)]'
      )}
      aria-label={isEnabled ? 'TTS 끄기' : 'TTS 켜기'}
      title={
        !isSupported
          ? '이 브라우저는 음성 합성을 지원하지 않습니다'
          : isEnabled
          ? '음성 응답 끄기'
          : '음성 응답 켜기'
      }
    >
      {isEnabled ? (
        <Volume2 className="w-5 h-5" />
      ) : (
        <VolumeX className="w-5 h-5" />
      )}

      {/* 말하는 중 애니메이션 */}
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-[var(--color-primary-500)]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
});

SpeakerButton.displayName = 'SpeakerButton';

// 언어 선택 드롭다운
interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LanguageSelector = memo(({
  currentLanguage,
  onLanguageChange,
  isOpen,
  onToggle,
}: LanguageSelectorProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[var(--color-gray-100)] hover:bg-[var(--color-gray-200)] text-[var(--color-gray-600)] text-xs transition-colors"
        aria-label="언어 선택"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{currentLang.flag}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 py-1 bg-white rounded-lg shadow-lg border border-[var(--color-gray-200)] min-w-[140px] z-10"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  onLanguageChange(lang.code);
                  onToggle();
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-gray-50)] transition-colors',
                  currentLanguage === lang.code
                    ? 'text-[var(--color-primary-600)] bg-[var(--color-primary-50)]'
                    : 'text-[var(--color-gray-700)]'
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

LanguageSelector.displayName = 'LanguageSelector';

// 실시간 텍스트 표시 컴포넌트
interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
}

const TranscriptDisplay = memo(({ transcript, isListening }: TranscriptDisplayProps) => {
  if (!isListening && !transcript) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 py-2 bg-[var(--color-gray-50)] border-t border-[var(--color-gray-200)]"
    >
      <div className="flex items-start gap-2">
        <Mic className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-h-[24px]">
          {transcript ? (
            <p className="text-sm text-[var(--color-gray-700)]">{transcript}</p>
          ) : (
            <p className="text-sm text-[var(--color-gray-400)] italic">
              말씀해주세요...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
});

TranscriptDisplay.displayName = 'TranscriptDisplay';

// 에러 표시 컴포넌트
interface VoiceErrorProps {
  error: string;
  onDismiss: () => void;
}

const VoiceError = memo(({ error, onDismiss }: VoiceErrorProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm"
  >
    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    <span className="flex-1 text-red-700">{error}</span>
    <button
      type="button"
      onClick={onDismiss}
      className="text-red-400 hover:text-red-600 text-xs underline"
    >
      닫기
    </button>
  </motion.div>
));

VoiceError.displayName = 'VoiceError';

// 메인 VoiceInput 컴포넌트 Props
export interface VoiceInputProps {
  /** 음성 인식 결과 콜백 (최종 결과) */
  onTranscript: (text: string) => void;
  /** 음성 모드 활성화 여부 */
  isVoiceModeEnabled: boolean;
  /** 음성 모드 토글 콜백 */
  onVoiceModeToggle: () => void;
  /** 입력 비활성화 */
  disabled?: boolean;
  /** TTS로 읽을 텍스트 (AI 응답) */
  textToSpeak?: string;
  /** 클래스 이름 */
  className?: string;
  /** 간소화 모드 (버튼만 표시) */
  compact?: boolean;
}

export function VoiceInput({
  onTranscript,
  isVoiceModeEnabled,
  onVoiceModeToggle,
  disabled = false,
  textToSpeak,
  className,
  compact = false,
}: VoiceInputProps) {
  const [language, setLanguage] = useState('ko-KR');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showError, setShowError] = useState(false);
  const lastSpokenTextRef = useRef<string>('');

  // 음성 인식 훅
  const speechRecognition: UseSpeechRecognitionReturn = useSpeechRecognition({
    language,
    continuous: false,
    interimResults: true,
    onResult: (transcript, isFinal) => {
      if (isFinal && transcript.trim()) {
        onTranscript(transcript.trim());
      }
    },
    onError: () => {
      setShowError(true);
    },
  });

  // 음성 합성 훅
  const speechSynthesis: UseSpeechSynthesisReturn = useSpeechSynthesis({
    language,
    rate: 1,
    pitch: 1,
    volume: 1,
  });

  // 마이크 버튼 클릭 핸들러
  const handleMicClick = () => {
    if (speechRecognition.isListening) {
      speechRecognition.stopListening();
    } else {
      speechRecognition.resetTranscript();
      speechRecognition.startListening();
    }
  };

  // TTS 토글 핸들러
  const handleTtsToggle = () => {
    if (speechSynthesis.isSpeaking) {
      speechSynthesis.cancel();
    }
    speechSynthesis.toggleEnabled();
  };

  // 언어 변경 핸들러
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    speechRecognition.setLanguage(lang);
  };

  // AI 응답 자동 TTS 재생
  useEffect(() => {
    if (
      textToSpeak &&
      speechSynthesis.isEnabled &&
      speechSynthesis.isSupported &&
      textToSpeak !== lastSpokenTextRef.current &&
      isVoiceModeEnabled
    ) {
      lastSpokenTextRef.current = textToSpeak;
      // 약간의 딜레이 후 재생 (UI 업데이트 후)
      const timeoutId = setTimeout(() => {
        speechSynthesis.speak(textToSpeak);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [textToSpeak, speechSynthesis, isVoiceModeEnabled]);

  // 음성 모드 비활성화 시 TTS 중지
  useEffect(() => {
    if (!isVoiceModeEnabled && speechSynthesis.isSpeaking) {
      speechSynthesis.cancel();
    }
  }, [isVoiceModeEnabled, speechSynthesis]);

  // 에러 자동 숨김
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  // 컴팩트 모드 (버튼만)
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <MicButton
          isListening={speechRecognition.isListening}
          isSupported={speechRecognition.isSupported}
          permissionStatus={speechRecognition.permissionStatus}
          onClick={handleMicClick}
          disabled={disabled || !isVoiceModeEnabled}
        />
        <SpeakerButton
          isEnabled={speechSynthesis.isEnabled}
          isSpeaking={speechSynthesis.isSpeaking}
          isSupported={speechSynthesis.isSupported}
          onClick={handleTtsToggle}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* 음성 컨트롤 바 */}
      <div className="flex items-center gap-2 px-2 py-1.5 bg-[var(--color-gray-50)] rounded-lg border border-[var(--color-gray-200)]">
        {/* 마이크 버튼 */}
        <MicButton
          isListening={speechRecognition.isListening}
          isSupported={speechRecognition.isSupported}
          permissionStatus={speechRecognition.permissionStatus}
          onClick={handleMicClick}
          disabled={disabled}
        />

        {/* 파형 시각화 */}
        <div className="flex-1 flex items-center justify-center">
          <AudioWaveform
            audioLevel={speechRecognition.audioLevel}
            isListening={speechRecognition.isListening}
          />
        </div>

        {/* 스피커 버튼 */}
        <SpeakerButton
          isEnabled={speechSynthesis.isEnabled}
          isSpeaking={speechSynthesis.isSpeaking}
          isSupported={speechSynthesis.isSupported}
          onClick={handleTtsToggle}
        />

        {/* 언어 선택 */}
        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
          isOpen={showLanguageSelector}
          onToggle={() => setShowLanguageSelector(!showLanguageSelector)}
        />

        {/* 음성 모드 토글 */}
        <button
          type="button"
          onClick={onVoiceModeToggle}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            isVoiceModeEnabled
              ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
              : 'bg-[var(--color-gray-100)] text-[var(--color-gray-500)] hover:bg-[var(--color-gray-200)]'
          )}
        >
          {isVoiceModeEnabled ? '음성 ON' : '음성 OFF'}
        </button>
      </div>

      {/* 실시간 텍스트 표시 */}
      <AnimatePresence>
        {speechRecognition.isListening && (
          <TranscriptDisplay
            transcript={speechRecognition.transcript}
            isListening={speechRecognition.isListening}
          />
        )}
      </AnimatePresence>

      {/* 에러 표시 */}
      <AnimatePresence>
        {showError && speechRecognition.error && (
          <VoiceError
            error={speechRecognition.error}
            onDismiss={() => setShowError(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default VoiceInput;

// 개별 컴포넌트도 export
export { AudioWaveform, MicButton, SpeakerButton, LanguageSelector, TranscriptDisplay };
