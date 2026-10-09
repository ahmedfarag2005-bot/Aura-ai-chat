import React from 'react';
import { X, Type, Palette, Globe, Check, Sparkles } from 'lucide-react';
import { AppSettings, ArabicFont, FontSize } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const isAr = settings.language === 'ar';

  const fonts: { id: ArabicFont; name: string; sample: string }[] = [
    {
      id: 'ibm',
      name: 'IBM Plex Sans Arabic',
      sample: 'الوضوح والاتزان في الصياغة الرقمية',
    },
    {
      id: 'alexandria',
      name: 'Alexandria',
      sample: 'تصميم هندسي معاصر بحروف متناسقة',
    },
    {
      id: 'readex',
      name: 'Readex Pro',
      sample: 'انسيابية بصرية فائقة وراحة في القراءة',
    },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: 'sm', label: isAr ? 'مضغوط (14px)' : 'Compact' },
    { id: 'md', label: isAr ? 'قياسي (15.5px)' : 'Standard' },
    { id: 'lg', label: isAr ? 'مريح (17px)' : 'Spacious' },
  ];

  const handleFontChange = (fontId: ArabicFont) => {
    onUpdateSettings({ arabicFont: fontId });
    document.documentElement.style.setProperty(
      '--font-arabic',
      fontId === 'ibm'
        ? "'IBM Plex Sans Arabic', 'Plus Jakarta Sans', sans-serif"
        : fontId === 'alexandria'
        ? "'Alexandria', 'Plus Jakarta Sans', sans-serif"
        : "'Readex Pro', 'Plus Jakarta Sans', sans-serif"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg liquid-glass rounded-3xl border border-white/50 dark:border-white/10 shadow-2xl p-6 z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/30 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              {isAr ? 'تخصيص الواجهة وتجربة القراءة' : 'Interface & Typography Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Section 1: Typography Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <Type size={14} className="text-neutral-400" />
            <span>{isAr ? 'نوع الخط العربي (Arabic Typography)' : 'Arabic Typeface'}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {fonts.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFontChange(f.id)}
                className={`w-full text-start p-3 rounded-2xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                  settings.arabicFont === f.id
                    ? 'border-indigo-500/70 bg-white/80 dark:bg-white/15 text-neutral-900 dark:text-white font-medium shadow-xs'
                    : 'border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="font-semibold text-sm">{f.name}</div>
                  <div className="text-neutral-400 text-xs mt-0.5">{f.sample}</div>
                </div>
                {settings.arabicFont === f.id && (
                  <Check size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Font Size */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
            {isAr ? 'حجم خط النصوص' : 'Font Size'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {fontSizes.map((sz) => (
              <button
                key={sz.id}
                onClick={() => onUpdateSettings({ fontSize: sz.id })}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  settings.fontSize === sz.id
                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Visual Theme */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
            {isAr ? 'المظهر اللوني' : 'Appearance'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onUpdateSettings({ theme: 'light' });
                document.documentElement.classList.remove('dark');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                settings.theme === 'light'
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {isAr ? 'فاتح ناصع (Light)' : 'Pure Light'}
            </button>
            <button
              onClick={() => {
                onUpdateSettings({ theme: 'dark' });
                document.documentElement.classList.add('dark');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                settings.theme === 'dark'
                  ? 'border-white bg-white text-neutral-900'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {isAr ? 'داكن هادئ (Dark)' : 'Midnight Dark'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            {isAr ? 'حفظ وإغلاق' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
