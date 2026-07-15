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
  ExternalLink,
  FolderOpen,
  FileText,
  Activity
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

function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="card p-8 text-center space-y-5 border border-slate-800/80 bg-slate-950/40">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.15)]">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h4 className="text-lg font-bold text-slate-100 tracking-tight">{title}</h4>
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="btn btn-primary text-xs"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
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
    { id: "alt-tags", label: "Add descriptions to all your images", impact: 6, checked: false, category: "Accessibility" },
    { id: "minify-js", label: "Make your website code smaller and faster", impact: 8, checked: false, category: "Performance" },
    { id: "meta-desc", label: "Write a short description for search engines", impact: 4, checked: false, category: "SEO" },
    { id: "heading-hier", label: "Use big headings followed by smaller ones (H1 then H2)", impact: 5, checked: false, category: "UI/UX" },
    { id: "contrast", label: "Make your text easier to read against the background", impact: 7, checked: false, category: "Design" },
    { id: "viewport", label: "Make your website look good on phones and tablets", impact: 8, checked: false, category: "Mobile" },
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
    if (score >= 90) return "text-success-700 bg-success-50 border-success-100";
    if (score >= 70) return "text-warning-700 bg-warning-50 border-warning-100";
    return "text-error-700 bg-error-50 border-error-100";
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Dashboard Top Intro Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-primary-500/10 via-secondary-500/5 to-transparent blur-[50px] pointer-events-none rounded-full" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              <BarChart3 className="h-3 w-3" /> ANALYTICS DASHBOARD
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
              {currUser ? `${currUser.name}'s Website Audit Dashboard` : "Website Audit Dashboard"}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Explore your audit history, track scores over time, and simulate improvements.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onAuditNew}
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm rounded-xl font-bold text-xs"
            >
              <Plus className="h-4 w-4" /> Run New Audit
            </button>
            {totalScans > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3.5 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:text-error-600 transition flex items-center gap-1.5 cursor-pointer"
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
        <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary-300 transition shadow-sm card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Audit Count</span>
            <div className="p-1.5 bg-primary-50 border border-primary-100 text-primary-600 rounded-lg">
              <Globe className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-gray-900 block tracking-tight">{totalScans}</span>
            <span className="text-[11px] text-gray-500 block mt-1 leading-none">Scanned URLs in history</span>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary-300 transition shadow-sm card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Average Score</span>
            <div className="p-1.5 bg-success-50 border border-success-100 text-success-600 rounded-lg">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-gray-900 block tracking-tight">{avgScore}</span>
              <span className="text-xs font-mono font-bold text-success-600">/100</span>
            </div>
            <span className="text-[11px] text-gray-500 block mt-1 leading-none">
              {avgScore >= 90 ? "Excellent Avg Grade" : avgScore >= 70 ? "Needs Minor Edits" : "Action Recommended"}
            </span>
          </div>
        </div>

        {/* Card 3: Top Performer */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary-300 transition shadow-sm card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Top Score</span>
            <div className="p-1.5 bg-secondary-50 border border-secondary-100 text-secondary-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-gray-900 block tracking-tight">{highestScore}</span>
              <span className="text-[10px] text-gray-500 font-mono font-bold">Max</span>
            </div>
            <p className="text-[11px] text-gray-500 truncate mt-1 leading-none">
              {totalScans > 0 ? `Best: ${auditHistory.reduce((a, b) => b.score > a.score ? b : a).url}` : "No scanned records"}
            </p>
          </div>
        </div>

        {/* Card 4: Weakest Performer */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary-300 transition shadow-sm card">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Lowest Score</span>
            <div className="p-1.5 bg-warning-50 border border-warning-100 text-warning-600 rounded-lg">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-gray-900 block tracking-tight">{lowestScore}</span>
              <span className="text-[10px] text-gray-500 font-mono font-bold">Min</span>
            </div>
            <p className="text-[11px] text-gray-500 truncate mt-1 leading-none">
              {totalScans > 0 ? `Needs work: ${auditHistory.reduce((a, b) => b.score < a.score ? b : a).url}` : "No scanned records"}
            </p>
          </div>
        </div>
      </div>

      {totalScans === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyStateCard
            icon={FolderOpen}
            title="No Projects"
            description="Create your first workspace project and start organizing priority audits in one place."
            actionLabel="Start a project"
            onAction={onAuditNew}
          />
          <EmptyStateCard
            icon={Activity}
            title="No Recent Activity"
            description="Your latest scans and project updates will show up here as soon as you begin auditing."
            actionLabel="Run your first audit"
            onAction={onAuditNew}
          />
        </div>
      )}

      {/* Main Grid: timeline chart + score comparison charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Score Timeline & url comparison */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Integrated Interactive History Progress Tracker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="space-y-0.5">
                <h3 className="font-bold text-gray-900 text-sm">Score Trend Timeline</h3>
                <p className="text-[10px] text-gray-500">Chronological score trend for all inspected domains</p>
              </div>
              <span className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                Interactive Chart
              </span>
            </div>

            {totalScans < 2 ? (
              <div className="text-center py-10 text-gray-500 space-y-2">
                <p className="text-xs">Run audits on multiple domains to view chronological charts.</p>
                <button
                  onClick={onAuditNew}
                  className="text-xs text-primary-600 hover:underline font-bold cursor-pointer"
                >
                  Scan another site now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Line Graph */}
                <div className="relative pt-6 px-2 bg-gray-50 rounded-xl border border-gray-200">
                  <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />

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
                        const y = 110 - (item.score / 100) * 100;
                        return { x, y, ...item };
                      });

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
                                stroke="#ffffff"
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
                  <div className="flex justify-between text-[9px] font-mono text-gray-500 pt-2 border-t border-gray-200 mt-2 px-1">
                    <span>{auditHistory[0]?.date || "Oldest"}</span>
                    <span>Progression</span>
                    <span>{auditHistory[auditHistory.length - 1]?.date || "Latest"}</span>
                  </div>
                </div>

                {/* Hover Details Panel */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center h-14">
                  {hoveredDataPoint !== null ? (
                    <>
                      <div className="text-left">
                        <span className="text-[10px] font-mono text-gray-500 block leading-tight">INSPECTED DOMAIN</span>
                        <span className="text-xs font-bold font-mono text-gray-900">{auditHistory[hoveredDataPoint].url}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-gray-500 block leading-tight">HEALTH RATING</span>
                        <span className={`text-sm font-black font-mono ${
                          auditHistory[hoveredDataPoint].score >= 90 ? "text-success-700" : "text-warning-700"
                        }`}>{auditHistory[hoveredDataPoint].score} / 100</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] font-mono text-gray-500 italic mx-auto flex items-center gap-1.5 select-none md:gap-2">
                      <Info className="h-3.5 w-3.5 text-primary-600 shrink-0" /> Hover over timelines nodes to inspect previous metrics!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Multi-URL Comparator */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-4 gap-2">
              <div className="space-y-0.5">
                <h3 className="font-bold text-gray-900 text-sm">Multi-URL Comparator</h3>
                <p className="text-[10px] text-gray-500">Pick up to 3 domains to analyze and contrast</p>
              </div>
              <span className="text-[9px] font-mono text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded shrink-0 self-start">
                {comparingUrls.length} selected
              </span>
            </div>

            {totalScans === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Your crawl log is clean. Run a scan to unlock comparison widgets!</p>
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
                            ? "bg-primary-50 text-primary-700 border-primary-200"
                            : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-primary-600 animate-pulse" : "bg-gray-400"}`} />
                        {item.url} ({item.score})
                      </button>
                    );
                  })}
                </div>

                {/* Compare Display */}
                {comparingUrls.length > 0 ? (
                  <div className="bg-gray-50 border border-gray-200 w-full p-4 rounded-xl space-y-3.5">
                    {comparingUrls.map((urlName) => {
                      const record = auditHistory.find(item => item.url === urlName);
                      if (!record) return null;
                      return (
                        <div key={urlName} className="space-y-1 text-left">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-800 font-mono flex items-center gap-1">
                              <Globe className="h-3 w-3 text-gray-500" /> {urlName}
                            </span>
                            <span className={`font-bold font-mono text-xs px-2 py-0.5 rounded border ${getScoreBadgeClass(record.score)}`}>
                              Score: {record.score}/100
                            </span>
                          </div>
                          {/* Relative graph horizontal bar */}
                          <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-gray-200">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                record.score >= 90 ? "bg-success-500" : record.score >= 70 ? "bg-warning-500" : "bg-error-500"
                              }`}
                              style={{ width: `${record.score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                    <p className="text-xs">Select any website domain tags above to initiate a side-by-side comparison.</p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Simulated AI Sandbox & checklist */}
        <div className="space-y-6">
          
          {/* Diagnostic score calculator sandbox */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 mb-1 bg-gray-50 border border-gray-200 w-fit px-2 py-0.5 rounded text-[9px] text-primary-600 font-mono font-bold">
                <Sparkles className="h-3 w-3 inline text-warning-500" /> SIMULATION SANDBOX
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Simulated Score Improvements</h3>
              <p className="text-[10px] text-gray-500">Toggle optimization tasks to see simulated score upgrades</p>
            </div>

            {/* Score Lift Visual Gauge */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-primary-500/10 blur-[30px] rounded-full pointer-events-none" />
              
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Simulated Grade</span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-4xl font-black font-mono transition-colors duration-200 ${
                    simulatedScore >= 90 ? "text-success-700" : simulatedScore >= 70 ? "text-warning-700" : "text-error-700"
                  }`}>
                    {simulatedScore}
                  </span>
                  <span className="text-sm font-bold text-gray-500">/ 100</span>
                </div>
                {simulatedScore > baseScore ? (
                  <span className="text-[10px] font-semibold text-success-700 bg-success-50 border border-success-100 px-2 py-0.5 rounded-full inline-block mt-1">
                    ★ Estimated Score Lift: +{simulatedScore - baseScore} points!
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 italic block mt-1">
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
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none hover:border-primary-200 ${
                    item.checked 
                      ? "bg-primary-50 border-primary-200 text-gray-900" 
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition ${
                      item.checked 
                        ? "bg-primary-600 border-primary-600 text-white" 
                        : "border-gray-300 bg-white"
                    }`}>
                      {item.checked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="space-y-1 flex-1 text-left">
                    <span className="text-[10px] font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                      {item.category}
                    </span>
                    <p className={`text-xs leading-normal ${item.checked ? "text-gray-900 font-medium" : "text-gray-700"}`}>
                      {item.label}
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold shrink-0 py-0.5 px-2 rounded-md ${
                    item.checked ? "text-primary-700 bg-primary-50" : "text-gray-500 bg-white border border-gray-200"
                  }`}>
                    +{item.impact}
                  </span>
                </div>
              ))}
            </div>

            {/* Playbook AI advisory tip */}
            <div className="bg-primary-50 p-3 rounded-xl border border-primary-100 text-left">
              <span className="text-[10px] font-bold text-primary-700 uppercase tracking-widest block mb-1">
                AI Advisory Tip
              </span>
              <p className="text-xs text-gray-700 leading-relaxed font-sans">
                The best ways to improve your website are: adding descriptions to images, making your code smaller, and using headings in order!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Audit Crawl History & Reports Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              <History className="h-3 w-3" /> AUDIT HISTORY
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Your Audit History</h3>
            <p className="text-xs text-gray-600">
              Inspect past evaluations, reload audits, or compare historical scans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter domain crawls..."
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition w-48 sm:w-60"
              />
            </div>
            <button
              onClick={onAuditNew}
              className="px-3.5 py-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 hover:shadow-lg text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Run New Audit
            </button>
            {auditHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 bg-gray-100 hover:bg-error-50 text-gray-600 hover:text-error-600 border border-gray-200 hover:border-error-200 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Audit History Table */}
        {auditHistory.length === 0 ? (
          <div className="py-4">
            <EmptyStateCard
              icon={History}
              title="No Audit History"
              description="Run your first website audit to build a history of scores, insights, and improvement milestones."
              actionLabel="Run your first audit"
              onAction={onAuditNew}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-mono uppercase tracking-wider text-gray-500">
                  <th className="pb-3 pl-2">Target Website URL</th>
                  <th className="pb-3">Scan Date</th>
                  <th className="pb-3">Health Score</th>
                  <th className="pb-3">Compliance Index Bar</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditHistory
                  .filter((item) =>
                    item.url.toLowerCase().includes(historyQuery.toLowerCase())
                  )
                  .map((item, idx) => (
                    <tr key={idx} className="group hover:bg-gray-50 transition">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-primary-600 transition">
                            <Globe className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs text-gray-900 block">
                              {item.url}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-600">
                          <Calendar className="h-3 w-3 text-gray-400" />
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
                          <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                item.score >= 90
                                  ? "bg-success-500"
                                  : item.score >= 70
                                  ? "bg-warning-500"
                                  : "bg-error-500"
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
                            className="px-2.5 py-1 bg-gray-100 hover:bg-primary-50 text-gray-700 hover:text-primary-700 border border-gray-200 hover:border-primary-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Inspect full audit report"
                          >
                            <ExternalLink className="h-3 w-3" /> View Report
                          </button>
                          <button
                            onClick={() => handleToggleCompare(item.url)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                              comparingUrls.includes(item.url)
                                ? "bg-primary-50 text-primary-700 border-primary-200"
                                : "bg-gray-100 text-gray-600 border-gray-200 hover:text-gray-900"
                            }`}
                            title="Compare this scan"
                          >
                            {comparingUrls.includes(item.url) ? "Comparing" : "Compare"}
                          </button>
                          {onDeleteAudit && (
                            <button
                              onClick={() => onDeleteAudit(item.url)}
                              className="p-1.5 bg-gray-100 hover:bg-error-50 text-gray-500 hover:text-error-600 border border-gray-200 hover:border-error-200 rounded-lg transition cursor-pointer"
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
