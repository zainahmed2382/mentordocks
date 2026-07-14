import React, { useState } from "react";
import { AuditIssue, CategoryFilter, SeverityFilter } from "../../types";
import { getFriendlyIssueContent } from "../../utils/reportExperience";
import {
  ChevronDown, ChevronUp, XCircle, AlertTriangle, Info,
  Copy, Check, FileCode, Hammer, ChevronRight,
  Search, Filter, Eye, EyeOff, CheckCircle2, Sparkles,
  Brain, ShieldCheck, ArrowRight, Clock3
} from "lucide-react";

interface AuditFindingsPanelProps {
  filteredIssues: AuditIssue[];
  allIssues: AuditIssue[];
  selectedCategory: CategoryFilter;
  setSelectedCategory: (c: CategoryFilter) => void;
  selectedSeverity: SeverityFilter;
  setSelectedSeverity: (s: SeverityFilter) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  allExpanded: boolean;
  setAllExpanded: (v: boolean) => void;
}

interface FindingItemProps {
  issue: AuditIssue;
  forceExpanded: boolean;
  index: number;
}

const SEVERITY_CONFIG = {
  High: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    border: "border-l-red-500",
    icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
    dot: "bg-red-500"
  },
  Medium: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    border: "border-l-amber-500",
    icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
    dot: "bg-amber-500"
  },
  Low: {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    border: "border-l-slate-400",
    icon: <Info className="h-3.5 w-3.5 text-slate-500" />,
    dot: "bg-slate-400"
  }
};

const CATEGORY_COLORS: Record<string, string> = {
  "Performance": "bg-orange-100 text-orange-700",
  "Accessibility": "bg-purple-100 text-purple-700",
  "Code Quality": "bg-blue-100 text-blue-700",
  "UI/UX Design": "bg-pink-100 text-pink-700",
  "Responsiveness": "bg-teal-100 text-teal-700",
  "Typography": "bg-indigo-100 text-indigo-700",
  "Color Theme": "bg-rose-100 text-rose-700"
};

