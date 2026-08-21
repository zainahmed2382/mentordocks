import React, { useState } from "react";
import { motion } from "motion/react";
import { WebsiteScan, ProblemItem, PLACEHOLDER_SCAN } from "../types";
import {
  Code2,
  MousePointerClick,
  MonitorSmartphone,
  Type,
  Palette,
  Accessibility,
  Gauge,
  Globe,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  FileDown,
  Loader2,
  AlertTriangle,
  ArrowRight,
  MessageSquareQuote
} from "lucide-react";
import { downloadPdfReport } from "../lib/generatePdf";
import EducationalAuditCard from "./EducationalAuditCard";

interface DashboardPageProps {
  activeScan: WebsiteScan | null;
  scanHistory: WebsiteScan[];
  onSelectHistoryScan: (id: string) => void;
  onNavigateToLabs?: () => void;
  onNavigateToAnalyze?: () => void;
  onScanAgain?: () => void;
}

export default function DashboardPage({
  activeScan,
  scanHistory,
  onSelectHistoryScan,
  onNavigateToLabs,
  onNavigateToAnalyze,
  onScanAgain,
}: DashboardPageProps) {
  const scan = activeScan ?? PLACEHOLDER_SCAN;
  const metrics = scan.metrics ?? PLACEHOLDER_SCAN.metrics;
  const score = typeof scan.score === "number" ? scan.score : 0;
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!scan.url || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await downloadPdfReport(scan);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Setup SVG circular progress coordinates
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  // Metric icons mapping
  const getMetricIcon = (key: string) => {
    switch (key) {
      case "codeQuality":
        return <Code2 className="h-5 w-5 text-indigo-600" />;
      case "uiUx":
        return <MousePointerClick className="h-5 w-5 text-purple-600" />;
      case "responsiveness":
        return <MonitorSmartphone className="h-5 w-5 text-pink-600" />;
      case "typography":
        return <Type className="h-5 w-5 text-sky-600" />;
      case "colorTheme":
        return <Palette className="h-5 w-5 text-amber-500" />;
      case "accessibility":
        return <Accessibility className="h-5 w-5 text-emerald-600" />;
      case "performance":
        return <Gauge className="h-5 w-5 text-rose-600" />;
      case "seo":
        return <Globe className="h-5 w-5 text-teal-600" />;
      default:
        return <Code2 className="h-5 w-5 text-indigo-600" />;
    }
  };

  const getMetricLabel = (key: string) => {
    switch (key) {
      case "codeQuality":
        return "Code Quality";
      case "uiUx":
        return "UI / UX";
      case "responsiveness":
        return "Responsiveness";
      case "typography":
        return "Typography";
      case "colorTheme":
        return "Color Theme";
      case "accessibility":
        return "Accessibility";
      case "performance":
        return "Performance";
      case "seo":
        return "SEO";
      default:
        return key;
    }
  };

  // Top issues for dashboard summary
  const topIssues = scan.problems.slice(0, 3);

  return (
    <div className="w-full flex flex-col gap-10 max-w-7xl mx-auto px-4 md:px-16 pt-10 pb-20 font-sans">
      {/* Header Info Banner */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-200/60 dark:border-slate-800/60 pb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-3xl md:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#E2E8F0] mb-2 tracking-tight"
          >
            Website Audit Dashboard
          </motion.h1>
          <div className="font-sans text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium flex flex-wrap items-center gap-2">
            <span>Audited target:</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3.5 py-1 rounded-full border border-gray-200 dark:border-slate-800 shadow-xs font-semibold text-xs md:text-sm inline-block">
              {scan.url}
            </span>
          </div>
        </div>

        {/* Action Controls Group */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Status Badge */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 px-3.5 py-2 rounded-full border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="text-emerald-500 h-4 w-4 shrink-0" />
            <span className="font-sans text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Audit Complete
            </span>
          </div>

          {/* Secondary Actions: Export PDF & Re-Scan */}
          <div className="flex items-center gap-2">
            {scan.url && (
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="bg-white dark:bg-[#131520] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-800 font-sans font-bold text-xs px-3.5 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                title="Download 1-Page PDF Audit Report"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>
            )}

            {onScanAgain && (
              <button
                onClick={onScanAgain}
                className="bg-white dark:bg-[#131520] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-800 font-sans font-bold text-xs px-3.5 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                title="Re-run audit for this website"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Re-Scan</span>
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Top Bento Grid - Score Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Circle (Left column) */}
        <div className="bg-white dark:bg-[#131520] rounded-[32px] p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-200/80 dark:border-slate-800/80 group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-50/20 dark:from-indigo-950/10 to-transparent pointer-events-none"></div>

          <h2 className="font-display text-lg font-bold text-[#1A1A1A] dark:text-slate-200 tracking-tight absolute top-6 left-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" /> Overall Health Score
          </h2>

          <div className="relative w-44 h-44 mt-8">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#F0F2F5" className="dark:stroke-slate-800" strokeWidth="8"></circle>

              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="transform -rotate-90 origin-[50%_50%]"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="url(#radial-gradient)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeLinecap="round"
              ></motion.circle>

              <defs>
                <linearGradient id="radial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Numerical Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl md:text-5xl font-extrabold text-[#1A1A1A] dark:text-slate-100 tracking-tight">
                {score}
              </span>
              <span className="font-sans text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">
                / 100
              </span>
            </div>
          </div>

          {/* Short user-friendly status badge */}
          <div className="mt-5">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-bold tracking-wide border shadow-xs ${
                score >= 90
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80"
                  : score >= 75
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80"
                  : score >= 55
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/80"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/80"
              }`}
            >
              {score >= 90
                ? "Excellent Standards"
                : score >= 75
                ? "Good Overall Health"
                : score >= 55
                ? "Some Fixes Recommended"
                : "Needs Attention"}
            </span>
          </div>
        </div>

        {/* Breakdown Metric Sub-cards (Right 2 columns) */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value], idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={onNavigateToLabs}
              className="bg-white/90 dark:bg-[#131520]/90 backdrop-blur-xs rounded-[24px] p-5 border border-gray-200/80 dark:border-slate-800/80 hover:border-indigo-250 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 rounded-[12px] bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                  {getMetricIcon(key)}
                </div>
                <span className="font-display text-lg md:text-xl font-bold text-[#1A1A1A] dark:text-slate-100 tracking-tight">
                  {value}
                </span>
              </div>

              <h3 className="font-sans text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-tight mb-2">
                {getMetricLabel(key)}
              </h3>

              {/* Progress Slider track */}
              <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${value}%` }}
                ></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Most Important Issues Section */}
      <section className="bg-white dark:bg-[#131520] rounded-[32px] p-6 md:p-8 border border-gray-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#1A1A1A] dark:text-slate-100 tracking-tight flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Most Important Issues</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Top prioritized fixes identified during this audit. Click any issue to see how to fix it or discuss it with AI.
            </p>
          </div>

          {onNavigateToLabs && (
            <button
              onClick={onNavigateToLabs}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View All {scan.problems.length} Issues in Detailed Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {topIssues.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200">No major issues identified!</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This website meets all baseline web standards.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {topIssues.map((problem, idx) => (
              <EducationalAuditCard
                key={problem.id || idx}
                problem={problem}
                defaultExpanded={idx === 0}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom Section - Scan History Table */}
      <section className="bg-white dark:bg-[#131520] rounded-[32px] p-6 md:p-8 border border-gray-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="font-display text-lg md:text-xl font-bold text-[#1A1A1A] dark:text-slate-100 tracking-tight">
              Audit History
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Previous website audits and health score tracking.
            </p>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-sans font-bold">
            {scanHistory.length} Record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-500 dark:text-gray-400 font-sans text-xs uppercase tracking-wider">
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Target URL</th>
                <th className="py-3 px-3 font-semibold">Score</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="font-sans text-xs md:text-sm text-[#1A1A1A] dark:text-slate-200">
              {scanHistory.map((hScan) => (
                <tr
                  key={hScan.id}
                  onClick={() => onSelectHistoryScan(hScan.id)}
                  className={`border-b border-gray-100 dark:border-slate-800/60 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                    hScan.id === activeScan?.id ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""
                  }`}
                >
                  <td className="py-4 px-3 text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{hScan.date}</td>
                  <td className="py-4 px-3 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 whitespace-nowrap truncate max-w-[200px] md:max-w-xs">
                    {hScan.url}
                  </td>
                  <td className="py-4 px-3 font-display font-bold text-sm">{hScan.score}/100</td>
                  <td className="py-4 px-3 whitespace-nowrap">
                    <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30 font-sans font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Completed
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button className="p-1.5 rounded-[8px] bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-slate-800 border border-transparent group-hover:border-gray-200 dark:group-hover:border-slate-700 text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-all cursor-pointer">
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
