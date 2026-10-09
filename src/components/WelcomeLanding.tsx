import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  Brain,
  X,
  FileText,
  Chrome,
  Facebook,
  Video,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Github,
  Code,
  Lightbulb,
  FileCheck,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { Attachment } from '../types/chat';
import { BrandEmblem } from './BrandEmblem';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const TikTokIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.96-4.52V8.9a8.28 8.28 0 0 0 4.81 1.54V7a4.83 4.83 0 0 1-1-.31z" />
  </svg>
);

const TIKTOK_PROFILE_URL =
  'https://www.google.com/url?opi=89978449&q=https://www.tiktok.com/%40mohamed.hewet1&sa=U&sqi=2&ved=2ahUKEwit2_K54ayXAxXcV0EAHZHCMIwQFnoECB4QAQ&usg=AOvVaw2dIz-dRD8o3gqIGHN6HowB';

interface WelcomeLandingProps {
  language: 'ar' | 'en';
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isLoading?: boolean;
  deepThinking?: boolean;
  onToggleDeepThinking?: () => void;
  webSearch?: boolean;
  onToggleWebSearch?: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({
  language,
  onSendMessage,
  isLoading = false,
  deepThinking = false,
  onToggleDeepThinking,
  webSearch = false,
  onToggleWebSearch,
}) => {
  const isAr = language === 'ar';
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [speechNotification, setSpeechNotification] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseTextBeforeRecordingRef = useRef<string>('');

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
    onError: (msg: string) => {
      setSpeechNotification(msg);
      setTimeout(() => setSpeechNotification(null), 5000);
    },
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${newHeight}px`;
  }, [inputText]);

  const handleSend = () => {
    if (isRecording) {
      stopRecording();
    }
    if (!inputText.trim() && attachments.length === 0) return;
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

  const toggleSpeechRecognition = () => {
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
      baseTextBeforeRecordingRef.current = inputText;
      setSpeechNotification(null);
      startRecording();
    }
  };

  const hasContent = inputText.trim().length > 0 || attachments.length > 0;

  const socialIcons = [
    {
      id: 'tiktok',
      icon: <TikTokIcon size={20} />,
      label: 'TikTok: @mohamed.hewet1',
      url: TIKTOK_PROFILE_URL,
    },
    { icon: <Facebook size={20} />, label: 'Facebook' },
    { icon: <Video size={20} />, label: 'Meet' },
    { icon: <Instagram size={20} />, label: 'Instagram' },
    { icon: <Youtube size={20} />, label: 'YouTube' },
    { icon: <Twitter size={20} />, label: 'Twitter' },
    { icon: <Linkedin size={20} />, label: 'LinkedIn' },
    { icon: <Github size={20} />, label: 'GitHub' },
    { icon: <Chrome size={20} />, label: 'Chrome' },
  ];

  const promptSuggestions = [
    {
      icon: <Code size={15} className="text-blue-500" />,
      title: isAr ? 'كتابة كود برمجي' : 'Write Code',
      desc: isAr ? 'اكتب دالة بلغة TypeScript للتحقق من صحة المدخلات' : 'Create a TypeScript validation helper',
      prompt: isAr
        ? 'اكتب دالة بلغة TypeScript نظيفة وقوية للتحقق من صحة عناوين البريد الإلكتروني مع أمثلة واختبارات.'
        : 'Write a clean, robust TypeScript function to validate emails and inputs with usage examples.',
    },
    {
      icon: <Lightbulb size={15} className="text-amber-500" />,
      title: isAr ? 'أفكار إبداعية' : 'Creative Ideas',
      desc: isAr ? 'أفكار لمشاريع تقنية مبتكرة لعام 2026' : 'Innovative tech project ideas for 2026',
      prompt: isAr
        ? 'اقترح عليّ 5 أفكار لمشاريع وتطبيقات ويب ذكية يمكن بناؤها باستخدام تقنيات الذكاء الاصطناعي في 2026.'
        : 'Suggest 5 innovative web app project ideas leveraging AI capabilities in 2026.',
    },
    {
      icon: <FileCheck size={15} className="text-emerald-500" />,
      title: isAr ? 'صياغة وتلخيص' : 'Summarize & Draft',
      desc: isAr ? 'صياغة رسالة بريد إلكتروني رسمية ومؤثرة' : 'Draft a polished executive email',
      prompt: isAr
        ? 'اكتب لي رسالة بريد إلكتروني رسمية ولبقة لتقديم عرض عمل لعميل مهم مع إبراز نقاط القوة.'
        : 'Draft a professional executive email presenting a project proposal to a high-priority client.',
    },
    {
      icon: <Compass size={15} className="text-purple-500" />,
      title: isAr ? 'شرح مفهوم معقد' : 'Explain Concepts',
      desc: isAr ? 'كيف تعمل نماذج اللغة التوليدية ببساطة؟' : 'How generative language models work',
      prompt: isAr
        ? 'اشرح لي ببساطة وتدرج منطقي كيف تعمل نماذج اللغة الكبيرة التوليدية (LLMs) وآلية الانتباه Attention.'
        : 'Explain in clear and intuitive terms how modern transformer language models and attention mechanisms work.',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-120px)] max-w-3xl mx-auto px-4 py-6 select-none welcome-screen w-full">
      {/* Upper Area: Brand Emblem, Title & Rounded Question Input Bar */}
      <div className="w-full flex flex-col items-center mt-4 sm:mt-6">
        {/* Custom Brand Emblem */}
        <BrandEmblem size={80} className="mb-3" />

        {/* Title Heading with Gradient */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-4">
          {isAr ? 'كيف يمكنني مساعدتك اليوم؟' : 'How can I assist you today?'}
        </h1>

        {/* Rounded Input Bar under the title (Liquid Glass Pill Shape) */}
        <div className="w-full max-w-[760px] my-3 flex flex-col items-center">
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

          {/* Speech notification / error alert */}
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

          <div className="glass-input-bar w-full flex items-center gap-2.5 sm:gap-3">
            {/* Attachment icon */}
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
            >
              <Paperclip size={18} />
            </button>

            {/* Voice dictation */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
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

            {/* Textarea */}
            <div className="flex-1 flex flex-col">
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
                placeholder={isAr ? 'اسأل أي شيء...' : 'Ask anything...'}
                dir="auto"
                style={{ minHeight: '24px' }}
                className="w-full resize-none bg-transparent outline-none border-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 text-[15px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
              />
            </div>

            {/* Optional Thinking & Web toggles */}
            {(onToggleDeepThinking || onToggleWebSearch) && (
              <div className="hidden sm:flex items-center gap-1 shrink-0">
                {onToggleDeepThinking && (
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
                )}
                {onToggleWebSearch && (
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
                )}
              </div>
            )}

            {/* Circular Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasContent || isLoading}
              className={`glass-send-btn w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                hasContent ? 'cursor-pointer opacity-100' : 'opacity-35 cursor-not-allowed'
              }`}
              title={isAr ? 'إرسال' : 'Send'}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>

        {/* Quick Starter Suggestions */}
        <div className="w-full max-w-[760px] grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 mb-3 px-1">
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(item.prompt)}
              className="liquid-glass text-start p-3 rounded-2xl border border-white/50 dark:border-white/10 hover:border-indigo-400/40 dark:hover:border-indigo-400/40 hover:bg-white/80 dark:hover:bg-white/15 transition-all cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-white/70 dark:bg-white/10 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Area: Animated Infinite Social Ticker & Developer Attribution Tag */}
      <div className="welcome-footer flex flex-col items-center gap-4 w-full mt-auto pb-4">
        {/* Social Ticker Container */}
        <div className="social-ticker-container">
          <div className="social-ticker-track">
            {/* First Set */}
            {socialIcons.map((s, idx) => {
              const isLink = Boolean(s.url);
              const Tag = isLink ? 'a' : 'div';
              return (
                <Tag
                  key={`set1-${idx}`}
                  {...(isLink
                    ? {
                        href: s.url,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }
                    : {})}
                  className={`social-icon ${
                    s.id === 'tiktok'
                      ? 'hover:text-[#ff0050] dark:hover:text-[#00f2fe] hover:border-pink-500/50'
                      : ''
                  }`}
                  title={s.label}
                  aria-label={s.label}
                >
                  {s.icon}
                </Tag>
              );
            })}
            {/* Second Repeated Set for seamless infinite looping */}
            {socialIcons.map((s, idx) => {
              const isLink = Boolean(s.url);
              const Tag = isLink ? 'a' : 'div';
              return (
                <Tag
                  key={`set2-${idx}`}
                  {...(isLink
                    ? {
                        href: s.url,
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      }
                    : {})}
                  className={`social-icon ${
                    s.id === 'tiktok'
                      ? 'hover:text-[#ff0050] dark:hover:text-[#00f2fe] hover:border-pink-500/50'
                      : ''
                  }`}
                  title={s.label}
                  aria-label={s.label}
                >
                  {s.icon}
                </Tag>
              );
            })}
          </div>
        </div>

        {/* Developer Attribution Tag */}
        <a
          href={TIKTOK_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="developer-tag liquid-glass px-4 py-1.5 rounded-full text-xs shadow-xs transition-all hover:scale-105 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer inline-flex items-center gap-1"
          title="TikTok: @mohamed.hewet1"
        >
          Developed by <span className="font-semibold underline decoration-dotted underline-offset-2">Mohamed Ahmed Hewet</span>
        </a>
      </div>
    </div>
  );
};
