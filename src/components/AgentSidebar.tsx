import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { ChatSession } from "../types";

interface AgentSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export function AgentSidebar({ sessions, activeSessionId, onSelectSession, onNewSession }: AgentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const filteredSessions = sessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-neutral-200 dark:border-neutral-800 bg-[#fbfbfb] dark:bg-[#111111] flex flex-col h-full select-none shrink-0">
      {/* Titlebar controls (macOS window controls + search + new chat) */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0">
        {/* macOS window control dots */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-sm" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-sm" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-sm" />
        </div>

        <div className="flex items-center gap-1 text-neutral-500">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search chats"
            className="p-1.5 rounded-lg hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNewSession}
            aria-label="New chat computer"
            className="p-1.5 rounded-lg hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Input Bar (when toggled) */}
      {showSearch && (
        <div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none"
          />
        </div>
      )}

      {/* Top Active Chat / Computer Showcase Card (from screenshot) */}
      {activeSession && (
        <div className="p-3 border-b border-neutral-200/60 dark:border-neutral-800/60 shrink-0">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-md text-2xl font-black mb-2"
              style={{ backgroundColor: activeSession.iconColor || "#ef4444" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
              {activeSession.title}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
              Computer #{activeSession.computerId}
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Chat List (Chats created along the way) */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredSessions.map((s) => {
          const isActive = s.id === activeSessionId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSession(s.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? "bg-neutral-200/70 dark:bg-neutral-800/90 shadow-sm"
                  : "hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40"
              }`}
            >
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                style={{ backgroundColor: s.iconColor || "#ef4444" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect width="20" height="14" x="2" y="3" rx="2" />
                  <line x1="8" x2="16" y1="21" y2="21" />
                  <line x1="12" x2="12" y1="17" y2="21" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[13px] text-neutral-900 dark:text-neutral-100 truncate">
                    {s.title}
                  </span>
                  {s.unread && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {s.lastMessage || "New cloud browser session ready."}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-neutral-900/50 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile avatar"
            className="h-8 w-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">Tyler McGregory</p>
            <p className="text-[10px] text-neutral-500 truncate">Big Mama AI &bull; Cloud Operator</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Online" />
          </div>
        </div>
      </div>
    </aside>
  );
}
