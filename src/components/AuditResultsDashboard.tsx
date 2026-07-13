import React, { useState } from "react";
import {
  Zap, Code, Palette, Layout, Accessibility, ShieldCheck,
  Monitor, Menu, LayoutDashboard, ScanLine, Sparkles,
  ExternalLink, Download, RotateCcw, CheckCircle2, Clock
} from "lucide-react";
import { AuditReport, AuditIssue, CategoryFilter, SeverityFilter } from "../types";
import { ScoreCard } from "./audit/ScoreCard";
import { CoreWebVitals } from "./audit/CoreWebVitals";
import { AuditSummaryBar } from "./audit/AuditSummaryBar";
import { PerformanceCharts } from "./audit/PerformanceCharts";
import { AuditFindingsPanel } from "./audit/AuditFindingsPanel";
import { AIRecommendationsPanel } from "./audit/AIRecommendationsPanel";
import { AuditHeader } from "./audit/AuditHeader";
import { AuditSidebar } from "./audit/AuditSidebar";

type SidebarSection = "overview" | "findings" | "vitals" | "ai" | "history";

interface AuditResultsDashboardProps {
  report: AuditReport;
  filteredIssues: AuditIssue[];
  selectedCategory: CategoryFilter;
  setSelectedCategory: (c: CategoryFilter) => void;
  selectedSeverity: SeverityFilter;
  setSelectedSeverity: (s: SeverityFilter) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  allExpanded: boolean;
  setAllExpanded: (v: boolean) => void;
  auditHistory: Array<{ url: string; date: string; score: number }>;
  mappedKeywords: string[];
  keywordInput: string;
  setKeywordInput: (v: string) => void;
  setMappedKeywords: (fn: (prev: string[]) => string[]) => void;
  onReset: () => void;
  onRescan: () => void;
  onExportPDF: () => void;
  brandColor: "blue" | "emerald" | "violet" | "amber";
  brandAccent: { gradient: string; text: string; bg: string; rawHex: string };
}

