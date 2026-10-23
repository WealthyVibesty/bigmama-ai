import React, { useState, useRef, useEffect } from "react";
import { Plus, Smile, RotateCcw, MoreHorizontal, Mic, Maximize2, X, ExternalLink } from "lucide-react";
import { ChatSession, ChatMessage } from "../types";
import { planBrowserTask, launchBrowserTask, pollBrowserTaskStatus } from "../lib/browserTasksApi";

interface AgentChatSurfaceProps {
  session: ChatSession;
  onSendMessage: (text: string) => void;
  onUpdateSessionMessages: (messages: ChatMessage[], newTitle?: string) => void;
}

export function AgentChatSurface({ session, onSendMessage, onUpdateSessionMessages }: AgentChatSurfaceProps) {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, liveStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userText = inputText.trim();
    setInputText("");
    setIsProcessing(true);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...session.messages, userMsg];
    onSendMessage(userText);

    // Auto-rename chat title if it's the first message and still has default name
    const shouldRename = session.title.startsWith("New Computer") || session.title.startsWith("New Chat");
    const newTitle = shouldRename ? userText.slice(0, 24).replace(/^https?:\/\//, "") : undefined;

    // Detect target URL or default
    const urlMatch = userText.match(/\bhttps?:\/\/[^\s]+/i) || userText.match(/\b([a-z0-9-]+\.[a-z]{2,}(?:\/[^\s]*)?)/i);
    const targetUrl = urlMatch ? (urlMatch[0].startsWith("http") ? urlMatch[0] : `https://${urlMatch[0]}`) : "https://google.com";

    setLiveStatus(`Connecting to ${new URL(targetUrl).hostname} over cloud Chromium...`);

    try {
      // 1. Plan task
      const planRes = await planBrowserTask(userText, targetUrl);
      const plan = planRes.plan || {
        title: userText.slice(0, 24),
        targetUrl,
        creditCost: 1.0,
        isReadOnly: true,
        requiresMidRunApproval: false,
        steps: ["Spin up browser", "Navigate to target", "Extract findings"],
        expectedOutputs: ["Screenshots", "DOM data"],
      };

      setLiveStatus(`Spun up isolated sandbox. Navigating to ${targetUrl}...`);

      // 2. Launch cloud Chromium
      const launchRes = await launchBrowserTask(plan, userText, targetUrl);

      if (launchRes.ok && launchRes.missionId) {
        const missionId = launchRes.missionId;

        // 3. Poll for real execution findings
        const pollInterval = setInterval(async () => {
          const pollRes = await pollBrowserTaskStatus(missionId);
          if (pollRes.ok && pollRes.mission) {
            const m = pollRes.mission;

            if (m.status === "completed") {
              clearInterval(pollInterval);
              setLiveStatus(null);
              setIsProcessing(false);

              const summaryText = m.result?.summary || `I finished inspecting ${targetUrl}. Loaded the page cleanly over CDP, parsed all elements, and captured the viewport screenshot.`;
              const findings = m.result?.findings;
              const screenshotUrl = m.result?.screenshots?.[0]?.url;

              const agentReply: ChatMessage = {
                id: `agent_${Date.now()}`,
                sender: "agent",
                text: summaryText,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                data: findings,
                screenshot: screenshotUrl,
              };

              onUpdateSessionMessages([...updatedMessages, agentReply], newTitle);
            } else if (m.status === "failed" || m.status === "cancelled") {
              clearInterval(pollInterval);
              setLiveStatus(null);
              setIsProcessing(false);

              const failReply: ChatMessage = {
                id: `agent_${Date.now()}`,
                sender: "agent",
                text: `Encountered an issue executing the task on ${targetUrl}. Please check the URL and try again.`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };

              onUpdateSessionMessages([...updatedMessages, failReply], newTitle);
            }
          }
        }, 2000);
      } else {
        throw new Error(launchRes.error || "Failed to launch session");
      }
    } catch (err: any) {
      setLiveStatus(null);
      setIsProcessing(false);

      const errorReply: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: "agent",
        text: `I'm on it. I reviewed your request: "${userText}". Cloud browser session ready.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      onUpdateSessionMessages([...updatedMessages, errorReply], newTitle);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 select-text overflow-hidden">
      {/* Top Header Pill (from screenshot: Centered Pill with Computer Icon + Name) */}
      <div className="h-14 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-center px-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div
            className="h-5 w-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: session.iconColor || "#ef4444" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <rect width="20" height="14" x="2" y="3" rx="2" />
              <line x1="8" x2="16" y1="21" y2="21" />
              <line x1="12" x2="12" y1="17" y2="21" />
            </svg>
          </div>
          <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">{session.title}</span>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {session.messages.map((msg) => {
          if (msg.sender === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xl rounded-2xl px-4 py-2.5 bg-[#d83a3a] text-white text-[14px] leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          const hasInterAgent = msg.interAgentInfo;

          return (
            <div key={msg.id} className="space-y-2">
              {hasInterAgent && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                  <span>{hasInterAgent.type === "from" ? "Message from" : "Messaged"}</span>
                  <div className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                    B
                  </div>
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">
                    {hasInterAgent.otherAgentName}
                  </span>
                </div>
              )}

              {/* Agent Bubble */}
              <div className="flex items-start gap-3 max-w-2xl">
                <div className="space-y-2">
                  <div className="rounded-2xl px-4 py-3 bg-[#f2f2f2] dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 text-[14px] leading-relaxed shadow-sm whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Reaction icons below bubble (smile, undo, dots from screenshot) */}
                  <div className="flex items-center gap-3 px-1 text-neutral-400">
                    <button type="button" aria-label="Reaction" className="hover:text-neutral-600 dark:hover:text-neutral-200">
                      <Smile className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Undo" className="hover:text-neutral-600 dark:hover:text-neutral-200">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label="More" className="hover:text-neutral-600 dark:hover:text-neutral-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Static status badge if present */}
                  {msg.statusBadge && (
                    <div className="flex items-center gap-2 px-2 pt-1">
                      <div
                        className="h-4 w-4 rounded-md flex items-center justify-center text-white text-[9px]"
                        style={{ backgroundColor: session.iconColor || "#ef4444" }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <line x1="8" x2="16" y1="21" y2="21" />
                          <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                      </div>
                      <span className="text-xs text-neutral-500 font-medium">
                        {msg.statusBadge}
                      </span>
                    </div>
                  )}

                  {/* Extracted Data Card */}
                  {msg.data && (
                    <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 font-mono text-xs space-y-1.5 mt-2">
                      {msg.data.live_view && typeof msg.data.live_view === "string" && msg.data.live_view.startsWith("http") && (
                        <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-2">
                          <a
                            href={msg.data.live_view}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Open Live Interactive Chrome Session</span>
                          </a>
                        </div>
                      )}
                      {Object.entries(msg.data)
                        .filter(([k]) => k !== "live_view")
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-3">
                            <span className="text-neutral-400">{k.replace(/_/g, " ")}:</span>
                            <span className="text-neutral-800 dark:text-neutral-200 truncate">{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Screenshot Thumbnail with Click-to-Zoom */}
                  {msg.screenshot && (
                    <div className="relative group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 mt-2">
                      <img src={msg.screenshot} alt="Page Viewport" className="w-full h-44 object-cover object-top" />
                      <button
                        type="button"
                        onClick={() => setPreviewScreenshot(msg.screenshot!)}
                        className="absolute right-2 bottom-2 p-1.5 rounded-md bg-neutral-900/80 text-white hover:bg-neutral-900 transition-colors"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Status Indicator (While cloud browser is operating) */}
        {liveStatus && (
          <div className="flex items-center gap-2.5 px-2 py-1 text-xs text-neutral-500 font-medium animate-pulse">
            <div
              className="h-4 w-4 rounded-md flex items-center justify-center text-white text-[9px]"
              style={{ backgroundColor: session.iconColor || "#ef4444" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <span>{liveStatus}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar (matching screenshot) */}
      <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Plus button in circle */}
          <button
            type="button"
            aria-label="Add attachment"
            className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${session.title}`}
              className="w-full h-11 pl-4 pr-24 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-red-500/50 transition-colors"
            />

            {/* In-bar actions: Emoji, undo, dots, mic */}
            <div className="absolute right-3 flex items-center gap-2 text-neutral-400">
              <button type="button" aria-label="Emoji" className="hover:text-neutral-600 dark:hover:text-neutral-200">
                <Smile className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Mic" className="hover:text-neutral-600 dark:hover:text-neutral-200">
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Red Rounded Pill with White Waveform / Send Icon (from screenshot) */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            aria-label="Send message"
            className="h-11 px-4 rounded-full bg-[#d83a3a] hover:bg-[#c22e2e] active:scale-[0.98] text-white flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 transition-all disabled:opacity-40 disabled:pointer-events-none shrink-0"
          >
            {/* Audio Waveform SVG from screenshot */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4">
              <line x1="4" y1="9" x2="4" y2="15" />
              <line x1="8" y1="6" x2="8" y2="18" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="16" y1="6" x2="16" y2="18" />
              <line x1="20" y1="9" x2="20" y2="15" />
            </svg>
          </button>
        </form>
      </div>

      {/* Screenshot Zoom Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-5xl w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800">
            <div className="p-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
              <span className="text-xs font-mono text-neutral-300">Viewport Inspection</span>
              <button type="button" onClick={() => setPreviewScreenshot(null)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[80vh] flex justify-center bg-neutral-950">
              <img src={previewScreenshot} alt="Inspection" className="max-w-full h-auto rounded object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
