import React, { useState } from 'react';
import { X, Copy, Check, Download, Printer, FileText } from 'lucide-react';
import { Conversation } from '../types/chat';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
  language: 'ar' | 'en';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  conversation,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const isAr = language === 'ar';

  // Format as Markdown transcript
  const markdownText = `# ${conversation.title}\n*${new Date(
    conversation.createdAt
  ).toLocaleString()}*\n\n---\n\n` +
    conversation.messages
      .map((m) => {
        const speaker = m.role === 'user' ? (isAr ? '👤 المستخدم' : '👤 User') : (isAr ? '✨ بيان' : '✨ Bayan AI');
        return `### ${speaker}\n\n${m.content}\n\n`;
      })
      .join('---\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[\s/]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl liquid-glass rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl p-6 z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/30 dark:border-white/10">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              {isAr ? 'تصدير ومشاركة المحادثة' : 'Export & Share Conversation'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Preview snippet */}
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800 text-xs font-mono max-h-48 overflow-y-auto leading-relaxed text-neutral-600 dark:text-neutral-400" dir="auto">
          <pre className="whitespace-pre-wrap">{markdownText.slice(0, 500)}...</pre>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ Markdown' : 'Copy MD')}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Download size={14} />
            <span>{isAr ? 'تحميل .md' : 'Download .md'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 text-xs font-medium transition-opacity"
          >
            <Printer size={14} />
            <span>{isAr ? 'طباعة / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
