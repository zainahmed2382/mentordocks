import React, { useState } from "react";
import { AuditIssue } from "../../types";
import { AlertTriangle, XCircle, Info, AlertCircle } from "lucide-react";

interface AuditSummaryBarProps {
  issues: AuditIssue[];
}

export const AuditSummaryBar: React.FC<AuditSummaryBarProps> = ({ issues }) => {
  const total = issues.length;
  const high = issues.filter(i => i.severity === "High").length;
  const medium = issues.filter(i => i.severity === "Medium").length;
  const low = issues.filter(i => i.severity === "Low").length;

  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const stats = [
    {
      key: "total",
      label: "Total Issues",
      value: total,
      icon: <AlertCircle className="h-4 w-4 text-slate-300" />,
      bg: "bg-slate-900/60 border border-slate-800/80 text-slate-100",
      iconBg: "bg-slate-800 text-slate-400 border border-slate-700/50",
      bar: "bg-slate-500",
      percent: 100
    },
    {
      key: "high",
      label: "Critical / High",
      value: high,
      icon: <XCircle className="h-4 w-4 text-red-400" />,
      bg: "bg-red-950/15 border border-red-900/30 text-red-400 hover:border-red-500/30",
      iconBg: "bg-red-950/50 text-red-400 border border-red-900/50",
      bar: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
      percent: total > 0 ? Math.round((high / total) * 100) : 0
    },
    {
      key: "medium",
      label: "Medium Priority",
      value: medium,
      icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
      bg: "bg-amber-950/15 border border-amber-900/30 text-amber-400 hover:border-amber-500/30",
      iconBg: "bg-amber-950/50 text-amber-400 border border-amber-900/50",
      bar: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
      percent: total > 0 ? Math.round((medium / total) * 100) : 0
    },
    {
      key: "low",
      label: "Low Priority",
      value: low,
      icon: <Info className="h-4 w-4 text-blue-400" />,
      bg: "bg-blue-950/15 border border-blue-900/30 text-blue-400 hover:border-blue-500/30",
      iconBg: "bg-blue-950/50 text-blue-400 border border-blue-900/50",
      bar: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
      percent: total > 0 ? Math.round((low / total) * 100) : 0
    }
  ];

  // Donut chart calculations
  const size = 96;
  const radius = 38;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~238.76

  const highOffset = 0;
  const medOffset = total > 0 ? -(high / total) * circumference : 0;
  const lowOffset = total > 0 ? -((high + medium) / total) * circumference : 0;

  return (
    <div className="bg-slate-950/70 border border-slate-900 rounded-2xl p-5 shadow-lg shadow-black/40 animate-slide-up delay-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-5 border-b border-slate-900 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 tracking-wide">Audit Severity Summary</h3>
          <p className="text-xs text-slate-500 mt-1">Distribution of issues by impact level</p>
        </div>

        {/* Dynamic Donut Chart */}
        <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-900 px-4 py-2.5 rounded-2xl self-start sm:self-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />
              {/* High severity arc */}
              {high > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={hoveredSegment === "high" ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${(high / total) * circumference} ${circumference}`}
                  strokeDashoffset={highOffset}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSegment("high")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
              {/* Medium severity arc */}
              {medium > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={hoveredSegment === "medium" ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${(medium / total) * circumference} ${circumference}`}
                  strokeDashoffset={medOffset}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSegment("medium")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
              {/* Low severity arc */}
              {low > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={hoveredSegment === "low" ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${(low / total) * circumference} ${circumference}`}
                  strokeDashoffset={lowOffset}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSegment("low")}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black font-mono text-slate-100">{total}</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Issues</span>
            </div>
          </div>

          <div className="text-left">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Status</div>
            <div className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
              {hoveredSegment === "high" ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> {high} Critical / High</>
              ) : hoveredSegment === "medium" ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> {medium} Medium Priority</>
              ) : hoveredSegment === "low" ? (
                <><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> {low} Low Priority</>
              ) : (
                <><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Scanning Complete</>
              )}
            </div>
            <div className="text-[9px] text-slate-400 mt-1 max-w-[140px] leading-tight">
              {hoveredSegment 
                ? `Represents ${Math.round(((hoveredSegment === "high" ? high : hoveredSegment === "medium" ? medium : low) / total) * 100)}% of total issues.`
                : "Hover segments for details."
              }
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 shadow-md flex flex-col justify-between h-[134px]`}
            style={{ animationDelay: `${200 + idx * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</span>
              <div className={`p-1.5 rounded-xl ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="mt-3">
              <div className="text-2xl font-black font-mono text-slate-100 mb-2.5">
                {stat.value}
              </div>
              <div className="space-y-1">
                <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.bar} transition-all duration-1000 ease-out`}
                    style={{ width: `${stat.percent}%`, transitionDelay: `${600 + idx * 100}ms` }}
                  />
                </div>
                <div className="text-[9px] font-mono text-slate-500 text-right">{stat.percent}% of total</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
