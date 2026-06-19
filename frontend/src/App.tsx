import React, { useState, useEffect, useRef } from "react";
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
  Briefcase,
  ArrowUp,
  ChevronUp,
  Moon,
  Sun
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

  // ── Back-to-top button state ──
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Section navigation active state (IntersectionObserver) ──
  const [activeSection, setActiveSection] = useState("scores");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!report) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-120px 0px -40% 0px", threshold: 0.3 }
    );

    const sections = ["scores", "summary", "priority-fixes", "seo-tools", "issues"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [report]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Issue severity counts for quick-stats strip
  const severityCounts = report
    ? {
        high: report.issues.filter((i) => i.severity === "High").length,
        medium: report.issues.filter((i) => i.severity === "Medium").length,
        low: report.issues.filter((i) => i.severity === "Low").length,
      }
    : { high: 0, medium: 0, low: 0 };

  // Helper to colorize categorical badges in scorecards
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
    if (score >= 55) return "text-amber-400 bg-amber-950/20 border-amber-900/40";
    return "text-rose-400 bg-rose-950/20 border-rose-900/40";
  };

  // Helper to get progress bar fill color
  const getProgressBarColor = (score: number) => {
    if (score >= 90) return "bg-emerald-400";
    if (score >= 55) return "bg-amber-400";
    return "bg-rose-400";
  };

  // Helper to get human-readable score label
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Great";
    if (score >= 70) return "Good";
    if (score >= 55) return "Fair";
    return "Poor";
  };

  // Section nav items
  const sectionNavItems = [
    { id: "scores", label: "Scores" },
    { id: "summary", label: "Summary" },
    { id: "priority-fixes", label: "Priority Fixes" },
    { id: "seo-tools", label: "SEO Tools" },
    { id: "issues", label: "Issues" },
  ];

  // Score card data
  const scoreCards = report ? [
    { label: "Quality", sublabel: "Code", score: report.code_quality_score, icon: <Code className="h-4 w-4 text-blue-400" /> },
    { label: "Design", sublabel: "UI/UX", score: report.design_score, icon: <Layout className="h-4 w-4 text-indigo-400" /> },
    { label: "Mobile", sublabel: "Responsive", score: report.responsiveness_score, icon: <Smartphone className="h-4 w-4 text-purple-400" /> },
    { label: "Fonts", sublabel: "Typography", score: report.typography_score, icon: <Type className="h-4 w-4 text-pink-400" /> },
    { label: "Theme", sublabel: "Contrast", score: report.color_theme_score, icon: <Palette className="h-4 w-4 text-emerald-400" /> },
    { label: "Speed", sublabel: "Performance", score: report.performance_score, icon: <Zap className="h-4 w-4 text-amber-400" /> },
    { label: "Access", sublabel: "WCAG", score: report.accessibility_score, icon: <Accessibility className="h-4 w-4 text-emerald-400" /> },
  ] : [];

  return (
    <div className="min-h-screen bg-custom-cream text-custom-choco selection:bg-brand-500 selection:text-white pb-20">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-custom-cream/90 backdrop-blur border-b border-custom-choco/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleReset}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-custom-rose flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-custom-choco tracking-tight">
                Mentor<span className="font-medium text-custom-ochre">Docks</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <span className="text-xs font-semibold text-custom-choco/60 uppercase tracking-widest hidden md:inline">
              PRO DIAGNOSTICS
            </span>

            {/* History Dashboard Toggle */}
            <button
              id="open-history-dashboard"
              onClick={() => setShowHistory(true)}
              title="View Search History"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-custom-sand border border-custom-choco/20 hover:border-custom-choco/30 hover:bg-custom-yellow/20 text-custom-choco/80 hover:text-blue-400 text-xs font-semibold rounded-lg transition cursor-pointer shadow-inner shrink-0"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
              {auditHistory.length > 0 && (
                <span className="bg-custom-ochre/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-[10px] px-1.5 rounded-full leading-none py-0.5">
                  {auditHistory.length}
                </span>
              )}
            </button>

            {/* Authentication user profile pill */}
            {currUser ? (
              <div className="flex items-center gap-2 bg-custom-sand border border-custom-choco/20 p-1 pr-3 rounded-full text-xs">
                <div className="h-6 w-6 rounded-full bg-custom-ochre/10 border border-custom-ochre/20 text-blue-400 font-mono font-bold flex items-center justify-center text-[10px]">
                  {currUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-bold leading-none text-custom-choco text-[11px] truncate max-w-[90px]">{currUser.name}</p>
                  <p className="text-[8px] font-mono font-semibold text-custom-choco/60 tracking-wider uppercase leading-none mt-0.5">{currUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1 hover:bg-custom-yellow/20 rounded text-custom-choco/80 hover:text-custom-choco cursor-pointer transition ml-1 shrink-0"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-custom-sand border border-custom-choco/20 hover:border-custom-choco/30 hover:bg-custom-yellow/20 text-custom-choco text-xs font-semibold rounded-lg transition cursor-pointer shadow-inner shrink-0"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}

            {report && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => exportReportToPDF(report)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-custom-cream text-custom-choco hover:bg-custom-yellow/20 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm"
                  title="Download PDF Report"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download PDF Report</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-custom-sand border border-[#2c2c2c] hover:bg-custom-yellow/20 rounded-lg text-xs font-semibold text-custom-choco cursor-pointer transition shadow-sm"
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

      {/* ── Sticky Section Navigation (only when report visible) ── */}
      {report && !loading && !errorMsg && (
        <nav className="sticky top-[65px] z-40 section-nav bg-custom-cream/80 border-b border-custom-choco/20 px-6 py-0">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {sectionNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`section-nav-item px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                  activeSection === item.id
                    ? "text-blue-400 bg-custom-ochre/10 active"
                    : "text-custom-choco/60 hover:text-custom-choco hover:bg-custom-yellow/20/50"
                }`}
              >
                {item.label}
                {item.id === "issues" && (
                  <span className="ml-1.5 text-[10px] font-mono bg-custom-sand border border-custom-choco/20 px-1.5 py-0.5 rounded-full">
                    {report.issues.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

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
              className="w-full py-2 bg-custom-cream border border-rose-200 text-rose-700 rounded-xl hover:bg-rose-100/50 transition font-semibold text-xs shrink-0 cursor-pointer"
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
            <div className="max-w-4xl mx-auto bg-custom-cream border border-custom-choco/20/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-44 h-44 bg-gradient-to-tr from-blue-500/5 to-transparent blur-[40px] pointer-events-none rounded-full" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-custom-choco/20 pb-4 gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 text-blue-400 bg-custom-ochre/10 border border-custom-ochre/20 rounded-lg flex items-center justify-center">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-extrabold text-custom-choco text-sm leading-tight">
                      {currUser ? `${currUser.name}'s Search Logbook` : "Interactive Workspace History"}
                    </h3>
                    <p className="text-[10px] text-custom-choco/60">
                      Fast recall of previously parsed domains and evaluation indexes
                    </p>
                  </div>
                </div>

                {!currUser ? (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs bg-custom-sand hover:bg-[#161616] border border-custom-choco/20 text-blue-400 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition self-start"
                  >
                    🔐 Unlock Sync Settings
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-custom-choco/60 uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Premium Local Engine Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {auditHistory.map((hist, hidx) => (
                  <div
                    key={hidx}
                    onClick={() => handleRunAudit(hist.url)}
                    className="bg-custom-sand/40 hover:bg-custom-yellow/20 border border-custom-choco/20 hover:border-blue-500/30 p-3 rounded-xl flex items-center justify-between cursor-pointer transition shadow-sm relative group text-left"
                  >
                    <div className="space-y-1">
                      <p className="font-mono text-xs font-bold text-custom-choco truncate max-w-[155px] group-hover:text-blue-400 transition">
                        {hist.url}
                      </p>
                      <p className="text-[9px] text-custom-choco/60 font-mono tracking-tight flex items-center gap-1 leading-none">
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
            <div className="bg-custom-cream rounded-xl border border-custom-choco/20 shadow-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-full">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-custom-ochre/10 border border-custom-ochre/20 px-2.5 py-1 rounded">
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
                    className="p-1 text-custom-choco/60 hover:text-custom-choco hover:bg-custom-yellow/20 rounded transition"
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
                    <p className="text-xs text-custom-choco font-sans leading-relaxed">
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
                    className="inline-flex items-center gap-2 px-4 py-2 bg-custom-ochre hover:bg-custom-yellow text-white font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    Export PDF Report
                  </button>
                </div>
              </div>

              {/* Overall circular rating */}
              <div className="flex items-center gap-4 bg-custom-sand p-3.5 rounded-xl border border-custom-choco/20">
                <CircularProgress score={report.overall_score} size={88} strokeWidth={8} label="Rating" />
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-custom-choco/60 uppercase tracking-wider block">Scale Grade</span>
                  <span className="text-lg font-bold text-white block">
                    {report.overall_score >= 90 ? "Excellent / Robust" : report.overall_score >= 55 ? "Needs Remediation" : "Critical Repair"}
                  </span>
                  <span className="text-xs font-medium text-[#888] block">
                    {report.issues.length} flagged diagnostics
                  </span>
                </div>
              </div>
            </div>

            {/* ── Quick Stats — Severity Badge Strip ── */}
            <div className="flex flex-wrap items-center gap-3 bg-custom-cream border border-custom-choco/20 rounded-xl p-4 shadow-md">
              <span className="text-xs font-semibold text-custom-choco/60 uppercase tracking-wider mr-1">Quick Filter:</span>

              <button
                onClick={() => { setSelectedSeverity("all"); setSelectedCategory("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedSeverity === "all"
                    ? "bg-custom-ochre/15 border-blue-500/30 text-blue-400"
                    : "bg-custom-sand border-custom-choco/20 text-custom-choco/80 hover:text-custom-choco hover:border-zinc-600"
                }`}
              >
                All Issues
                <span className="font-mono text-[10px] bg-custom-sand border border-custom-choco/20 px-1.5 py-0.5 rounded-full">
                  {report.issues.length}
                </span>
              </button>

              <button
                onClick={() => { setSelectedSeverity("High"); setSelectedCategory("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedSeverity === "High"
                    ? "bg-rose-950/30 border-rose-900/50 text-rose-400"
                    : "bg-custom-sand border-custom-choco/20 text-custom-choco/80 hover:text-rose-400 hover:border-rose-900/40"
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                High
                <span className="font-mono text-[10px] bg-custom-sand border border-custom-choco/20 px-1.5 py-0.5 rounded-full">
                  {severityCounts.high}
                </span>
              </button>

              <button
                onClick={() => { setSelectedSeverity("Medium"); setSelectedCategory("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedSeverity === "Medium"
                    ? "bg-amber-950/30 border-amber-900/50 text-amber-400"
                    : "bg-custom-sand border-custom-choco/20 text-custom-choco/80 hover:text-amber-400 hover:border-amber-900/40"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Medium
                <span className="font-mono text-[10px] bg-custom-sand border border-custom-choco/20 px-1.5 py-0.5 rounded-full">
                  {severityCounts.medium}
                </span>
              </button>

              <button
                onClick={() => { setSelectedSeverity("Low"); setSelectedCategory("all"); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedSeverity === "Low"
                    ? "bg-custom-sand/60 border-zinc-600/50 text-custom-choco"
                    : "bg-custom-sand border-custom-choco/20 text-custom-choco/80 hover:text-custom-choco hover:border-zinc-600"
                }`}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Low
                <span className="font-mono text-[10px] bg-custom-sand border border-custom-choco/20 px-1.5 py-0.5 rounded-full">
                  {severityCounts.low}
                </span>
              </button>
            </div>

            {/* Scoreboard Matrix Cards — with progress bars */}
            <div id="scores" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {scoreCards.map((card, idx) => (
                <div
                  key={card.label}
                  className="bg-custom-cream p-4 rounded-xl border border-custom-choco/20 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#444] hover:shadow-md transition-all duration-200 animate-fade-in-up group"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-custom-choco/60 uppercase tracking-wider">{card.label}</span>
                    <div className="group-hover:scale-110 transition-transform duration-200">
                      {card.icon}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-end gap-1.5">
                      <span className="text-2xl font-bold tracking-tight text-white font-mono block">{card.score}</span>
                      <span className="text-[10px] font-semibold text-custom-choco/60 mb-1">{getScoreLabel(card.score)}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-custom-sand/60 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full score-progress-bar ${getProgressBarColor(card.score)}`}
                        style={{ width: `${card.score}%`, animationDelay: `${idx * 80 + 300}ms` }}
                      />
                    </div>

                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-2 ${getScoreColorClass(card.score)}`}>
                      {card.sublabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Executive Summary Card from Gemini */}
            <div id="summary" className="bg-custom-cream border border-custom-choco/20 rounded-xl p-6 text-custom-choco shadow-xl relative overflow-hidden">
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
              <div id="priority-fixes" className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-6 space-y-4 shadow-lg">
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
                      className="bg-custom-sand p-3.5 rounded-lg border border-custom-choco/20 flex items-start gap-2.5 shadow-sm hover:border-amber-950/50 transition animate-fade-in"
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
            <div id="seo-tools">
              <SEOToolsHub report={report} targetUrl={currentUrl} />
            </div>

            {/* Main Issue Listing & Categories */}
            <div id="issues" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-custom-choco/20 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Audit Findings ({filteredIssues.length} found)
                  </h3>
                  <p className="text-xs text-custom-choco/60">
                    Click any issue to expand details · Filter by category and severity
                  </p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-custom-choco/60">
                    <Filter className="h-3.5 w-3.5" /> Category:
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                    className="text-xs bg-custom-sand border border-[#292929] rounded-lg px-2.5 py-1.5 text-custom-choco focus:outline-none focus:border-brand-500 font-medium cursor-pointer hover:bg-custom-yellow/20 transition"
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

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-custom-choco/60">
                    Severity:
                  </div>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
                    className="text-xs bg-custom-sand border border-[#292929] rounded-lg px-2.5 py-1.5 text-custom-choco focus:outline-none focus:border-brand-500 font-medium cursor-pointer hover:bg-custom-yellow/20 transition"
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
                <div className="text-center p-12 bg-custom-cream rounded-lg border border-custom-choco/20 shadow-lg max-w-xl mx-auto space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Clear Scan Diagnostic</h4>
                  <p className="text-xs text-custom-choco/60">
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

      {/* ── Back-to-top floating button ── */}
      {report && showBackToTop && (
        <button
          onClick={scrollToTop}
          className="back-to-top-btn fixed bottom-8 right-8 z-50 h-11 w-11 rounded-full bg-custom-ochre hover:bg-custom-yellow text-white shadow-lg hover:shadow-xl flex items-center justify-center cursor-pointer transition-all duration-200 border border-blue-400/20"
          title="Back to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

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
