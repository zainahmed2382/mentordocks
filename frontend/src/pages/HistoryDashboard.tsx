import React, { useState, useMemo, useEffect } from "react";
import {
  History,
  Search,
  Trash2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Filter,
  X,
  ChevronRight,
  BarChart2,
  Award,
  AlertTriangle,
  Star,
  Zap,
  ArrowUpRight,
  Calendar,
  Download,
  ExternalLink,
  Activity,
} from "lucide-react";
import { UserProfile } from "../components/AuthScreen";

export interface HistoryEntry {
  url: string;
  date: string;
  score: number;
}

interface HistoryDashboardProps {
  history: HistoryEntry[];
  currUser: UserProfile | null;
  onReaudit: (url: string) => void;
  onDeleteEntry: (url: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

type SortMode = "date_desc" | "date_asc" | "score_desc" | "score_asc";

function getScoreLabel(score: number) {
  if (score >= 90) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-900/40", dot: "bg-emerald-400" };
  if (score >= 70) return { label: "Good", color: "text-blue-400", bg: "bg-blue-950/30", border: "border-blue-900/40", dot: "bg-blue-400" };
  if (score >= 50) return { label: "Fair", color: "text-amber-400", bg: "bg-amber-950/30", border: "border-amber-900/40", dot: "bg-amber-400" };
  return { label: "Poor", color: "text-rose-400", bg: "bg-rose-950/30", border: "border-rose-900/40", dot: "bg-rose-400" };
}

function ScoreBar({ score }: { score: number }) {
  const { color } = getScoreLabel(score);
  const barColor = score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-blue-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="relative h-1.5 w-full bg-custom-sand/60 rounded-full overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  colorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
}) {
  return (
    <div className="bg-custom-sand border border-custom-choco/20 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#2a2a2a] transition group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-[60px] opacity-20 pointer-events-none ${colorClass}`} />
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${colorClass} bg-current/10 border border-current/20`}>
        <Icon className={`h-4.5 w-4.5 text-current`} style={{ opacity: 1 }} />
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-mono uppercase tracking-widest text-custom-choco/60 mb-1">{label}</p>
        <p className="text-2xl font-extrabold font-display text-white tracking-tight leading-none">{value}</p>
        {sub && <p className="text-[11px] text-custom-choco/60 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function HistoryDashboard({
  history,
  currUser,
  onReaudit,
  onDeleteEntry,
  onClearAll,
  onClose,
}: HistoryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date_desc");
  const [scoreFilter, setScoreFilter] = useState<"all" | "excellent" | "good" | "fair" | "poor">("all");
  const [confirmClear, setConfirmClear] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const scores = history.map((h) => h.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const bestEntry = history.find((h) => h.score === best);
    const excellent = history.filter((h) => h.score >= 90).length;
    const trend = history.length >= 2 ? history[0].score - history[1].score : 0;
    return { avg, best, worst, bestEntry, excellent, trend };
  }, [history]);

  // Filter and sort
  const filtered = useMemo(() => {
    let list = [...history];
    if (searchQuery.trim()) {
      list = list.filter((h) => h.url.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (scoreFilter !== "all") {
      list = list.filter((h) => {
        if (scoreFilter === "excellent") return h.score >= 90;
        if (scoreFilter === "good") return h.score >= 70 && h.score < 90;
        if (scoreFilter === "fair") return h.score >= 50 && h.score < 70;
        if (scoreFilter === "poor") return h.score < 50;
        return true;
      });
    }
    list.sort((a, b) => {
      if (sortMode === "date_desc") return b.date.localeCompare(a.date);
      if (sortMode === "date_asc") return a.date.localeCompare(b.date);
      if (sortMode === "score_desc") return b.score - a.score;
      if (sortMode === "score_asc") return a.score - b.score;
      return 0;
    });
    return list;
  }, [history, searchQuery, sortMode, scoreFilter]);

  // Mini sparkline data (last 7 audits by date)
  const sparkData = useMemo(() => {
    return [...history]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [history]);

  const maxSparkScore = Math.max(...sparkData.map((d) => d.score), 1);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl bg-custom-cream border border-[#1c1c1c] rounded-3xl shadow-2xl relative flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Decorative ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-blue-500/6 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/4 blur-[80px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="relative z-10 border-b border-custom-choco/20 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-custom-ochre/30 to-custom-rose/20 border border-custom-ochre/20 flex items-center justify-center">
              <History className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-white text-lg tracking-tight leading-none">
                {currUser ? `${currUser.name}'s` : "Your"} Audit History
              </h2>
              <p className="text-[11px] text-custom-choco/60 mt-0.5 font-mono">
                {history.length} total scan{history.length !== 1 ? "s" : ""} · Local workspace engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-lg hover:bg-rose-950/40 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              id="history-dashboard-close"
              className="h-8 w-8 flex items-center justify-center rounded-xl bg-custom-sand border border-[#2a2a2a] text-custom-choco/80 hover:text-custom-choco hover:border-[#3a3a3a] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {/* Confirm Clear Banner */}
          {confirmClear && (
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-rose-300">Permanently delete all {history.length} audit records?</p>
                  <p className="text-xs text-rose-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-custom-choco bg-custom-sand/60 border border-custom-choco/30/50 rounded-lg hover:bg-zinc-700/50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onClearAll(); setConfirmClear(false); }}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          )}

          {history.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 space-y-4">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-custom-sand border border-custom-choco/20 flex items-center justify-center">
                <History className="h-7 w-7 text-zinc-600" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-custom-choco">No Audit History Yet</h3>
                <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
                  Run your first website scan and it will appear here with scores and metrics.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-custom-ochre hover:bg-custom-yellow text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5" />
                Run First Audit
              </button>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    icon={BarChart2}
                    label="Avg Score"
                    value={stats.avg}
                    sub={stats.avg >= 70 ? "Above threshold" : "Needs improvement"}
                    colorClass="text-blue-400"
                  />
                  <StatCard
                    icon={Star}
                    label="Best Score"
                    value={stats.best}
                    sub={stats.bestEntry?.url.slice(0, 20)}
                    colorClass="text-emerald-400"
                  />
                  <StatCard
                    icon={Award}
                    label="Excellent Sites"
                    value={stats.excellent}
                    sub={`of ${history.length} total audited`}
                    colorClass="text-amber-400"
                  />
                  <StatCard
                    icon={Activity}
                    label="Score Trend"
                    value={stats.trend > 0 ? `+${stats.trend}` : stats.trend === 0 ? "—" : `${stats.trend}`}
                    sub="vs previous audit"
                    colorClass={stats.trend > 0 ? "text-emerald-400" : stats.trend < 0 ? "text-rose-400" : "text-custom-choco/80"}
                  />
                </div>
              )}

              {/* Score Sparkline Chart */}
              {sparkData.length > 1 && (
                <div className="bg-custom-sand border border-custom-choco/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-xs font-mono font-bold text-custom-choco uppercase tracking-widest">Score Trend (Last {sparkData.length} Audits)</h3>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {sparkData.map((entry, idx) => {
                      const heightPct = (entry.score / maxSparkScore) * 100;
                      const { dot } = getScoreLabel(entry.score);
                      const isLast = idx === sparkData.length - 1;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-custom-cream border border-[#2a2a2a] rounded-lg px-2 py-1 text-[10px] font-mono text-custom-choco whitespace-nowrap shadow-xl">
                            {entry.url.slice(0, 14)}… · {entry.score}
                          </div>
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${dot} opacity-80 group-hover:opacity-100 relative`}
                            style={{ height: `${heightPct}%`, minHeight: "6px" }}
                          >
                            {isLast && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full border-2 border-custom-choco/20 bg-blue-400 animate-pulse" />
                            )}
                          </div>
                          <p className="text-[8px] font-mono text-zinc-600 truncate w-full text-center">{entry.date.slice(5)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search + Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-custom-choco/60" />
                  <input
                    id="history-search-input"
                    type="text"
                    placeholder="Search scanned domains…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-custom-cream border border-custom-choco/20 hover:border-[#2a2a2a] focus:border-blue-500/60 rounded-xl py-2.5 pl-10 pr-4 text-xs text-custom-choco placeholder-zinc-600 focus:outline-none transition font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-choco/60 hover:text-custom-choco transition cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Score Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-custom-choco/60 pointer-events-none" />
                  <select
                    id="history-score-filter"
                    value={scoreFilter}
                    onChange={(e) => setScoreFilter(e.target.value as typeof scoreFilter)}
                    className="bg-custom-cream border border-custom-choco/20 rounded-xl py-2.5 pl-9 pr-4 text-xs text-custom-choco focus:outline-none focus:border-blue-500/60 transition cursor-pointer appearance-none font-mono"
                  >
                    <option value="all">All Scores</option>
                    <option value="excellent">Excellent (90+)</option>
                    <option value="good">Good (70–89)</option>
                    <option value="fair">Fair (50–69)</option>
                    <option value="poor">Poor (&lt;50)</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    id="history-sort-select"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="bg-custom-cream border border-custom-choco/20 rounded-xl py-2.5 px-4 text-xs text-custom-choco focus:outline-none focus:border-blue-500/60 transition cursor-pointer appearance-none font-mono"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="score_desc">Highest Score</option>
                    <option value="score_asc">Lowest Score</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-custom-choco/60 font-mono">
                  Showing <span className="text-custom-choco font-bold">{filtered.length}</span> of{" "}
                  <span className="text-custom-choco font-bold">{history.length}</span> records
                </p>
                {(searchQuery || scoreFilter !== "all") && (
                  <button
                    onClick={() => { setSearchQuery(""); setScoreFilter("all"); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-4 transition cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Audit History List */}
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-xs font-mono">
                  No matching records for current filters.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filtered.map((entry, idx) => {
                    const meta = getScoreLabel(entry.score);
                    const isRecent = idx === 0 && sortMode === "date_desc";
                    return (
                      <div
                        key={`${entry.url}-${idx}`}
                        className="group bg-custom-sand hover:bg-custom-yellow/20 border border-[#1c1c1c] hover:border-custom-ochre/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-200 relative overflow-hidden"
                      >
                        {/* Hover glow accent */}
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500/0 via-blue-500/60 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-2xl" />

                        {/* Score badge */}
                        <div className="shrink-0 flex flex-col items-center justify-center gap-1">
                          <div className={`h-12 w-12 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                            <span className={`text-lg font-extrabold font-mono ${meta.color}`}>{entry.score}</span>
                          </div>
                          <span className={`text-[9px] font-bold font-mono uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                        </div>

                        {/* Domain info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Globe className="h-3.5 w-3.5 text-custom-choco/60 shrink-0" />
                              <p className="font-mono text-sm font-bold text-custom-choco truncate group-hover:text-blue-300 transition">
                                {entry.url}
                              </p>
                            </div>
                            {isRecent && (
                              <span className="text-[9px] font-bold font-mono bg-custom-ochre/10 border border-custom-ochre/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                Latest
                              </span>
                            )}
                          </div>
                          <ScoreBar score={entry.score} />
                          <div className="flex items-center gap-1.5 text-[10px] text-custom-choco/60">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>Scanned {entry.date}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => { onReaudit(entry.url); onClose(); }}
                            title="Re-run audit"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-custom-ochre/10 hover:bg-custom-ochre/20 border border-custom-ochre/20 hover:border-blue-500/40 text-blue-400 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Re-audit</span>
                          </button>
                          <a
                            href={`https://${entry.url}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open site"
                            className="p-1.5 bg-custom-sand hover:bg-[#222] border border-[#2a2a2a] text-custom-choco/60 hover:text-custom-choco rounded-xl transition"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => onDeleteEntry(entry.url)}
                            title="Remove from history"
                            className="p-1.5 bg-custom-sand hover:bg-rose-950/30 border border-[#2a2a2a] hover:border-rose-900/40 text-zinc-600 hover:text-rose-400 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer info strip */}
              <div className="flex items-center justify-between pt-2 border-t border-custom-choco/20">
                <p className="text-[10px] text-zinc-600 font-mono flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  All data stored locally in your browser session.
                </p>
                <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-mono">
                  <Zap className="h-3 w-3 text-custom-ochre" />
                  MentorDocks PRO Engine
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
