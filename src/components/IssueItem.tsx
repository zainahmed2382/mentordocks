import React, { useState } from "react";
import { AuditIssue } from "../types";
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Hammer, 
  ChevronDown, 
  ChevronUp, 
  Eye,
  EyeOff
} from "lucide-react";

interface IssueItemProps {
  issue: AuditIssue;
  forceExpanded?: boolean;
}

export const IssueItem: React.FC<IssueItemProps> = ({ issue, forceExpanded = false }) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use local state or forceExpanded prop
  const isExpanded = forceExpanded || localExpanded;

  // Determine severity aesthetics
  let severityBadge = "";
  let severityIcon = <Info className="h-3.5 w-3.5" />;
  let borderAccent = "";
  let hoverBg = "";

  switch (issue.severity) {
    case "High":
      severityBadge = "bg-rose-500/10 text-rose-400 border-rose-500/20";
      severityIcon = <XCircle className="h-3.5 w-3.5 text-rose-400" />;
      borderAccent = "border-l-4 border-l-rose-500";
      hoverBg = "hover:bg-rose-500/[0.02]";
      break;
    case "Medium":
      severityBadge = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      severityIcon = <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
      borderAccent = "border-l-4 border-l-amber-550";
      hoverBg = "hover:bg-amber-500/[0.02]";
      break;
    case "Low":
      severityBadge = "bg-zinc-800 text-zinc-400 border-zinc-700/60";
      severityIcon = <Info className="h-3.5 w-3.5 text-zinc-400" />;
      borderAccent = "border-l-4 border-l-zinc-600";
      hoverBg = "hover:bg-zinc-800/10";
      break;
  }

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering accordion close
    if (!issue.example_fix) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(issue.example_fix);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (err) {
      console.warn("Failed to copy clipboard content:", err);
    }

    // Fallback copy using traditional input select
    try {
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = issue.example_fix;
      tempTextArea.style.position = "fixed";
      tempTextArea.style.opacity = "0";
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand("copy");
      document.body.removeChild(tempTextArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (innerErr) {
      console.error("Critical copy fallback sequence exception:", innerErr);
    }
  };

  return (
    <div
      onClick={() => setLocalExpanded(!localExpanded)}
      className={`bg-[#0a0a0a] rounded-xl border border-zinc-900 shadow-md overflow-hidden transition-all duration-200 cursor-pointer ${hoverBg} ${borderAccent} ${
        isExpanded ? "ring-1 ring-blue-500/20 bg-zinc-950/20 border-zinc-800" : ""
      }`}
    >
      <div className="p-4 md:p-5">
        {/* Simple Header view showing context summaries */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5 text-left">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-[#141414] text-blue-400 border border-zinc-800 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {issue.category}
              </span>
              <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded-full flex items-center gap-1 ${severityBadge}`}>
                {severityIcon}
                {issue.severity}
              </span>
            </div>

            {/* Problem Statement */}
            <h3 className="text-sm md:text-base font-bold text-zinc-100 tracking-tight font-sans">
              {issue.problem}
            </h3>
          </div>

          {/* Action indicator on the right */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 hover:text-zinc-400 hidden sm:inline-block">
              {isExpanded ? "Hide Details" : "Inspect Details"}
            </span>
            <div className="h-8 w-8 rounded-full bg-zinc-950 border border-zinc-900 group-hover:bg-zinc-900 flex items-center justify-center text-zinc-400 transition shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-blue-400" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Details Body section */}
        {isExpanded && (
          <div 
            onClick={(e) => e.stopPropagation()} // Stop clicking details closing the card
            className="mt-4 pt-4 border-t border-zinc-900 space-y-4 text-left animate-fade-in"
          >
            {/* Context Impact Analysis */}
            <div className="space-y-1">
              <h4 className="text-zinc-500 font-bold text-[10px] font-mono uppercase tracking-wider">
                Impact Analysis & Reason
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#0e0e0e] hover:bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                {issue.reason}
              </p>
            </div>

            {/* Expert recommendations */}
            <div className="space-y-1">
              <h4 className="text-zinc-500 font-bold text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Hammer className="h-3.5 w-3.5 text-blue-400" /> Actionable Audit Suggestion
              </h4>
              <p className="text-xs text-white font-medium leading-relaxed bg-[#0f0fa0]/5 p-3 rounded-lg border border-blue-900/10">
                {issue.recommendation}
              </p>
            </div>

            {/* Code example remediation blueprint block */}
            {issue.example_fix && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-zinc-500 font-bold text-[10px] font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3.5 w-3.5 text-slate-500" /> Example Fix Snippet
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#141414] hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[#ccc] rounded-md text-[9px] font-mono transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-3.5 bg-black rounded-lg text-[11px] text-zinc-300 font-mono overflow-x-auto border border-zinc-950 leading-relaxed shadow-inner max-h-72">
                    <code>{issue.example_fix}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
