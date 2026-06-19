import React, { useState, useEffect } from "react";
import { Sparkles, Monitor, Code, Palette, Cpu, ShieldAlert, BadgeInfo } from "lucide-react";

interface LoadingScreenProps {
  url: string;
}

const STEPS = [
  {
    message: "Initializing secure website crawler...",
    subtext: "Establishing sandboxed connections and resolving DNS servers",
    icon: <Cpu className="h-5 w-5 text-accent animate-pulse" />,
  },
  {
    message: "Crawling HTML document components...",
    subtext: "Analyzing meta descriptors, viewpoint configs, and script counts",
    icon: <Code className="h-5 w-5 text-purple-500 animate-pulse" />,
  },
  {
    message: "Validating typography definitions and sizes...",
    subtext: "Measuring line-height ratios, heading orders, and readabilities",
    icon: <Cpu className="h-5 w-5 text-indigo-500 animate-pulse" />,
  },
  {
    message: "Verifying WCAG color contrast criteria...",
    subtext: "Calculating relative luminance and background hex ratios",
    icon: <Palette className="h-5 w-5 text-pink-500 animate-pulse" />,
  },
  {
    message: "Synthesizing full website audit report...",
    subtext: "Invoking the expert LLM evaluation engine with web grounding context",
    icon: <Sparkles className="h-5 w-5 text-amber-500 animate-bounce" />,
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
    <div className="flex flex-col items-center justify-center min-h-[450px] p-8 max-w-xl mx-auto text-center">
      {/* Visual Scanning Animation Anchor */}
      <div className="relative mb-8">
        {/* Ambient Ring Glow */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl opacity-50 animate-ping -z-10" />

        {/* Outer Tech Ring */}
        <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-white animate-spin flex items-center justify-center">
          {/* Inner pulsating core */}
          <div className="w-16 h-16 rounded-full bg-background border border-white/10 flex items-center justify-center">
            <Monitor className="h-7 w-7 text-white animate-pulse" />
          </div>
        </div>

        {/* Tiny floaters */}
        <div className="absolute -top-1 -right-1 p-1 bg-surface rounded-full border border-white/10">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Scanned URL indicator */}
      <div className="bg-surface border border-white/10 px-3 py-1 rounded-full text-xs font-mono text-secondary mb-6 max-w-sm truncate shadow-inner">
        Crawling: {url}
      </div>

      {/* Progress Label */}
      <div className="space-y-2 mb-8">
        <h2 className="text-xl font-display font-semibold text-white tracking-tight">
          {STEPS[currentStepIndex].message}
        </h2>
        <p className="text-sm text-secondary max-w-md mx-auto leading-relaxed h-10">
          {STEPS[currentStepIndex].subtext}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-surface h-2.5 rounded-full mb-3 overflow-hidden border border-white/10 shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-secondary">{percent}% Audited</span>

      {/* Passive Step indicators */}
      <div className="mt-8 pt-6 border-t border-white/10 w-full">
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
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs ${
                    isCompleted
                      ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                      : isActive
                      ? "bg-blue-950/20 border-blue-900/40 text-blue-400 font-bold"
                      : "bg-surface border-white/10 text-[#555]"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span className="text-xs text-primary">{step.message}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
