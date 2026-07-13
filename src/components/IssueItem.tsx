import React, { useState } from "react";
import { AuditIssue } from "../types";
import { 
  AlertTriangle, 
  XCircle, 
  Info, 
  Copy, 
  Check, 
  FileCode, 
  Hammer, 
  ChevronDown, 
  ChevronUp
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
      severityBadge = "bg-error-50 text-error-700 border-error-200";
      severityIcon = <XCircle className="h-3.5 w-3.5 text-error-600" />;
      borderAccent = "border-l-4 border-l-error-500";
      hoverBg = "hover:bg-error-50";
      break;
    case "Medium":
      severityBadge = "bg-warning-50 text-warning-700 border-warning-200";
      severityIcon = <AlertTriangle className="h-3.5 w-3.5 text-warning-600" />;
      borderAccent = "border-l-4 border-l-warning-500";
      hoverBg = "hover:bg-warning-50";
      break;
    case "Low":
      severityBadge = "bg-gray-50 text-gray-700 border-gray-200";
      severityIcon = <Info className="h-3.5 w-3.5 text-gray-600" />;
      borderAccent = "border-l-4 border-l-gray-400";
      hoverBg = "hover:bg-gray-50";
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
      className={`bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden transition-all duration-200 cursor-pointer ${hoverBg} ${borderAccent} ${
        isExpanded ? "ring-1 ring-primary-200 bg-gray-50 border-primary-300" : ""
      }`}
    >
      <div className="p-4 md:p-5">
        {/* Simple Header view showing context summaries */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5 text-left">
            {/* Meta Tags Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                {issue.category}
              </span>
              <span className={`text-[10px] font-mono font-bold border px-2 py-0.5 rounded-full flex items-center gap-1 ${severityBadge}`}>
                {severityIcon}
                {issue.severity}
              </span>
            </div>

            {/* Problem Statement */}
            <h3 className="text-sm md:text-base font-bold text-gray-900 tracking-tight font-sans">
              {issue.problem}
            </h3>
          </div>

          {/* Action indicator on the right */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] font-mono text-gray-500 hover:text-gray-700 hidden sm:inline-block">
              {isExpanded ? "Hide Details" : "Inspect Details"}
            </span>
            <div className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-gray-100 flex items-center justify-center text-gray-500 transition shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-primary-600" />
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
            className="mt-4 pt-4 border-t border-gray-200 space-y-4 text-left animate-fade-in"
          >
            {/* Context Impact Analysis */}
            <div className="space-y-1">
              <h4 className="text-gray-500 font-bold text-[10px] font-mono uppercase tracking-wider">
                Impact Analysis & Reason
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-200">
                {issue.reason}
              </p>
            </div>

            {/* Expert recommendations */}
            <div className="space-y-1">
              <h4 className="text-gray-500 font-bold text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Hammer className="h-3.5 w-3.5 text-primary-600" /> Actionable Audit Suggestion
              </h4>
              <p className="text-xs text-gray-800 font-medium leading-relaxed bg-primary-50 p-3 rounded-lg border border-primary-200">
                {issue.recommendation}
              </p>
            </div>

            {/* Code example remediation blueprint block */}
            {issue.example_fix && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-gray-500 font-bold text-[10px] font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <FileCode className="h-3.5 w-3.5 text-gray-600" /> Example Fix Snippet
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 hover:border-primary-300 text-gray-700 rounded-md text-[9px] font-mono transition cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-success-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <pre className="p-3.5 bg-gray-900 rounded-lg text-[11px] text-gray-100 font-mono overflow-x-auto border border-gray-800 leading-relaxed shadow-inner max-h-72">
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
