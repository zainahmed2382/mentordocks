import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Clock,
  PlusCircle,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Image,
  Palette,
  Monitor,
  FileCode2,
  Sparkles,
  CheckCircle2,
  X
} from "lucide-react";
import { WebsiteScan } from "../types";

// --- PROJECTS TAB ---
interface ProjectsPageProps {
  onScanClick: (url: string) => void;
  projects: any[];
  onSaveProject: (project: { name: string; url: string; category: string; score?: number; lastScan?: string; issues?: number }) => Promise<void>;
  user: any;
  onLoginClick: () => void;
  scanHistory?: WebsiteScan[];
}

export function ProjectsPage({ onScanClick, projects, onSaveProject, user, onLoginClick, scanHistory = [] }: ProjectsPageProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Landing Page");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName || !trimmedUrl) {
      setError("Please fill in both the project name and website URL.");
      return;
    }

    // Basic URL validation
    let formattedUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = "https://" + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setError("Please enter a valid website URL (e.g., example.com).");
      return;
    }

    setIsSaving(true);
    try {
      // Find latest scan score if available
      const matchingScan = scanHistory.find(
        (s) => s.url.toLowerCase().replace(/\/$/, "") === formattedUrl.toLowerCase().replace(/\/$/, "")
      );

      await onSaveProject({
        name: trimmedName,
        url: formattedUrl,
        category,
        score: matchingScan ? matchingScan.score : 80,
        lastScan: matchingScan ? matchingScan.date : "Just now",
        issues: matchingScan ? matchingScan.problems.length : 2,
      });

      // Reset
      setName("");
      setUrl("");
      setCategory("Landing Page");
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto px-4 md:px-16 pt-10 pb-20 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#1A1A1A] dark:text-slate-100 tracking-tight">Saved Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {user ? "Save websites and keep track of their audit health and improvement scores over time." : "Sign in to save and monitor your websites."}
          </p>
        </div>
        
        {user ? (
          <button
            onClick={() => {
              setError("");
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs md:text-sm px-5 py-2.5 rounded-full shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Track New Website</span>
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-xs md:text-sm px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" /> Sign In to Track Websites
          </button>
        )}
      </div>

      {/* Track Website Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#131520] rounded-[28px] border border-gray-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl max-w-lg w-full relative z-10"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-gray-900 dark:text-slate-100">Track New Website</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Enter the website name and address to save it to your dashboard.
            </p>

            {error && (
              <div className="mb-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Portfolio or Company Store"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Website URL</label>
                <input
                  type="text"
                  placeholder="e.g. mywebsite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] dark:text-slate-100 outline-none transition focus:border-indigo-500"
                >
                  <option value="Landing Page">Landing Page</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="SaaS & Web App">SaaS & Web App</option>
                  <option value="Portfolio & Blog">Portfolio & Blog</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Website"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white dark:bg-[#131520] rounded-[32px] p-12 border border-gray-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-200">No tracked websites yet</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            {user ? "Click 'Track New Website' above to save and monitor website health scores." : "Sign in and start saving websites to your tracked list."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-[#131520] rounded-[32px] p-6 border border-gray-200/80 dark:border-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 dark:from-indigo-950/10 to-transparent rounded-bl-full pointer-events-none"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    {project.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#1A1A1A] dark:text-slate-100 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-xs md:max-w-sm">
                    {project.name}
                  </h3>
                  <p className="font-mono text-xs text-gray-400 dark:text-gray-500 mt-1 truncate max-w-xs md:max-w-sm">{project.url}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-display font-extrabold text-indigo-600 dark:text-indigo-400">{project.score}</div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">SCORE</div>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-slate-800/80 my-4"></div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-4">
                  <span className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" /> {project.lastScan || "Recent"}
                  </span>
                  <span className="text-rose-500 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" /> {project.issues ?? 0} Finding(s)
                  </span>
                </div>

                <button
                  onClick={() => onScanClick(project.url)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer hover:underline"
                >
                  Run Audit <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- INSIGHTS TAB ---
interface InsightsPageProps {
  scanHistory?: WebsiteScan[];
  activeScan?: WebsiteScan | null;
}

export function InsightsPage({ scanHistory = [], activeScan }: InsightsPageProps) {
  // Compute real average score
  const totalScans = scanHistory.length > 0 ? scanHistory : (activeScan ? [activeScan] : []);
  const avgScore =
    totalScans.length > 0
      ? Math.round(totalScans.reduce((sum, s) => sum + (s.score || 0), 0) / totalScans.length)
      : 82;

  const commonBottlenecks = [
    {
      title: "Some images are larger than they need to be",
      rate: 70,
      icon: Image,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-950/20",
      gradient: "from-sky-500 via-cyan-500 to-blue-500 dark:from-sky-400 dark:via-cyan-400 dark:to-blue-400",
      glow: "shadow-[0_0_10px_rgba(56,189,248,0.25)]"
    },
    {
      title: "Some text may be hard to read on its background",
      rate: 65,
      icon: Palette,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-500 via-indigo-500 to-violet-500 dark:from-purple-400 dark:via-indigo-400 dark:to-violet-400",
      glow: "shadow-[0_0_10px_rgba(192,132,252,0.25)]"
    },
    {
      title: "Your website may not adjust smoothly on every screen size",
      rate: 45,
      icon: Monitor,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950/20",
      gradient: "from-pink-500 via-rose-500 to-fuchsia-500 dark:from-pink-400 dark:via-rose-400 dark:to-fuchsia-400",
      glow: "shadow-[0_0_10px_rgba(244,114,182,0.25)]"
    },
    {
      title: "Some scripts may be doing unnecessary work",
      rate: 40,
      icon: FileCode2,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      gradient: "from-rose-500 via-red-500 to-amber-500 dark:from-rose-400 dark:via-red-400 dark:to-amber-400",
      glow: "shadow-[0_0_10px_rgba(251,113,133,0.25)]"
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto px-4 md:px-16 pt-10 pb-20 font-sans">
      <div className="border-b border-gray-200/60 dark:border-slate-800/60 pb-6">
        <h1 className="font-display text-3xl font-extrabold text-[#1A1A1A] dark:text-slate-100 tracking-tight flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-indigo-600 dark:text-indigo-400" /> Your Website Insights
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Summary of common audit findings and practical tips to improve your website's performance and design.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Summary Card */}
        <div className="bg-white dark:bg-[#131520] rounded-[32px] p-6 border border-gray-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">Average Audit Index</h3>
            <div className="text-4xl font-display font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
              {avgScore} / 100
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed font-medium">
              Based on your website audits, your overall health tier is{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {avgScore >= 85 ? "Excellent" : avgScore >= 70 ? "Good" : "Needs Improvement"}
              </span>
              . Image compression and text readability are the most effective ways to boost your score.
            </p>
          </div>
          <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000"
              style={{ width: `${avgScore}%` }}
            ></div>
          </div>
        </div>

        {/* Global Statistics Grid (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131520] rounded-[32px] p-6 border border-gray-200/80 dark:border-slate-800/80 shadow-sm flex flex-col gap-4">
          <h3 className="font-display text-base font-bold text-[#1A1A1A] dark:text-slate-200 flex items-center gap-2 mb-2">
            <Compass className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Most Frequent Website Problems
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonBottlenecks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-gray-50/50 dark:bg-[#0A0B10]/40 border border-gray-100 dark:border-slate-800 rounded-[20px] p-4 flex gap-4 items-center">
                  <div className={`p-2.5 rounded-xl ${item.bg} border border-gray-100 dark:border-slate-800 shrink-0`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs md:text-sm font-bold text-[#1A1A1A] dark:text-slate-200 truncate leading-tight">{item.title}</h4>
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="h-2.5 flex-grow bg-gray-200/80 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-gray-200/40 dark:border-slate-700/50 shadow-inner">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${item.rate}%` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 * idx }}
                          className={`h-full bg-gradient-to-r ${item.gradient} rounded-full ${item.glow}`}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-slate-300 shrink-0">{item.rate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recommended Design Checkpoints List */}
      <section className="bg-white dark:bg-[#131520] rounded-[32px] p-6 border border-gray-200/80 dark:border-slate-800/80 shadow-sm">
        <h3 className="font-display text-base font-bold text-[#1A1A1A] dark:text-slate-200 flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Recommended Action Checkpoints
        </h3>
        <div className="flex flex-col gap-3">
          <div className="bg-gray-50/50 dark:bg-[#0A0B10]/40 border border-gray-100 dark:border-slate-800/80 rounded-[20px] p-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-all">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-sky-500"></span>
              <span className="text-xs md:text-sm text-[#1A1A1A] dark:text-slate-200 font-semibold">Convert heavy PNG and JPEG images to WebP format</span>
            </div>
            <span className="text-[10px] bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 font-bold px-2 py-0.5 rounded uppercase">High Impact</span>
          </div>
          <div className="bg-gray-50/50 dark:bg-[#0A0B10]/40 border border-gray-100 dark:border-slate-800/80 rounded-[20px] p-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-all">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              <span className="text-xs md:text-sm text-[#1A1A1A] dark:text-slate-200 font-semibold">Ensure text colors stand out clearly against backgrounds</span>
            </div>
            <span className="text-[10px] bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 font-bold px-2 py-0.5 rounded uppercase">High Impact</span>
          </div>
          <div className="bg-gray-50/50 dark:bg-[#0A0B10]/40 border border-gray-100 dark:border-slate-800/80 rounded-[20px] p-4 flex items-center justify-between hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-all">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-pink-500"></span>
              <span className="text-xs md:text-sm text-[#1A1A1A] dark:text-slate-200 font-semibold">Add image descriptions (alt text) so screen readers can describe pictures</span>
            </div>
            <span className="text-[10px] bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30 font-bold px-2 py-0.5 rounded uppercase">Medium Impact</span>
          </div>
        </div>
      </section>
    </div>
  );
}
