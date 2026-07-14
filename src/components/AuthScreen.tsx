import React, { useState } from "react";
import { Mail, Lock, User, Briefcase, Sparkles, CheckCircle2, ShieldCheck, X, Code, Palette, Search, ArrowRight } from "lucide-react";

export interface UserProfile {
  name: string;
  email: string;
  role: "Developer" | "UI/UX Designer" | "SEO Architect" | "Project Lead" | "Guest";
  isLoggedIn: boolean;
  isGuest?: boolean;
}

interface AuthScreenProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthScreen({ onClose, onLoginSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserProfile["role"]>("Developer");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password || (isSignUp && !name)) {
      setErrorMsg("Explicitly fill in all required account fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Security credentials must feel sturdy (at least 6 characters).");
      return;
    }

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";
      const payload = isSignUp ? { name, email, password, role } : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: any = {};
      if (text && text.trim()) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { error: text };
        }
      }

      if (!response.ok) {
        setErrorMsg(data.error || `Authentication failed (Status ${response.status}). Please check your server connection.`);
        return;
      }

      localStorage.setItem("ms_auth_token", data.token);

      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          ...data.user,
          isLoggedIn: true,
        });
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-[28px] p-6 md:p-8 relative shadow-[0_28px_80px_-32px_rgba(2,6,23,0.95)] overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_42%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-28 bg-primary-400/10 blur-[60px] pointer-events-none rounded-full" />

        <div className="flex justify-between items-center relative z-10 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-600">
                MentorDocks Access
              </p>
              <p className="text-sm font-display font-semibold text-gray-900">
                {isSignUp ? "Create your workspace" : "Welcome back"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4 relative z-10 animate-fade-in">
            <div className="mx-auto h-14 w-14 rounded-full bg-success-50 border border-success-100 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-success-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-gray-900 text-xl tracking-tight">
                {isSignUp ? "Account ready" : "Signed in successfully"}
              </h3>
              <p className="text-sm text-gray-600">
                Opening your audit workspace with your saved history and preferences.
              </p>
            </div>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-success-500 animate-pulse w-full" />
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-display font-extrabold text-gray-900 tracking-tight">
                {isSignUp ? "Build your analyst profile" : "Access your audit workspace"}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isSignUp
                  ? "Create a workspace profile and start organizing audits, reports, and recommendations."
                  : "Sign in to continue reviewing websites, reports, and performance insights."}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-error-50 border border-error-100 text-error-700 text-sm p-3 rounded-2xl font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-gray-500">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Alexis Carter"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-gray-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="e.g. alexis@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-gray-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold uppercase tracking-[0.25em] text-gray-500 block">
                    Professional Focus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        value: "Developer" as UserProfile["role"],
                        desc: "Code quality, semantics, and speed",
                        icon: <Code className="h-4 w-4 text-primary-600" />,
                      },
                      {
                        value: "UI/UX Designer" as UserProfile["role"],
                        desc: "Typography, visuals, and contrast",
                        icon: <Palette className="h-4 w-4 text-pink-500" />,
                      },
                      {
                        value: "SEO Architect" as UserProfile["role"],
                        desc: "SERP previews and crawl health",
                        icon: <Search className="h-4 w-4 text-amber-500" />,
                      },
                      {
                        value: "Project Lead" as UserProfile["role"],
                        desc: "High-level performance oversight",
                        icon: <Briefcase className="h-4 w-4 text-success-600" />,
                      },
                    ].map((item) => {
                      const isSelected = role === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setRole(item.value)}
                          className={`flex flex-col text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary-50 border-primary-200 text-gray-900 shadow-sm"
                              : "bg-white border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {item.icon}
                            <span className="text-[11px] font-bold tracking-tight">{item.value}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-snug">{item.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-2xl text-sm transition hover:shadow-lg hover:-translate-y-0.5 mt-2 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSignUp ? "Create workspace" : "Continue to dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                onClick={() => {
                  setErrorMsg("");
                  setIsSignUp(!isSignUp);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold underline underline-offset-4 cursor-pointer"
              >
                {isSignUp ? "Already have an account? Sign in" : "Need a workspace profile? Create one"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2 border-t border-gray-100">
              <ShieldCheck className="h-4 w-4 text-success-600" />
              <span>Encrypted session token and secure local storage are active.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
