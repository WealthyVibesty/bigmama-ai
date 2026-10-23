import { Sparkles, ArrowRight, Palette, Clapperboard, Users } from "lucide-react";

interface EcosystemBridgeProps {
  findings?: Record<string, any>;
  targetUrl?: string;
}

export function EcosystemBridge({ findings = {}, targetUrl = "" }: EcosystemBridgeProps) {
  const brandAppUrl = "https://aibrandapp.com";
  const findingsCount = Object.keys(findings).length;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-teal-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
        <Sparkles className="h-4 w-4" />
        <span>Connected Growth Flywheel</span>
      </div>

      <h3 className="text-xl font-black text-white mb-2">
        Ready to turn this web intel into high-converting assets?
      </h3>

      <p className="text-neutral-400 text-xs leading-relaxed max-w-2xl mb-6">
        Big Mama extracted the data. AI Brand App converts it into 24 ad pack variations, Nano Banana social creatives, cinematic video scripts, and outbound campaigns locked to your brand identity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
          <Palette className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">Nano Banana Creatives</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Generate 4:5 carousels & hero image prompts from extracted branding.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
          <Clapperboard className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">Video Studio Ads</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Spin extracted hooks and angles into 1080p cinematic video scripts.</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-start gap-3">
          <Users className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-white">Brand CRM Workspace</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Feed verified directory links and company contacts straight to pipeline.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-neutral-800/80">
        <div className="text-[11px] text-neutral-500 font-mono">
          {findingsCount > 0 && targetUrl
            ? `Extracted ${findingsCount} points from ${targetUrl}. Unified ecosystem.`
            : "Single unified credit balance & identity profile ecosystem."}
        </div>

        <a
          href={brandAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-neutral-950 font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-teal-500/20"
        >
          <span>Launch AI Brand App</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
