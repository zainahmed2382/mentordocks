import React, { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreCardProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  delay?: number;
}

function getScoreConfig(score: number) {
  if (score >= 90) return { status: "Excellent", color: "#10b981", bg: "bg-emerald-50", badge: "bg-emerald-100 text-emerald-700", ring: "#10b981", trend: "up" };
  if (score >= 70) return { status: "Good", color: "#3b82f6", bg: "bg-blue-50", badge: "bg-blue-100 text-blue-700", ring: "#3b82f6", trend: "up" };
  if (score >= 50) return { status: "Needs Improvement", color: "#f59e0b", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", ring: "#f59e0b", trend: "flat" };
  return { status: "Poor", color: "#ef4444", bg: "bg-red-50", badge: "bg-red-100 text-red-700", ring: "#ef4444", trend: "down" };
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, icon, delay = 0 }) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const config = getScoreConfig(score);

  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

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
  const trendColor = config.trend === "up" ? "text-emerald-600" : config.trend === "down" ? "text-red-500" : "text-slate-400";

  return (
    <div
      className="dash-card p-5 flex flex-col gap-3 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
        </div>
        <TrendIcon className={`h-4 w-4 ${trendColor}`} />
      </div>

      {/* Score Ring */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
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
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black" style={{ color: config.ring }}>
              {score}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-3xl font-black text-slate-900">{score}</div>
          <div className="text-xs text-slate-500 mb-2">out of 100</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
            {config.status}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor: config.ring,
            transitionDelay: `${delay + 200}ms`
          }}
        />
      </div>
    </div>
  );
};
