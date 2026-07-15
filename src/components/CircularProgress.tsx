import React, { useState, useEffect } from "react";

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  label?: string;
}

export function CircularProgress({
  score,
  size = 120,
  strokeWidth = 10,
  showText = true,
  label,
}: CircularProgressProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = score;
    if (start === end) {
      setDisplayScore(end);
      return;
    }
    const duration = 1200; // ms
    const range = end - start;
    let startTime: number | null = null;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      // Ease out quad
      const easeProgress = progressRatio * (2 - progressRatio);
      const currentScore = Math.round(start + easeProgress * range);
      setDisplayScore(currentScore);
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(end);
      }
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  // Color selection based on score tier
  let strokeColor = "stroke-emerald-400";
  let textColor = "text-emerald-400";

  if (displayScore < 55) {
    strokeColor = "stroke-rose-400";
    textColor = "text-rose-400";
  } else if (displayScore < 90) {
    strokeColor = "stroke-amber-400";
    textColor = "text-amber-400";
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-800"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`transition-all duration-150 ease-out fill-none ${strokeColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Percentage Text */}
        {showText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-display font-bold tracking-tight ${textColor}`}>
              {displayScore}
            </span>
            {label && <span className="text-[10px] font-medium text-[#777] uppercase tracking-wider">{label}</span>}
          </div>
        )}
      </div>

      {/* Decorative Badge outside */}
      {!showText && label && (
        <span className="mt-2 text-xs font-semibold text-[#888] uppercase tracking-widest">{label}</span>
      )}
    </div>
  );
}
