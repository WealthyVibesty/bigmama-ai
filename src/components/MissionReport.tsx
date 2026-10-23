import { useState } from "react";
import { CheckCircle2, Download, Copy, RotateCcw, Maximize2, X } from "lucide-react";
import { BrowserTaskMission } from "@/lib/browserTasksApi";
import { EcosystemBridge } from "./EcosystemBridge";

interface MissionReportProps {
  mission: BrowserTaskMission;
  onReset: () => void;
}

export function MissionReport({ mission, onReset }: MissionReportProps) {
  const result = mission.result || {};
  const summary = result.summary || "Browser task completed successfully. All DOM findings and forensic assets extracted.";
  const findings = result.findings || {};
  const screenshots = result.screenshots || [];

  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bigmama-mission-${mission.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Mission Report Complete</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target: <span className="text-teal-400 font-mono">{result.targetUrl || mission.prompt}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-neutral-950 font-bold text-xs hover:opacity-90 transition-all shadow-md shadow-teal-500/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Mission</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Executive Summary</span>
        <p className="text-sm text-neutral-200 leading-relaxed">{summary}</p>
      </div>

      {/* Structured Findings */}
      {Object.keys(findings).length > 0 && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Extracted Web Findings</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(findings).map(([key, val]) => (
              <div key={key} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">{key.replace(/_/g, " ")}</span>
                <div className="mt-1 text-xs text-neutral-200 font-mono whitespace-pre-wrap break-all">
                  {typeof val === "object" ? JSON.stringify(val, null, 2) : String(val)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Screenshots Gallery */}
      {screenshots.length > 0 && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Viewport Screenshots</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {screenshots.map((s, idx) => (
              <div key={idx} className="group relative rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950">
                <img src={s.url} alt={s.title} className="w-full h-48 object-cover object-top" />
                <div className="p-3 flex items-center justify-between text-xs bg-neutral-950/90 border-t border-neutral-800">
                  <span className="font-semibold text-neutral-300 truncate">{s.title}</span>
                  <button
                    type="button"
                    onClick={() => setActivePreviewUrl(s.url)}
                    className="p-1 rounded text-neutral-400 hover:text-teal-300 transition-colors"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The AI Brand App Bridge */}
      <EcosystemBridge findings={findings} targetUrl={result.targetUrl} />

      {/* Modal Screenshot Zoom */}
      {activePreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
              <span className="text-xs font-mono text-neutral-300">Screenshot Inspector</span>
              <button
                type="button"
                onClick={() => setActivePreviewUrl(null)}
                className="p-1 rounded text-neutral-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex-1 flex justify-center bg-neutral-950">
              <img src={activePreviewUrl} alt="Inspection" className="max-w-full h-auto rounded object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
