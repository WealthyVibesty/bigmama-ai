import React, { useState, useRef, useEffect } from "react";
import { Plus, Smile, RotateCcw, MoreHorizontal, Mic, ShieldCheck, CheckCircle2, Loader2, Maximize2, X } from "lucide-react";
import { BrowserAgent, ChatMessage } from "../types";
import { AgentIcon } from "./AgentIcon";
import { planBrowserTask, launchBrowserTask, pollBrowserTaskStatus } from "../lib/browserTasksApi";

interface AgentChatSurfaceProps {
  agent: BrowserAgent;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUpdateMessage: (id: string, updates: Partial<ChatMessage>) => void;
}

export function AgentChatSurface({ agent, messages, onSendMessage, onUpdateMessage }: AgentChatSurfaceProps) {
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userText = inputText.trim();
    setInputText("");
    onSendMessage(userText);
    setIsProcessing(true);

    // Call real backend plan action
    try {
      const planRes = await planBrowserTask(userText, agent.defaultUrl);
      if (planRes.ok && planRes.plan) {
        // Add plan approval message
        const planMsgId = `plan_${Date.now()}`;
        onUpdateMessage(planMsgId, {
          id: planMsgId,
          sender: "agent",
          agentId: agent.id,
          agentName: agent.name,
          text: `I drafted an execution plan for this browser task. Please review the planned sequence and approve before I spin up the cloud Chromium session.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          planData: planRes.plan,
        });
      }
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprovePlan = async (plan: any, promptText: string) => {
    setIsProcessing(true);
    const launchRes = await launchBrowserTask(plan, promptText, plan.targetUrl);

    if (launchRes.ok && launchRes.missionId) {
      const missionId = launchRes.missionId;
      const statusMsgId = `status_${Date.now()}`;

      // Insert live status message
      onUpdateMessage(statusMsgId, {
        id: statusMsgId,
        sender: "agent",
        agentId: agent.id,
        agentName: agent.name,
        text: `Spinning up isolated cloud Chromium session over CDP with residential proxying...`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        statusBadge: `Navigating to ${plan.targetUrl}...`,
        missionId,
      });

      // Poll until completed
      const pollInterval = setInterval(async () => {
        const pollRes = await pollBrowserTaskStatus(missionId);
        if (pollRes.ok && pollRes.mission) {
          const m = pollRes.mission;

          if (m.status === "completed") {
            clearInterval(pollInterval);
            setIsProcessing(false);

            const reportMsgId = `report_${Date.now()}`;
            onUpdateMessage(reportMsgId, {
              id: reportMsgId,
              sender: "agent",
              agentId: agent.id,
              agentName: agent.name,
              text: m.result?.summary || `Browser task finished. Extracted forensic findings and full viewport screenshot.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              reportData: m.result,
            });
          } else if (m.status === "failed" || m.status === "cancelled") {
            clearInterval(pollInterval);
            setIsProcessing(false);
          }
        }
      }, 2000);
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 select-text overflow-hidden">
      {/* Top Header Pill (from screenshot: Centered Pill with Agent Icon + Name) */}
      <div className="h-14 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-center px-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <AgentIcon type={agent.iconType} size="sm" />
          <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">{agent.name}</span>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          if (msg.sender === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xl rounded-2xl px-4 py-2.5 bg-[#d83a3a] text-white text-[14px] leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Inter-agent message header (e.g. "Message from BIG AI BRAND APP")
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
                  <div className="rounded-2xl px-4 py-3 bg-[#f2f2f2] dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 text-[14px] leading-relaxed shadow-sm">
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

                  {/* Live Status Indicator (e.g. "Checking the recent commits") */}
                  {msg.statusBadge && (
                    <div className="flex items-center gap-2 px-2 pt-1">
                      <AgentIcon type={agent.iconType} size="sm" />
                      <span className="text-xs text-neutral-500 font-medium animate-pulse">
                        {msg.statusBadge}
                      </span>
                    </div>
                  )}

                  {/* Plan Approval Card (Gate 1) */}
                  {msg.planData && (
                    <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          <span className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300">Gate 1 Execution Plan</span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400">{msg.planData.creditCost} Credit</span>
                      </div>

                      <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                        Target: <span className="font-mono text-blue-600 dark:text-blue-400">{msg.planData.targetUrl}</span>
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        {msg.planData.steps?.map((step: string, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="font-mono text-[10px] text-neutral-400 font-bold shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleApprovePlan(msg.planData, msg.text)}
                        disabled={isProcessing}
                        className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Launching Cloud Browser...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve & Launch Mission</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Report Card with Findings & Screenshots */}
                  {msg.reportData && (
                    <div className="p-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Forensic Extraction Complete
                        </span>
                      </div>

                      {msg.reportData.findings && (
                        <div className="space-y-1 text-xs font-mono bg-white dark:bg-neutral-950 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          {Object.entries(msg.reportData.findings).map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-2">
                              <span className="text-neutral-400">{k}:</span>
                              <span className="text-neutral-800 dark:text-neutral-200 truncate">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.reportData.screenshots?.[0] && (
                        <div className="relative group rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                          <img
                            src={msg.reportData.screenshots[0].url}
                            alt="Screenshot"
                            className="w-full h-36 object-cover object-top"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshot(msg.reportData.screenshots[0].url)}
                            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-neutral-900/80 text-white hover:bg-neutral-900 transition-colors"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar (matching screenshot exactly) */}
      <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Plus button in circle */}
          <button
            type="button"
            aria-label="Add attachment or URL"
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
              placeholder={`Message ${agent.name}`}
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
