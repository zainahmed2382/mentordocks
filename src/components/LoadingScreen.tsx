import React, { useState, useEffect } from "react";
import { Sparkles, Monitor, Code, Palette, Cpu, ShieldAlert, BadgeInfo } from "lucide-react";

interface LoadingScreenProps {
  url: string;
}

const STEPS = [
  {
    message: "Initializing secure website crawler...",
    subtext: "Establishing sandboxed connections and resolving DNS servers",
    icon: <Cpu className="h-5 w-5 text-primary-600 animate-pulse" />,
  },
  {
    message: "Crawling HTML document components...",
    subtext: "Analyzing meta descriptors, viewpoint configs, and script counts",
    icon: <Code className="h-5 w-5 text-secondary-600 animate-pulse" />,
  },
  {
    message: "Validating typography definitions and sizes...",
    subtext: "Measuring line-height ratios, heading orders, and readabilities",
    icon: <Cpu className="h-5 w-5 text-primary-700 animate-pulse" />,
  },
  {
    message: "Verifying WCAG color contrast criteria...",
    subtext: "Calculating relative luminance and background hex ratios",
    icon: <Palette className="h-5 w-5 text-warning-600 animate-pulse" />,
  },
  {
    message: "Synthesizing full website audit report...",
    subtext: "Invoking the expert LLM evaluation engine with web grounding context",
    icon: <Sparkles className="h-5 w-5 text-success-600 animate-bounce" />,
  },
];

export function LoadingScreen({ url }: LoadingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [percent, setPercent] = useState(5);

  useEffect(() => {
    // Progress Step message advance
    const messageInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    // Linear progress simulation
    const percentInterval = setInterval(() => {
      setPercent((prev) => {
        if (prev < 98) {
          const increment = Math.max(1, Math.floor((98 - prev) / 8));
          return prev + increment;
        }
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(messageInterval);
      clearInterval(percentInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8 max-w-xl mx-auto text-center">
      {/* Visual Scanning Animation Anchor */}
      <div className="relative mb-8">
        {/* Ambient Ring Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl opacity-50 animate-ping -z-10" />

        {/* Outer Tech Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-slate-900 border-t-blue-500 animate-spin flex items-center justify-center">
          {/* Inner pulsating core */}
          <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
            <Monitor className="h-7 w-7 text-slate-100 animate-pulse" />
          </div>
        </div>

        {/* Tiny floaters */}
        <div className="absolute -top-1 -right-1 p-1 bg-slate-900 rounded-full border border-slate-800 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Scanned URL indicator */}
      <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-1.5 rounded-full text-xs font-mono text-blue-400 mb-6 max-w-sm truncate shadow-sm">
        Crawling: {url}
      </div>

      {/* Progress Label */}
      <div className="space-y-2 mb-8">
        <h2 className="text-xl font-display font-bold text-slate-100 tracking-tight">
          {STEPS[currentStepIndex].message}
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed h-10">
          {STEPS[currentStepIndex].subtext}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full mb-3 overflow-hidden border border-slate-800/80 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_#3b82f6]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-slate-400">{percent}% Audited</span>

      {/* Mockup skeleton preview of dashboard with sweeping scanner bar */}
      <div className="w-full max-w-md mt-8 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5 relative overflow-hidden opacity-50 shadow-inner">
        {/* Sweeping Scanner beam */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_#3b82f6] opacity-75 animate-scanner-sweep pointer-events-none" />
        
        <div className="space-y-4">
          {/* Header Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg skeleton-dark" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/3 skeleton-dark" />
              <div className="h-2 w-1/2 skeleton-dark" />
            </div>
          </div>
          {/* Grid Skeleton */}
          <div className="grid grid-cols-3 gap-3">
            <div className="h-16 rounded-xl skeleton-dark" />
            <div className="h-16 rounded-xl skeleton-dark" />
            <div className="h-16 rounded-xl skeleton-dark" />
          </div>
          {/* Large chart Area Skeleton */}
          <div className="h-20 rounded-xl skeleton-dark" />
        </div>
      </div>

      {/* Passive Step indicators */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 w-full">
        <div className="flex flex-col gap-3.5 justify-start text-left max-w-md mx-auto">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCompleted ? "opacity-35" : isActive ? "opacity-100 scale-[1.02] font-semibold" : "opacity-20"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs transition-all ${
                    isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : isActive
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400 font-bold shadow-[0_0_8px_rgba(59,130,246,0.2)]"
                      : "bg-slate-950 border-slate-800 text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span className="text-xs text-slate-300">{step.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
