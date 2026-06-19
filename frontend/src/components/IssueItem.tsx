import React, { useState } from "react";
import { AuditIssue } from "../types";
import { AlertTriangle, XCircle, Info, Copy, Check, Terminal, FileCode, Hammer, ChevronDown } from "lucide-react";

interface IssueItemProps {
  issue: AuditIssue;
}

export const IssueItem: React.FC<IssueItemProps> = ({ issue }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

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

  // Truncated preview of the reason for collapsed view
  const previewText = issue.reason.length > 100
    ? issue.reason.slice(0, 100) + "…"
    : issue.reason;

  return (
    <div
      className={`bg-[#0a0a0a] rounded-lg border border-[#222] shadow-lg overflow-hidden transition-all duration-200 ${borderAccent} hover:border-[#333]`}
    >
      {/* Clickable Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 pb-4 cursor-pointer group focus:outline-none"
        aria-expanded={expanded}
      >
        {/* Category & Severity Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#1a1a1a] text-blue-400 border border-[#333] px-2 py-0.5 rounded">
              {issue.category}
            </span>
            <span className={`text-xs font-medium border px-2 py-0.5 rounded-full flex items-center gap-1.5 ${severityBadge}`}>
              {severityIcon}
              {issue.severity}
            </span>
          </div>

          {/* Expand/collapse chevron */}
          <div className="flex items-center gap-2">
            {!expanded && issue.example_fix && (
              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded hidden sm:inline">
                has code fix
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="text-base font-semibold text-white font-display group-hover:text-blue-100 transition-colors">
          {issue.problem}
        </h3>

        {/* Collapsed preview */}
        {!expanded && (
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed line-clamp-2">
            {previewText}
          </p>
        )}
      </button>

      {/* Expandable Detail Section */}
      {expanded && (
        <div className="issue-expand-enter px-5 pb-5">
          <div className="space-y-3.5 pt-1 border-t border-[#1e1e1e]">
            {/* Why it is a problem */}
            <div className="text-sm mt-3.5">
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
                    onClick={(e) => { e.stopPropagation(); handleCopyCode(); }}
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
      )}
    </div>
  );
}
