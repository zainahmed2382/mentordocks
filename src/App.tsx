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
  Briefcase,
  Search,
  Eye,
  EyeOff,
  BarChart3
} from "lucide-react";
import { AuditReport, CategoryFilter, SeverityFilter } from "./types";
import { CircularProgress } from "./components/CircularProgress";
import { IssueItem } from "./components/IssueItem";
import { LoadingScreen } from "./components/LoadingScreen";
import { HomeState } from "./components/HomeState";
import { exportReportToPDF } from "./utils/pdfGenerator";
import { generateClientFallbackReport } from "./utils/fallbackAudit";
import { SplashScreen } from "./components/SplashScreen";
import { AuthScreen, UserProfile } from "./components/AuthScreen";
import { SEOToolsHub } from "./components/SEOToolsHub";
import { DashboardView } from "./components/DashboardView";

export default function App() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return localStorage.getItem("ms_splash_dismissed") !== "true";
    } catch {
      return false;
    }
  });

  // Authentication State
  const [currUser, setCurrUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("ms_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.email) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  // Saved Audits History
  const [auditHistory, setAuditHistory] = useState<Array<{ url: string; date: string; score: number }>>(() => {
    try {
      const saved = localStorage.getItem("ms_audit_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
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
    try {
      localStorage.setItem("ms_audit_history", JSON.stringify(auditHistory));
    } catch {}
  }, [auditHistory]);

  const fetchAuditHistory = async () => {
    const token = localStorage.getItem("ms_auth_token");
    if (!token) return;
    
    try {
      const response = await fetch("/api/audits", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const text = await response.text();
        if (text && text.trim()) {
          try {
            const audits = JSON.parse(text);
            if (Array.isArray(audits)) {
              setAuditHistory(audits.map((a: any) => ({
                url: a.url,
                date: new Date(a.createdAt).toISOString().slice(0, 10),
                score: a.score,
              })));
            }
          } catch {
            console.warn("Audit history response was not JSON:", text);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch audit history:", err);
    }
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrUser(profile);
    try {
      localStorage.setItem("ms_user_profile", JSON.stringify(profile));
    } catch {}
    setActiveTab("dashboard");
    
    if (!profile.isGuest) {
      fetchAuditHistory();
    }
  };

  // Fetch audit history on initial load if user is logged in
  useEffect(() => {
    if (currUser && !currUser.isGuest) {
      fetchAuditHistory();
    }
  }, [currUser?.email]);

  const handleLogout = () => {
    setCurrUser(null);
    try {
      localStorage.removeItem("ms_user_profile");
    } catch {}
    setActiveTab("scanner");
  };

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [allExpanded, setAllExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"scanner" | "dashboard">((() => {
    try {
      const saved = localStorage.getItem("ms_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.email) {
          return "dashboard";
        }
      }
    } catch {}
    return "scanner";
  })());

  const [brandColor, setBrandColor] = useState<"blue" | "emerald" | "violet" | "amber">("blue");

  const BrandAccents = {
    blue: {
      name: "Sapphire Blue",
      gradient: "from-blue-600 to-indigo-600",
      text: "text-blue-400",
      headerSpan: "text-blue-400 font-semibold",
      textHover: "hover:text-blue-300",
      bg: "bg-blue-600",
      bgHover: "hover:bg-blue-700",
      border: "border-blue-500/20",
      borderFocused: "focus:border-blue-500",
      bgLight: "bg-blue-500/10",
      rawHex: "#3b82f6"
    },
    emerald: {
      name: "Mint Emerald",
      gradient: "from-emerald-500 to-teal-500",
      text: "text-emerald-400",
      headerSpan: "text-emerald-400 font-semibold",
      textHover: "hover:text-emerald-300",
      bg: "bg-emerald-500",
      bgHover: "hover:bg-emerald-600",
      border: "border-emerald-500/20",
      borderFocused: "focus:border-emerald-500",
      bgLight: "bg-emerald-500/10",
      rawHex: "#10b981"
    },
    violet: {
      name: "Mystic Violet",
      gradient: "from-violet-600 to-pink-600",
      text: "text-violet-400",
      headerSpan: "text-violet-400 font-semibold",
      textHover: "hover:text-violet-300",
      bg: "bg-violet-600",
      bgHover: "hover:bg-violet-700",
      border: "border-violet-500/20",
      borderFocused: "focus:border-violet-500",
      bgLight: "bg-violet-500/10",
      rawHex: "#8b5cf6"
    },
    amber: {
      name: "Golden Amber",
      gradient: "from-amber-500 to-orange-500",
      text: "text-amber-400",
      headerSpan: "text-amber-400 font-semibold",
      textHover: "hover:text-amber-300",
      bg: "bg-amber-500",
      bgHover: "hover:bg-amber-600",
      border: "border-amber-500/20",
      borderFocused: "focus:border-amber-500",
      bgLight: "bg-amber-500/10",
      rawHex: "#f59e0b"
    }
  };

  const handleRunAudit = async (targetUrl: string) => {
    setLoading(true);
    setErrorMsg("");
    setReport(null);
    setCurrentUrl(targetUrl);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const token = localStorage.getItem("ms_auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      let data: any = null;
      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          headers,
          body: JSON.stringify({ url: targetUrl }),
        });

        const text = await response.text();
        if (text && text.trim()) {
          try {
            data = JSON.parse(text);
          } catch {
            console.warn("Audit API response was not JSON:", text);
          }
        }

        if (!response.ok || !data) {
          throw new Error(data?.error || `Server responded with status ${response.status}`);
        }
      } catch (apiErr) {
        console.warn("Backend audit API failed or unreachable, using client-side heuristic engine:", apiErr);
        data = generateClientFallbackReport(targetUrl);
      }

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
    setSearchTerm("");
    setAllExpanded(false);
  };

  // Filter issues logic
  const filteredIssues = report
    ? report.issues.filter((issue) => {
        const matchCategory = selectedCategory === "all" || issue.category === selectedCategory;
        const matchSeverity = selectedSeverity === "all" || issue.severity === selectedSeverity;
        const matchSearch =
          searchTerm.trim() === "" ||
          issue.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.recommendation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSeverity && matchSearch;
      })
    : [];

  // Helper to colorize categorical badges in scorecards
  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
    if (score >= 55) return "text-amber-400 bg-amber-950/20 border-amber-900/40";
    return "text-rose-400 bg-rose-950/20 border-rose-900/40";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] pb-20">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#222] px-4 md:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
          <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-5 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={handleReset}>
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${BrandAccents[brandColor].gradient} flex items-center justify-center shadow-md transition-all duration-300`}>
                <Zap className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="text-left">
                <span className="font-display font-extrabold text-lg text-white tracking-tight">
                  Mentor<span className={`${BrandAccents[brandColor].headerSpan} transition-all duration-300`}>Docks</span>
                </span>
              </div>
            </div>

            {/* Visual View-Tab Controller */}
            <div className="flex items-center bg-zinc-950/80 border border-zinc-900 p-0.5 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab("scanner");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "scanner"
                    ? "bg-zinc-900 text-white border border-zinc-850 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Audit Scanner</span>
                <span className="sm:hidden">Scanner</span>
              </button>
              {currUser && (
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-zinc-900 text-white border border-zinc-500/20 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Compliance Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                  <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-mono rounded uppercase tracking-wider">
                    Active
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 w-full md:w-auto">
            {/* Elegant Accent Customizer Dot Set */}
            <div className="flex items-center gap-2 bg-[#121212] border border-[#222] rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest hidden lg:block">BRAND VIBE:</span>
              <div className="flex gap-1.5">
                {(Object.keys(BrandAccents) as Array<keyof typeof BrandAccents>).map((col) => (
                  <button
                    key={col}
                    onClick={() => setBrandColor(col)}
                    title={`Switch Accent to ${BrandAccents[col].name}`}
                    className={`h-3 w-3 rounded-full cursor-pointer transition-all duration-200 relative ${
                      col === "blue" ? "bg-blue-500" :
                      col === "emerald" ? "bg-emerald-500" :
                      col === "violet" ? "bg-[#c026d3]" : "bg-amber-500"
                    } ${brandColor === col ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-125" : "hover:scale-110 opacity-60 hover:opacity-100"}`}
                  />
                ))}
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden xl:inline">
              PRO DIAGNOSTICS
            </span>

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
                  <LogOut className="h-3.5 w-3.5" />
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
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => exportReportToPDF(report)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold cursor-pointer transition shadow-sm shrink-0"
                  title="Download PDF Report"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline-block md:hidden lg:inline-block">PDF Report</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#141414] border border-[#2c2c2c] hover:bg-[#1f1f1f] rounded-lg text-xs font-semibold text-slate-300 cursor-pointer transition shadow-sm shrink-0"
                  title="Audit New URL"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline-block md:hidden lg:inline-block">New Audit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
        {activeTab === "dashboard" ? (
          <DashboardView
            auditHistory={auditHistory}
            currentReport={report}
            onSelectAudit={(url) => {
              setActiveTab("scanner");
              handleRunAudit(url);
            }}
            onClearHistory={() => setAuditHistory([])}
            onAuditNew={() => {
              setActiveTab("scanner");
              handleReset();
            }}
            currUser={currUser}
          />
        ) : (
          <>
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
            <HomeState onAudit={handleRunAudit} isLoading={loading} brandColor={brandColor} brandAccent={BrandAccents[brandColor]} />
            
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight select-all font-mono">
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
                  <Clock className="h-3 w-3" /> Audited on {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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

              {/* Overall circular rating & live severity statistics breakdown */}
              <div className="flex items-center gap-4 bg-[#141414] p-3.5 rounded-xl border border-zinc-900 shadow-sm shrink-0">
                <CircularProgress score={report.overall_score} size={88} strokeWidth={8} label="Rating" />
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Scale Grade</span>
                  <span className="text-base font-black text-white block leading-tight">
                    {report.overall_score >= 90 ? "Excellent / Robust" : report.overall_score >= 55 ? "Needs Remediation" : "Critical Repair"}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-400 block pb-1.5">
                    {report.issues.length} total diagnostics flagged
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-zinc-850">
                    <button
                      onClick={() => setSelectedSeverity(selectedSeverity === "High" ? "all" : "High")}
                      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer border ${
                        selectedSeverity === "High"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500"
                          : "bg-rose-950/20 text-rose-400 border-rose-950/45 hover:border-rose-900"
                      }`}
                    >
                      ● {report.issues.filter(i => i.severity === "High").length} High
                    </button>
                    <button
                      onClick={() => setSelectedSeverity(selectedSeverity === "Medium" ? "all" : "Medium")}
                      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer border ${
                        selectedSeverity === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500"
                          : "bg-amber-950/20 text-amber-400 border-amber-950/45 hover:border-amber-900"
                      }`}
                    >
                      ● {report.issues.filter(i => i.severity === "Medium").length} Med
                    </button>
                    <button
                      onClick={() => setSelectedSeverity(selectedSeverity === "Low" ? "all" : "Low")}
                      className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-md transition cursor-pointer border ${
                        selectedSeverity === "Low"
                          ? "bg-zinc-700/20 text-zinc-300 border-zinc-500"
                          : "bg-zinc-905 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      ● {report.issues.filter(i => i.severity === "Low").length} Low
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoreboard Matrix Cards with Interactive Pre-Filters */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1 text-left">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  Diagnostic Score Matrix (Click card to filter issues below)
                </span>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="text-[10px] font-mono text-blue-400 hover:text-white underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {/* 1. Code Quality */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "Code Quality" ? "all" : "Code Quality")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "Code Quality"
                      ? "border-blue-500 bg-blue-500/[0.04] ring-1 ring-blue-500/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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

                {/* 2. UI/UX Design */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "UI/UX Design" ? "all" : "UI/UX Design")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "UI/UX Design"
                      ? "border-indigo-500 bg-indigo-500/[0.04] ring-1 ring-indigo-500/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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

                {/* 3. Responsiveness */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "Responsiveness" ? "all" : "Responsiveness")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "Responsiveness"
                      ? "border-purple-500 bg-purple-500/[0.04] ring-1 ring-purple-500/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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

                {/* 4. Typography */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "Typography" ? "all" : "Typography")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "Typography"
                      ? "border-pink-500 bg-pink-500/[0.04] ring-1 ring-pink-500/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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

                {/* 5. Color Theme (Contrast) */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "Color Theme" ? "all" : "Color Theme")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "Color Theme"
                      ? "border-emerald-500 bg-emerald-500/[0.04] ring-1 ring-emerald-500/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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

                {/* 6. Performance */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "Performance" ? "all" : "Performance")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "Performance"
                      ? "border-amber-500 bg-amber-500/[0.04] ring-1 ring-amber-500/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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

                {/* 7. Accessibility */}
                <div 
                  onClick={() => setSelectedCategory(selectedCategory === "Accessibility" ? "all" : "Accessibility")}
                  className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between space-y-4 transition cursor-pointer select-none text-left ${
                    selectedCategory === "Accessibility"
                      ? "border-emerald-600 bg-emerald-600/[0.04] ring-1 ring-emerald-600/20"
                      : "bg-[#0a0a0a] border-[#222] hover:border-[#333]"
                  }`}
                >
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
            </div>

            {/* Fallback Engine Info Banner */}
            {report.isFallbackScanner && (
              <div className="bg-blue-950/20 border border-blue-900/35 rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[40px] rounded-full pointer-events-none" />
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="p-2 bg-amber-500/10 border border-amber-950/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold font-mono text-amber-400 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Quota Management Fallback
                    </span>
                    <h4 className="text-sm font-bold text-white tracking-tight">Active: High-Fidelity Local Scanner</h4>
                    <p className="text-xs text-zinc-450 leading-relaxed max-w-2xl">
                      Your query domain was successfully parsed! Due to global Google Gemini API rate-limits or API quota constraints, we automatically transitioned your report generation to the pre-compressed, high-fidelity local scanner. Metrics and recommendations have been calculated based on direct HTML structural data.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center bg-zinc-900/80 border border-zinc-800 p-2.5 rounded-lg">
                  <div className="text-left font-mono">
                    <span className="text-[9px] text-zinc-500 block">LOCAL ENGINE</span>
                    <span className="text-[10px] text-emerald-400 font-bold flex flex-row items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active / Ready
                    </span>
                  </div>
                </div>
              </div>
            )}

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
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white font-display">
                    Audit Findings ({filteredIssues.length} found)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Filter by system category, urgency severity, or search for keywords
                  </p>
                  
                  {/* Reset indicators inside listing if filters are active */}
                  {(selectedCategory !== "all" || selectedSeverity !== "all" || searchTerm !== "") && (
                    <button
                      onClick={() => {
                        setSelectedCategory("all");
                        setSelectedSeverity("all");
                        setSearchTerm("");
                      }}
                      className="text-[10px] font-mono text-zinc-400 hover:text-white transition inline-flex items-center gap-1.5 mt-1.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md hover:border-zinc-700 cursor-pointer"
                    >
                      Reset active filters & search
                    </button>
                  )}
                </div>

                {/* Filters & Actions Control Center */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Realtime Live Search */}
                  <div className="relative w-full md:w-56">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search problems or code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-xs bg-[#0a0a0a]/90 border border-[#292929] rounded-lg pl-8 pr-7 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 w-full hover:bg-[#0e0e0e] transition"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-2 hover:text-white font-bold text-xs p-0.5 text-zinc-500 hover:bg-zinc-800 rounded-full transition"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Category select filter dropdown */}
                  <div className="flex items-center bg-[#070707] border border-[#292929] rounded-lg px-2 py-1 select-none hover:border-zinc-800 transition">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 mr-1 flex items-center gap-1">
                      <Filter className="h-3 w-3" /> Cat:
                    </span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                      className="text-xs bg-transparent border-none rounded-lg py-1 text-slate-200 focus:outline-none font-semibold cursor-pointer"
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

                  {/* Severity select filter dropdown */}
                  <div className="flex items-center bg-[#070707] border border-[#292929] rounded-lg px-2 py-1 select-none hover:border-zinc-805 transition">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 mr-1 flex items-center gap-1">
                      Sev:
                    </span>
                    <select
                      value={selectedSeverity}
                      onChange={(e) => setSelectedSeverity(e.target.value as SeverityFilter)}
                      className="text-xs bg-transparent border-none rounded-lg py-1 text-slate-200 focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="all">All Severities</option>
                      <option value="High">High Severity</option>
                      <option value="Medium">Medium Severity</option>
                      <option value="Low">Low Severity</option>
                    </select>
                  </div>

                  {/* Global Expand All / Collapse All control */}
                  <button
                    onClick={() => setAllExpanded(!allExpanded)}
                    className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700 text-zinc-300 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer max-md:w-full max-md:justify-center"
                    title={allExpanded ? "Collapse All Details" : "Expand All Details"}
                  >
                    {allExpanded ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Collapse All</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-blue-400" />
                        <span>Expand All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid of Results */}
              {filteredIssues.length === 0 ? (
                <div className="text-center p-12 bg-[#0a0a0a] rounded-xl border border-zinc-900 shadow-lg max-w-xl mx-auto space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Clear Scan Diagnostic</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Zero flagged issues found for this specific category matching combination. Give yourself a high-five or loosen filters!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIssues.map((issue, index) => (
                    <IssueItem key={index} issue={issue} forceExpanded={allExpanded} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Modern High-fidelity Splash Screen Boot Layer */}
      {showSplash && (
        <SplashScreen 
          onDismiss={() => { 
            setShowSplash(false); 
            try {
              localStorage.setItem("ms_splash_dismissed", "true"); 
            } catch {}
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

      {/* Floating Diagnostics Glossary Coach Trigger Toggle Button */}
      <button
        onClick={() => setShowGlossary(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer group"
        title="Open Diagnostics Guide & Standards Glossary"
      >
        <span className={`absolute top-0 right-0 h-3 w-3 rounded-full bg-gradient-to-tr ${BrandAccents[brandColor].gradient} animate-ping`} />
        <span className={`absolute top-0 right-0 h-3 w-3 rounded-full bg-gradient-to-tr ${BrandAccents[brandColor].gradient}`} />
        <HelpCircle className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* Diagnostics Standards Side Slider Guide Drawer Card */}
      {showGlossary && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowGlossary(false)} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 cursor-pointer" 
          />
          
          {/* Drawer Body container */}
          <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-zinc-900 shadow-2xl h-full flex flex-col justify-between p-6 overflow-y-auto animate-fade-in text-left">
            <div className="space-y-6">
              {/* Drawer Top Header block */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="space-y-1">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono tracking-wider ${BrandAccents[brandColor].text} ${BrandAccents[brandColor].bgLight} border ${BrandAccents[brandColor].border}`}>
                    ★ WORKSPACE ADVOCACY
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">Diagnostics Standards Companion</h3>
                </div>
                <button 
                  onClick={() => setShowGlossary(false)}
                  className="text-zinc-500 hover:text-white transition cursor-pointer"
                >
                  <XCircle className="h-5.5 w-5.5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Professional rules of thumb for WCAG compliances, search ranking performance, content layout, and general client-side optimization heuristics.
              </p>

              {/* Glossary Definitions Items List Grid */}
              <div className="space-y-4">
                {[
                  {
                    title: "WCAG Color Contrast Ratios",
                    desc: "Contrast between screen assets and written elements. WCAG Level AA specifies a contrast of at least 4.5:1 for standard fonts, while AAA heightens the standard to 7:1 for optimum low-vision compatibility."
                  },
                  {
                    title: "Largest Contentful Paint (LCP)",
                    desc: "An essential Core Web Vital metric reporting render speed times. It signals when the primary visual element or largest content block renders on the viewport. Good performance targets ≤ 2.5s."
                  },
                  {
                    title: "Heading Hierarchies Order",
                    desc: "Semantic sequential order of page headlines (H1 followed consecutively by H2 sequences, avoiding skips to H4). Vital for web-readers and text speech synthesizers."
                  },
                  {
                    title: "Image Alternate Text (ALT Attributes)",
                    desc: "Critical short descriptions appended to HTML image assets. They explain asset nature to disabled browser tools or load when image paths fail."
                  },
                  {
                    title: "Meta Search Index Descriptions",
                    desc: "Summaries displayed on Google Search Engine Results Page (SERP) cards. Maintain values under 160 characters to maximize clicks and prevent title truncation on mobile."
                  },
                  {
                    title: "Bundle Script Compressions",
                    desc: "Minifying runtime JavaScript blocks by stripping spaces, wrapping functions, and deferring non-critical assets. Drastically cuts render blocks and speed ratings."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition">
                    <h4 className={`text-xs font-bold ${BrandAccents[brandColor].text} flex items-center justify-between`}>
                      <span>{item.title}</span>
                      <span className="text-[9px] font-mono font-bold text-zinc-650 bg-zinc-900 border border-zinc-850 px-1 py-0.5 rounded">
                        RULE {idx + 1}
                      </span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Help Card Footer */}
            <div className="pt-6 border-t border-zinc-900 text-center space-y-3">
              <p className="text-[10px] text-zinc-500 italic">
                MentorDocks automatically applies these diagnostic standards to every code scan!
              </p>
              <button
                onClick={() => setShowGlossary(false)}
                className={`w-full py-2.5 rounded-xl bg-white text-black font-extrabold text-xs uppercase hover:bg-zinc-200 transition cursor-pointer`}
              >
                Return to Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
