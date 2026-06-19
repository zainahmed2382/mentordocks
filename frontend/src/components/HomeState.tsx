import React, { useState } from "react";
import { Search, Sparkles, Code, Monitor, Palette, Type, Zap, ShieldCheck } from "lucide-react";

interface HomeStateProps {
  onAudit: (url: string) => void;
  isLoading: boolean;
}

const PRESETS = [
  { name: "Wikipedia", url: "wikipedia.org" },
  { name: "Hacker News", url: "news.ycombinator.com" },
  { name: "GitHub", url: "github.com" },
  { name: "Tailwind CSS", url: "tailwindcss.com" },
];

export function HomeState({ onAudit, isLoading }: HomeStateProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const targetUrl = url.trim();
    if (!targetUrl) {
      setError("Please key in a URL first.");
      return;
    }

    onAudit(targetUrl);
  };

  const handleSelectPreset = (presetUrl: string) => {
    setUrl(presetUrl);
    setError("");
    onAudit(presetUrl);
  };

  return (
    <div className="space-y-12">
      {/* 1. Hero text section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border border-accent/30 rounded-full text-accent text-xs font-semibold uppercase tracking-wider animate-bounce shadow-md shadow-black/40">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Next-Gen Website Analyzer
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-primary leading-[1.15]">
          Inspect Website Design, UX, <span className="text-transparent bg-clip-text bg-primary-gradient">Accessibility & Performance</span>
        </h1>
        <p className="text-base md:text-lg text-secondary max-w-xl mx-auto leading-relaxed">
          Provide any website link to initiate an advanced technical audit. Get actionable grading results, WCAG reports, performance insights, and copy-paste remediation formulas.
        </p>
      </div>

      {/* 2. URL search bar container */}
      <div className="max-w-2xl mx-auto glass-panel p-4 rounded-2xl relative transition-all duration-300 hover:shadow-primary/30">
        <div className="absolute inset-0 ambient-glow -z-10 rounded-2xl" />

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary" />
            </div>
            <input
              type="text"
              placeholder="e.g. wikipedia.org or https://mywebsite.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3.5 bg-surface/50 border border-white/10 focus:ring-2 focus:ring-accent focus:border-transparent focus:bg-background rounded-xl text-primary placeholder-slate-400 focus:outline-none transition-all text-base disabled:opacity-65 shadow-inner backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3.5 bg-primary-gradient text-white hover:scale-[1.02] hover:shadow-accent/40 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isLoading ? "Scanning..." : "AI Scan Engine"}
            <Zap className="h-4 w-4 text-white" />
          </button>
        </form>

        {error && (
          <p className="text-xs font-semibold text-rose-500 mt-2 px-1">
            {error}
          </p>
        )}

        {/* Preset pill list */}
        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3.5 border-t border-white/10">
          <span className="text-xs text-[#555] font-semibold uppercase tracking-wider">Try Demo:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset.url)}
              disabled={isLoading}
              className="text-xs bg-surface hover:bg-white/5 text-[#888] font-medium px-3 py-1 rounded-full border border-white/10 cursor-pointer transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Marketing features/checks grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
        {/* Card 1 */}
        <div className="glass-navbar p-6 rounded-2xl border border-white/10 shadow-md shadow-black/40 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-accent/30">
            <Code className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">HTML & SEO Standards</h3>
          <p className="text-xs text-[#888] leading-relaxed">
            Crawls parsed document metadata, page titles, descriptions, heading arrangements, tag nestings, and indexing variables automatically.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-navbar p-6 rounded-2xl border border-white/10 shadow-md shadow-black/40 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Palette className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Contrast & Typography</h3>
          <p className="text-xs text-[#888] leading-relaxed">
            Measures line intervals, typeface hierarchic arrangements, copy size balances, and checks compliance for relative WCAG 2.1 color contrasts.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-navbar p-6 rounded-2xl border border-white/10 shadow-md shadow-black/40 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Monitor className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">UX & Responsiveness</h3>
          <p className="text-[#888] text-xs leading-relaxed">
            Examines layout structures across screen sizes, mobile viewports setup, interactive scaling factors, and visual alignment guides.
          </p>
        </div>
      </div>
    </div>
  );
}
