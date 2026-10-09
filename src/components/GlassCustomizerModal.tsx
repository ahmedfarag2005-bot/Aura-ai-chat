import React from 'react';
import {
  Sliders,
  X,
  Circle,
  Square,
  Sparkles,
  Check,
} from 'lucide-react';
import { AppSettings, GlassButtonShape, GlassTint } from '../types/chat';

interface GlassCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const GlassCustomizerModal: React.FC<GlassCustomizerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const isAr = settings.language === 'ar';
  const currentShape = settings.buttonShape || 'circular';
  const currentTint = settings.glassTint || 'crystal';
  const particlesEnabled = settings.particlesEnabled !== false;

  const shapes: { id: GlassButtonShape; labelAr: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      id: 'circular',
      labelAr: 'دائري (Circular)',
      labelEn: 'Circular',
      icon: <Circle size={18} className="stroke-[2.5]" />,
    },
    {
      id: 'squircle',
      labelAr: 'اسكيركل (Squircle)',
      labelEn: 'Squircle',
      icon: <Square size={18} className="rounded-md stroke-[2.5]" />,
    },
    {
      id: 'pill',
      labelAr: 'حبة دواء (Pill)',
      labelEn: 'Pill',
      icon: (
        <span className="inline-block w-5 h-3.5 rounded-full border-2 border-current" />
      ),
    },
  ];

  const tints: {
    id: GlassTint;
    nameAr: string;
    nameEn: string;
    descAr: string;
    descEn: string;
    previewBg: string;
    border: string;
  }[] = [
    {
      id: 'crystal',
      nameAr: 'كريستال نقي (Crystal Glass)',
      nameEn: 'Crystal Glass',
      descAr: 'زجاج شفاف ونقي مع انعكاس ضوئي أبيض خفيف',
      descEn: 'Pure crystal frost with crisp white reflections',
      previewBg: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(199,210,254,0.4))',
      border: 'rgba(255,255,255,0.8)',
    },
    {
      id: 'obsidian',
      nameAr: 'أوبسيديان فاحم (Obsidian Dark)',
      nameEn: 'Obsidian Dark',
      descAr: 'زجاج دخاني داكن عميق مع لمعان معدني كروم',
      descEn: 'Deep smoke charcoal glass with chrome highlights',
      previewBg: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(55,65,81,0.7))',
      border: 'rgba(255,255,255,0.3)',
    },
    {
      id: 'emerald',
      nameAr: 'انكسار الزمرد (Emerald Refraction)',
      nameEn: 'Emerald Refraction',
      descAr: 'توهج زمردي فاخر يعكس بريق الأحجار الكريمة',
      descEn: 'Luxurious emerald jewel refraction glow',
      previewBg: 'linear-gradient(135deg, rgba(16,185,129,0.4), rgba(5,150,105,0.7))',
      border: 'rgba(52,211,153,0.8)',
    },
    {
      id: 'amethyst',
      nameAr: 'أميثيست نيون (Neon Amethyst)',
      nameEn: 'Neon Amethyst',
      descAr: 'انكسار بنفسجي مستقبلي نيون ذو طابع سيبراني',
      descEn: 'Futuristic vibrant cyber violet amethyst glow',
      previewBg: 'linear-gradient(135deg, rgba(168,85,247,0.45), rgba(236,72,153,0.5))',
      border: 'rgba(192,132,252,0.8)',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg p-6 rounded-3xl liquid-glass border border-white/60 dark:border-white/15 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isAr ? 'تخصيص الواجهة الزجاجية' : 'Liquid Glass Customizer'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'تحكم مباشر في أشكال الأزرار والألوان وانكسار الجزيئات'
                  : 'Live control toggles for glass shapes, tints & ambient particles'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label={isAr ? 'إغلاق' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Button Shape Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">
            {isAr ? '١. شكل الأزرار الطافية (Button Shape)' : '1. Floating Button Shape'}
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {shapes.map((s) => {
              const active = currentShape === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onUpdateSettings({ buttonShape: s.id })}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-500/15 border-indigo-500/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center pure-liquid-glass ${
                      s.id === 'circular'
                        ? 'shape-circular'
                        : s.id === 'squircle'
                        ? 'shape-squircle'
                        : 'shape-pill'
                    } ${
                      active
                        ? 'tint-crystal ring-2 ring-indigo-500'
                        : 'bg-black/5 dark:bg-white/10'
                    }`}
                  >
                    {s.icon}
                  </div>
                  <span className="text-xs font-medium text-center">
                    {isAr ? s.labelAr : s.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Glass Tint Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2.5">
            {isAr ? '٢. درجة انكسار الزجاج (Glass Tint)' : '2. Liquid Glass Tint'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tints.map((t) => {
              const active = currentTint === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ glassTint: t.id })}
                  className={`flex items-start gap-3 p-3 rounded-2xl border text-start transition-all cursor-pointer ${
                    active
                      ? 'bg-white/80 dark:bg-white/15 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/40'
                      : 'bg-white/40 dark:bg-white/5 border-black/5 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                  }`}
                >
                  {/* Swatch Orb */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 relative overflow-hidden shadow-sm"
                    style={{
                      background: t.previewBg,
                      border: `1.5px solid ${t.border}`,
                    }}
                  >
                    <div className="absolute inset-x-1 top-0 h-2 rounded-full bg-white/70 blur-[0.5px]" />
                    {active && (
                      <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow">
                        <Check size={16} className="stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                      <span>{isAr ? t.nameAr : t.nameEn}</span>
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                      {isAr ? t.descAr : t.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Dynamic Particle Ambient Background Toggle */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  particlesEnabled
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-neutral-500/10 text-neutral-400'
                }`}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  {isAr ? 'جزيئات الإضاءة السائلة المحيطية' : 'Dynamic Particle Ambience'}
                </span>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                  {isAr
                    ? 'جزيئات سائلة طافية في الخلفية تعكس لون الزجاج'
                    : 'Glowing floating fluid particles reacting to glass tint'}
                </span>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={() => onUpdateSettings({ particlesEnabled: !particlesEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                particlesEnabled
                  ? 'bg-indigo-600 dark:bg-indigo-500'
                  : 'bg-neutral-300 dark:bg-neutral-700'
              }`}
              aria-label={isAr ? 'تبديل الجزيئات' : 'Toggle particles'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  particlesEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Done Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {isAr ? 'تطبيق وإغلاق' : 'Apply & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
