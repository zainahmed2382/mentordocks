import React, { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreCardProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  delay?: number;
}

const AI_INSIGHTS: Record<string, { excellent: string; good: string; average: string; poor: string }> = {
  "Overall Score": {
    excellent: "Site is fully optimized and adheres to best practices.",
    good: "Solid health score. A few optimization steps remaining.",
    average: "Performance and SEO improvements recommended.",
    poor: "Critical improvements needed. Focus on core vitals."
  },
  "Performance": {
    excellent: "Page loads fast. Images are well optimized.",
    good: "Good performance. Minor script deferrals suggested.",
    average: "LCP is high. Large resources are blocking main thread.",
    poor: "Critical load delay. Compress assets and defer JS."
  },
  "Accessibility": {
    excellent: "Semantic markup is correct. ARIA labels are present.",
    good: "Good navigation structure. Add alt attributes to all images.",
    average: "Contrast ratios are low. Form inputs missing labels.",
    poor: "Poor screen reader support. Missing landmarks and labels."
  },
  "Code Quality": {
    excellent: "Clean DOM structure. Semantic elements utilized.",
    good: "Clean structure. Consider wrapping nodes in landmarks.",
    average: "Too many inline styles. Clean up CSS declarations.",
    poor: "Bloated HTML structure. High density of scripts/styles."
  },
  "Design": {
    excellent: "Layout structure is highly optimized and balanced.",
    good: "Good design layout. Improve vertical text rhythms.",
    average: "Text hierarchy could be improved. Enhance layouts.",
    poor: "Low visual hierarchy. Density of components causes clutter."
  },
  "Responsiveness": {
    excellent: "Fully responsive. Touch targets are well-sized.",
    good: "Mostly mobile-friendly. Tap targets could be slightly larger.",
    average: "Viewport configuration exists. Tap target padding is low.",
    poor: "Unoptimized for mobile viewports. Layout overflow issues."
  }
};

function getScoreConfig(score: number) {
  if (score >= 90) return { status: "Excellent", color: "#10b981", badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", ring: "#10b981", trend: "up" };
  if (score >= 70) return { status: "Good", color: "#3b82f6", badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20", ring: "#3b82f6", trend: "up" };
  if (score >= 50) return { status: "Average", color: "#f59e0b", badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20", ring: "#f59e0b", trend: "flat" };
  return { status: "Poor", color: "#ef4444", badge: "bg-red-500/10 text-red-400 border border-red-500/20", ring: "#ef4444", trend: "down" };
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, icon, delay = 0 }) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const config = getScoreConfig(score);

  const size = 68;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) {
      setDisplayScore(end);
      return;
    }
    const duration = 1200; // ms
    const range = end - start;
    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      // Ease out quad
      const easeProgress = progressRatio * (2 - progressRatio);
      const currentScore = Math.round(start + easeProgress * range);
      setDisplayScore(currentScore);
      if (progress < duration) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayScore(end);
      }
    };

    const timer = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [score, delay]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
        circleRef.current.style.strokeDashoffset = String(targetOffset);
      }
    }, delay + 100);
    return () => clearTimeout(timer);
  }, [score, targetOffset, delay]);

  const TrendIcon = config.trend === "up" ? TrendingUp : config.trend === "down" ? TrendingDown : Minus;
  const trendColor = config.trend === "up" ? "text-emerald-400" : config.trend === "down" ? "text-red-400" : "text-slate-500";

  // Get AI insight
  const insightKey = AI_INSIGHTS[label] ? label : "Overall Score";
  const insight = score >= 90 
    ? AI_INSIGHTS[insightKey].excellent 
    : score >= 70 
    ? AI_INSIGHTS[insightKey].good 
    : score >= 50 
    ? AI_INSIGHTS[insightKey].average 
    : AI_INSIGHTS[insightKey].poor;

  return (
    <div
      className="dash-card p-4 flex flex-col justify-between h-[234px] bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-800 rounded-2xl transform-gpu transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-3 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-slate-900/60 to-slate-800/50 text-slate-300 border border-slate-700/80 flex items-center justify-center w-10 h-10">
              {icon}
            </div>
            <span className="text-xs font-semibold text-slate-200 tracking-wide">{label}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-bold ${trendColor}`}>
              {config.trend === "up" ? "↑" : config.trend === "down" ? "↓" : "→"}
            </span>
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
          </div>
        </div>

        {/* Score Ring */}
        <div className="flex items-center gap-4 py-1">
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#0f1724"
                strokeWidth={strokeWidth}
                opacity={0.6}
              />
              {/* Progress */}
              <circle
                ref={circleRef}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={config.ring}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.6))" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-extrabold font-mono" style={{ color: config.ring }}>
                {displayScore}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-extrabold font-mono text-white tracking-tight">{displayScore}</span>
              <span className="text-[10px] font-semibold text-slate-400">/100</span>
            </div>
            <span className={`inline-flex items-center mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${config.badge}`}>
              {config.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Insight */}
        <div className="text-[11px] text-slate-300 italic leading-tight line-clamp-2 border-t border-slate-700/50 pt-3">
          "{insight}"
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/40 rounded-full h-2 overflow-hidden border border-slate-700/60">
          <div
            className="h-full rounded-full transition-all duration-400 ease-out"
            style={{
              width: `${displayScore}%`,
              backgroundColor: config.ring,
              boxShadow: `0 6px 18px ${config.ring}33`
            }}
          />
        </div>
      </div>
    </div>
  );
};
