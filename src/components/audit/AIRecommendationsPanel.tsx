import React, { useState } from "react";
import { AuditIssue } from "../../types";
import { Sparkles, ChevronDown, ChevronUp, ArrowUpRight, Zap, Target, TrendingUp, Clock } from "lucide-react";

interface AIRecommendationsPanelProps {
  issues: AuditIssue[];
  priorityFixes: string[];
  overallScore: number;
}

interface Recommendation {
  priority: "High" | "Medium" | "Low";
  problem: string;
  impact: string;
  recommendation: string;
  estimatedImprovement: string;
  timeToFix: string;
  category: string;
}

function buildRecommendations(issues: AuditIssue[], priorityFixes: string[]): Recommendation[] {
  const recs: Recommendation[] = [];

  // Build from high-severity issues first
  const highIssues = issues.filter(i => i.severity === "High").slice(0, 3);
  const medIssues = issues.filter(i => i.severity === "Medium").slice(0, 2);
  const combined = [...highIssues, ...medIssues];

  combined.forEach((issue) => {
    const isHigh = issue.severity === "High";
    const isMed = issue.severity === "Medium";

    let scoreBoost = isHigh ? "+8–12" : isMed ? "+4–7" : "+1–3";
    // Tweak per category
    if (issue.category === "Performance") scoreBoost = isHigh ? "+10–15" : "+5–8";
    if (issue.category === "Accessibility") scoreBoost = isHigh ? "+8–12" : "+4–6";

    recs.push({
      priority: issue.severity as "High" | "Medium",
      problem: issue.problem,
      impact: issue.reason.length > 120 ? issue.reason.slice(0, 117) + "..." : issue.reason,
      recommendation: issue.recommendation.length > 140 ? issue.recommendation.slice(0, 137) + "..." : issue.recommendation,
      estimatedImprovement: `${scoreBoost} overall score`,
      timeToFix: isHigh ? "30–60 minutes" : "15–30 minutes",
      category: issue.category
    });
  });

  // Fill with priority_fixes if we have room
  if (recs.length < 3 && priorityFixes.length > 0) {
    priorityFixes.slice(0, 3 - recs.length).forEach((fix, idx) => {
      recs.push({
        priority: idx === 0 ? "High" : "Medium",
        problem: fix.split(":")[0] || fix.slice(0, 60),
        impact: "Improves overall website quality and user experience significantly.",
        recommendation: fix,
        estimatedImprovement: "+4–8 overall score",
        timeToFix: "20–45 minutes",
        category: "General"
      });
    });
  }

  // Ensure at least 3 recommendations with sensible defaults
  const defaults: Recommendation[] = [
    {
      priority: "High",
      problem: "Missing or incomplete meta description",
      impact: "Pages without meta descriptions may get lower click-through rates from search results.",
      recommendation: "Add a unique 150–160 character meta description for each page that describes the content.",
      estimatedImprovement: "+6–10 SEO score",
      timeToFix: "15–20 minutes",
      category: "SEO"
    },
    {
      priority: "Medium",
      problem: "Images missing alt text attributes",
      impact: "Screen readers can't describe images to visually impaired users, reducing accessibility.",
      recommendation: "Add descriptive alt attributes to all <img> elements. Use empty alt='' for decorative images.",
      estimatedImprovement: "+4–8 Accessibility score",
      timeToFix: "20–30 minutes",
      category: "Accessibility"
    },
    {
      priority: "Low",
      problem: "Unoptimized JavaScript bundle size",
      impact: "Large JS bundles increase parse time and delay interactivity, especially on mobile.",
      recommendation: "Enable code splitting, tree shaking, and lazy load non-critical scripts.",
      estimatedImprovement: "+3–6 Performance score",
      timeToFix: "1–2 hours",
      category: "Performance"
    }
  ];

  while (recs.length < 3) {
    recs.push(defaults[recs.length]);
  }

  return recs.slice(0, 5);
}

const PRIORITY_CONFIG = {
  High: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    glow: "from-red-50",
    dot: "bg-red-500"
  },
  Medium: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    glow: "from-amber-50",
    dot: "bg-amber-500"
  },
  Low: {
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    glow: "from-blue-50",
    dot: "bg-blue-500"
  }
};

const CATEGORY_COLORS: Record<string, string> = {
  "Performance": "text-orange-600",
  "Accessibility": "text-purple-600",
  "Code Quality": "text-blue-600",
  "UI/UX Design": "text-pink-600",
  "SEO": "text-emerald-600",
  "General": "text-slate-600"
};

interface RecCardProps {
  rec: Recommendation;
  index: number;
}

const RecCard: React.FC<RecCardProps> = ({ rec, index }) => {
  const [open, setOpen] = useState(index === 0);
  const cfg = PRIORITY_CONFIG[rec.priority];
  const catColor = CATEGORY_COLORS[rec.category] || "text-slate-600";

  return (
    <div
      className={`bg-gradient-to-r ${cfg.glow} to-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up`}
      style={{ animationDelay: `${600 + index * 100}ms` }}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-start justify-between gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3 flex-1">
          {/* Priority number */}
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shadow-sm mt-0.5">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                Priority: {rec.priority}
              </span>
              <span className={`text-[10px] font-semibold ${catColor}`}>{rec.category}</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900">{rec.problem}</h4>
          </div>
        </div>

        <div className="shrink-0 mt-1">
          {open
            ? <ChevronUp className="h-4 w-4 text-slate-400" />
            : <ChevronDown className="h-4 w-4 text-slate-400" />
          }
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 space-y-3 animate-fade-in">
          {/* Grid of info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
            {/* Impact */}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Target className="h-3 w-3 text-red-500" />
                Impact
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{rec.impact}</p>
            </div>

            {/* Recommendation */}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                <Zap className="h-3 w-3 text-blue-500" />
                Recommendation
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{rec.recommendation}</p>
            </div>
          </div>

          {/* Metrics row */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <div>
                <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Estimated Improvement</div>
                <div className="text-xs font-bold text-emerald-800">{rec.estimatedImprovement}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
              <Clock className="h-3.5 w-3.5 text-violet-600" />
              <div>
                <div className="text-[9px] font-bold text-violet-600 uppercase tracking-wide">Time to Fix</div>
                <div className="text-xs font-bold text-violet-800">{rec.timeToFix}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({
  issues, priorityFixes, overallScore
}) => {
  const recommendations = buildRecommendations(issues, priorityFixes);
  const potentialGain = recommendations
    .filter(r => r.priority === "High")
    .length * 8 + recommendations.filter(r => r.priority === "Medium").length * 4;

  return (
    <div className="dash-card p-6 animate-slide-up delay-600">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 shadow-md">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">AI Recommendations</h3>
            <p className="text-xs text-slate-500 mt-0.5">Prioritized action plan to improve your score</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Potential gain</div>
          <div className="text-lg font-black text-emerald-600">+{potentialGain} pts</div>
        </div>
      </div>

      {/* Score improvement preview */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-violet-700">Current Score</span>
          <span className="text-xs font-semibold text-emerald-700">After All Fixes</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black text-slate-900">{overallScore}</span>
          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-violet-100">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, overallScore + potentialGain)}%` }}
            />
          </div>
          <span className="text-2xl font-black text-emerald-600">
            {Math.min(100, overallScore + potentialGain)}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs text-emerald-600 font-semibold">
            Implementing all {recommendations.length} recommendations could boost your score by ~{potentialGain} points
          </span>
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <RecCard key={idx} rec={rec} index={idx} />
        ))}
      </div>
    </div>
  );
};
