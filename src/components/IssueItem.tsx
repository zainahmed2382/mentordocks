import React, { useState } from "react";
import { AuditIssue } from "../types";
import { AlertTriangle, XCircle, Info, Copy, Check, Terminal, FileCode, Hammer } from "lucide-react";

interface IssueItemProps {
  issue: AuditIssue;
}

export const IssueItem: React.FC<IssueItemProps> = ({ issue }) => {
  const [copied, setCopied] = useState(false);

  // Determine severity aesthetics
  let severityBadge = "";
  let severityIcon = <Info className="h-4 w-4" />;
  let borderAccent = "";

  switch (issue.severity) {
    case "High":
      severityBadge = "bg-rose-950/30 text-rose-400 border-rose-900/45";
      severityIcon = <XCircle className="h-4 w-4 text-rose-500" />;
      borderAccent = "border-l-4 border-l-rose-500";
      break;
    case "Medium":
      severityBadge = "bg-amber-950/30 text-amber-400 border-amber-900/45";
      severityIcon = <AlertTriangle className="h-4 w-4 text-amber-500" />;
      borderAccent = "border-l-4 border-l-amber-500";
      break;
    case "Low":
      severityBadge = "bg-[#1a1a1a] text-slate-400 border-[#333]";
      severityIcon = <Info className="h-4 w-4 text-slate-400" />;
      borderAccent = "border-l-4 border-l-slate-600";
      break;
  }

  const handleCopyCode = async () => {
    if (!issue.example_fix) return;
    try {
      await navigator.clipboard.writeText(issue.example_fix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy clipboard content:", err);
    }
  };

  return (
    <div
      className={`bg-[#0a0a0a] rounded-lg border border-[#222] shadow-lg overflow-hidden transition-all duration-200 ${borderAccent}`}
    >
      <div className="p-5">
        {/* Category & Severity Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#1a1a1a] text-blue-400 border border-[#333] px-2 py-0.5 rounded">
              {issue.category}
            </span>
            <span className={`text-xs font-medium border px-2 py-0.5 rounded-full flex items-center gap-1.5 ${severityBadge}`}>
              {severityIcon}
              {issue.severity} Severity
            </span>
          </div>
        </div>

        {/* Issue Tile */}
        <h3 className="text-base font-semibold text-white mb-2 font-display">
          {issue.problem}
        </h3>

        {/* Detailed Description Grid */}
        <div className="space-y-3.5 mt-4">
          {/* Why it is a problem */}
          <div className="text-sm">
            <div className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1">Impact Analysis</div>
            <p className="text-[#a5a5a5] leading-relaxed bg-[#111] p-2.5 rounded border border-[#222]">
              {issue.reason}
            </p>
          </div>

          {/* Actionable fix roadmap */}
          <div className="text-sm">
            <div className="text-gray-500 font-medium text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Hammer className="h-3 w-3 text-blue-500" /> Actionable Recommendation
            </div>
            <p className="text-white font-medium leading-relaxed bg-[#111]/40 p-2.5 rounded border border-[#1b1b1b]">
              {issue.recommendation}
            </p>
          </div>

          {/* Example fix (Code block if exists) */}
          {issue.example_fix && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-gray-500 font-medium text-xs uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1">
                  <FileCode className="h-3 w-3 text-slate-500" /> Remediation Blueprint
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-0.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] text-[#aaa] rounded text-[10px] transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Snippet
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-[#030303] rounded-lg text-xs text-slate-300 font-mono overflow-x-auto border border-[#222] leading-relaxed shadow-inner max-h-72">
                <code>{issue.example_fix}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
