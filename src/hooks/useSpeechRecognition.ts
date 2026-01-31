'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// SpeechRecognition 타입 정의
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Window 확장 타입
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseSpeechRecognitionOptions {
  /** 음성 인식 언어 (기본값: 'ko-KR') */
  language?: string;
  /** 연속 인식 모드 (기본값: false) */
  continuous?: boolean;
  /** 중간 결과 표시 (기본값: true) */
  interimResults?: boolean;
  /** 최대 대안 개수 (기본값: 1) */
  maxAlternatives?: number;
  /** 인식 완료 콜백 */
  onResult?: (transcript: string, isFinal: boolean) => void;
  /** 인식 종료 콜백 */
  onEnd?: () => void;
  /** 에러 콜백 */
  onError?: (error: string) => void;
}

export interface UseSpeechRecognitionReturn {
  /** 음성 인식이 지원되는지 여부 */
  isSupported: boolean;
  /** 현재 듣고 있는지 여부 */
  isListening: boolean;
  /** 인식된 텍스트 (중간 결과 포함) */
  transcript: string;
  /** 최종 인식된 텍스트 */
  finalTranscript: string;
  /** 에러 메시지 */
  error: string | null;
  /** 마이크 권한 상태 */
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  /** 음성 레벨 (0-1, 시각화용) */
  audioLevel: number;
  /** 음성 인식 시작 */
  startListening: () => Promise<void>;
  /** 음성 인식 중지 */
  stopListening: () => void;
  /** 텍스트 초기화 */
  resetTranscript: () => void;
  /** 언어 변경 */
  setLanguage: (lang: string) => void;
}

// 에러 메시지 매핑
const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': '마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.',
  'no-speech': '음성이 감지되지 않았습니다. 다시 말씀해주세요.',
  'audio-capture': '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.',
  'network': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  'aborted': '음성 인식이 중단되었습니다.',
  'language-not-supported': '선택한 언어가 지원되지 않습니다.',
  'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다.',
  'bad-grammar': '문법 오류가 발생했습니다.',
};

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    language = 'ko-KR',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onEnd,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'prompt' | 'unknown'
  >('unknown');
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 브라우저 지원 확인
  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  // 마이크 권한 상태 확인
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: 'microphone' as PermissionName,
          });
          setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');

          result.addEventListener('change', () => {
            setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          });
        }
      } catch {
        // 권한 API가 지원되지 않는 경우
        setPermissionStatus('unknown');
      }
    };

    checkPermission();
  }, []);

  // 오디오 레벨 분석 시작
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.smoothingTimeConstant = 0.8;
      analyserRef.current.fftSize = 256;
      microphoneRef.current.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255); // 0-1 범위로 정규화
        }
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.error('Audio analysis error:', err);
    }
  }, []);

  // 오디오 분석 중지
  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setAudioLevel(0);
  }, []);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.');
      onError?.('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    // 기존 인식 중지
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    setError(null);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;
    recognition.lang = currentLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      startAudioAnalysis();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalText += transcriptText;
          setFinalTranscript((prev) => prev + transcriptText);
          onResult?.(transcriptText, true);
        } else {
          interimTranscript += transcriptText;
        }
      }

      setTranscript(finalText || interimTranscript);

      if (interimTranscript) {
        onResult?.(interimTranscript, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = ERROR_MESSAGES[event.error] || `음성 인식 오류: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);

      if (event.error === 'not-allowed') {
        setPermissionStatus('denied');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      stopAudioAnalysis();
      onEnd?.();
    };

    try {
      recognition.start();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '음성 인식을 시작할 수 없습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [
    isSupported,
    continuous,
    interimResults,
    maxAlternatives,
    currentLanguage,
    onResult,
    onEnd,
    onError,
    startAudioAnalysis,
    stopAudioAnalysis,
  ]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    stopAudioAnalysis();
  }, [stopAudioAnalysis]);

  // 텍스트 초기화
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
  }, []);

  // 언어 변경
  const setLanguage = useCallback((lang: string) => {
    setCurrentLanguage(lang);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.lang = lang;
    }
  }, [isListening]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);

  return {
    isSupported,
    isListening,
    transcript,
    finalTranscript,
    error,
    permissionStatus,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript,
    setLanguage,
  };
}

export default useSpeechRecognition;
