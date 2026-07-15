import React from "react";
import { Clock, Zap, Move, Eye, Server } from "lucide-react";

interface CoreWebVitalsProps {
  performanceScore: number;
}

interface VitalMetric {
  key: string;
  label: string;
  fullName: string;
  value: string;
  unit: string;
  status: "good" | "needs-improvement" | "poor";
  description: string;
  icon: React.ReactNode;
  goodThreshold: string;
}

function getVitalsFromScore(performanceScore: number): VitalMetric[] {
  // Simulate realistic Core Web Vitals based on performance score
  const p = performanceScore / 100;

  const lcpMs = Math.round(4500 - p * 3000); // 1500ms–4500ms
  const clsVal = parseFloat((0.25 - p * 0.22).toFixed(3));
  const inpMs = Math.round(500 - p * 350); // 150ms–500ms
  const fcpMs = Math.round(3000 - p * 2200); // 800ms–3000ms
  const ttfbMs = Math.round(1800 - p * 1500); // 300ms–1800ms

  const lcpStatus: "good" | "needs-improvement" | "poor" = lcpMs <= 2500 ? "good" : lcpMs <= 4000 ? "needs-improvement" : "poor";
  const clsStatus: "good" | "needs-improvement" | "poor" = clsVal <= 0.1 ? "good" : clsVal <= 0.25 ? "needs-improvement" : "poor";
  const inpStatus: "good" | "needs-improvement" | "poor" = inpMs <= 200 ? "good" : inpMs <= 500 ? "needs-improvement" : "poor";
  const fcpStatus: "good" | "needs-improvement" | "poor" = fcpMs <= 1800 ? "good" : fcpMs <= 3000 ? "needs-improvement" : "poor";
  const ttfbStatus: "good" | "needs-improvement" | "poor" = ttfbMs <= 800 ? "good" : ttfbMs <= 1800 ? "needs-improvement" : "poor";

  return [
    {
      key: "lcp",
      label: "LCP",
      fullName: "Largest Contentful Paint",
      value: (lcpMs / 1000).toFixed(1),
      unit: "s",
      status: lcpStatus,
      description: "Measures loading performance. How long the largest content element takes to render.",
      icon: <Clock className="h-4 w-4" />,
      goodThreshold: "≤ 2.5s"
    },
    {
      key: "cls",
      label: "CLS",
      fullName: "Cumulative Layout Shift",
      value: clsVal.toFixed(3),
      unit: "",
      status: clsStatus,
      description: "Measures visual stability. How much unexpected layout shift occurs during page load.",
      icon: <Move className="h-4 w-4" />,
      goodThreshold: "≤ 0.1"
    },
    {
      key: "inp",
      label: "INP",
      fullName: "Interaction to Next Paint",
      value: String(inpMs),
      unit: "ms",
      status: inpStatus,
      description: "Measures responsiveness. How quickly the page responds to user interactions.",
      icon: <Zap className="h-4 w-4" />,
      goodThreshold: "≤ 200ms"
    },
    {
      key: "fcp",
      label: "FCP",
      fullName: "First Contentful Paint",
      value: (fcpMs / 1000).toFixed(1),
      unit: "s",
      status: fcpStatus,
      description: "Measures perceived load speed. When the first content element is rendered on screen.",
      icon: <Eye className="h-4 w-4" />,
      goodThreshold: "≤ 1.8s"
    },
    {
      key: "ttfb",
      label: "TTFB",
      fullName: "Time to First Byte",
      value: String(ttfbMs),
      unit: "ms",
      status: ttfbStatus,
      description: "Measures server response time. How long the browser waits for the first response byte.",
      icon: <Server className="h-4 w-4" />,
      goodThreshold: "≤ 800ms"
    }
  ];
}

const STATUS_CONFIG = {
  good: {
    label: "Good",
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600"
  },
  "needs-improvement": {
    label: "Needs Improvement",
    badge: "bg-amber-100 text-amber-700",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-700",
    iconBg: "bg-amber-100 text-amber-600"
  },
  poor: {
    label: "Poor",
    badge: "bg-red-100 text-red-700",
    border: "border-l-red-500",
    dot: "bg-red-500",
    text: "text-red-700",
    iconBg: "bg-red-100 text-red-600"
  }
};

export const CoreWebVitals: React.FC<CoreWebVitalsProps> = ({ performanceScore }) => {
  const vitals = getVitalsFromScore(performanceScore);

  return (
    <div className="p-6 animate-slide-up delay-300 bg-gradient-to-b from-slate-900/60 to-slate-800/50 rounded-2xl border border-slate-800 shadow-[0_12px_36px_rgba(2,6,23,0.7)]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Core Web Vitals</h3>
          <p className="text-xs text-slate-400 mt-0.5">Google's performance metrics for user experience</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/30 text-slate-200 border border-slate-700">
          {vitals.filter(v => v.status === "good").length}/{vitals.length} Passing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {vitals.map((vital, idx) => {
          const cfg = STATUS_CONFIG[vital.status];
          return (
            <div
              key={vital.key}
              className={`relative bg-gradient-to-b from-slate-900/50 to-slate-800/40 border border-slate-800 rounded-xl p-4 transform-gpu hover:-translate-y-1 hover:shadow-2xl transition-all duration-200 group animate-slide-up`}
              style={{ animationDelay: `${300 + idx * 100}ms` }}
              title={vital.description}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${cfg.iconBg}`}>
                  {vital.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-100">{vital.label}</span>
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} inline-block`} />
                  </div>
                  <div className="text-[10px] text-slate-400">{cfg.label}</div>
                </div>
              </div>

              <div className="mb-1">
                <span className="text-2xl font-extrabold text-white">{vital.value}</span>
                <span className="text-sm font-semibold text-slate-400 ml-1">{vital.unit}</span>
              </div>

              <div className="text-[10px] text-slate-400 mb-1">Good: {vital.goodThreshold}</div>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-0 mb-2 w-60 bg-gradient-to-b from-slate-900 to-slate-800 text-white text-xs rounded-lg p-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="font-semibold mb-1">{vital.fullName}</div>
                <div className="text-slate-300 leading-relaxed">{vital.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
