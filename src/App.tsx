import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { ChatSession, ChatMessage } from "./types";
import { AgentSidebar } from "./components/AgentSidebar";
import { AgentChatSurface } from "./components/AgentChatSurface";

const STORAGE_KEY = "bigmama_chat_sessions_v3";

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: "session_01",
    title: "Computer 01",
    computerId: "01",
    iconColor: "#ef4444",
    lastMessage: "Computer #01 is online and ready.",
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "msg_init",
        sender: "agent",
        text: "Computer #01 is online and connected over cloud Chromium CDP.\n\nDrop in any URL or tell me what to do on the web (e.g. \"open google chrome\", \"check stripe.com/pricing\", \"pull page content\").",
        timestamp: "Just now",
      },
    ],
  },
];

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || "session_delegator";
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore storage errors
    }
  }, [sessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // User clicks "+" to create a new chat computer
  const handleNewSession = () => {
    const nextNum = sessions.length + 1;
    const color = COLORS[sessions.length % COLORS.length];
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `Computer ${nextNum.toString().padStart(2, "0")}`,
      computerId: nextNum.toString().padStart(2, "0"),
      iconColor: color,
      lastMessage: "New cloud computer ready.",
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: "agent",
          text: `Computer #${nextNum.toString().padStart(2, "0")} is online. Drop in a URL or tell me what to do on the web.`,
          timestamp: "Just now",
        },
      ],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSendMessage = (text: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          const userMsg: ChatMessage = {
            id: `user_${Date.now()}`,
            sender: "user",
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          return {
            ...s,
            lastMessage: text,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMsg],
          };
        }
        return s;
      })
    );
  };

  const handleUpdateSessionMessages = (messages: ChatMessage[], newTitle?: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          const lastMsg = messages[messages.length - 1];
          return {
            ...s,
            title: newTitle || s.title,
            lastMessage: lastMsg?.text || s.lastMessage,
            updatedAt: new Date().toISOString(),
            messages,
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-neutral-100 dark:bg-[#0c0c0c] font-sans antialiased">
      <Toaster position="top-right" richColors theme="system" />

      {/* Left Sidebar (Chats created along the way) */}
      <AgentSidebar
        sessions={sessions}
        activeSessionId={activeSession?.id}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
      />

      {/* Right Chat Surface (Each one has its own computer) */}
      {activeSession && (
        <AgentChatSurface
          key={activeSession.id}
          session={activeSession}
          onSendMessage={handleSendMessage}
          onUpdateSessionMessages={handleUpdateSessionMessages}
        />
      )}
    </div>
  );
}
