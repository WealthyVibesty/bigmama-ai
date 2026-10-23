import { useState } from "react";
import { Search, Plus, ArrowDown } from "lucide-react";
import { BrowserAgent } from "../types";
import { AgentIcon } from "./AgentIcon";

interface AgentSidebarProps {
  agents: BrowserAgent[];
  activeAgent: BrowserAgent;
  onSelectAgent: (agent: BrowserAgent) => void;
  onNewChat: () => void;
}

export function AgentSidebar({ agents, activeAgent, onSelectAgent, onNewChat }: AgentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-neutral-200 dark:border-neutral-800 bg-[#fbfbfb] dark:bg-[#111111] flex flex-col h-full select-none shrink-0">
      {/* Top Titlebar Controls */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60">
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
            aria-label="Search agents"
            className="p-1.5 rounded-lg hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNewChat}
            aria-label="New browser session"
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
            placeholder="Search browser agents..."
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 outline-none"
          />
        </div>
      )}

      {/* Featured Big Active Agent Card (Matching Screenshot) */}
      <div className="p-3 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-100/90 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <AgentIcon type={activeAgent.iconType} size="xl" className="mb-2" />
          <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{activeAgent.name}</span>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{activeAgent.role}</span>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 relative">
        {filteredAgents.map((agent) => {
          const isActive = agent.id === activeAgent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onSelectAgent(agent)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all relative ${
                isActive
                  ? "bg-neutral-200/70 dark:bg-neutral-800/90 shadow-sm"
                  : "hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40"
              }`}
            >
              <AgentIcon type={agent.iconType} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-[13px] text-neutral-900 dark:text-neutral-100 truncate">
                    {agent.name}
                  </span>
                  {agent.unread && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" aria-label="Unread update" />
                  )}
                </div>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {agent.subtitle}
                </p>
              </div>
            </button>
          );
        })}

        {/* Floating "More unreads" Badge (from screenshot) */}
        <div className="sticky bottom-2 flex justify-center pointer-events-none mt-2">
          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-lg shadow-blue-500/30">
            <ArrowDown className="h-3 w-3" />
            <span>More unreads</span>
          </div>
        </div>
      </div>

      {/* Bottom Profile Bar (Tyler McGregory / Active User from Screenshot) */}
      <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-neutral-900/50">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Profile avatar"
            className="h-8 w-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">Tyler McGregory</p>
            <p className="text-[10px] text-neutral-500 truncate">Big Mama AI &bull; Cloud CDP</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" title="Connected" />
          </div>
        </div>
      </div>
    </aside>
  );
}
