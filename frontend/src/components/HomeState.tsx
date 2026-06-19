import React, { useState } from "react";
import { Search, Sparkles, Code, Monitor, Palette, Zap, ArrowRight, Globe, ShieldCheck } from "lucide-react";

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

const FEATURE_CARDS = [
  {
    icon: <Code className="h-5 w-5 text-blue-400" />,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    title: "HTML & SEO Standards",
    desc: "Crawls parsed document metadata, page titles, descriptions, heading hierarchies, and indexing variables automatically.",
  },
  {
    icon: <Palette className="h-5 w-5 text-violet-400" />,
    iconBg: "bg-violet-500/10 border-violet-500/20",
    title: "Contrast & Typography",
    desc: "Measures typeface hierarchies, copy size balances, and checks compliance for WCAG 2.1 color contrasts.",
  },
  {
    icon: <Monitor className="h-5 w-5 text-cyan-400" />,
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    title: "UX & Responsiveness",
    desc: "Examines layout structures across screen sizes, mobile viewports, interactive scaling, and visual alignment.",
  },
];

export function HomeState({ onAudit, isLoading }: HomeStateProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const targetUrl = url.trim();
    if (!targetUrl) {
      setError("Please enter a URL first.");
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
    <div className="space-y-16 pb-8">
      {/* ── Hero Section ── */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-4 animate-fade-in">

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" />
          Next‑Gen Website Analyzer
        </div>

        {/* Headline — fixed: gradient applied via inline style to avoid Tailwind class conflicts */}
        <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-white">
          Inspect Website{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #3B82F6, #6366F1, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Design, UX &amp; Performance
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Enter any website URL to trigger a comprehensive AI audit — scoring design, accessibility, SEO, typography, responsiveness, and performance.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {[
            { label: "Checks Run", value: "50+" },
            { label: "Avg Scan Time", value: "~8s" },
            { label: "WCAG Standards", value: "2.1 AA" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg font-bold font-mono text-white">{stat.value}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {/* Glowing border container */}
        <div
          className="relative rounded-2xl p-[1px]"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(99,102,241,0.2), rgba(6,182,212,0.4))",
          }}
        >
          <div className="bg-[#0a0a0a] rounded-2xl p-4">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Globe className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  type="text"
                  id="audit-url-input"
                  placeholder="e.g. wikipedia.org or https://mywebsite.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/8 focus:ring-2 focus:ring-cyan-500 focus:border-transparent rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all duration-200 text-sm disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                id="audit-submit-btn"
                disabled={isLoading}
                className="px-6 py-3.5 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 text-sm"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #6366F1, #06B6D4)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(59,130,246,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(59,130,246,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    AI Scan Engine
                    <Zap className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <p className="text-xs font-medium text-red-400 mt-2 px-1 flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}

            {/* Preset pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3.5 border-t border-white/5">
              <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest mr-1">Try Demo:</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  id={`preset-${preset.name.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => handleSelectPreset(preset.url)}
                  disabled={isLoading}
                  className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1 rounded-full border border-white/10 hover:border-white/20 bg-white/3 hover:bg-white/8 cursor-pointer transition-all duration-200 disabled:opacity-40"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {FEATURE_CARDS.map((card, i) => (
          <div
            key={card.title}
            id={`feature-card-${i}`}
            className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}
          >
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border mb-4 ${card.iconBg}`}>
              {card.icon}
            </div>
            <h3 className="text-sm font-bold text-white font-display mb-2">{card.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>

            {/* Subtle hover glow line at bottom */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/40 transition-all duration-500 rounded-full" />
          </div>
        ))}
      </div>

      {/* ── Trust Strip ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        {[
          { icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />, label: "WCAG 2.1 Compliant" },
          { icon: <Zap className="h-4 w-4 text-amber-400" />, label: "Sub-10s Analysis" },
          { icon: <Globe className="h-4 w-4 text-blue-400" />, label: "Any Public URL" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