const FindingItem: React.FC<FindingItemProps> = ({ issue, forceExpanded, index }) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpanded = forceExpanded || localExpanded;
  const sev = SEVERITY_CONFIG[issue.severity];
  const catColor = CATEGORY_COLORS[issue.category] || "bg-slate-100 text-slate-600";
  const friendly = getFriendlyIssueContent(issue);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!issue.example_fix) return;
    try {
      await navigator.clipboard.writeText(issue.example_fix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = issue.example_fix;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200 border-l-4 ${sev.border} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
        onClick={() => setLocalExpanded(!localExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${sev.badge}`}>
              {sev.icon} {issue.severity}
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catColor}`}>
              {issue.category}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900 leading-snug">{issue.problem}</h4>
          {!isExpanded && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{issue.reason}</p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {isExpanded ? "Collapse" : "Details"}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
            {isExpanded
              ? <ChevronUp className="h-4 w-4 text-slate-500" />
              : <ChevronDown className="h-4 w-4 text-slate-500" />
            }
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-4 animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-500" />
              What does this mean?
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{friendly.plainEnglish}</p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
              Why is this important?
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
              {friendly.whyItMatters}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Hammer className="h-3 w-3 text-blue-500" />
              How can I fix it?
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-blue-50 rounded-lg p-3 border border-blue-100">
              {friendly.howToFix}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Difficulty</div>
              <div className="text-sm font-semibold text-emerald-800">{friendly.difficulty}</div>
            </div>
            <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
              <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-1">Priority</div>
              <div className="text-sm font-semibold text-violet-800">{friendly.priority}</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Estimated Fix Time</div>
              <div className="text-sm font-semibold text-amber-800">{friendly.estimatedFixTime}</div>
            </div>
            <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
              <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">Expected Improvement</div>
              <div className="text-sm font-semibold text-sky-800">{friendly.expectedImprovement}</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-primary-100 bg-primary-50 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-1.5">
                <Brain className="h-3.5 w-3.5" /> AI Insight
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{friendly.aiInsight}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Pro Tip
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{friendly.proTip}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                <Clock3 className="h-3.5 w-3.5" /> Learn More
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{friendly.learnMore}</p>
            </div>
          </div>

          {issue.example_fix && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="h-3 w-3 text-slate-400" />
                  Example Fix
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  {copied
                    ? <><Check className="h-3 w-3 text-emerald-500" /> Copied!</>
                    : <><Copy className="h-3 w-3" /> Copy</>
                  }
                </button>
              </div>
              <pre className="text-[11px] bg-slate-900 text-green-400 font-mono rounded-xl p-4 overflow-x-auto leading-relaxed max-h-48 border border-slate-800">
                <code>{issue.example_fix}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Category grouping
const CATEGORY_ORDER = [
  "Performance", "Accessibility", "Code Quality", "UI/UX Design",
  "Responsiveness", "Typography", "Color Theme"
];

interface CategorySectionProps {
  category: string;
  issues: AuditIssue[];
  forceExpanded: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, issues, forceExpanded }) => {
  const [open, setOpen] = useState(true);

  if (issues.length === 0) return null;

  const severityRank = { High: 0, Medium: 1, Low: 2 } as Record<string, number>;
  const orderedIssues = [...issues].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  const highCount = orderedIssues.filter(i => i.severity === "High").length;
  const catColor = CATEGORY_COLORS[category] || "bg-slate-100 text-slate-600";
  const overallScore = Math.max(0, 100 - orderedIssues.length * 10 - highCount * 8);
  const passedChecks = orderedIssues.length === 0 ? "All checks passed" : `${Math.max(0, 6 - orderedIssues.length)} checks likely passing`;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white animate-slide-up">
      {/* Category Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <ChevronRight
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          />
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${catColor}`}>{category}</span>
          <span className="text-sm font-semibold text-slate-700">{issues.length} issue{issues.length !== 1 ? "s" : ""}</span>
          {highCount > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {highCount} High
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mini severity breakdown */}
          <div className="hidden sm:flex items-center gap-1.5">
            {issues.filter(i => i.severity === "High").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
            {issues.filter(i => i.severity === "Medium").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
            {issues.filter(i => i.severity === "Low").length > 0 && (
              <span className="w-2 h-2 rounded-full bg-slate-400" />
            )}
          </div>
          {open
            ? <ChevronUp className="h-4 w-4 text-slate-400" />
            : <ChevronDown className="h-4 w-4 text-slate-400" />
          }
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3">
            {[
              { label: "Overall Score", value: `${overallScore}%` },
              { label: "Total Issues", value: orderedIssues.length },
              { label: "Critical Issues", value: highCount },
              { label: "Passed Checks", value: passedChecks },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">{stat.value}</div>
              </div>
            ))}
          </div>
          {orderedIssues.map((issue, idx) => (
            <FindingItem
              key={idx}
              issue={issue}
              forceExpanded={forceExpanded}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AuditFindingsPanel: React.FC<AuditFindingsPanelProps> = ({
  filteredIssues,
  allIssues,
  selectedCategory,
  setSelectedCategory,
  selectedSeverity,
  setSelectedSeverity,
  searchTerm,
  setSearchTerm,
  allExpanded,
  setAllExpanded
}) => {
  // Group by category
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const catIssues = filteredIssues.filter(i => i.category === cat);
    if (catIssues.length > 0) acc[cat] = catIssues;
    return acc;
  }, {} as Record<string, AuditIssue[]>);

  // Catch-all for unexpected categories
  const knownCats = new Set(CATEGORY_ORDER);
  filteredIssues.forEach(i => {
    if (!knownCats.has(i.category)) {
      if (!grouped[i.category]) grouped[i.category] = [];
      grouped[i.category].push(i);
    }
  });

  const hasActiveFilters = selectedCategory !== "all" || selectedSeverity !== "all" || searchTerm !== "";

  return (
    <div className="space-y-5 animate-slide-up delay-500">
      {/* Header + Controls */}
      <div className="dash-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Audit Findings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""} found
              {hasActiveFilters && ` (filtered from ${allIssues.length} total)`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-48 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >×</button>
              )}
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Filter className="h-3 w-3 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                className="text-xs bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Code Quality">Code Quality</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Responsiveness">Responsiveness</option>
                <option value="Typography">Typography</option>
                <option value="Color Theme">Color Theme</option>
                <option value="Performance">Performance</option>
                <option value="Accessibility">Accessibility</option>
              </select>
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
                className="text-xs bg-transparent border-none text-slate-700 focus:outline-none cursor-pointer font-medium"
              >
                <option value="all">All Severities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Expand / Collapse All */}
            <button
              onClick={() => setAllExpanded(!allExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              {allExpanded
                ? <><EyeOff className="h-3.5 w-3.5" /> Collapse All</>
                : <><Eye className="h-3.5 w-3.5" /> Expand All</>
              }
            </button>

            {/* Reset filters */}
            {hasActiveFilters && (
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedSeverity("all"); setSearchTerm(""); }}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="dash-card p-5 bg-gradient-to-br from-primary-50 via-white to-violet-50 border-primary-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-primary-100 text-primary-700 text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Mentor Guidance
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Your report, translated into plain English</h3>
            <p className="text-sm text-slate-600 mt-1">Each finding now explains what it means, why it matters, and how to improve it in a simple, practical way.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ArrowRight className="h-4 w-4 text-primary-600" />
            Friendly for beginners and professionals alike
          </div>
        </div>
      </div>

      {/* Issue List */}
      {filteredIssues.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">No Issues Found</h4>
          <p className="text-sm text-slate-500">
            {hasActiveFilters
              ? "No issues match your current filters. Try adjusting them."
              : "All checks passed for this category!"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, issues]) => (
            <CategorySection
              key={cat}
              category={cat}
              issues={issues}
              forceExpanded={allExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
};


