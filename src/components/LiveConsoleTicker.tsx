import { Loader2, AlertTriangle, Square, ExternalLink } from "lucide-react";
import { BrowserTaskMission } from "@/lib/browserTasksApi";

interface LiveConsoleTickerProps {
  mission: BrowserTaskMission;
  onConfirmGate: (confirmed: boolean) => void;
  onCancel: () => void;
  isConfirmingGate: boolean;
}

export function LiveConsoleTicker({ mission, onConfirmGate, onCancel, isConfirmingGate }: LiveConsoleTickerProps) {
  const isPausedForApproval = mission.status === "paused_for_approval";
  const liveDebuggerUrl = mission.result?.liveDebuggerUrl;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500" />
            </span>
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
              Live Chromium CDP Session
            </span>
          </div>

          <div className="flex items-center gap-3">
            {liveDebuggerUrl && (
              <a
                href={liveDebuggerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
              >
                <span>Live View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-md border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Stop Mission</span>
            </button>
          </div>
        </div>

        {/* Mission Details */}
        <div className="px-5 py-3 bg-neutral-900/60 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-neutral-500">Target: </span>
            <span className="font-mono text-teal-400">{mission.result?.targetUrl || mission.prompt}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">Session ID:</span>
            <span className="font-mono text-neutral-300">{mission.result?.vendorSessionId || mission.id.slice(0, 8)}</span>
          </div>
        </div>

        {/* Gate 2 Alert (Mid-run sensitive confirmation) */}
        {isPausedForApproval && (
          <div className="p-5 bg-amber-500/10 border-b border-amber-500/30 animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm text-amber-300">Gate 2 Safety Halt: Sensitive External Action</p>
                <p className="text-xs text-amber-200/90 mt-1">
                  The browser agent has navigated to a sensitive boundary (e.g. form submission, external checkout, or post). Explicit confirmation is required to proceed.
                </p>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onConfirmGate(true)}
                    disabled={isConfirmingGate}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    {isConfirmingGate ? "Confirming..." : "Confirm & Proceed"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onConfirmGate(false)}
                    disabled={isConfirmingGate}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  >
                    Deny & Cancel Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Terminal Log Stream */}
        <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-300 max-h-80 overflow-y-auto space-y-2">
          {mission.logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-3 leading-relaxed">
              <span className="text-neutral-600 text-[10px] shrink-0 pt-0.5">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-teal-400/90 font-semibold shrink-0">[{log.step}]</span>
              <span className="text-neutral-300 break-all">{log.message}</span>
            </div>
          ))}

          {mission.status === "running" && (
            <div className="flex items-center gap-2 pt-2 text-teal-400 animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Executing DOM instructions over CDP...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
