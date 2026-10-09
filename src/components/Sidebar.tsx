import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Moon,
  Sun,
  Globe,
  PanelLeftClose,
  PanelRightClose,
  LogOut,
  User,
} from 'lucide-react';
import { Conversation, AppSettings } from '../types/chat';
import { loginWithGoogle, logoutUser } from '../lib/firebase';
import { GoogleIcon } from './AuthButton';
import { BrandEmblem } from './BrandEmblem';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettingsModal: () => void;
  user: FirebaseUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePin,
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const isAr = settings.language === 'ar';

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  // Filter conversations
  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedList = filtered.filter((c) => c.isPinned);
  const unpinnedList = filtered.filter((c) => !c.isPinned);

  // Group unpinned by timeframe
  const now = Date.now();
  const dayMs = 86400000;
  const todayList = unpinnedList.filter((c) => now - c.updatedAt < dayMs);
  const yesterdayList = unpinnedList.filter(
    (c) => now - c.updatedAt >= dayMs && now - c.updatedAt < dayMs * 2
  );
  const olderList = unpinnedList.filter((c) => now - c.updatedAt >= dayMs * 2);

  const toggleLanguage = () => {
    const nextLang = settings.language === 'ar' ? 'en' : 'ar';
    onUpdateSettings({ language: nextLang });
    document.documentElement.setAttribute('lang', nextLang);
    document.documentElement.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
  };

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    onUpdateSettings({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 z-40 w-[260px] glass-sidebar flex flex-col transition-all duration-300 ease-in-out ${
          isAr ? 'lg:rounded-s-3xl' : 'lg:rounded-e-3xl'
        } ${
          isOpen
            ? 'translate-x-0'
            : isAr
            ? 'translate-x-full lg:-me-[260px]'
            : '-translate-x-full lg:-ms-[260px]'
        }`}
      >
        {/* Sidebar Header & Brand */}
        <div className="p-3.5 pb-2 border-b border-white/30 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 ps-1">
            <BrandEmblem size={28} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-neutral-900 dark:text-white leading-none">
                {isAr ? 'بيان' : 'Bayan'}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5 truncate max-w-[130px]">
                {isAr ? 'المساعد الذكي' : 'AI Assistant'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-white/30 dark:hover:bg-white/10 transition-colors lg:hidden"
            title={isAr ? 'إغلاق الشريط الجانبي' : 'Close sidebar'}
          >
            {isAr ? <PanelRightClose size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center gap-2.5 liquid-glass hover:bg-white/80 dark:hover:bg-white/20 py-2.5 px-4 rounded-2xl text-xs font-semibold text-neutral-800 dark:text-neutral-100 transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            <Plus size={16} />
            <span>{isAr ? 'محادثة جديدة' : 'New conversation'}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search
              size={13}
              className={`absolute top-2.5 text-neutral-400 ${
                isAr ? 'right-2.5' : 'left-2.5'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في المحادثات...' : 'Search conversations...'}
              className={`w-full py-1.5 bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all ${
                isAr ? 'pr-8 pl-2' : 'pl-8 pr-2'
              }`}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 text-xs select-none">
          {/* Pinned section */}
          {pinnedList.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Pin size={11} className="text-amber-500" />
                <span>{isAr ? 'المثبتة' : 'Pinned'}</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {pinnedList.map((conv) => renderConvItem(conv))}
              </div>
            </div>
          )}

          {/* Today section */}
          {todayList.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {isAr ? 'اليوم' : 'Today'}
              </div>
              <div className="space-y-0.5 mt-1">
                {todayList.map((conv) => renderConvItem(conv))}
              </div>
            </div>
          )}

          {/* Yesterday section */}
          {yesterdayList.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {isAr ? 'الأمس' : 'Yesterday'}
              </div>
              <div className="space-y-0.5 mt-1">
                {yesterdayList.map((conv) => renderConvItem(conv))}
              </div>
            </div>
          )}

          {/* Older section */}
          {olderList.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                {isAr ? 'السابقة' : 'Previous'}
              </div>
              <div className="space-y-0.5 mt-1">
                {olderList.map((conv) => renderConvItem(conv))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              {isAr ? 'لا توجد محادثات مطابقة' : 'No conversations found'}
            </div>
          )}
        </div>

        {/* Bottom Profile & Settings Bar */}
        <div className="p-3 border-t border-white/30 dark:border-white/10 space-y-2.5">
          {/* User Profile or Google Sign In */}
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-2xl liquid-glass text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <User size={12} className="text-neutral-500" />
                  </div>
                )}
                <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => logoutUser()}
                className="p-1 hover:text-rose-500 rounded transition-colors shrink-0"
                title={isAr ? 'تسجيل الخروج' : 'Sign out'}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl liquid-glass hover:bg-white/80 dark:hover:bg-white/20 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل دخول بحساب Google' : 'Sign in with Google'}</span>
            </button>
          )}

          <div className="flex items-center justify-between text-neutral-500 text-xs pt-1">
            {/* Language switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors font-medium cursor-pointer"
              title={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
            >
              <Globe size={14} />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme switch */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title={isAr ? 'تبديل المظهر' : 'Toggle theme'}
            >
              {settings.theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Settings modal */}
            <button
              onClick={onOpenSettingsModal}
              className="p-1.5 rounded-xl hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title={isAr ? 'إعدادات الواجهة' : 'Settings'}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  function renderConvItem(conv: Conversation) {
    const isActive = conv.id === activeId;
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => {
          if (!isEditing) {
            onSelectConversation(conv.id);
            if (window.innerWidth < 1024) onClose();
          }
        }}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
          isActive
            ? 'glass-nav-active text-neutral-900 dark:text-white font-medium'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-neutral-200'
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <MessageSquare size={13} className="shrink-0 text-neutral-400" />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              autoFocus
              onChange={(e) => setEditTitle(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded text-xs text-neutral-900 dark:text-white outline-none border border-neutral-300 dark:border-neutral-700"
            />
          ) : (
            <span className="truncate text-xs">{conv.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {isEditing ? (
          <div className="flex items-center gap-1 ms-1 shrink-0">
            <button
              onClick={(e) => saveRename(conv.id, e)}
              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
            >
              <Check size={12} />
            </button>
            <button
              onClick={cancelRename}
              className="p-1 text-neutral-400 hover:bg-neutral-200 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ms-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(conv.id);
              }}
              className="p-1 hover:text-amber-500 rounded"
              title={conv.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
            >
              {conv.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
            </button>
            <button
              onClick={(e) => startRename(conv, e)}
              className="p-1 hover:text-neutral-900 dark:hover:text-white rounded"
              title="إعادة التسمية"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="p-1 hover:text-rose-500 rounded"
              title="حذف"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }
};
