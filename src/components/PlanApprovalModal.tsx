import { ShieldCheck, AlertTriangle, ArrowRight, X, Loader2, CheckCircle2 } from "lucide-react";
import { BrowserTaskPlan } from "@/lib/browserTasksApi";

interface PlanApprovalModalProps {
  plan: BrowserTaskPlan;
  onApprove: () => void;
  onCancel: () => void;
  isLaunching: boolean;
}

export function PlanApprovalModal({ plan, onApprove, onCancel, isLaunching }: PlanApprovalModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-400" />
            <h2 className="font-bold text-base text-white">Gate 1: Pre-Run Execution Plan Approval</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLaunching}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Mission Target</span>
            <p className="text-lg font-bold text-white mt-0.5">{plan.title}</p>
            <p className="text-xs text-teal-400 font-mono mt-1 break-all">{plan.targetUrl}</p>
          </div>

          {plan.requiresMidRunApproval && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">Mid-Run Sensitive Action Gate Armed</p>
                <p className="text-amber-200/80 mt-0.5">
                  This task involves {plan.sensitiveActionType}. The browser agent will pause execution and ask for your explicit confirmation before proceeding with sensitive actions.
                </p>
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Planned Action Sequence</span>
            <div className="mt-2 space-y-2">
              {plan.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300 bg-neutral-950/60 border border-neutral-800/80 p-2.5 rounded-lg">
                  <span className="h-5 w-5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Deliverables</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {plan.expectedOutputs.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 bg-neutral-950/40 p-2 rounded-lg border border-neutral-800/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLaunching}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onApprove}
            disabled={isLaunching}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-neutral-950 font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLaunching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Launching Cloud Browser...</span>
              </>
            ) : (
              <>
                <span>Approve & Launch Mission</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