export const AuditResultsDashboard: React.FC<AuditResultsDashboardProps> = ({
  report,
  filteredIssues,
  selectedCategory,
  setSelectedCategory,
  selectedSeverity,
  setSelectedSeverity,
  searchTerm,
  setSearchTerm,
  allExpanded,
  setAllExpanded,
  auditHistory,
  mappedKeywords,
  keywordInput,
  setKeywordInput,
  setMappedKeywords,
  onReset,
  onRescan,
  onExportPDF,
}) => {
  const [activeSection, setActiveSection] = useState<SidebarSection>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const scanDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  // Build score cards data
  const scoreCards = [
    {
      label: "Overall Score",
      score: report.overall_score,
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      label: "Performance",
      score: report.performance_score,
      icon: <Zap className="h-4 w-4" />,
    },
    {
      label: "Accessibility",
      score: report.accessibility_score,
      icon: <Accessibility className="h-4 w-4" />,
    },
    {
      label: "Code Quality",
      score: report.code_quality_score,
      icon: <Code className="h-4 w-4" />,
    },
    {
      label: "Design",
      score: report.design_score,
      icon: <Palette className="h-4 w-4" />,
    },
    {
      label: "Responsiveness",
      score: report.responsiveness_score,
      icon: <Layout className="h-4 w-4" />,
    },
  ];

  // Section refs for smooth scroll
  const scrollToSection = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSectionChange = (section: SidebarSection) => {
    setActiveSection(section);
    setTimeout(() => scrollToSection(section), 50);
  };

  return (
    <div className="flex bg-slate-100 min-h-screen -mx-4 md:-mx-6 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 mt-4">

      {/* ── Left Sidebar ── */}
      <AuditSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        issueCount={report.issues.length}
        overallScore={report.overall_score}
        websiteUrl={report.website_url}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Top Header */}
        <AuditHeader
          websiteUrl={report.website_url}
          scanDate={scanDate}
          onRescan={onRescan}
          onExportPDF={onExportPDF}
        />

        {/* Mobile sidebar toggle */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-slate-400">Menu</span>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-bold text-white">{report.website_url}</span>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">

          {/* ── Fallback Banner ── */}
          {report.isFallbackScanner && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
              <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0 mt-0.5">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-700 mb-0.5">Local Scanner Active</div>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Due to API rate limits, your report was generated using our high-fidelity local scanner. Results are based on direct HTML analysis.
                </p>
              </div>
              <div className="ml-auto flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>
          )}

          {/* ── SECTION: Overview ── */}
          <div id="section-overview">
            {/* Score Cards Grid */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Score Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {scoreCards.map((card, idx) => (
                  <ScoreCard
                    key={card.label}
                    label={card.label}
                    score={card.score}
                    icon={card.icon}
                    delay={idx * 80}
                  />
                ))}
              </div>
            </div>

            {/* Audit Summary Bar */}
            <AuditSummaryBar issues={report.issues} />

            {/* Executive Summary */}
            {report.summary && (
              <div className="dash-card p-6 animate-slide-up delay-300 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Expert Executive Summary</h3>
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">AI Powered</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {report.summary}
                </p>
              </div>
            )}

            {/* Analytics Charts */}
            <div className="mt-4">
              <PerformanceCharts
                overallScore={report.overall_score}
                performanceScore={report.performance_score}
                accessibilityScore={report.accessibility_score}
                auditHistory={auditHistory}
              />
            </div>

            {/* Priority Fixes */}
            {report.priority_fixes && report.priority_fixes.length > 0 && (
              <div className="dash-card p-6 animate-slide-up delay-400 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Immediate Action Required</h3>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {report.priority_fixes.length} fixes
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.priority_fixes.map((fix, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl animate-slide-up"
                      style={{ animationDelay: `${400 + idx * 60}ms` }}
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-black flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">{fix}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Heading structure stats */}
            {(report.h1Count !== undefined || report.h2Count !== undefined) && (
              <div className="dash-card p-5 animate-slide-up delay-500 mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Heading Structure</h3>
                  <span className="text-[10px] text-slate-500 ml-auto">H1–H4 tag analysis</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "H1", count: report.h1Count ?? 0, good: (report.h1Count ?? 0) === 1 },
                    { label: "H2", count: report.h2Count ?? 0, good: (report.h2Count ?? 0) > 0 },
                    { label: "H3", count: report.h3Count ?? 0, good: true },
                    { label: "H4", count: report.h4Count ?? 0, good: true },
                  ].map((tag) => (
                    <div key={tag.label} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-xs font-bold text-slate-500 mb-1">{tag.label}</div>
                      <div className="text-2xl font-black text-slate-900">{tag.count}</div>
                      <div className={`text-[10px] font-semibold mt-1 ${tag.good ? "text-emerald-600" : "text-amber-600"}`}>
                        {tag.label === "H1" ? (tag.count === 1 ? "✓ Ideal" : tag.count === 0 ? "Missing" : "Multiple") : tag.count > 0 ? "Present" : "None"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keyword tracker */}
            <div className="dash-card p-5 animate-slide-up delay-600 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Keyword Tracker</h3>
                <span className="text-xs text-slate-500">{mappedKeywords.length} tracked</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {mappedKeywords.map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                    {kw}
                    <button
                      onClick={() => setMappedKeywords(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-0.5 text-blue-400 hover:text-blue-700 cursor-pointer transition"
                    >×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && keywordInput.trim()) {
                      setMappedKeywords(prev => [keywordInput.trim(), ...prev].slice(0, 8));
                      setKeywordInput("");
                    }
                  }}
                  placeholder="Add keyword and press Enter..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                />
                <button
                  onClick={() => {
                    if (keywordInput.trim()) {
                      setMappedKeywords(prev => [keywordInput.trim(), ...prev].slice(0, 8));
                      setKeywordInput("");
                    }
                  }}
                  disabled={!keywordInput.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* ── SECTION: Core Web Vitals ── */}
          <div id="section-vitals">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ScanLine className="h-3.5 w-3.5" />
              Core Web Vitals
            </h3>
            <CoreWebVitals performanceScore={report.performance_score} />
          </div>

          {/* ── SECTION: AI Recommendations ── */}
          <div id="section-ai">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI Recommendations
            </h3>
            <AIRecommendationsPanel
              issues={report.issues}
              priorityFixes={report.priority_fixes ?? []}
              overallScore={report.overall_score}
            />
          </div>

          {/* ── SECTION: Audit Findings ── */}
          <div id="section-findings">
            <AuditFindingsPanel
              filteredIssues={filteredIssues}
              allIssues={report.issues}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSeverity={selectedSeverity}
              setSelectedSeverity={setSelectedSeverity}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              allExpanded={allExpanded}
              setAllExpanded={setAllExpanded}
            />
          </div>

          {/* ── SECTION: Audit History ── */}
          <div id="section-history">
            <div className="dash-card p-6 animate-slide-up">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Recent Audit History</h3>
              {auditHistory.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No audit history yet.</p>
              ) : (
                <div className="space-y-2">
                  {auditHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer group animate-slide-up"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200 group-hover:border-blue-200">
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{item.url}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {item.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${item.score >= 90 ? "text-emerald-600" : item.score >= 70 ? "text-blue-600" : item.score >= 50 ? "text-amber-600" : "text-red-600"}`}>
                          {item.score}
                        </span>
                        <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.score >= 90 ? "bg-emerald-100 text-emerald-700" : item.score >= 70 ? "bg-blue-100 text-blue-700" : item.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                          {item.score >= 90 ? "Excellent" : item.score >= 70 ? "Good" : item.score >= 50 ? "Fair" : "Poor"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between pt-4 pb-2 border-t border-slate-200">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:shadow-sm transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New Audit
            </button>
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 hover:shadow-md transition cursor-pointer shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
