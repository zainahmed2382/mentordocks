import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Globe, 
  Award, 
  Zap, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Info,
  Layers,
  Code,
  Layout,
  Smartphone,
  Type,
  Palette,
  Accessibility,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Search,
  History,
  Calendar,
  ExternalLink
} from "lucide-react";
import { AuditReport } from "../types";

interface DashboardViewProps {
  auditHistory: Array<{ url: string; date: string; score: number }>;
  currentReport: AuditReport | null;
  onSelectAudit: (url: string) => void;
  onClearHistory: () => void;
  onDeleteAudit?: (url: string) => void;
  onAuditNew: () => void;
  currUser: any;
}

export function DashboardView({ 
  auditHistory, 
  currentReport, 
  onSelectAudit, 
  onClearHistory,
  onDeleteAudit,
  onAuditNew,
  currUser 
}: DashboardViewProps) {
  const [historyQuery, setHistoryQuery] = useState("");
  const [comparingUrls, setComparingUrls] = useState<string[]>([]);
  const [fixChecklist, setFixChecklist] = useState<Array<{ id: string; label: string; impact: number; checked: boolean; category: string }>>([
    { id: "alt-tags", label: "Add alternate text tags to all critical viewport images", impact: 6, checked: false, category: "Accessibility" },
    { id: "minify-js", label: "Bundle script modules and compress JavaScript payloads", impact: 8, checked: false, category: "Performance" },
    { id: "meta-desc", label: "Configure high-relevance search meta descriptions", impact: 4, checked: false, category: "SEO" },
    { id: "heading-hier", label: "Normalize nested heading hierarchy sequence (H1 -> H2)", impact: 5, checked: false, category: "UI/UX" },
    { id: "contrast", label: "Increase background-to-text text color contrast ratios", impact: 7, checked: false, category: "Design" },
    { id: "viewport", label: "Embed relative standard initial-scale viewport tags", impact: 8, checked: false, category: "Mobile" },
  ]);

  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  // Compute macro metrics
  const totalScans = auditHistory.length;
  const avgScore = totalScans > 0 
    ? Math.round(auditHistory.reduce((sum, item) => sum + item.score, 0) / totalScans) 
    : 0;
  
  const highestScore = totalScans > 0 
    ? Math.max(...auditHistory.map(item => item.score)) 
    : 0;

  const lowestScore = totalScans > 0 
    ? Math.min(...auditHistory.map(item => item.score)) 
    : 0;

  // Compute simulated landing score based on checklist
  const baseScore = currentReport?.overall_score || avgScore || 70;
  const addedPoints = fixChecklist.filter(f => f.checked).reduce((sum, f) => sum + f.impact, 0);
  const simulatedScore = Math.min(100, baseScore + addedPoints);

  // Toggle Url for comparison
  const handleToggleCompare = (url: string) => {
    if (comparingUrls.includes(url)) {
      setComparingUrls(comparingUrls.filter(u => u !== url));
    } else {
      if (comparingUrls.length >= 3) {
        // limit to 3 URLs
        setComparingUrls([...comparingUrls.slice(1), url]);
      } else {
        setComparingUrls([...comparingUrls, url]);
      }
    }
  };

  const handleToggleChecklist = (id: string) => {
    setFixChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
    if (score >= 70) return "text-amber-400 bg-amber-950/20 border-amber-900/40";
    return "text-rose-400 bg-rose-950/20 border-rose-900/40";
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Dashboard Top Intro Banner */}
      <div className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent blur-[50px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <BarChart3 className="h-3 w-3" /> ANALYTICS COMMAND CENTER
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {currUser ? `${currUser.name}'s Compliance Dashboard` : "Universal Audit Command Dashboard"}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Explore aggregate health curves, evaluate compliance indices across saved websites, and simulate remediation impact levels in real time.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onAuditNew}
              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Run New Audit
            </button>
            {totalScans > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3.5 py-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 hover:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 transition flex items-center gap-1.5 cursor-pointer"
                title="Clear Logs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Logs
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Audited */}
        <div className="bg-[#0a0a0a] border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Audit Frequency</span>
            <div className="p-1.5 bg-blue-500/10 border border-blue-500/10 text-blue-400 rounded-lg">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-white block tracking-tight">{totalScans}</span>
            <span className="text-[11px] text-zinc-400 block mt-1 leading-none">Scanned URLs in history</span>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-[#0a0a0a] border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Average Compliance</span>
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 rounded-lg">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white block tracking-tight">{avgScore}</span>
              <span className="text-xs font-mono font-bold text-emerald-400">/100</span>
            </div>
            <span className="text-[11px] text-zinc-400 block mt-1 leading-none">
              {avgScore >= 90 ? "Excellent Avg Grade" : avgScore >= 70 ? "Needs Minor Edits" : "Action Recommended"}
            </span>
          </div>
        </div>

        {/* Card 3: Top Performer */}
        <div className="bg-[#0a0a0a] border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Peak Audit Score</span>
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white block tracking-tight">{highestScore}</span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">Max score</span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-1 leading-none">
              {totalScans > 0 ? `Best: ${auditHistory.reduce((a, b) => b.score > a.score ? b : a).url}` : "No scanned records"}
            </p>
          </div>
        </div>

        {/* Card 4: Weakest Performer */}
        <div className="bg-[#0a0a0a] border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-800 transition">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Lowest Audit Score</span>
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/10 text-rose-400 rounded-lg">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-white block tracking-tight">{lowestScore}</span>
              <span className="text-[10px] text-zinc-500 font-mono font-bold">Min score</span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-1 leading-none">
              {totalScans > 0 ? `Needs improvement: ${auditHistory.reduce((a, b) => b.score < a.score ? b : a).url}` : "No scanned records"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: timeline chart + score comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Score Timeline & url comparison */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Integrated Interactive History Progress Tracker */}
          <div className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <div className="space-y-0.5">
                <h3 className="font-bold text-white text-sm">Crawl Health Progress Timeline</h3>
                <p className="text-[10px] text-zinc-500">Chronological score trend for all inspected domains</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded">
                Live Interactive SVG
              </span>
            </div>

            {totalScans < 2 ? (
              <div className="text-center py-10 text-zinc-500 space-y-2">
                <p className="text-xs">Run audits on multiple domains to view chronological line comparison charts.</p>
                <button
                  onClick={onAuditNew}
                  className="text-xs text-blue-400 hover:underline font-bold cursor-pointer"
                >
                  Scan another site now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Line Graph */}
                <div className="relative pt-6 px-2 bg-zinc-950/45 rounded-xl border border-zinc-900/50">
                  <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#1c1c1c" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Gradient Area under line */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Path builder */}
                    {(() => {
                      const points = auditHistory.map((item, idx) => {
                        const x = totalScans > 1 ? (idx / (totalScans - 1)) * 500 : 250;
                        // Map score 0-100 to y coordinate (110 down to 10)
                        const y = 110 - (item.score / 100) * 100;
                        return { x, y, ...item };
                      });

                      // Construct cubic bezier path or simple points line
                      let pathStr = `M ${points[0].x} ${points[0].y}`;
                      for (let i = 1; i < points.length; i++) {
                        pathStr += ` L ${points[i].x} ${points[i].y}`;
                      }

                      let areaStr = `${pathStr} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`;

                      return (
                        <>
                          {/* Filled Area */}
                          <path d={areaStr} fill="url(#chartGradient)" />

                          {/* Line */}
                          <path d={pathStr} fill="none" stroke="#2563eb" strokeWidth="2.5" />

                          {/* Data points */}
                          {points.map((pt, pIdx) => (
                            <g 
                              key={pIdx}
                              onMouseEnter={() => setHoveredDataPoint(pIdx)}
                              onMouseLeave={() => setHoveredDataPoint(null)}
                              className="cursor-pointer group"
                            >
                              <circle 
                                cx={pt.x} 
                                cy={pt.y} 
                                r={hoveredDataPoint === pIdx ? "6" : "4.5"} 
                                fill={pt.score >= 90 ? "#10b981" : pt.score >= 70 ? "#f59e0b" : "#ef4444"} 
                                stroke="#141414"
                                strokeWidth="2"
                                className="transition-all duration-150"
                              />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* Timeline labels */}
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-2 border-t border-zinc-900 mt-2 px-1">
                    <span>{auditHistory[0]?.date || "Oldest"}</span>
                    <span>Progression</span>
                    <span>{auditHistory[auditHistory.length - 1]?.date || "Latest"}</span>
                  </div>
                </div>

                {/* Hover Details Panel */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 flex justify-between items-center h-14">
                  {hoveredDataPoint !== null ? (
                    <>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-zinc-500 block leading-tight">INSPECTED DOMAIN</span>
                        <span className="text-xs font-bold font-mono text-white">{auditHistory[hoveredDataPoint].url}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-500 block leading-tight">HEALTH RATING</span>
                        <span className={`text-sm font-black font-mono ${
                          auditHistory[hoveredDataPoint].score >= 90 ? "text-emerald-400" : "text-amber-400"
                        }`}>{auditHistory[hoveredDataPoint].score} / 100</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] font-mono text-zinc-500 italic mx-auto flex items-center gap-1.5 select-none md:gap-2">
                      <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" /> Hover over timelines nodes to inspect previous compliance metrics!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Multi-URL Comparator */}
          <div className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-3 mb-4 gap-2">
              <div className="space-y-0.5">
                <h3 className="font-bold text-white text-sm">Interactive Multi-URL Comparator</h3>
                <p className="text-[10px] text-zinc-500">Pick up to 3 domains to analyze and contrast evaluation metrics</p>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded shrink-0 self-start">
                {comparingUrls.length} selected
              </span>
            </div>

            {totalScans === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Your crawl log is clean. Run a scan to unlock comparison widgets!</p>
            ) : (
              <div className="space-y-4">
                {/* Selector list */}
                <div className="flex flex-wrap gap-2">
                  {auditHistory.map((item, index) => {
                    const isSelected = comparingUrls.includes(item.url);
                    return (
                      <button
                        key={index}
                        onClick={() => handleToggleCompare(item.url)}
                        className={`text-xs font-mono px-3 py-1.5 rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/50"
                            : "bg-[#121212]/30 hover:bg-zinc-900 border-zinc-850 text-zinc-400"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-blue-400 animate-pulse" : "bg-zinc-600"}`} />
                        {item.url} ({item.score})
                      </button>
                    );
                  })}
                </div>

                {/* Compare Display */}
                {comparingUrls.length > 0 ? (
                  <div className="bg-[#0c0c0c] border border-zinc-90 w-full p-4 rounded-xl space-y-3.5">
                    {comparingUrls.map((urlName) => {
                      const record = auditHistory.find(item => item.url === urlName);
                      if (!record) return null;
                      return (
                        <div key={urlName} className="space-y-1 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-zinc-200 font-mono flex items-center gap-1">
                              <Globe className="h-3 w-3 text-zinc-500" /> {urlName}
                            </span>
                            <span className={`font-bold font-mono text-xs px-2 py-0.5 rounded border ${getScoreBadgeClass(record.score)}`}>
                              Score: {record.score}/100
                            </span>
                          </div>
                          {/* Relative graph horizontal bar */}
                          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-900">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                record.score >= 90 ? "bg-emerald-500" : record.score >= 70 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${record.score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#0b0b0b] p-4 rounded-xl border border-dashed border-zinc-850 text-center text-zinc-500">
                    <p className="text-xs">Select any website domain tags above to initiate a side-by-side performance audit comparison.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Simulated AI Sandbox & checklist */}
        <div className="space-y-6">
          
          {/* Diagnostic score calculator sandbox */}
          <div className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-1.5 mb-1 bg-zinc-900 border border-zinc-850 w-fit px-2 py-0.5 rounded text-[9px] text-blue-400 font-mono font-bold">
                <Sparkles className="h-3 w-3 inline text-amber-500" /> SIMULATION SANDBOX
              </div>
              <h3 className="font-bold text-white text-sm">Interactive Dev Playbook</h3>
              <p className="text-[10px] text-zinc-500">Toggle optimization tasks to see simulated health score upgrades</p>
            </div>

            {/* Score Lift Visual Gauge */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 blur-[30px] rounded-full pointer-events-none" />
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Simulated Grade</span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-4xl font-black font-mono transition-colors duration-200 ${
                    simulatedScore >= 90 ? "text-emerald-400" : simulatedScore >= 70 ? "text-amber-400" : "text-rose-400"
                  }`}>
                    {simulatedScore}
                  </span>
                  <span className="text-sm font-bold text-zinc-500">/ 100</span>
                </div>
                {simulatedScore > baseScore ? (
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/20 border border-emerald-900/20 px-2 py-0.5 rounded-full inline-block mt-1">
                    ★ Estimated Score Lift: +{simulatedScore - baseScore} points!
                  </span>
                ) : (
                  <span className="text-[10px] text-[#666] italic block mt-1">
                    Select optimizations below to simulate score impact
                  </span>
                )}
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              {fixChecklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none hover:border-zinc-800 ${
                    item.checked 
                      ? "bg-blue-500/5 border-blue-500/20 text-white" 
                      : "bg-[#0c0c0c] border-[#161616] text-zinc-400"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition ${
                      item.checked 
                        ? "bg-blue-500 border-blue-500 text-white" 
                        : "border-zinc-800 bg-[#070707]"
                    }`}>
                      {item.checked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 text-left">
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
                      {item.category}
                    </span>
                    <p className={`text-xs leading-normal ${item.checked ? "text-zinc-100 font-medium" : "text-zinc-400"}`}>
                      {item.label}
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold shrink-0 py-0.5 px-2 rounded-md ${
                    item.checked ? "text-blue-400 bg-blue-950/25" : "text-zinc-500 bg-zinc-950"
                  }`}>
                    +{item.impact}
                  </span>
                </div>
              ))}
            </div>

            {/* Playbook AI advisory tip */}
            <div className="bg-[#1010ef]/5 p-3 rounded-xl border border-blue-900/10 text-left">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                AI Advisory Tip
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Implementing standard ALT tags, minifying runtime JS bundles, and enforcing correct nesting orders are the top 3 highest leverage ways to lift WCAG readability indexes and paint speeds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Audit Crawl History & Reports Section */}
      <div className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <History className="h-3 w-3" /> AUDIT HISTORY LOGS
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Website Compliance Crawl History</h3>
            <p className="text-xs text-zinc-400">
              Inspect past diagnostic evaluations, reload scanner blueprints, or compare historical scans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter domain crawls..."
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition w-48 sm:w-60"
              />
            </div>
            <button
              onClick={onAuditNew}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Run New Audit
            </button>
            {auditHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-900/40 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Audit History Table */}
        {auditHistory.length === 0 ? (
          <div className="py-12 px-4 text-center bg-zinc-950/60 rounded-2xl border border-dashed border-zinc-850 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Audit History Available</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                You haven't scanned any websites under this profile yet. Run your first website audit to populate history and unlock visual analytics.
              </p>
            </div>
            <button
              onClick={onAuditNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              Start First Audit <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  <th className="pb-3 pl-2">Target Website URL</th>
                  <th className="pb-3">Scan Date</th>
                  <th className="pb-3">Health Score</th>
                  <th className="pb-3">Compliance Index Bar</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60">
                {auditHistory
                  .filter((item) =>
                    item.url.toLowerCase().includes(historyQuery.toLowerCase())
                  )
                  .map((item, idx) => (
                    <tr key={idx} className="group hover:bg-zinc-950/80 transition">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 transition">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs text-zinc-200 block">
                              {item.url}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                          <Calendar className="h-3 w-3 text-zinc-600" />
                          {item.date}
                        </span>
                      </td>

                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${getScoreBadgeClass(
                            item.score
                          )}`}
                        >
                          {item.score} / 100
                        </span>
                      </td>

                      <td className="py-3.5 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-900">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                item.score >= 90
                                  ? "bg-emerald-500"
                                  : item.score >= 70
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectAudit(item.url)}
                            className="px-2.5 py-1 bg-zinc-900 hover:bg-blue-600/20 text-zinc-300 hover:text-blue-400 border border-zinc-800 hover:border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Inspect full audit report"
                          >
                            <ExternalLink className="h-3 w-3" /> View Report
                          </button>
                          <button
                            onClick={() => handleToggleCompare(item.url)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                              comparingUrls.includes(item.url)
                                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                            }`}
                            title="Compare this scan"
                          >
                            {comparingUrls.includes(item.url) ? "Comparing" : "Compare"}
                          </button>
                          {onDeleteAudit && (
                            <button
                              onClick={() => onDeleteAudit(item.url)}
                              className="p-1.5 bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/40 rounded-lg transition cursor-pointer"
                              title="Delete from history"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
