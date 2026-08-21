import React, { useState } from "react";
import { Settings, Bell, Cpu, Database, Save, Trash2, Download, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { WebsiteScan } from "../types";

interface SettingsPageProps {
  onClearHistory?: () => void;
  scanHistory: WebsiteScan[];
}

export default function SettingsPage({ onClearHistory, scanHistory }: SettingsPageProps) {
  // Option Toggles state
  const [contrastCheck, setContrastCheck] = useState(true);
  const [altCheck, setAltCheck] = useState(true);
  const [speedCheck, setSpeedCheck] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanHistory, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mentor_audit_history.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmClear = () => {
    if (onClearHistory) {
      onClearHistory();
    }
    setShowConfirmDelete(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 font-sans">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200/60 dark:border-slate-800/60 pb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 dark:text-[#E2E8F0] tracking-tight">
          Audit Settings
        </h1>
        <p className="font-sans text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Customize your scan checks, notification preferences, and stored audit data.
        </p>
      </div>

      <div className="space-y-6">
        {savedSuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        {/* 1. AUDIT SETTINGS */}
        <div className="bg-white dark:bg-[#131520] rounded-[32px] border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-500" />
            <span>Audit Settings</span>
          </h3>

          <div className="space-y-6">
            {/* Contrast check */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="block font-sans text-sm font-semibold text-gray-900 dark:text-slate-200">
                  Text & Color Contrast Verification
                </span>
                <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
                  Check if all text colors contrast clearly with their backgrounds for easy reading.
                </p>
              </div>
              <button
                onClick={() => setContrastCheck(!contrastCheck)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                  contrastCheck ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    contrastCheck ? "transform translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Alt check */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="block font-sans text-sm font-semibold text-gray-900 dark:text-slate-200">
                  Image Descriptions & Alt Text
                </span>
                <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
                  Ensure images have descriptive text for screen readers and accessibility standards.
                </p>
              </div>
              <button
                onClick={() => setAltCheck(!altCheck)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                  altCheck ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    altCheck ? "transform translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Performance check */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="block font-sans text-sm font-semibold text-gray-900 dark:text-slate-200">
                  Page Loading & Performance Tests
                </span>
                <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
                  Test server response times, image sizes, and script loading bottlenecks.
                </p>
              </div>
              <button
                onClick={() => setSpeedCheck(!speedCheck)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                  speedCheck ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    speedCheck ? "transform translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 2. NOTIFICATIONS */}
        <div className="bg-white dark:bg-[#131520] rounded-[32px] border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-500" />
            <span>Notifications</span>
          </h3>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="block font-sans text-sm font-semibold text-gray-900 dark:text-slate-200">
                  Email Me When My Website Score Drops
                </span>
                <p className="font-sans text-xs text-gray-400 dark:text-gray-500">
                  Send an email notification if a future scan score falls below your selected threshold.
                </p>
              </div>
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                  emailAlerts ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    emailAlerts ? "transform translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {emailAlerts && (
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100/80 dark:border-slate-800/80">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Score Alert Threshold
                </label>
                <select
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full font-sans text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                >
                  <option value="90">90% Score - Alert on any minor drop</option>
                  <option value="80">80% Score - Alert when score drops below Good (Recommended)</option>
                  <option value="70">70% Score - Alert on significant score drops only</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 3. DATA */}
        <div className="bg-white dark:bg-[#131520] rounded-[32px] border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-500" />
            <span>Data Management</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportData}
              className="flex-1 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-indigo-500" />
              <span>Export Audit Data (JSON)</span>
            </button>

            {onClearHistory && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="flex-1 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Audit History</span>
              </button>
            )}
          </div>
        </div>

        {/* Save Settings Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-sans font-bold text-sm px-8 py-3 rounded-full shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-xs"
            onClick={() => setShowConfirmDelete(false)}
          />
          <div className="bg-white dark:bg-[#131520] rounded-[28px] border border-gray-200 dark:border-slate-800 p-6 md:p-8 shadow-2xl max-w-md w-full relative z-10">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-100">Delete Audit History?</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              This action will delete all saved website audit records from your current session. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                Yes, Delete History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
