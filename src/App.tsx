import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { ChatSession, ChatMessage } from "./types";
import { AgentSidebar } from "./components/AgentSidebar";
import { AgentChatSurface } from "./components/AgentChatSurface";

const STORAGE_KEY = "bigmama_chat_sessions_v1";

const DEFAULT_SESSIONS: ChatSession[] = [
  {
    id: "session_delegator",
    title: "Delegator 3",
    computerId: "01",
    iconColor: "#ef4444", // Red matching screenshot
    lastMessage: "I'm checking what's changed since Oct 18: what's been merged...",
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "msg_1",
        sender: "agent",
        interAgentInfo: {
          type: "from",
          otherAgentName: "BIG AI BRAND APP ANTIGRAVITY IDE",
        },
        text: "One heads-up on the UGC switch. When its test is done, the coding bot will ask you for a one-tap OK in its own chat before it merges, so keep an eye out for that.",
        timestamp: "Today 2:14 PM",
      },
      {
        id: "msg_2",
        sender: "agent",
        interAgentInfo: {
          type: "to",
          otherAgentName: "BIG AI BRAND APP ANTIGRAVITY IDE",
        },
        text: "The ad card polish (#459) is clear to merge, and it's on both test copies now (the ad writer at v36 and the image function at v15). The crash is fixed, card prices only come from your saved offers, billing hasn't changed, and no other clients' details are left in the code.\n\nThe coding bot is running one last paid test now. Then it'll ask you to OK the merge, and I'll put both live.",
        timestamp: "Today 2:16 PM",
      },
      {
        id: "msg_3",
        sender: "user",
        text: "wake up pull in latest code we back to the bage",
        timestamp: "Today 2:19 PM",
      },
      {
        id: "msg_4",
        sender: "agent",
        text: "I'm here. I'm pulling the latest from main and checking where live stands now.\n\nI'm checking what's changed since Oct 18: what's been merged, where the ad card polish (#459) and UGC switch (#460) stand, what's live, and whether the app needs a publish. I'll send you one summary shortly.",
        timestamp: "Today 2:19 PM",
        statusBadge: "Checking the recent commits",
      },
    ],
  },
  {
    id: "session_resend",
    title: "resend",
    computerId: "02",
    iconColor: "#6b7280",
    lastMessage: "Two smaller things. On Oct 14, Lov...",
    updatedAt: new Date().toISOString(),
    unread: true,
    messages: [
      {
        id: "r_1",
        sender: "agent",
        text: "Two smaller things. On Oct 14, Lovable DNS verification completed cleanly.",
        timestamp: "Oct 14",
      },
    ],
  },
  {
    id: "session_hyperframes",
    title: "hyperframes",
    computerId: "03",
    iconColor: "#4b5563",
    lastMessage: "The vertical video file was too big to a...",
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "h_1",
        sender: "agent",
        text: "The vertical video file was too big to attach directly, so I uploaded it to the cloud sandbox.",
        timestamp: "Oct 15",
      },
    ],
  },
  {
    id: "session_dealmaker",
    title: "Deal Maker",
    computerId: "04",
    iconColor: "#10b981",
    lastMessage: "All four posts for this week are in the...",
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "d_1",
        sender: "agent",
        text: "All four posts for this week are in the queue. Checked engagement on competitor profiles.",
        timestamp: "Oct 16",
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
