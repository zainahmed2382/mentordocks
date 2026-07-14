import React, { useState } from "react";
import { Search, Sparkles, Code, Monitor, Palette, Zap, CheckCircle2, ArrowRight } from "lucide-react";

const PRESETS = [
  { name: "Wikipedia", url: "wikipedia.org" },
  { name: "GitHub", url: "github.com" },
  { name: "Tailwind CSS", url: "tailwindcss.com" },
];

export function HomeState({
  onAudit,
  isLoading,
}: {
  onAudit: (url: string) => void;
  isLoading: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const targetUrl = url.trim();
    if (!targetUrl) {
      setError("Please enter a website URL first.");
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
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-400/20 text-primary-300 rounded-full text-sm font-semibold backdrop-blur">
          <Sparkles className="h-4 w-4" />
          AI-Powered Website Analysis
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-100 leading-tight">
          Audit Your Website in Seconds
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
          Get actionable insights on performance, accessibility, SEO, and design with a single click.
        </p>

        {/* URL Input Section */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="url" className="block text-sm font-semibold text-slate-300 text-left">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="url"
                  type="text"
                  placeholder="Enter your website URL"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className="w-full pl-12 pr-36 py-4 text-lg bg-slate-900/80 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20 transition-all disabled:opacity-65 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl hover:shadow-[0_14px_34px_-16px_rgba(37,99,235,0.7)] hover:scale-[1.01] transition-all disabled:opacity-65 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
                  >
                    {isLoading ? "Auditing..." : "Start AI Audit"}
                    {!isLoading && <Zap className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm font-semibold text-error-400 text-left">
                  {error}
                </p>
              )}
            </div>
          </form>

          {/* Preset Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-slate-500 font-medium">Try with:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset.url)}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-900/80 border border-slate-700 text-slate-300 font-medium rounded-xl hover:bg-slate-800 hover:border-primary-400 transition-all cursor-pointer disabled:opacity-60"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-slate-100 mb-3">
            Everything You Need to Improve
          </h2>
          <p className="text-slate-400">
            Comprehensive audit covering all critical aspects of your website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Code className="h-6 w-6" />,
              title: "Code Quality",
              desc: "Clean, maintainable, and optimized HTML structure",
              color: "text-primary-600",
              bg: "bg-primary-50",
            },
            {
              icon: <Monitor className="h-6 w-6" />,
              title: "Responsiveness",
              desc: "Perfect mobile and desktop compatibility checks",
              color: "text-secondary-600",
              bg: "bg-secondary-50",
            },
            {
              icon: <Palette className="h-6 w-6" />,
              title: "Design & Accessibility",
              desc: "WCAG compliance, colors, and typography review",
              color: "text-success-600",
              bg: "bg-success-50",
            },
            {
              icon: <Zap className="h-6 w-6" />,
              title: "Performance",
              desc: "Speed optimization and Core Web Vitals analysis",
              color: "text-warning-600",
              bg: "bg-warning-50",
            },
            {
              icon: <CheckCircle2 className="h-6 w-6" />,
              title: "SEO Best Practices",
              desc: "Search engine optimization and meta tag checks",
              color: "text-secondary-700",
              bg: "bg-secondary-50",
            },
            {
              icon: <Sparkles className="h-6 w-6" />,
              title: "AI Recommendations",
              desc: "Smart suggestions to fix issues quickly",
              color: "text-primary-700",
              bg: "bg-primary-50",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="card p-6 space-y-4"
            >
              <div className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} border border-slate-700/60`}>
                {feature.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary-600/90 to-primary-500/90 rounded-3xl p-8 md:p-12 text-white text-center shadow-[0_24px_70px_-32px_rgba(37,99,235,0.8)]">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
            Ready to Audit Your Website?
          </h2>
          <p className="text-primary-50/90 mb-8 max-w-xl mx-auto">
            Get a full report in seconds and start improving your website today.
          </p>
          <button
            onClick={() => {
              const input = document.getElementById('url') as HTMLInputElement;
              input?.focus();
            }}
            className="bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Start Your Audit <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
