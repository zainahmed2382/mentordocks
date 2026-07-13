import React, { useState } from "react";
import { ExternalLink, RotateCcw, Download, Share2, Calendar, Globe, Check } from "lucide-react";

interface AuditHeaderProps {
  websiteUrl: string;
  scanDate: string;
  onRescan: () => void;
  onExportPDF: () => void;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({
  websiteUrl,
  scanDate,
  onRescan,
  onExportPDF
}) => {
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?url=${encodeURIComponent(websiteUrl)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // Format URL for display
  const displayUrl = websiteUrl
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: URL + Scan Info */}
        <div className="flex items-start md:items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0">
            <Globe className="h-4 w-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 truncate max-w-xs md:max-w-md">
                {displayUrl}
              </h2>
              <a
                href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition flex-shrink-0"
                title="Open website"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span className="text-xs text-slate-500">Last scanned: {scanDate}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Audit Complete
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Re-scan */}
          <button
            onClick={onRescan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition hover:shadow-sm cursor-pointer"
            title="Re-scan this URL"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Re-scan</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition hover:shadow-sm cursor-pointer"
            title="Copy share link"
          >
            {shareCopied
              ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> <span className="hidden sm:inline text-emerald-600">Copied!</span></>
              : <><Share2 className="h-3.5 w-3.5 text-slate-500" /> <span className="hidden sm:inline">Share</span></>
            }
          </button>

          {/* Download PDF */}
          <button
            onClick={onExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm hover:shadow-md cursor-pointer"
            title="Download PDF report"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
