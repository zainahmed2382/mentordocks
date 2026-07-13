import React from "react";
import {
  LayoutDashboard, ScanLine, FileText, History,
  FolderOpen, Settings, Zap, ChevronRight, X
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
}

const NAV_ITEMS = [
  { id: "overview" as SidebarSection, label: "Dashboard", icon: LayoutDashboard, badge: null },
  { id: "findings" as SidebarSection, label: "Audit Findings", icon: FileText, badge: "issues" as const },
  { id: "vitals" as SidebarSection, label: "Core Web Vitals", icon: ScanLine, badge: null },
  { id: "ai" as SidebarSection, label: "AI Recommendations", icon: Zap, badge: null },
  { id: "history" as SidebarSection, label: "History", icon: History, badge: null },
];

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
  websiteUrl
}) => {
  const displayUrl = websiteUrl
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .slice(0, 22);

  const scoreColor = overallScore >= 90 ? "text-emerald-400" : overallScore >= 70 ? "text-blue-400" : overallScore >= 50 ? "text-amber-400" : "text-red-400";

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-md flex-shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">Mentor<span className="text-blue-400">Docks</span></span>
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Audit Dashboard</div>
          </div>
        </div>
      </div>

      {/* Current audit site pill */}
      {websiteUrl && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5">
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Current Audit</div>
            <div className="text-xs font-semibold text-slate-300 truncate">{displayUrl}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[9px] text-slate-500">Overall Score</span>
              <span className={`text-sm font-black ${scoreColor}`}>{overallScore}</span>
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
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer group ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge === "issues" && issueCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-red-500/20 text-red-400"}`}>
                    {issueCount}
                  </span>
                )}
                <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? "text-white/60 translate-x-0.5" : "text-slate-600 group-hover:translate-x-0.5"}`} />
              </div>
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-slate-700/40 my-3 mx-2" />

        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">General</div>
        {SECONDARY_ITEMS.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-300 text-left transition-all duration-150 cursor-pointer group"
          >
            <item.icon className="h-4 w-4 flex-shrink-0 text-slate-600 group-hover:text-slate-300" />
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-5 pt-3 border-t border-slate-700/60">
        <div className="text-[9px] text-slate-600 text-center">
          MentorDocks © 2026
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-slate-900 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-64 bg-slate-900 h-full flex flex-col shadow-2xl animate-slide-left">
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
