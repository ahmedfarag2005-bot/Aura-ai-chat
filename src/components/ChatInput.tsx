import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  Brain,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Attachment } from '../types/chat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  language: 'ar' | 'en';
  deepThinking: boolean;
  onToggleDeepThinking: () => void;
  webSearch: boolean;
  onToggleWebSearch: () => void;
  initialValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  language,
  deepThinking,
  onToggleDeepThinking,
  webSearch,
  onToggleWebSearch,
  initialValue = '',
}) => {
  const [inputText, setInputText] = useState(initialValue);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [speechNotification, setSpeechNotification] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseTextBeforeRecordingRef = useRef<string>('');

  const isAr = language === 'ar';

  // Real SpeechRecognition Web API Hook
  const {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
  } = useSpeechRecognition({
    language,
    onTranscriptChange: (spokenTranscript: string) => {
      const base = baseTextBeforeRecordingRef.current;
      const separator = base && !base.endsWith(' ') ? ' ' : '';
      const combined = base ? `${base}${separator}${spokenTranscript}` : spokenTranscript;
      setInputText(combined);
    },
    onError: (errorMsg: string) => {
      setSpeechNotification(errorMsg);
      setTimeout(() => setSpeechNotification(null), 5000);
    },
  });

  useEffect(() => {
    if (initialValue) {
      setInputText(initialValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialValue]);

  // Dynamic textarea height expansion
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${newHeight}px`;
  }, [inputText]);

  // Handle message submission
  const handleSend = () => {
    // If voice recording is actively in progress, stop it upon message submission
    if (isRecording) {
      stopRecording();
    }

    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;

    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
    baseTextBeforeRecordingRef.current = '';

    if (textareaRef.current) {
      textareaRef.current.style.height = '24px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type.startsWith('image/') ? 'image' : 'file',
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Toggle voice-to-text recording
  const handleToggleSpeech = () => {
    if (!isSupported) {
      setSpeechNotification(
        isAr
          ? 'المتصفح الحالي لا يدعم خاصية تحويل الصوت إلى نص (SpeechRecognition). يُفضل استخدام Google Chrome أو Edge.'
          : 'SpeechRecognition API is not supported in this browser. Please use Chrome or Edge.'
      );
      setTimeout(() => setSpeechNotification(null), 5000);
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      // Remember existing text so speech appends smoothly
      baseTextBeforeRecordingRef.current = inputText;
      setSpeechNotification(null);
      startRecording();
    }
  };

  const hasContent = inputText.trim().length > 0 || attachments.length > 0;

  return (
    <div className="input-container w-full z-20 pointer-events-none pb-4 pt-1">
      <div className="w-full flex flex-col items-center pointer-events-auto px-4 max-w-3xl mx-auto">
        {/* Active voice recording status indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 mb-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 backdrop-blur-md shadow-xs transition-all animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600" />
            </span>
            <span>{isAr ? 'جارٍ الاستماع... تحدث الآن' : 'Listening... speak now'}</span>
            <button
              type="button"
              onClick={stopRecording}
              className="px-2 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              {isAr ? 'إنهاء' : 'Done'}
            </button>
          </div>
        )}

        {/* Speech Recognition notification / error alert */}
        {speechNotification && (
          <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/30 backdrop-blur-md shadow-xs max-w-md w-full">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate">{speechNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setSpeechNotification(null)}
              className="text-amber-600 dark:text-amber-400 hover:opacity-75 p-0.5 cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Liquid Glass Input bar (Pill Shape) */}
        <div className="glass-input-bar w-full flex items-center gap-2.5 sm:gap-3">
          {/* Action icon: attachment */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors shrink-0 p-1 cursor-pointer"
            title={isAr ? 'إرفاق ملف' : 'Attach file'}
            aria-label={isAr ? 'إرفاق ملف' : 'Attach file'}
          >
            <Paperclip size={18} />
          </button>

          {/* Voice-to-text dictation button */}
          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`transition-all shrink-0 p-1.5 rounded-full cursor-pointer relative ${
              isRecording
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/20 ring-2 ring-rose-500/50 shadow-sm animate-pulse'
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-500/10'
            }`}
            title={
              isRecording
                ? isAr
                  ? 'إيقاف التسجيل الصوتي'
                  : 'Stop recording'
                : isAr
                ? 'تحويل الصوت إلى نص (إملاء صوتي)'
                : 'Voice typing (Speech to text)'
            }
            aria-label={
              isRecording
                ? isAr
                  ? 'إيقاف التسجيل الصوتي'
                  : 'Stop recording'
                : isAr
                ? 'تحويل الصوت إلى نص'
                : 'Voice typing'
            }
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Attachment preview pills */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full liquid-glass text-[11px] text-neutral-700 dark:text-neutral-300"
                  >
                    <FileText size={11} className="text-neutral-500" />
                    <span className="truncate max-w-[110px] font-medium">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isRecording
                  ? isAr
                    ? 'تحدث الآن... يتم تحويل صوتك إلى نص'
                    : 'Listening... speak to transcribe'
                  : isAr
                  ? 'اسأل أي شيء...'
                  : 'Ask anything...'
              }
              dir="auto"
              style={{ minHeight: '24px' }}
              className="w-full resize-none bg-transparent outline-none border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 text-[15px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
            />
          </div>

          {/* Reasoning & Web pill shortcuts */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleDeepThinking}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                deepThinking
                  ? 'text-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              title={isAr ? 'تفكير متعمق' : 'Deep reasoning'}
            >
              <Brain size={16} />
            </button>
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                webSearch
                  ? 'text-blue-600 bg-blue-50/80 dark:bg-blue-950/50 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              title={isAr ? 'بحث الويب' : 'Web search'}
            >
              <Globe size={16} />
            </button>
          </div>

          {/* Send / Stop Button with liquid glass shine */}
          {isLoading ? (
            <button
              type="button"
              onClick={onStopGeneration}
              className="glass-send-btn w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
              title={isAr ? 'إيقاف' : 'Stop'}
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent}
              className={`glass-send-btn w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                hasContent ? 'cursor-pointer opacity-100' : 'opacity-35 cursor-not-allowed'
              }`}
              title={isAr ? 'إرسال' : 'Send'}
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
