import React, { useState } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  RotateCw,
  Share2,
  Pencil,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageItemProps {
  message: Message;
  language: 'ar' | 'en';
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onReaction?: (type: 'like' | 'dislike') => void;
  onShare?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  language,
  onRegenerate,
  onEdit,
  onReaction,
  onShare,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = message.content.replace(/[#*`_>|]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveEdit = () => {
    if (editedText.trim() && editedText !== message.content) {
      onEdit?.(editedText);
    }
    setIsEditing(false);
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-start w-full mb-6 group">
        <div className="glass-user-bubble relative transition-all max-w-[92%] sm:max-w-[85%]">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full bg-transparent p-2 rounded-xl text-sm outline-none"
                rows={3}
                dir="auto"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-neutral-600 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium"
                >
                  {language === 'ar' ? 'تحديث وإرسال' : 'Update & Send'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 liquid-glass rounded-lg text-xs"
                    >
                      <FileText size={13} className="text-neutral-500" />
                      <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap select-text leading-relaxed" dir="auto">
                {message.content}
              </p>
            </div>
          )}
        </div>

        {/* User Bubble Toolbar */}
        {!isEditing && (
          <div className="flex items-center gap-1.5 mt-1.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-neutral-400">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/10 rounded-lg transition-colors"
              title={language === 'ar' ? 'تعديل السؤال' : 'Edit prompt'}
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={handleCopy}
              className="p-1 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/10 rounded-lg transition-colors"
              title={language === 'ar' ? 'نسخ' : 'Copy'}
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // AI Response: Liquid Glass card with neutral frosted glass and curved borders
  return (
    <div className="glass-ai-bubble mb-8 group w-full">
      {/* Assistant Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-black/5 dark:border-white/5 select-none">
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
          <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            {language === 'ar' ? 'المساعد' : 'Assistant'}
          </span>
        </div>
      </div>

      {message.isStreaming && !message.content ? (
        <div className="typing-indicator">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      ) : (
        <>
          <MarkdownRenderer content={message.content} isStreaming={message.isStreaming} />

          {/* AI Action Toolbar */}
          {!message.isStreaming && (
            <div className="flex items-center flex-wrap gap-1.5 mt-3 pt-2 text-neutral-400 select-none">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={language === 'ar' ? 'نسخ الإجابة' : 'Copy answer'}
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {language === 'ar' ? 'تم النسخ' : 'Copied'}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>

              {/* Read Aloud */}
              <button
                onClick={handleSpeech}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ${
                  isSpeaking
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 font-medium'
                    : 'hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={language === 'ar' ? 'استماع صوتي' : 'Read aloud'}
              >
                {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>
                  {language === 'ar' ? (isSpeaking ? 'إيقاف' : 'استماع') : isSpeaking ? 'Stop' : 'Listen'}
                </span>
              </button>

              {/* Like */}
              <button
                onClick={() => onReaction?.('like')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  message.liked
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={language === 'ar' ? 'إعجاب' : 'Like'}
              >
                <ThumbsUp size={13} />
              </button>

              {/* Dislike */}
              <button
                onClick={() => onReaction?.('dislike')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  message.disliked
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                    : 'hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={language === 'ar' ? 'لم يعجبني' : 'Dislike'}
              >
                <ThumbsDown size={13} />
              </button>

              {/* Regenerate */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title={language === 'ar' ? 'إعادة التوليد' : 'Regenerate'}
                >
                  <RotateCw size={12} />
                  <span>{language === 'ar' ? 'إعادة' : 'Retry'}</span>
                </button>
              )}

              {/* Share / Export */}
              {onShare && (
                <button
                  onClick={onShare}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title={language === 'ar' ? 'مشاركة' : 'Share'}
                >
                  <Share2 size={12} />
                  <span>{language === 'ar' ? 'تصدير' : 'Export'}</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
