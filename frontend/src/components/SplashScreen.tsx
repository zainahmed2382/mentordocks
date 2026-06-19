import React, { useState, useEffect } from "react";
import { Zap, Sparkles, ShieldCheck, Terminal, Disc, ArrowRight } from "lucide-react";
import { ParticlesBackground } from "./ParticlesBackground";


interface SplashScreenProps {
  onDismiss: () => void;
}

export function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const BOOT_LOGS = [
    "Initializing Mentor Docks diagnostic engine...",
    "Loading WCAG 2.1 color contrast standards...",
    "Mounting headless crawler agents...",
    "Verifying W3C validation parsers...",
    "Synchronizing semantic typography matrices...",
    "Establishing high-speed audit sandbox...",
    "All diagnostic modules ready!"
  ];

  useEffect(() => {
    // Increment progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFinished(true);
          return 100;
        }
        // Random increments for diagnostic hyper-realism
        const rand = Math.floor(Math.random() * 12) + 5;
        return Math.min(prev + rand, 100);
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Transition status text based on progress percentages
    const currentStep = Math.min(
      Math.floor((progress / 100) * BOOT_LOGS.length),
      BOOT_LOGS.length - 1
    );
    setStatusIdx(currentStep);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-[100] bg-custom-cream flex flex-col items-center justify-between p-6 overflow-hidden md:p-12">
      {/* Dynamic Particles Background Layer */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <ParticlesBackground />
      </div>

      {/* Decorative Radial Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-custom-ochre/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />

      {/* Top Section */}
      <div className="w-full flex justify-between items-center max-w-5xl">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-custom-ochre animate-pulse" />
          <span className="text-xs font-mono text-custom-choco/60 tracking-widest uppercase">System Core Boot</span>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs font-mono text-custom-choco/80 hover:text-custom-choco bg-custom-sand border border-custom-choco/20 hover:border-custom-choco/30 px-3 py-1 rounded transition cursor-pointer"
        >
          Skip Boot [Esc]
        </button>
      </div>

      {/* Middle Core Graphics & Brand Branding */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-md my-auto">
        {/* Futuristic Radar Loading Logo Frame */}
        <div className="relative mb-2">
          <div className="absolute inset-0 rounded-full border border-custom-ochre/20 animate-ping opacity-60" />
          <div className="absolute -inset-4 rounded-full border border-indigo-500/10 animate-pulse" />
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0a0a0a] to-[#121212] border border-blue-500/30 flex items-center justify-center relative shadow-2xl">
            <Disc className="absolute inset-2 text-zinc-800/40 h-20 w-20 animate-spin" />
            <Zap className="h-10 w-10 text-blue-400 relative z-10 animate-bounce" />
            
            {/* Absolute side micro sparkles */}
            <div className="absolute top-1 right-1 p-1 bg-custom-sand rounded-full border border-custom-choco/20">
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-black text-white tracking-widest">
            MENTOR <span className="text-custom-ochre">DOCKS</span>
          </h1>
          <p className="text-xs text-custom-choco/80 uppercase tracking-[0.25em] font-mono">
            Professional Web & SEO Audit Suite
          </p>
        </div>

        {/* Dynamic Log Line Console Screen */}
        <div className="w-full bg-custom-cream border border-custom-choco/20/80 rounded-xl p-3 text-left font-mono text-[11px] h-12 flex items-center gap-2.5 overflow-hidden shadow-inner text-custom-choco/80">
          <Terminal className="h-4 w-4 text-custom-ochre shrink-0 animate-pulse" />
          <span className="truncate">{BOOT_LOGS[statusIdx]}</span>
        </div>

        {/* Big visual progress percentage bar */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center font-mono text-[10px] text-custom-choco/60 px-1">
            <span>AUDIT_CRAWL_STABLE_V2</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-custom-sand/80 h-1.5 rounded-full overflow-hidden border border-zinc-950">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Active Enter App Actions Panel */}
        <div className="h-10">
          {isFinished ? (
            <button
              onClick={onDismiss}
              className="px-6 py-2.5 bg-custom-ochre text-white hover:bg-custom-yellow text-xs font-mono tracking-wider font-bold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-blue-900/40 animate-bounce cursor-pointer"
            >
              ACCESS DIAGNOSTIC SUITE
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-zinc-600 animate-pulse">Establishing container environment...</span>
          )}
        </div>
      </div>

      {/* Bottom Legal Indicators Section */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center max-w-5xl text-[10px] font-mono text-zinc-600 gap-2">
        <p>© 2026 Mentor Docks Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/80" /> Standard TLS Encryption
          </span>
          <span>Build 1.48-STABLE</span>
        </div>
      </div>
    </div>
  );
}
