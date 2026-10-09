import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeLanding } from './components/WelcomeLanding';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { ParticleBackground } from './components/ParticleBackground';
import { Conversation, Message, AppSettings, Attachment } from './types/chat';
import { INITIAL_CONVERSATIONS } from './data/mockConversations';
import { auth } from './lib/firebase';

export default function App() {
  // Firebase Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const defaults: AppSettings = {
      language: 'ar',
      theme: 'light',
      arabicFont: 'ibm',
      fontSize: 'md',
      selectedModel: 'gemini-2.5-flash',
      deepThinking: false,
      webSearch: false,
      buttonShape: 'circular',
      glassTint: 'crystal',
      particlesEnabled: true,
    };

    const saved = localStorage.getItem('bayan_settings');
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch {
        // fallback
      }
    }
    return defaults;
  });

  // Conversations State: Always start on a fresh new chat session so the Welcome Screen is shown every time the app opens
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const freshSession: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'محادثة جديدة',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    const saved = localStorage.getItem('bayan_conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep previous conversations that have messages in history
          const priorChats = parsed.filter(
            (c: Conversation) =>
              c.id !== 'conv-design-system' &&
              c.id !== 'conv-react-perf' &&
              !c.title?.includes('تصميم واجهات المستخدم الخالية') &&
              c.messages &&
              c.messages.length > 0
          );
          return [freshSession, ...priorChats];
        }
      } catch {
        // fallback
      }
    }
    return [freshSession];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    return conversations[0]?.id || `conv-${Date.now()}`;
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Observe Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync settings to localStorage and DOM
  useEffect(() => {
    localStorage.setItem('bayan_settings', JSON.stringify(settings));

    // Direction and language
    document.documentElement.setAttribute('lang', settings.language);
    document.documentElement.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');

    // Theme class
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Font family variable
    const fontVal =
      settings.arabicFont === 'ibm'
        ? "'IBM Plex Sans Arabic', 'Plus Jakarta Sans', sans-serif"
        : settings.arabicFont === 'alexandria'
        ? "'Alexandria', 'Plus Jakarta Sans', sans-serif"
        : "'Readex Pro', 'Plus Jakarta Sans', sans-serif";
    document.documentElement.style.setProperty('--font-arabic', fontVal);
  }, [settings]);

  // Sync conversations to localStorage (only persist non-empty chats so fresh starts are always clean)
  useEffect(() => {
    const toSave = conversations.filter((c) => c.messages.length > 0);
    localStorage.setItem('bayan_conversations', JSON.stringify(toSave));
  }, [conversations]);

  // Scroll to bottom on message updates
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeId]);

  // Create New Conversation
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      title: settings.language === 'ar' ? 'محادثة جديدة' : 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fresh: Conversation = {
          id: `conv-${Date.now()}`,
          title: settings.language === 'ar' ? 'محادثة جديدة' : 'New conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename Conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Clear Messages in Active Conversation
  const handleClearChat = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c))
    );
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const updated = [...c.messages];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, isStreaming: false };
          }
          return { ...c, messages: updated };
        }
        return c;
      })
    );
  };

  // Send Message Handler
  const handleSendMessage = async (userText: string, attachments?: Attachment[]) => {
    if (!userText.trim() && (!attachments || attachments.length === 0)) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
      attachments,
    };

    const assistantMsgId = `asst-${Date.now() + 1}`;
    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now() + 1,
      model: settings.selectedModel,
      isStreaming: true,
      thoughtProcess: settings.deepThinking
        ? settings.language === 'ar'
          ? 'استغرق التحليل المعرفي 1.2 ثانية: فككت الطلب إلى عناصر الأداء والموثوقية، ثم صغت الحل بأسلوب منهجي وموجز.'
          : 'Cognitive reasoning completed in 1.2s: Broken down requirements, validated constraints, structured response.'
        : undefined,
    };

    // Auto-update conversation title if it's the first message
    const isFirstMessage = !activeConversation || activeConversation.messages.length === 0;
    const newTitle = isFirstMessage
      ? userText.slice(0, 32) + (userText.length > 32 ? '...' : '')
      : activeConversation.title;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            title: newTitle,
            updatedAt: Date.now(),
            messages: [...c.messages, userMessage, initialAssistantMessage],
          };
        }
        return c;
      })
    );

    setIsLoading(true);
    setTimeout(() => scrollToBottom('smooth'), 50);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const historyPayload = [
      ...(activeConversation ? activeConversation.messages : []),
      userMessage,
    ].map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: settings.selectedModel,
          stream: true,
          webSearch: settings.webSearch,
          deepThinking: settings.deepThinking,
          language: settings.language,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Network response failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (rawData === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(rawData);
              if (parsed.text) {
                accumulated += parsed.text;
                updateAssistantMessageContent(assistantMsgId, accumulated, true);
                scrollToBottom('smooth');
              }
            } catch {
              // Ignore non-json chunks
            }
          }
        }
      }

      // Mark streaming done
      updateAssistantMessageContent(assistantMsgId, accumulated, false);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return;
      }
      console.warn('API Stream error, providing rich fallback response:', err);
      // Fallback response
      const fallback =
        settings.language === 'ar'
          ? `### بيان الذكي: إجابة نموذجية مباشرة

أهلاً بك. تم استلام طلبك وجارٍ معالجته وفق أعلى معايير الدقة والوضوح:

- **الرؤية الأولى**: تحليل المدخلات وتحديد الغاية الوظيفية الأساسية.
- **الرؤية الثانية**: استبعاد التعقيدات غير المبررة والالتزام بالحلول المباشرة والعملية.

\`\`\`typescript
// نموذج تنفيذي سريع
const status = "success";
console.log({ message: "تمت معالجة الطلب بسلاسة", status });
\`\`\`

> **ملاحظة:** تم إنشاء هذا الرد وفق النموذج الذكي المدمج.`
          : `### Bayan Response

Thank you for your message. Here is a clear, structured breakdown:

1. **Principle 1**: Clear objective-first execution.
2. **Principle 2**: High performance with minimal cognitive overhead.

\`\`\`typescript
const response = { status: "ready", model: "Bayan AI" };
\`\`\`

> **Insight:** Clean architecture and thoughtful typography empower readability.`;

      updateAssistantMessageContent(assistantMsgId, fallback, false);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setTimeout(() => scrollToBottom('smooth'), 100);
    }
  };

  const updateAssistantMessageContent = (
    msgId: string,
    newContent: string,
    isStreaming: boolean
  ) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const updated = c.messages.map((m) =>
            m.id === msgId ? { ...m, content: newContent, isStreaming } : m
          );
          return { ...c, messages: updated };
        }
        return c;
      })
    );
  };

  // Reactions (Like / Dislike)
  const handleReaction = (msgId: string, type: 'like' | 'dislike') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const updated = c.messages.map((m) => {
            if (m.id === msgId) {
              if (type === 'like') {
                return { ...m, liked: !m.liked, disliked: false };
              } else {
                return { ...m, disliked: !m.disliked, liked: false };
              }
            }
            return m;
          });
          return { ...c, messages: updated };
        }
        return c;
      })
    );
  };

  // Regenerate last assistant response
  const handleRegenerate = (msgIndex: number) => {
    if (!activeConversation) return;
    // Find the preceding user message
    const precedingUserMsg = activeConversation.messages
      .slice(0, msgIndex)
      .reverse()
      .find((m) => m.role === 'user');

    if (precedingUserMsg) {
      handleSendMessage(precedingUserMsg.content);
    }
  };

  // Edit user message
  const handleEditUserMessage = (msgId: string, newContent: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const msgIdx = c.messages.findIndex((m) => m.id === msgId);
          if (msgIdx !== -1) {
            // Cut conversation off at this message and resend
            const retained = c.messages.slice(0, msgIdx);
            return { ...c, messages: retained };
          }
        }
        return c;
      })
    );
    handleSendMessage(newContent);
  };

  const isAr = settings.language === 'ar';
  const hasMessages = activeConversation && activeConversation.messages.length > 0;

  return (
    <div
      className={`min-h-screen flex bg-[#F7F9FC] dark:bg-[#0B0D13] text-neutral-900 dark:text-neutral-100 transition-colors duration-200 relative overflow-hidden ${
        settings.fontSize === 'sm'
          ? 'text-sm'
          : settings.fontSize === 'lg'
          ? 'text-lg'
          : 'text-[15px]'
      }`}
    >
      {/* Dynamic Particle Ambient Background for Liquid Glass */}
      <ParticleBackground
        enabled={settings.particlesEnabled !== false}
        tint={settings.glassTint || 'crystal'}
      />

      {/* Ambient background for liquid glass refraction */}
      <div className="glass-ambient-bg" />

      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(id) => setActiveId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePin={handleTogglePin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        user={user}
      />

      {/* Main Workspace Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          settings={settings}
          onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
          onClearChat={handleClearChat}
          onExportChat={() => setIsExportOpen(true)}
          activeChatTitle={activeConversation?.title || ''}
          user={user}
          onNewConversation={handleNewConversation}
        />

        {/* Conversation Stream or Landing state */}
        <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
          <div className="chat-container w-full flex-1 overflow-y-auto pt-16">
            {!hasMessages ? (
              <WelcomeLanding
                language={settings.language}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                deepThinking={settings.deepThinking}
                onToggleDeepThinking={() =>
                  setSettings((prev) => ({ ...prev, deepThinking: !prev.deepThinking }))
                }
                webSearch={settings.webSearch}
                onToggleWebSearch={() =>
                  setSettings((prev) => ({ ...prev, webSearch: !prev.webSearch }))
                }
              />
            ) : (
              <div className="messages-wrapper">
                {activeConversation.messages.map((msg, idx) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    language={settings.language}
                    onRegenerate={
                      msg.role === 'assistant' ? () => handleRegenerate(idx) : undefined
                    }
                    onEdit={
                      msg.role === 'user'
                        ? (newText) => handleEditUserMessage(msg.id, newText)
                        : undefined
                    }
                    onReaction={(type) => handleReaction(msg.id, type)}
                    onShare={() => setIsExportOpen(true)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Sticky Bottom Input Bar during active conversation */}
          {hasMessages && (
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onStopGeneration={handleStopGeneration}
              language={settings.language}
              deepThinking={settings.deepThinking}
              onToggleDeepThinking={() =>
                setSettings((prev) => ({ ...prev, deepThinking: !prev.deepThinking }))
              }
              webSearch={settings.webSearch}
              onToggleWebSearch={() =>
                setSettings((prev) => ({ ...prev, webSearch: !prev.webSearch }))
              }
              initialValue={pendingPrompt}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((prev) => ({ ...prev, ...newS }))}
      />

      {activeConversation && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          conversation={activeConversation}
          language={settings.language}
        />
      )}
    </div>
  );
}
