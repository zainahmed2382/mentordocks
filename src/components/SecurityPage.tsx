import React, { useState } from "react";
import { Shield, Key, Eye, EyeOff, CheckCircle2, AlertTriangle, Monitor, Smartphone, Lock } from "lucide-react";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError("");
    setUpdateSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setUpdateError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setUpdateError("The new passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setUpdateError("Your new password must be at least 6 characters long.");
      return;
    }

    // Successfully updated
    setUpdateSuccess("Your password has been changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setUpdateSuccess(""), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300 font-sans">
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-200/60 dark:border-slate-800/60 pb-6">
        <h1 className="font-display text-3xl font-extrabold text-gray-900 dark:text-[#E2E8F0] tracking-tight">
          Account Security
        </h1>
        <p className="font-sans text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Manage your password, two-factor authentication, and active sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Security status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#131520] rounded-[28px] border border-gray-200/80 dark:border-slate-800 p-6 shadow-sm">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-4">
              Security Status
            </span>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-sans text-sm font-bold text-gray-900 dark:text-slate-100">Account Protected</span>
                <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Standard Security Active
                </span>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                <span>Password Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Protected</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800">
                <span>Two-Factor Auth</span>
                <span className="font-bold text-gray-900 dark:text-slate-200">
                  {twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Active Sessions</span>
                <span className="font-bold text-gray-900 dark:text-slate-200">1 Device</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-[28px] p-6 text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-display font-bold text-sm">Security Best Practice</h4>
            </div>
            <p className="font-sans text-xs text-indigo-700 dark:text-indigo-300/80 leading-relaxed">
              Use a strong, unique password with at least 8 characters including letters, numbers, and symbols.
            </p>
          </div>
        </div>

        {/* Right column: Update password and active sessions */}
        <div className="lg:col-span-2 space-y-6">
          {updateSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{updateSuccess}</span>
            </div>
          )}

          {updateError && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{updateError}</span>
            </div>
          )}

          {/* Change Password Form Card */}
          <div className="bg-white dark:bg-[#131520] rounded-[32px] border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2.5">
              <Key className="h-5 w-5 text-indigo-500" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full font-sans text-sm px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full font-sans text-sm px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full font-sans text-sm px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#1A1A1A] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs md:text-sm px-6 py-2.5 rounded-full shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* 2-Factor Authentication Status Card */}
          <div className="bg-white dark:bg-[#131520] rounded-[32px] border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="block font-sans text-sm font-bold text-gray-900 dark:text-slate-100">
                  Two-Factor Authentication (2FA)
                </span>
                <p className="font-sans text-xs text-gray-400 dark:text-gray-500 max-w-md">
                  Add an extra layer of protection by requiring a verification code when signing in.
                </p>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none shrink-0 ${
                  twoFactorEnabled ? "bg-indigo-600" : "bg-gray-200 dark:bg-slate-800"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? "transform translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-white dark:bg-[#131520] rounded-[32px] border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-slate-100 mb-6">
              Active Sessions
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 py-3.5 px-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0">
                    <Monitor className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block font-sans text-xs md:text-sm font-semibold text-gray-900 dark:text-slate-200">
                      Web Browser — Current Device
                    </span>
                    <span className="block text-[10px] text-gray-400 dark:text-gray-500">
                      Active Now • Secure Session
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 shrink-0">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
