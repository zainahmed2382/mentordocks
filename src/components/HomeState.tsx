import React, { useState } from "react";
import { Search, Sparkles, Code, Monitor, Palette, Type, Zap, ShieldCheck } from "lucide-react";

interface HomeStateProps {
  onAudit: (url: string) => void;
  isLoading: boolean;
  brandColor?: string;
  brandAccent?: {
    name: string;
    gradient: string;
    text: string;
    headerSpan: string;
    textHover: string;
    bg: string;
    bgHover: string;
    border: string;
    borderFocused: string;
    bgLight: string;
    rawHex: string;
  };
}

const PRESETS = [
  { name: "Wikipedia", url: "wikipedia.org" },
  { name: "Hacker News", url: "news.ycombinator.com" },
  { name: "GitHub", url: "github.com" },
  { name: "Tailwind CSS", url: "tailwindcss.com" },
];

export function HomeState({ onAudit, isLoading, brandColor = "blue", brandAccent }: HomeStateProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const activeText = brandAccent?.text || "text-blue-400";
  const activeBorder = brandAccent?.border || "border-blue-500/20";
  const activeBgLight = brandAccent?.bgLight || "bg-blue-500/10";
  const activeGradient = brandAccent?.gradient || "from-blue-400 to-indigo-400";
  const activeBg = brandAccent?.bg || "bg-white";
  const activeBgHover = brandAccent?.bgHover || "hover:bg-zinc-200";
  const isDarkText = brandColor === "blue" || !brandAccent;
  const activeBorderFocus = brandAccent?.borderFocused || "focus:border-brand-500";

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
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a0a0a] border ${activeBorder} rounded-full ${activeText} text-xs font-semibold uppercase tracking-wider animate-bounce`}>
          <Sparkles className="h-3.5 w-3.5" />
          Next-Gen Website Analyzer
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-white leading-[1.15]">
          Inspect Website Design, UX, <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeGradient}`}>Accessibility & Performance</span>
        </h1>
        <p className="text-base md:text-lg text-[#aaa] max-w-xl mx-auto leading-relaxed">
          Provide any website link to initiate an advanced technical audit. Get actionable grading results, WCAG reports, performance insights, and copy-paste remediation formulas.
        </p>
      </div>

      {/* 2. URL search bar container */}
      <div className="max-w-2xl mx-auto bg-[#0a0a0a] p-4 rounded-2xl border border-[#222] shadow-2xl relative">
        <div className="absolute inset-0 ambient-glow -z-10 rounded-2xl" />

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#555]" />
            </div>
            <input
              type="text"
              placeholder="Enter your website URL"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className={`w-full pl-11 pr-4 py-3.5 bg-[#141414] border border-[#222] ${activeBorderFocus} focus:bg-[#1a1a1a] rounded-xl text-[#e0e0e0] placeholder-gray-500 focus:outline-none transition-all text-base disabled:opacity-65 shadow-inner`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3.5 ${activeBg} ${isDarkText ? "text-black" : "text-white"} ${activeBgHover} font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50`}
          >
            {isLoading ? "Auditing..." : "Run Free Audit"}
            <Zap className="h-4 w-4" />
          </button>
        </form>

        {error && (
          <p className="text-xs font-semibold text-rose-500 mt-2 px-1">
            {error}
          </p>
        )}

        {/* Preset pill list */}
        <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3.5 border-t border-[#1f1f1f]">
          <span className="text-xs text-[#555] font-semibold uppercase tracking-wider">Try Demo:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset.url)}
              disabled={isLoading}
              className="text-xs bg-[#141414] hover:bg-[#1a1a1a] text-[#888] font-medium px-3 py-1 rounded-full border border-[#222] cursor-pointer transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Marketing features/checks grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-4">
        {/* Card 1 */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur p-6 rounded-2xl border border-[#1a1a1a] shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Code className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">HTML & SEO Standards</h3>
          <p className="text-xs text-[#888] leading-relaxed">
            Crawls parsed document metadata, page titles, descriptions, heading arrangements, tag nestings, and indexing variables automatically.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur p-6 rounded-2xl border border-[#1a1a1a] shadow-sm space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Palette className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-white font-display">Contrast & Typography</h3>
          <p className="text-xs text-[#888] leading-relaxed">
            Measures line intervals, typeface hierarchic arrangements, copy size balances, and checks compliance for relative WCAG 2.1 color contrasts.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur p-6 rounded-2xl border border-[#1a1a1a] shadow-sm space-y-3">
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
