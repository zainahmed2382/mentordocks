import React, { useState } from "react";
import { Mail, Lock, User, Briefcase, Sparkles, CheckCircle2, ShieldCheck, X } from "lucide-react";

export interface UserProfile {
  name: string;
  email: string;
  role: "Developer" | "UI/UX Designer" | "SEO Architect" | "Project Lead";
  isLoggedIn: boolean;
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
      const payload = isSignUp 
        ? { name, email, password, role } 
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred during authentication.");
      }

      if (data.token) {
        localStorage.setItem("ms_auth_token", data.token);
      }

      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isLoggedIn: true,
        });
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authenticate. Please check connection and try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#222]/90 rounded-2xl p-6 md:p-8 relative shadow-2xl overflow-hidden">
        {/* Decorative Grid Mesh overlay inside login */}
        <div className="absolute inset-0 bg-transparent opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "20px 20px"
          }}
        />
        
        {/* Top absolute light flare decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/10 blur-[50px] pointer-events-none rounded-full" />

        <div className="flex justify-between items-center relative z-10 mb-6">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-blue-400" />
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">
              Mentor Docks Account Gate
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 hover:bg-[#141414] rounded-lg transition overflow-hidden h-7 w-7 flex items-center justify-center cursor-pointer"
          >
            <X className="h-4 bg-transparent" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4 relative z-10 animate-fade-in">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-white text-lg tracking-tight">
                {isSignUp ? "Account Standardized!" : "Verification Confirmed"}
              </h3>
              <p className="text-xs text-zinc-400">
                Signing you into your live web-diagnostic workspace...
              </p>
            </div>
            {/* Pulsating fake indicator */}
            <div className="w-20 bg-zinc-900 h-1 mx-auto rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-pulse w-full" />
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
                {isSignUp ? "Initiate Your Profile" : "Access Professional Suite"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isSignUp 
                  ? "Build a dedicated digital locker to bookmark crawls & premium tests" 
                  : "Welcome back! Enter credentials to continue saved url diagnostics"
                }
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs p-3 rounded-lg font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. Alexis Carter"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#141414] border border-[#222]/80 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    placeholder="e.g. alexis@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#141414] border border-[#222]/80 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#141414] border border-[#222]/80 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Professional Role Focus</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserProfile["role"])}
                      className="w-full bg-[#141414] border border-[#222]/80 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500 text-zinc-300 appearance-none font-sans"
                    >
                      <option value="Developer">Developer (Focus on Code Quality & Fixes)</option>
                      <option value="UI/UX Designer">UI/UX Designer (Focus on Styling & Contrast)</option>
                      <option value="SEO Architect">SEO Architect (Focus on SERP & Meta Indexes)</option>
                      <option value="Project Lead">Project Lead (Focus on Performance & WCAG Compliances)</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider transition hover:bg-zinc-200 mt-2 cursor-pointer"
              >
                {isSignUp ? "Create Workspace Key" : "Access Workspace Core"}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setErrorMsg("");
                  setIsSignUp(!isSignUp);
                }}
                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 cursor-pointer"
              >
                {isSignUp 
                  ? "Already registered? Go to Login screen" 
                  : "No workspace profile? Create an analyst profile"
                }
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-600" />
              <span>Encrypted local session token active.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
