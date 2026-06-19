import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Monitor,
  Smartphone,
  Tablet,
  Layout,
  Code,
  Palette,
  Type,
  Zap,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Download,
  User,
  LogOut,
  History,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { AuditReport, CategoryFilter, SeverityFilter } from "./types";
import { CircularProgress } from "./components/CircularProgress";
import { IssueItem } from "./components/IssueItem";
import { LoadingScreen } from "./components/LoadingScreen";
import { HomeState } from "./components/HomeState";
import { exportReportToPDF } from "./utils/pdfGenerator";
import { SplashScreen } from "./components/SplashScreen";
import { AuthScreen, UserProfile } from "./components/AuthScreen";
import { SEOToolsHub } from "./components/SEOToolsHub";
import { HistoryDashboard } from "./pages/HistoryDashboard";

export default function App() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(() => {
    return localStorage.getItem("ms_splash_dismissed") !== "true";
  });

  // Authentication State
  const [currUser, setCurrUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("ms_user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Saved Audits History
  const [auditHistory, setAuditHistory] = useState<Array<{ url: string; date: string; score: number }>>(() => {
    try {
      const saved = localStorage.getItem("ms_audit_history");
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default mock history for personalized UX
    return [
      { url: "react.dev", date: "2026-06-15", score: 94 },
      { url: "wikipedia.org", date: "2026-06-12", score: 86 },
      { url: "news.ycombinator.com", date: "2026-06-10", score: 77 }
    ];
  });

  // Save history to localstorage
  useEffect(() => {
    localStorage.setItem("ms_audit_history", JSON.stringify(auditHistory));
  }, [auditHistory]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrUser(profile);
    localStorage.setItem("ms_user_profile", JSON.stringify(profile));
  };

  const handleLogout = () => {
    setCurrUser(null);
    localStorage.removeItem("ms_user_profile");
  };

  const handleDeleteEntry = (url: string) => {
    setAuditHistory((prev) => prev.filter((item) => item.url !== url));
  };

  const handleClearHistory = () => {
    setAuditHistory([]);
    localStorage.removeItem("ms_audit_history");
  };

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>("all");

  const handleRunAudit = async (targetUrl: string) => {
    setLoading(true);
    setErrorMsg("");
    setReport(null);
    setCurrentUrl(targetUrl);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
      
      // Append completed audit records to the interactive history matrix
      const shortDomain = targetUrl.replace(/https?:\/\/(www\.)?/, "");
      setAuditHistory((prev) => {
        const filtered = prev.filter((item) => item.url !== shortDomain);
        return [
          { url: shortDomain, date: new Date().toISOString().slice(0, 10), score: data.overall_score },
          ...filtered
        ].slice(0, 10);
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while generating the audit.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setErrorMsg("");
    setCurrentUrl("");
    setSelectedCategory("all");
    setSelectedSeverity("all");
  };

  // Filter issues logic
  const filteredIssues = report
    ? report.issues.filter((issue) => {
        const matchCategory = selectedCategory === "all" || issue.category === selectedCategory;
        const matchSeverity = selectedSeverity === "all" || issue.severity === selectedSeverity;
        return matchCategory && matchSeverity;
      })
    : [];

  // Helper to colorize categorical badges in scorecards
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
    if (score >= 55) return "text-amber-400 bg-amber-950/20 border-amber-900/40";
    return "text-rose-400 bg-rose-950/20 border-rose-900/40";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] selection:bg-brand-500 selection:text-white pb-20">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#222] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                Mentor<span className="font-medium text-blue-400">Docks</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:inline">
              PRO DIAGNOSTICS
            </span>

            {/* History Dashboard Toggle */}
            <button
              id="open-history-dashboard"
              onClick={() => setShowHistory(true)}
              title="View Search History"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#222] hover:border-zinc-700 hover:bg-[#1a1a1a] text-zinc-400 hover:text-blue-400 text-xs font-semibold rounded-lg transition cursor-pointer shadow-inner shrink-0"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
              {auditHistory.length > 0 && (
                <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-[10px] px-1.5 rounded-full leading-none py-0.5">
                  {auditHistory.length}
                </span>
              )}
            </button>

            {/* Authentication user profile pill */}
            {currUser ? (
              <div className="flex items-center gap-2 bg-[#121212] border border-[#222] p-1 pr-3 rounded-full text-xs">
                <div className="h-6 w-6 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-[10px]">
                  {currUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-bold leading-none text-zinc-300 text-[11px] truncate max-w-[90px]">{currUser.name}</p>
                  <p className="text-[8px] font-mono font-semibold text-zinc-500 tracking-wider uppercase leading-none mt-0.5">{currUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer transition ml-1 shrink-0"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#222] hover:border-zinc-700 hover:bg-[#1a1a1a] text-zinc-200 text-xs font-semibold rounded-lg transition cursor-pointer shadow-inner shrink-0"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}

            {report && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => exportReportToPDF(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm"
                  title="Download PDF Report"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download PDF Report</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#2c2c2c] hover:bg-[#1f1f1f] rounded-lg text-xs font-semibold text-slate-300 cursor-pointer transition shadow-sm"
                  title="Audit New URL"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Audit New URL</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Page Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10">
        {/* Loading Phase */}
        {loading && <LoadingScreen url={currentUrl} />}

        {/* Error States */}
        {errorMsg && (
          <div className="max-w-xl mx-auto bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-display text-base">Audit Operation Failed</h3>
                <p className="text-sm text-rose-600 mt-1 leading-relaxed">
                  {errorMsg}
                </p>
                <p className="text-xs text-rose-500 mt-2 font-medium">
                  Tip: Confirm that the URL is valid, public-facing, and allows network connections. You can try a simplified domain format like "wikipedia.org".
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-2 bg-white border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-100/50 transition font-semibold text-xs shrink-0 cursor-pointer"
            >
              Back to Home State
            </button>
          </div>
        )}

        {/* Home Landing Page (no report, no loading, no error) */}
        {!report && !loading && !errorMsg && (
          <div className="space-y-12">
            <HomeState onAudit={handleRunAudit} isLoading={loading} />
            
            {/* Interactive saved queries, personalized diagnostic badges and previous audit logs */}
            <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-[#222]/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-44 h-44 bg-gradient-to-tr from-blue-500/5 to-transparent blur-[40px] pointer-events-none rounded-full" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-extrabold text-[#e0e0e0] text-sm leading-tight">
                      {currUser ? `${currUser.name}'s Search Logbook` : "Interactive Workspace History"}
                    </h3>
                    <p className="text-[10px] text-zinc-500">
                      Fast recall of previously parsed domains and evaluation indexes
                    </p>
                  </div>
                </div>

                {!currUser ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs bg-zinc-900 hover:bg-[#161616] border border-zinc-800 text-blue-400 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition self-start"
                  >
                    🔐 Unlock Sync Settings
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Premium Local Engine Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {auditHistory.map((hist, hidx) => (
                  <div
                    key={hidx}
                    onClick={() => handleRunAudit(hist.url)}
                    className="bg-[#121212]/40 hover:bg-[#141414] border border-[#1e1e1e] hover:border-blue-500/30 p-3 rounded-xl flex items-center justify-between cursor-pointer transition shadow-sm relative group text-left"
                  >
                    <div className="space-y-1">
                      <p className="font-mono text-xs font-bold text-zinc-300 truncate max-w-[155px] group-hover:text-blue-400 transition">
                        {hist.url}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-mono tracking-tight flex items-center gap-1 leading-none">
                        <Clock className="h-3 w-3 inline shrink-0 text-zinc-600" />
                        Scanned {hist.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border leading-none ${
                        hist.score >= 90 ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30" : "text-amber-400 bg-amber-950/20 border-amber-900/40"
                      }`}>
                        {hist.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Report Container */}
        {report && !loading && !errorMsg && (
          <div className="space-y-10 animate-fade-in">
            {/* Report Jumbotron Header */}
            <div className="bg-[#0a0a0a] rounded-xl border border-[#222] shadow-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-full">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                  DIAGNOSIS COMPLETE
                </span>
                <div className="flex items-center gap-2 flex-wrap max-w-full">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight select-all font-mono break-all">
                    {report.website_url}
                  </h2>
                  <a
                    href={report.website_url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="p-1 text-slate-500 hover:text-white hover:bg-zinc-800 rounded transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-xs text-[#666] font-mono flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Audited on {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>

                {currUser && (
                  <div className="mt-4 flex items-center gap-2.5 p-2.5 px-3.5 bg-blue-950/15 border border-blue-900/30 rounded-xl text-left max-w-xl">
                    <Briefcase className="h-4 w-4 text-blue-400 shrink-0" />
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      <span className="font-bold text-white">Advisory Tip ({currUser.role}):</span> Prioritizing {
                        currUser.role === "Developer" 
                          ? "code structure semantics, layout parameters and responsive script payloads"
                          : currUser.role === "UI/UX Designer"
                          ? "WCAG contrast specifications, line-height intervals and branding layout rhythm"
                          : currUser.role === "SEO Architect"
                          ? "google preview snippet lengths, heading arrangements and crawl index parameters"
                          : "performance payload optimization, paint speeds and accessibility validation logs"
                      }. Use the sandbox below to tweak metadata tags!
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => exportReportToPDF(report)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF Report
                  </button>
                </div>
              </div>

              {/* Overall circular rating */}
              <div className="flex items-center gap-4 bg-[#141414] p-3.5 rounded-xl border border-[#222]">
                <CircularProgress score={report.overall_score} size={88} strokeWidth={8} label="Rating" />
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Scale Grade</span>
                  <span className="text-lg font-bold text-white block">
                    {report.overall_score >= 90 ? "Excellent / Robust" : report.overall_score >= 55 ? "Needs Remediation" : "Critical Repair"}
                  </span>
                  <span className="text-xs font-medium text-[#888] block">
                    {report.issues.length} flagged diagnostics
                  </span>
                </div>
              </div>
            </div>

            {/* Scoreboard Matrix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality</span>
                  <Code className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.code_quality_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.code_quality_score)}`}>
                    Code
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Design</span>
                  <Layout className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.design_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.design_score)}`}>
                    UI/UX
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile</span>
                  <Smartphone className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.responsiveness_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.responsiveness_score)}`}>
                    Responsive
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fonts</span>
                  <Type className="h-4 w-4 text-pink-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.typography_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.typography_score)}`}>
                    Typography
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Theme</span>
                  <Palette className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.color_theme_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.color_theme_score)}`}>
                    Contrast
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Speed</span>
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.performance_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.performance_score)}`}>
                    Speed
                  </span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#222] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#333] transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Access</span>
                  <Accessibility className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-white font-mono block">{report.accessibility_score}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${getScoreColorClass(report.accessibility_score)}`}>
                    WCAG
                  </span>
                </div>
              </div>
            </div>

            {/* Executive Summary Card from Gemini */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 text-[#e0e0e0] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-indigo-500/10 pointer-events-none">
                <Sparkles className="h-36 w-36" style={{ transform: "rotate(15deg)" }} />
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Expert Executive Synthesis
                </div>
                <h3 className="text-xl font-bold font-display tracking-tight text-white mb-2">
                  Auditor Appraisal
                </h3>
                <p className="text-[#aaa] text-sm leading-relaxed whitespace-pre-line">
                  {report.summary}
                </p>
              </div>
            </div>

            {/* Core Priority Repairs Bar */}
            {report.priority_fixes && report.priority_fixes.length > 0 && (
              <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-6 space-y-4 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="p-1 px-1.5 bg-amber-500/20 border border-amber-900/40 text-amber-400 rounded text-xs font-bold font-mono">PRIORITY_FIXES</span>
                  <h3 className="text-base font-bold font-display tracking-tight">
                    Immediate Action Recommended
                  </h3>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {report.priority_fixes.map((fixString, fixIdx) => (
                    <li
                      key={fixIdx}
                      className="bg-[#0e0e0e] p-3.5 rounded-lg border border-[#222] flex items-start gap-2.5 shadow-sm hover:border-amber-950/50 transition animate-fade-in"
                    >
                      <span className="h-5 w-5 rounded-full bg-amber-950/30 border border-amber-900/50 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {fixIdx + 1}
                      </span>
                      <p className="text-xs text-[#ccc] leading-relaxed font-semibold">
                        {fixString}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive SEO Expert diagnostic sandbox tools suite */}
            <SEOToolsHub report={report} targetUrl={currentUrl} />

            {/* Main Issue Listing & Categories */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Audit Findings ({filteredIssues.length} found)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Filter by system category and urgency severity
                  </p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <Filter className="h-3.5 w-3.5" /> Category:
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                    className="text-xs bg-[#0f0f0f] border border-[#292929] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500 font-medium cursor-pointer hover:bg-zinc-900 transition"
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

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    Severity:
                  </div>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
                    className="text-xs bg-[#0f0f0f] border border-[#292929] rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500 font-medium cursor-pointer hover:bg-zinc-900 transition"
                  >
                    <option value="all">All Severities</option>
                    <option value="High">High Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="Low">Low Severity</option>
                  </select>
                </div>
              </div>

              {/* Grid of Results */}
              {filteredIssues.length === 0 ? (
                <div className="text-center p-12 bg-[#0a0a0a] rounded-lg border border-[#222] shadow-lg max-w-xl mx-auto space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Clear Scan Diagnostic</h4>
                  <p className="text-xs text-gray-500">
                    Zero flagged issues found for this specific category matching combination. Give yourself a high-five or loosen filters!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue, index) => (
                    <IssueItem key={index} issue={issue} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modern High-fidelity Splash Screen Boot Layer */}
      {showSplash && (
        <SplashScreen 
          onDismiss={() => { 
            setShowSplash(false); 
            localStorage.setItem("ms_splash_dismissed", "true"); 
          }} 
        />
      )}

      {/* Simulated authentication account flow gating */}
      {showAuthModal && (
        <AuthScreen 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {/* Full Search History Dashboard */}
      {showHistory && (
        <HistoryDashboard
          history={auditHistory}
          currUser={currUser}
          onReaudit={handleRunAudit}
          onDeleteEntry={handleDeleteEntry}
          onClearAll={handleClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
