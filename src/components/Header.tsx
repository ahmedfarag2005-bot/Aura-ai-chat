import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Menu,
  SquarePen,
  Sliders,
  Sparkles,
  ChevronDown,
  Check,
  LogIn,
  LogOut,
  Share2,
  Trash2,
} from 'lucide-react';
import { AppSettings, GlassButtonShape, GlassTint } from '../types/chat';
import { loginWithGoogle, logoutUser } from '../lib/firebase';
import { GlassCustomizerModal } from './GlassCustomizerModal';

interface HeaderProps {
  onToggleSidebar: () => void;
  settings: AppSettings;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  activeChatTitle: string;
  user: FirebaseUser | null;
  onNewConversation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  settings,
  onUpdateSettings,
  onClearChat,
  onExportChat,
  user,
  onNewConversation,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAr = settings.language === 'ar';
  const shape: GlassButtonShape = settings.buttonShape || 'circular';
  const tint: GlassTint = settings.glassTint || 'crystal';

  const defaultAvatar =
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80';
  const avatarUrl = user?.photoURL || defaultAvatar;
  const displayName =
    user?.displayName || (isAr ? 'محمد أحمد حيوط' : 'Mohamed Ahmed Hewet');

  // Available Gemini Models for the central badge selector
  const availableModels = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      tagAr: 'الأسرع والأذكى',
      tagEn: 'Ultra Fast & Smart',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      tagAr: 'الاستدلال المتقدم',
      tagEn: 'Advanced Reasoning',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      tagAr: 'خفيف وعالي الاستجابة',
      tagEn: 'Light & Responsive',
    },
  ];

  const currentModelName =
    availableModels.find((m) => m.id === settings.selectedModel)?.name ||
    'Gemini Flash';

  // Smooth Scroll Detection: fades out central Gemini Flash badge when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer =
        document.querySelector('.chat-container') ||
        document.querySelector('main') ||
        document.documentElement;

      const currentScrollY =
        window.scrollY ||
        (scrollContainer ? (scrollContainer as HTMLElement).scrollTop : 0);

      if (currentScrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Also attach to chat container if it has internal scroll
    const scrollContainer =
      document.querySelector('.chat-container') || document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      {/* 
        NO BACKGROUND BAR:
        The top bar has no solid or semi-opaque bar behind it (bg-transparent, border-none).
        Only floating action buttons and the central badge hover over the content!
      */}
      <header className="fixed top-0 inset-x-0 z-30 pointer-events-none p-3 sm:p-4 flex items-center justify-between">
        {/* Left: Floating Circular Menu Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleSidebar}
            className={`pure-liquid-glass shape-${shape} tint-${tint}`}
            title={isAr ? 'القائمة الجانبية' : 'Toggle sidebar'}
            aria-label={isAr ? 'القائمة الجانبية' : 'Toggle sidebar'}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Center: Gemini Flash Badge / Name Selector (Fades out automatically on scroll down) */}
        <div
          className={`pointer-events-auto transition-all duration-300 ease-out transform ${
            isScrolled
              ? 'opacity-0 -translate-y-3 pointer-events-none scale-95'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className={`pure-liquid-glass tint-${tint} px-3.5 py-1.5 h-11 rounded-full flex items-center gap-2 shadow-lg cursor-pointer`}
              title={isAr ? 'تحديد نموذج Gemini Flash' : 'Select Gemini Flash Model'}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-500 to-indigo-500 text-white shadow-xs">
                <Sparkles size={11} />
              </div>
              <span className="text-xs font-bold tracking-tight">
                {currentModelName}
              </span>
              <ChevronDown
                size={14}
                className={`opacity-60 transition-transform duration-200 ${
                  modelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Model Selection Dropdown */}
            {modelDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setModelDropdownOpen(false)}
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-2 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-black/5 dark:border-white/5 mb-1">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                      {isAr ? 'اختر نموذج المحادثة' : 'Select AI Model'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {availableModels.map((m) => {
                      const isSelected = settings.selectedModel === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            if (onUpdateSettings) {
                              onUpdateSettings({ selectedModel: m.id });
                            }
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'hover:bg-black/5 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="text-start">
                            <p className="leading-tight">{m.name}</p>
                            <p className="text-[10px] text-neutral-400">
                              {isAr ? m.tagAr : m.tagEn}
                            </p>
                          </div>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Floating Circular Action Buttons & Profile Avatar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Interactive Liquid Glass Customizer Toggle */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className={`pure-liquid-glass shape-${shape} tint-${tint}`}
            title={isAr ? 'تخصيص الواجهة الزجاجية' : 'Customize Liquid Glass'}
            aria-label={isAr ? 'تخصيص الواجهة الزجاجية' : 'Customize Liquid Glass'}
          >
            <Sliders size={18} />
          </button>

          {/* Quick Chat Share / Export (Desktop) */}
          <button
            onClick={onExportChat}
            className={`pure-liquid-glass shape-${shape} tint-${tint} hidden md:inline-flex`}
            title={isAr ? 'تصدير ومشاركة' : 'Export & Share'}
            aria-label={isAr ? 'تصدير ومشاركة' : 'Export & Share'}
          >
            <Share2 size={17} />
          </button>

          {/* Quick Chat Clear (Desktop) */}
          <button
            onClick={onClearChat}
            className={`pure-liquid-glass shape-${shape} tint-${tint} hidden md:inline-flex text-rose-500 hover:text-rose-600`}
            title={isAr ? 'مسح المحادثة' : 'Clear Chat'}
            aria-label={isAr ? 'مسح المحادثة' : 'Clear Chat'}
          >
            <Trash2 size={17} />
          </button>

          {/* Pencil / Temp Chat Button */}
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className={`pure-liquid-glass shape-${shape} tint-${tint} text-indigo-600 dark:text-indigo-400`}
              title={isAr ? 'محادثة مؤقتة / جديدة' : 'Temporary / New Chat'}
              aria-label={isAr ? 'محادثة مؤقتة' : 'Temporary chat'}
            >
              <SquarePen size={18} />
            </button>
          )}

          {/* Circular Profile Avatar Button */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`pure-liquid-glass shape-${shape} tint-${tint} p-0.5 overflow-hidden`}
              title={displayName}
              aria-label={isAr ? 'الملف الشخصي' : 'Profile'}
            >
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute top-full end-0 mt-2 w-60 p-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-3 p-2 border-b border-black/5 dark:border-white/5 mb-1">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover border border-white/80 dark:border-white/20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {user?.email || (isAr ? 'مستخدم غير متصل' : 'Guest')}
                      </p>
                    </div>
                  </div>

                  {user ? (
                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await logoutUser();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>{isAr ? 'تسجيل الخروج' : 'Sign out'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await loginWithGoogle();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                    >
                      <LogIn size={14} />
                      <span>{isAr ? 'تسجيل الدخول مع Google' : 'Sign in with Google'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Interactive Liquid Glass Customizer Dialog */}
      <GlassCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        onUpdateSettings={(newS) => {
          if (onUpdateSettings) {
            onUpdateSettings(newS);
          }
        }}
      />
    </>
  );
};
