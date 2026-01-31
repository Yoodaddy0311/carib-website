'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseSpeechSynthesisOptions {
  /** 음성 언어 (기본값: 'ko-KR') */
  language?: string;
  /** 음성 속도 (0.1-10, 기본값: 1) */
  rate?: number;
  /** 음성 피치 (0-2, 기본값: 1) */
  pitch?: number;
  /** 음성 볼륨 (0-1, 기본값: 1) */
  volume?: number;
  /** 선호 음성 이름 (선택사항) */
  preferredVoiceName?: string;
  /** 말하기 시작 콜백 */
  onStart?: () => void;
  /** 말하기 종료 콜백 */
  onEnd?: () => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
}

export interface UseSpeechSynthesisReturn {
  /** TTS가 지원되는지 여부 */
  isSupported: boolean;
  /** 현재 말하고 있는지 여부 */
  isSpeaking: boolean;
  /** 일시 정지 상태인지 여부 */
  isPaused: boolean;
  /** TTS 활성화 여부 */
  isEnabled: boolean;
  /** 사용 가능한 음성 목록 */
  voices: SpeechSynthesisVoice[];
  /** 현재 선택된 음성 */
  currentVoice: SpeechSynthesisVoice | null;
  /** 에러 메시지 */
  error: string | null;
  /** 텍스트 말하기 */
  speak: (text: string) => void;
  /** 말하기 일시 정지 */
  pause: () => void;
  /** 말하기 재개 */
  resume: () => void;
  /** 말하기 취소 */
  cancel: () => void;
  /** TTS 활성화/비활성화 토글 */
  toggleEnabled: () => void;
  /** TTS 활성화 설정 */
  setEnabled: (enabled: boolean) => void;
  /** 음성 변경 */
  setVoice: (voice: SpeechSynthesisVoice) => void;
  /** 속도 변경 */
  setRate: (rate: number) => void;
  /** 피치 변경 */
  setPitch: (pitch: number) => void;
  /** 볼륨 변경 */
  setVolume: (volume: number) => void;
}

// 한국어 음성 우선순위 (Google 음성 선호)
const KOREAN_VOICE_PRIORITIES = [
  'Google 한국어',
  'Microsoft Heami',
  'ko-KR',
  'Korean',
];

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    language = 'ko-KR',
    rate: initialRate = 1,
    pitch: initialPitch = 1,
    volume: initialVolume = 1,
    preferredVoiceName,
    onStart,
    onEnd,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rate, setRate] = useState(initialRate);
  const [pitch, setPitch] = useState(initialPitch);
  const [volume, setVolume] = useState(initialVolume);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // 브라우저 지원 확인 및 음성 목록 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    synthRef.current = synth;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);

      // 한국어 음성 찾기
      const koreanVoices = availableVoices.filter(
        (voice) => voice.lang.startsWith('ko') || voice.lang === language
      );

      if (koreanVoices.length > 0) {
        // 선호 음성 이름이 있으면 찾기
        if (preferredVoiceName) {
          const preferred = koreanVoices.find((v) =>
            v.name.toLowerCase().includes(preferredVoiceName.toLowerCase())
          );
          if (preferred) {
            setCurrentVoice(preferred);
            return;
          }
        }

        // 우선순위에 따라 음성 선택
        for (const priority of KOREAN_VOICE_PRIORITIES) {
          const found = koreanVoices.find(
            (v) =>
              v.name.includes(priority) ||
              v.lang.includes(priority)
          );
          if (found) {
            setCurrentVoice(found);
            return;
          }
        }

        // 기본 한국어 음성 선택
        setCurrentVoice(koreanVoices[0]);
      } else if (availableVoices.length > 0) {
        // 한국어 음성이 없으면 기본 음성 사용
        setCurrentVoice(availableVoices[0]);
      }
    };

    // 음성 목록이 비동기로 로드될 수 있음
    loadVoices();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // 일부 브라우저에서 음성 로드 지연
    const timeoutId = setTimeout(loadVoices, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [language, preferredVoiceName]);

  // 텍스트 말하기
  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !synthRef.current || !isEnabled) {
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      // 기존 발화 취소
      synthRef.current.cancel();
      setError(null);

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utteranceRef.current = utterance;

      // 설정 적용
      utterance.rate = Math.max(0.1, Math.min(10, rate));
      utterance.pitch = Math.max(0, Math.min(2, pitch));
      utterance.volume = Math.max(0, Math.min(1, volume));
      utterance.lang = language;

      if (currentVoice) {
        utterance.voice = currentVoice;
      }

      // 이벤트 핸들러
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        setIsPaused(false);

        // 취소된 경우 에러로 처리하지 않음
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return;
        }

        const errorMessage = `음성 합성 오류: ${event.error}`;
        setError(errorMessage);
        onError?.(errorMessage);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      synthRef.current.speak(utterance);
    },
    [
      isSupported,
      isEnabled,
      rate,
      pitch,
      volume,
      language,
      currentVoice,
      onStart,
      onEnd,
      onError,
    ]
  );

  // 일시 정지
  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
    }
  }, [isSpeaking]);

  // 재개
  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
    }
  }, [isPaused]);

  // 취소
  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  // TTS 활성화 토글
  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      if (prev) {
        // 비활성화 시 현재 발화 취소
        cancel();
      }
      return !prev;
    });
  }, [cancel]);

  // 음성 변경
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    isEnabled,
    voices,
    currentVoice,
    error,
    speak,
    pause,
    resume,
    cancel,
    toggleEnabled,
    setEnabled: setIsEnabled,
    setVoice,
    setRate,
    setPitch,
    setVolume,
  };
}

export default useSpeechSynthesis;
