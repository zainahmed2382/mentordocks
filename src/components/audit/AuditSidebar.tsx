import React from "react";
import {
  LayoutDashboard, ScanLine, FileText, History,
  FolderOpen, Settings, Zap, ChevronRight, X, Sparkles, BarChart3, Database
} from "lucide-react";

type SidebarSection = "overview" | "findings" | "vitals" | "ai" | "history";

interface AuditSidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (s: SidebarSection) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  issueCount: number;
  overallScore: number;
  websiteUrl: string;
  onUpgradeClick?: () => void;
}

const NAV_ITEMS = [
  { id: "overview" as SidebarSection, label: "Dashboard", icon: LayoutDashboard, badge: null },
  { id: "findings" as SidebarSection, label: "Audit Findings", icon: FileText, badge: "issues" as const },
  { id: "vitals" as SidebarSection, label: "Core Web Vitals", icon: ScanLine, badge: null },
  { id: "ai" as SidebarSection, label: "AI Recommendations", icon: Zap, badge: null },
  { id: "history" as SidebarSection, label: "History", icon: History, badge: null },
];

// Set to true to re-enable "Projects" and "Settings" sections in the future
const ENABLE_FUTURE_FEATURES = false;

const SECONDARY_ITEMS = [
  { label: "Projects", icon: FolderOpen },
  { label: "Settings", icon: Settings },
];

export const AuditSidebar: React.FC<AuditSidebarProps> = ({
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileClose,
  issueCount,
  overallScore,
  websiteUrl,
  onUpgradeClick
}) => {
  const displayUrl = websiteUrl
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .slice(0, 22);

  const scoreColor = overallScore >= 90 ? "text-emerald-400" : overallScore >= 70 ? "text-blue-400" : overallScore >= 50 ? "text-amber-400" : "text-red-400";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-900">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Zap className="h-4 w-4 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">Mentor<span className="text-blue-400">Docks</span></span>
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Audit Console</div>
          </div>
        </div>
      </div>

      {/* Current audit site pill */}
      {websiteUrl && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl px-4 py-3 shadow-inner">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Target Domain</div>
            <div className="text-xs font-bold text-slate-200 truncate">{displayUrl}</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
              <span className="text-[9px] text-slate-500 font-medium">Health Index</span>
              <span className={`text-xs font-black font-mono ${scoreColor}`}>{overallScore} / 100</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Navigation</div>
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onSectionChange(item.id); onMobileClose(); }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 cursor-pointer group relative ${
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-950/50"
                  : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent"
              }`}
            >
              <span className={`absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-md transition-all duration-300 origin-left ${isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"}`} />
              <div className="flex items-center gap-2.5">
                <item.icon className={`h-4 w-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-400 ${isActive ? "text-blue-400 scale-105" : "text-slate-500"}`} />
                <span className={`text-xs transition-colors duration-300 ${isActive ? "font-bold text-blue-400" : "font-semibold text-slate-400 group-hover:text-slate-200"}`}>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge === "issues" && issueCount > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 ${isActive ? "bg-blue-500/20 text-blue-400" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                    {issueCount}
                  </span>
                )}
                <ChevronRight className={`h-3 w-3 transition-all duration-300 ${isActive ? "text-blue-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5"}`} />
              </div>
            </button>
          );
        })}

        {/* Divider & Future Features (Projects/Settings) */}
        {ENABLE_FUTURE_FEATURES && (
          <>
            <div className="h-px bg-slate-900 my-3 mx-2" />
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">General</div>
            {SECONDARY_ITEMS.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-900 hover:text-slate-300 text-left transition-all duration-150 cursor-pointer group border border-transparent"
              >
                <item.icon className="h-4 w-4 flex-shrink-0 text-slate-600 group-hover:text-slate-300" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Bottom Pro / Usage Section */}
      <div className="px-4 py-4 border-t border-slate-900 bg-slate-950/80">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-3.5 shadow-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Plan: <span className="text-blue-400 font-black">Free Tier</span></span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-500/10 px-1.5 py-0.2 text-[9px] font-bold text-violet-400 border border-violet-500/20">
              <Sparkles className="h-2 w-2" /> Pro
            </span>
          </div>
          
          <div className="space-y-1 mt-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3 text-slate-500" /> Audit Usage</span>
              <span className="font-mono font-bold text-slate-300">4 / 10 scans</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: "40%" }} />
            </div>
          </div>

          <div className="space-y-1 mt-2.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><Database className="h-3 w-3 text-slate-500" /> API Storage</span>
              <span className="font-mono font-bold text-slate-300">0.4 / 1.0 GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" style={{ width: "40%" }} />
            </div>
          </div>

          <button
            onClick={onUpgradeClick}
            className="w-full mt-3.5 py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all duration-200 hover:shadow-lg hover:shadow-violet-950/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="h-3 w-3" />
            Upgrade to Pro
          </button>
        </div>
        <div className="text-[9px] text-slate-600 text-center mt-3 font-mono">
          MentorDocks © 2026
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-64 h-full flex flex-col shadow-2xl animate-slide-left">
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition cursor-pointer z-10"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

