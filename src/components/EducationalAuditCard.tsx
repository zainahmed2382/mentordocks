import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProblemItem } from "../types";
import { AlertCircle, ChevronDown, ChevronUp, MapPin, Code2 } from "lucide-react";

interface EducationalAuditCardProps {
  key?: React.Key;
  problem: ProblemItem;
  defaultExpanded?: boolean;
}

export default function EducationalAuditCard({
  problem,
  defaultExpanded = true,
}: EducationalAuditCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showDevDetails, setShowDevDetails] = useState(false);

  const details = problem.details;

  // Friendly title in plain language
  const friendlyTitle = details?.friendlyTitle || problem.title;

  // 1. PROBLEM (1-2 simple sentences)
  const simpleProblem = details?.simpleProblem || details?.whatItMeans || problem.description;

  // 2. WHY IT MATTERS
  const whyItMatters =
    details?.whyItHappened ||
    "This issue affects your website's performance, user experience, search engine ranking, or accessibility.";

  // 3. HOW TO FIX IT (Simplest practical solution in plain language)
  const howToFixSteps: string[] =
    details?.howToFixSteps && details.howToFixSteps.length > 0
      ? details.howToFixSteps
      : details?.stepByStepSolution && details.stepByStepSolution.length > 0
      ? details.stepByStepSolution
      : [
          details?.bestRecommendation ||
            "Apply the specific fix for this issue on your website.",
        ];

  // 3. RECOMMENDATION (One specific recommendation based only on the detected issue)
  const recommendation =
    details?.bestRecommendation ||
    "Address this specific issue according to web standards.";

  // Optional Developer info
  const hasDevInfo = Boolean(details?.codeSnippet || details?.readyToUseExample);
  const codeSnippet = details?.codeSnippet;
  const readyToUseExample = details?.readyToUseExample;

  // 3 simple priority levels (Section 12 requirement)
  const isImportant = problem.severity === "critical" || details?.priority === "Critical" || details?.priority === "High";
  const isNeedsImprovement = problem.severity === "medium" || details?.priority === "Medium";
  
  const priorityLabel = isImportant ? "🔴 Important" : isNeedsImprovement ? "🟡 Needs Improvement" : "🟢 Good";
  const priorityBadgeStyle = isImportant
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800"
    : isNeedsImprovement
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800"
    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800";

  // Location / Category
  const whereIsIssueVal = details?.whereIsIssue || problem.category || "Website Analysis";

  return (
    <div
      className={`bg-white dark:bg-[#11131E] border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm ${
        isExpanded
          ? "border-indigo-400 dark:border-indigo-700/80 shadow-md ring-2 ring-indigo-500/10"
          : "border-gray-200 dark:border-slate-800/90 hover:border-gray-300 dark:hover:border-slate-700"
      }`}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none group bg-white dark:bg-[#11131E]"
      >
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
              isImportant
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                : isNeedsImprovement
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
          </div>

          <div className="flex flex-col gap-2 min-w-0 flex-1">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] md:text-[11px] font-extrabold border shadow-xs ${priorityBadgeStyle}`}
              >
                {priorityLabel}
              </span>

              <span className="px-3 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-indigo-500" />
                {whereIsIssueVal}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-sans font-bold text-base md:text-lg text-[#1A1A1A] dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {friendlyTitle}
            </h4>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            <span className="hidden sm:inline">{isExpanded ? "Hide Details" : "View Fix"}</span>
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sections: PROBLEM, HOW TO FIX IT, RECOMMENDATION, FOR DEVELOPERS */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-t border-gray-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#0B0D14] p-5 md:p-7 flex flex-col gap-5"
          >
            {/* 🔴 Section 1: PROBLEM */}
            <div className="bg-white dark:bg-[#131520] border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs md:text-sm uppercase tracking-wide">
                <span className="text-base md:text-lg">🔴</span>
                <span>PROBLEM</span>
              </div>
              <p className="text-sm md:text-base text-gray-900 dark:text-slate-100 font-medium leading-relaxed">
                {simpleProblem}
              </p>
            </div>

            {/* ⚠️ Section 2: WHY IT MATTERS */}
            <div className="bg-white dark:bg-[#131520] border border-sky-200 dark:border-sky-900/40 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-extrabold text-xs md:text-sm uppercase tracking-wide">
                <span className="text-base md:text-lg">⚠️</span>
                <span>WHY IT MATTERS</span>
              </div>
              <p className="text-sm md:text-base text-gray-800 dark:text-slate-200 font-medium leading-relaxed">
                {whyItMatters}
              </p>
            </div>

            {/* 🛠️ Section 3: HOW TO FIX IT */}
            <div className="bg-white dark:bg-[#131520] border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-3.5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs md:text-sm uppercase tracking-wide">
                <span className="text-base md:text-lg">🛠️</span>
                <span>HOW TO FIX IT</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {howToFixSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-950/40"
                  >
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs md:text-sm text-gray-800 dark:text-slate-200 leading-relaxed font-medium pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 💡 Section 4: RECOMMENDATION */}
            <div className="bg-white dark:bg-[#131520] border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-xs md:text-sm uppercase tracking-wide">
                <span className="text-base md:text-lg">💡</span>
                <span>RECOMMENDATION</span>
              </div>
              <p className="text-xs md:text-sm text-gray-800 dark:text-slate-200 font-semibold leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                {recommendation}
              </p>
            </div>

            {/* 💻 Optional Section: FOR DEVELOPERS */}
            {hasDevInfo && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-100/60 dark:bg-[#0F1118]">
                <button
                  type="button"
                  onClick={() => setShowDevDetails(!showDevDetails)}
                  className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-indigo-500" />
                    <span>For Developers (Optional Technical Reference)</span>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                    {showDevDetails ? "Hide Code" : "Show Code"}
                    {showDevDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </span>
                </button>

                <AnimatePresence>
                  {showDevDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3"
                    >
                      {readyToUseExample && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Example:</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-mono mt-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                            {readyToUseExample}
                          </p>
                        </div>
                      )}
                      {codeSnippet && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code Snippet:</span>
                          <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-slate-900 dark:bg-black p-4 rounded-xl overflow-x-auto mt-1 border border-slate-800">
                            {codeSnippet}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


