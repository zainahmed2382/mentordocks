import React from "react";
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

  const stats = [
    {
      label: "Total Issues",
      value: total,
      icon: <AlertCircle className="h-4 w-4" />,
      bg: "bg-slate-100",
      text: "text-slate-700",
      iconBg: "bg-slate-200 text-slate-600",
      bar: "bg-slate-400",
      percent: 100
    },
    {
      label: "Critical / High",
      value: high,
      icon: <XCircle className="h-4 w-4" />,
      bg: "bg-red-50",
      text: "text-red-700",
      iconBg: "bg-red-100 text-red-600",
      bar: "bg-red-500",
      percent: total > 0 ? Math.round((high / total) * 100) : 0
    },
    {
      label: "Medium Priority",
      value: medium,
      icon: <AlertTriangle className="h-4 w-4" />,
      bg: "bg-amber-50",
      text: "text-amber-700",
      iconBg: "bg-amber-100 text-amber-600",
      bar: "bg-amber-500",
      percent: total > 0 ? Math.round((medium / total) * 100) : 0
    },
    {
      label: "Low Priority",
      value: low,
      icon: <Info className="h-4 w-4" />,
      bg: "bg-blue-50",
      text: "text-blue-700",
      iconBg: "bg-blue-100 text-blue-600",
      bar: "bg-blue-400",
      percent: total > 0 ? Math.round((low / total) * 100) : 0
    }
  ];

  return (
    <div className="dash-card p-6 animate-slide-up delay-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Audit Summary</h3>
          <p className="text-xs text-slate-500 mt-0.5">Distribution of issues by severity level</p>
        </div>

        {/* Mini donut chart */}
        <div className="relative" style={{ width: 56, height: 56 }}>
          <svg width={56} height={56} className="-rotate-90">
            <circle cx={28} cy={28} r={22} fill="none" stroke="#f1f5f9" strokeWidth={8} />
            {/* High severity arc */}
            {high > 0 && (
              <circle
                cx={28} cy={28} r={22}
                fill="none" stroke="#ef4444" strokeWidth={8}
                strokeDasharray={`${(high / Math.max(total, 1)) * 138.2} 138.2`}
                strokeDashoffset={0}
                strokeLinecap="butt"
              />
            )}
            {/* Medium severity arc */}
            {medium > 0 && (
              <circle
                cx={28} cy={28} r={22}
                fill="none" stroke="#f59e0b" strokeWidth={8}
                strokeDasharray={`${(medium / Math.max(total, 1)) * 138.2} 138.2`}
                strokeDashoffset={-(high / Math.max(total, 1)) * 138.2}
                strokeLinecap="butt"
              />
            )}
            {/* Low severity arc */}
            {low > 0 && (
              <circle
                cx={28} cy={28} r={22}
                fill="none" stroke="#60a5fa" strokeWidth={8}
                strokeDasharray={`${(low / Math.max(total, 1)) * 138.2} 138.2`}
                strokeDashoffset={-((high + medium) / Math.max(total, 1)) * 138.2}
                strokeLinecap="butt"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-slate-900">{total}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-4 animate-slide-up`}
            style={{ animationDelay: `${200 + idx * 80}ms` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${stat.iconBg}`}>
                {stat.icon}
              </div>
            </div>
            <div className={`text-2xl font-black ${stat.text} mb-1 animate-count`}
              style={{ animationDelay: `${400 + idx * 80}ms` }}>
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 mb-3">{stat.label}</div>
            <div className="w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${stat.bar} transition-all duration-1000 ease-out`}
                style={{ width: `${stat.percent}%`, transitionDelay: `${600 + idx * 100}ms` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1">{stat.percent}% of total</div>
          </div>
        ))}
      </div>
    </div>
  );
};
