import { useState } from "react";
import { Globe, ArrowRight, Loader2, Sparkles, Terminal } from "lucide-react";

interface BigMamaHeroProps {
  onPlan: (prompt: string, targetUrl: string) => void;
  isPlanning: boolean;
}

const STARTER_PRESETS = [
  {
    title: "Competitor Pricing Audit",
    prompt: "Extract all subscription tiers, feature checklists, and discounts from target pricing page.",
    url: "https://stripe.com/pricing",
    badge: "Audits",
  },
  {
    title: "Brand Asset & Visual Scraper",
    prompt: "Capture full viewport screenshots and extract official logo, primary hex colors, and hero media.",
    url: "https://apple.com",
    badge: "Creatives",
  },
  {
    title: "Company Intel & Social Profiles",
    prompt: "Scrape registered business address, support emails, executive contacts, and official socials.",
    url: "https://github.com/about",
    badge: "Leads",
  },
  {
    title: "Directory Listing Verification",
    prompt: "Verify whether our brand profile is listed correctly and verify external citation links.",
    url: "https://google.com",
    badge: "Reputation",
  },
];

export function BigMamaHero({ onPlan, isPlanning }: BigMamaHeroProps) {
  const [prompt, setPrompt] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onPlan(prompt.trim(), targetUrl.trim());
  };

  const handlePickStarter = (starterPrompt: string, starterUrl: string) => {
    setPrompt(starterPrompt);
    setTargetUrl(starterUrl);
    onPlan(starterPrompt, starterUrl);
  };

  return (
    <div className="py-12 md:py-16 text-center max-w-4xl mx-auto px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-6">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Autonomous Web Execution Engine</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
        Tell Big Mama what to do <br className="hidden sm:block" />
        <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
          on the live web.
        </span>
      </h1>

      <p className="text-neutral-400 text-base md:text-lg max-w-2xl mx-auto mb-8">
        Put an autonomous cloud Chromium agent to work. Scrapes data, audits competitors, verifies listings, and captures full forensic screenshots reached over CDP.
      </p>

      {/* Main Mission Box */}
      <form onSubmit={handleSubmit} className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 shadow-2xl shadow-teal-500/5 mb-10 text-left">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-3 pt-1">
            <Terminal className="h-4 w-4 text-teal-400" />
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Mission Objective</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Audit competitor pricing, pull all monthly tiers, and screenshot their feature comparison table..."
            rows={3}
            className="w-full bg-neutral-950/70 border border-neutral-800/80 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-teal-500 transition-colors resize-none"
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="Target URL (e.g., https://stripe.com/pricing)"
                className="w-full bg-neutral-950/70 border border-neutral-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPlanning || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-neutral-950 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-teal-500/20"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Planning Mission...</span>
                </>
              ) : (
                <>
                  <span>Plan Task</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Starter Mission Cards */}
      <div className="text-left">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Or Pick a 1-Click Starter Mission:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STARTER_PRESETS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => handlePickStarter(item.prompt, item.url)}
              className="p-4 rounded-xl bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 hover:border-teal-500/40 text-left transition-all group"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-semibold text-sm text-neutral-200 group-hover:text-teal-300 transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-2 mb-2">{item.prompt}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-teal-400/80 font-mono">
                <Globe className="h-3 w-3" />
                <span className="truncate">{item.url}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
