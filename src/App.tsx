import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  User,
  LogOut,
  History,
  ShieldCheck,
  Download,
  HelpCircle,
  XCircle,
  Zap,
  BarChart3,
  Search,
  AlertTriangle,
  Globe2,
  WifiOff,
  ServerCrash,
  FileQuestion,
  RefreshCw,
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
import { AuditResultsDashboard } from "./components/AuditResultsDashboard";

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
      { url: "github.com", date: "2026-06-10", score: 77 },
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

  const handleRunAudit = async (targetUrl: string) => {
    if (!currUser || !currUser.isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

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
          ...filtered,
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

  const getErrorState = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes("404") || normalized.includes("not found") || normalized.includes("page not found")) {
      return {
        title: "Page not found",
        description: "The destination page could not be reached. Verify the URL and try again with a public website.",
        icon: FileQuestion,
        actionLabel: "Try another URL",
        accent: "text-slate-700 bg-slate-100 border-slate-200",
      };
    }

    if (normalized.includes("network") || normalized.includes("fetch") || normalized.includes("connection") || normalized.includes("timed out") || normalized.includes("internet")) {
      return {
        title: "Network connection issue",
        description: "We could not reach the site from your current connection. Please check your network and retry.",
        icon: WifiOff,
        actionLabel: "Retry audit",
        accent: "text-warning-700 bg-warning-50 border-warning-100",
      };
    }

    if (normalized.includes("server") || normalized.includes("status 5") || normalized.includes("500") || normalized.includes("502") || normalized.includes("503") || normalized.includes("504")) {
      return {
        title: "Server error",
        description: "The audit service is currently unavailable. Please wait a moment and try again.",
        icon: ServerCrash,
        actionLabel: "Retry audit",
        accent: "text-primary-700 bg-primary-50 border-primary-100",
      };
    }

    if (normalized.includes("invalid") || normalized.includes("valid") || normalized.includes("please enter") || normalized.includes("url")) {
      return {
        title: "Invalid URL",
        description: "The website address looks incomplete or unsupported. Try a full URL such as https://example.com.",
        icon: Globe2,
        actionLabel: "Try a new URL",
        accent: "text-error-700 bg-error-50 border-error-100",
      };
    }

    return {
      title: "Audit could not be completed",
      description: "We hit an unexpected issue while generating your report. Review the message below and try again.",
      icon: AlertTriangle,
      actionLabel: "Retry audit",
      accent: "text-error-700 bg-error-50 border-error-100",
    };
  };

  const errorState = errorMsg ? getErrorState(errorMsg) : null;
  const ErrorIcon = errorState?.icon ?? AlertTriangle;

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
    if (score >= 90) return "text-success-700 bg-success-50 border-success-100";
    if (score >= 55) return "text-warning-700 bg-warning-50 border-warning-100";
    return "text-error-700 bg-error-50 border-error-100";
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 pb-20 relative overflow-x-hidden">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-6 py-3 sm:py-4 shadow-[0_10px_40px_-22px_rgba(2,6,23,0.95)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleReset}>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center shadow-md transition-all duration-300">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-lg sm:text-xl text-slate-100 tracking-tight">
                Mentor<span className="text-primary-600">Docks</span>
              </span>
            </div>

            {/* Mobile Actions Right (User Profile / Sign In) */}
            <div className="flex items-center gap-2 md:hidden">
              {currUser ? (
                <div className="flex items-center gap-2 bg-slate-900/70 border border-slate-800 py-1.5 px-3 rounded-xl text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary-500/15 text-primary-300 font-mono font-bold flex items-center justify-center text-xs">
                    {currUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-100 text-xs max-w-[85px] truncate">{currUser.name}</span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition cursor-pointer shadow-[0_10px_30px_-15px_rgba(37,99,235,0.8)]"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t border-gray-100 md:border-0">
            {/* Segmented View-Tab Controller */}
            <div className="flex items-center bg-slate-900/70 border border-slate-800/80 p-1 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <button
                onClick={() => setActiveTab("scanner")}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "scanner"
                    ? "bg-slate-800/90 text-slate-100 border border-blue-500/20 shadow-[0_10px_26px_-16px_rgba(59,130,246,0.45)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                }`}
              >
                <Search className="h-4 w-4" />
                Scanner
              </button>
              {currUser && (
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-slate-800/90 text-slate-100 border border-blue-500/20 shadow-[0_10px_26px_-16px_rgba(59,130,246,0.45)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/80"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </button>
              )}
            </div>

            {/* Desktop User Profile / Actions */}
            <div className="flex items-center gap-3">
              {report && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportReportToPDF(report)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-slate-100 font-semibold rounded-xl hover:bg-slate-800 transition cursor-pointer border border-slate-700"
                    title="Download PDF Report"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline-block">PDF Report</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition cursor-pointer shadow-sm"
                    title="Audit New URL"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="hidden sm:inline-block">New Audit</span>
                  </button>
                </div>
              )}
              
              {currUser ? (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 pr-4 rounded-xl text-sm">
                  <div className="h-9 w-9 rounded-full bg-primary-100 border border-primary-200 text-primary-700 font-mono font-bold flex items-center justify-center text-xs">
                    {currUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-bold leading-none text-gray-900 text-sm">{currUser.name}</p>
                    <p className="text-[10px] font-mono font-semibold text-gray-500 tracking-wider uppercase leading-none mt-1">{currUser.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 cursor-pointer transition ml-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 transition cursor-pointer shadow-[0_10px_30px_-15px_rgba(37,99,235,0.8)]"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        {activeTab === "dashboard" ? (
          <DashboardView
            auditHistory={auditHistory}
            currentReport={report}
            onSelectAudit={(url) => {
              setActiveTab("scanner");
              handleRunAudit(url);
            }}
            onClearHistory={() => setAuditHistory([])}
            onDeleteAudit={(url) => {
              setAuditHistory((prev) => prev.filter((item) => item.url !== url));
            }}
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
            {errorMsg && errorState && (
              <div className="max-w-2xl mx-auto glass-panel rounded-[28px] p-8 shadow-[0_28px_90px_-36px_rgba(2,6,23,0.98)] space-y-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${errorState.accent}`}>
                    <ErrorIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-extrabold text-xl text-gray-900 mb-2">
                      {errorState.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {errorState.description}
                    </p>
                    <p className="text-gray-500 text-sm mt-3 font-medium">
                      {errorMsg}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (currentUrl.trim()) {
                        handleRunAudit(currentUrl);
                      } else {
                        handleReset();
                      }
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl hover:shadow-lg transition font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {errorState.actionLabel}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-semibold text-sm cursor-pointer"
                  >
                    Back to home
                  </button>
                </div>
              </div>
            )}

            {/* Home Landing Page (no report, no loading, no error) */}
            {!report && !loading && !errorMsg && (
              <div className="space-y-12">
                <HomeState onAudit={handleRunAudit} isLoading={loading} />
                
                {/* History Section */}
                <div className="max-w-5xl mx-auto glass-panel rounded-[28px] p-8 shadow-[0_28px_90px_-36px_rgba(2,6,23,0.98)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary-500/5 to-transparent blur-[40px] pointer-events-none rounded-full" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-6 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 text-primary-600 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center">
                        <History className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-display font-extrabold text-gray-900 text-lg leading-tight">
                          {currUser ? `${currUser.name}'s Search History` : "Your Recent Scans"}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Fast access to your previous website audits
                        </p>
                      </div>
                    </div>

                    {!currUser ? (
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="text-sm bg-primary-50 border border-primary-100 text-primary-700 font-bold px-5 py-2.5 rounded-xl hover:bg-primary-100 transition cursor-pointer self-start"
                      >
                        <ShieldCheck className="h-4 w-4 inline mr-2" />
                        Sign Up for Free
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-success-600" /> 
                        Premium Features Active
                      </span>
                    )}
                  </div>

                  {auditHistory.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-950/60 p-8 text-center transition-all hover:border-slate-700">
                      <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                        <FileQuestion className="h-6 w-6" />
                      </div>
                      <h4 className="mt-4 text-lg font-bold text-slate-100 tracking-tight">No Reports Yet</h4>
                      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                        Run your first audit to create a polished report, track improvements, and build a history of insights.
                      </p>
                      <button
                        onClick={() => document.getElementById("url")?.focus()}
                        className="mt-5 btn btn-primary text-xs"
                      >
                        Start your first audit
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {auditHistory.map((hist, hidx) => (
                        <div
                          key={hidx}
                          onClick={() => handleRunAudit(hist.url)}
                          className="bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800 hover:border-primary-400 p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm hover:shadow-md relative group text-left"
                        >
                          <div className="space-y-2">
                            <p className="font-mono text-sm font-bold text-gray-800 truncate max-w-[160px] group-hover:text-primary-700 transition">
                              {hist.url}
                            </p>
                            <p className="text-xs text-gray-500 font-mono tracking-tight flex items-center gap-1.5 leading-none">
                              <History className="h-3.5 w-3.5 inline" />
                              {hist.date}
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border leading-none ${
                              getScoreColorClass(hist.score)
                            }`}>
                              {hist.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audit Report Container */}
            {report && !loading && !errorMsg && (
              <AuditResultsDashboard
                report={report}
                filteredIssues={filteredIssues}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSeverity={selectedSeverity}
                setSelectedSeverity={setSelectedSeverity}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                allExpanded={allExpanded}
                setAllExpanded={setAllExpanded}
                auditHistory={auditHistory}
                mappedKeywords={[]}
                keywordInput=""
                setKeywordInput={() => {}}
                setMappedKeywords={() => {}}
                onReset={handleReset}
                onRescan={() => handleRunAudit(currentUrl)}
                onExportPDF={() => exportReportToPDF(report)}
                brandColor="blue"
                brandAccent={null as any}
              />
            )}
          </>
        )}
      </main>

      {/* Splash Screen */}
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

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthScreen 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {/* Help Glossary Button */}
      <button
        onClick={() => setShowGlossary(true)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-slate-950/80 border border-slate-800/80 hover:border-blue-400/35 text-slate-200 hover:text-white rounded-full shadow-[0_24px_70px_-22px_rgba(2,6,23,0.95)] transition-all duration-300 hover:scale-110 flex items-center justify-center cursor-pointer group"
        title="Open Diagnostics Guide"
      >
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 animate-ping" />
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500" />
        <HelpCircle className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* Glossary Drawer */}
      {showGlossary && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setShowGlossary(false)} 
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 cursor-pointer" 
          />
          
          {/* Drawer */}
          <div className="relative w-full max-w-md glass-panel border-l border-slate-800/80 shadow-[0_25px_100px_-30px_rgba(2,6,23,0.98)] h-full flex flex-col justify-between p-8 overflow-y-auto animate-fade-in text-left backdrop-blur-2xl">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100 text-xs uppercase font-bold font-mono tracking-widest">
                    <Sparkles className="h-3.5 w-3.5" />
                    BEST PRACTICES
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight font-display">
                    Website Audit Guide
                  </h3>
                </div>
                <button 
                  onClick={() => setShowGlossary(false)}
                  className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <p className="text-gray-600 leading-relaxed">
                Learn about key website metrics and how to improve your score in every category.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Color Contrast",
                    desc: "Make sure your text is readable against its background. WCAG Level AA requires 4.5:1 contrast ratio for normal text.",
                  },
                  {
                    title: "Page Speed",
                    desc: "Fast loading improves user experience and SEO. Aim for Largest Contentful Paint (LCP) under 2.5 seconds.",
                  },
                  {
                    title: "Heading Hierarchy",
                    desc: "Use proper heading tags in order (H1 → H2 → H3) to help screen readers and search engines understand your content.",
                  },
                  {
                    title: "Image Alt Text",
                    desc: "Add descriptive alt text to all images so screen reader users know what they show.",
                  },
                  {
                    title: "Meta Descriptions",
                    desc: "Write unique, descriptive meta tags for each page to improve search results and click-through rates.",
                  },
                  {
                    title: "Mobile Responsiveness",
                    desc: "Ensure your site looks good and works well on mobile devices. Use a viewport meta tag!",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                    <h4 className="text-sm font-bold text-primary-700 flex items-center justify-between mb-2">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono font-bold text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-lg">
                        TIP {idx + 1}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-100 text-center space-y-4">
              <p className="text-xs text-gray-500 italic">
                Apply these tips to improve your website score!
              </p>
              <button
                onClick={() => setShowGlossary(false)}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-extrabold text-sm uppercase hover:bg-gray-800 transition-all cursor-pointer shadow-lg hover:shadow-xl"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
