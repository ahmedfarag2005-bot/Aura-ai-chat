export type Role = 'user' | 'assistant';

export type ArabicFont = 'ibm' | 'alexandria' | 'readex';
export type AppLanguage = 'ar' | 'en';
export type AppTheme = 'light' | 'dark';
export type FontSize = 'sm' | 'md' | 'lg';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'file';
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  thoughtProcess?: string;
  isStreaming?: boolean;
  liked?: boolean;
  disliked?: boolean;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  messages: Message[];
}

export type GlassButtonShape = 'circular' | 'squircle' | 'pill';
export type GlassTint = 'crystal' | 'obsidian' | 'emerald' | 'amethyst';

export interface AppSettings {
  language: AppLanguage;
  theme: AppTheme;
  arabicFont: ArabicFont;
  fontSize: FontSize;
  selectedModel: string;
  deepThinking: boolean;
  webSearch: boolean;
  buttonShape?: GlassButtonShape;
  glassTint?: GlassTint;
  particlesEnabled?: boolean;
}
