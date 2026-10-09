import { useState, useRef, useEffect, useCallback } from 'react';

// Web Speech API interface definitions for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  language?: 'ar' | 'en';
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
}

export function useSpeechRecognition({
  language = 'ar',
  onTranscriptChange,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isManuallyStoppedRef = useRef(false);

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const supported = !!(win.SpeechRecognition || win.webkitSpeechRecognition);
      setIsSupported(supported);
    }
  }, []);

  // Stop recording on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore abort errors on cleanup
        }
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    setError(null);
    isManuallyStoppedRef.current = false;

    if (typeof window === 'undefined') return;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      const notSupportedMsg =
        language === 'ar'
          ? 'التعرف على الصوت غير مدعوم في هذا المتصفح. جرّب متصفح Chrome أو Edge.'
          : 'Speech recognition is not supported in this browser. Try Chrome or Edge.';
      setError(notSupportedMsg);
      onError?.(notSupportedMsg);
      return;
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let completeFinal = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            if (result.isFinal) {
              completeFinal += result[0].transcript + ' ';
            } else {
              currentInterim += result[0].transcript;
            }
          }
        }

        const fullSpokenText = (completeFinal + currentInterim).trim();
        if (fullSpokenText) {
          onTranscriptChange?.(fullSpokenText, currentInterim === '');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        let errorMsg = '';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg =
            language === 'ar'
              ? 'يرجى السماح بالوصول إلى الميكروفون لاستخدام الإملاء الصوتي.'
              : 'Please allow microphone access to use voice dictation.';
        } else if (event.error === 'no-speech') {
          // No speech detected, not fatal
          return;
        } else if (event.error === 'network') {
          errorMsg =
            language === 'ar'
              ? 'تعذر الاتصال بخدمة التعرف على الصوت. تحقق من اتصال الإنترنت.'
              : 'Network error connecting to speech recognition service.';
        } else {
          errorMsg =
            language === 'ar'
              ? 'حدث خطأ أثناء الاستماع. يرجى المحاولة مرة أخرى.'
              : 'An error occurred during speech recognition. Please try again.';
        }

        setError(errorMsg);
        onError?.(errorMsg);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      const errMsg =
        language === 'ar'
          ? 'تعذر بدء التسجيل الصوتي. يرجى التحقق من أذونات الميكروفون.'
          : 'Failed to start speech recognition. Please check microphone permissions.';
      setError(errMsg);
      onError?.(errMsg);
      setIsRecording(false);
    }
  }, [language, onTranscriptChange, onError]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    toggleRecording,
    clearError: () => setError(null),
  };
}
