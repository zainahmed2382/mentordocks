import React, { useState, useEffect, useRef } from "react";

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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Animated count-up for the score number
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayScore(0);
    startTimeRef.current = null;

    const duration = 1000; // 1 second

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score]);

  // Color selection based on score tier
  let strokeColor = "stroke-emerald-400";
  let textColor = "text-emerald-400";

  if (score < 55) {
    strokeColor = "stroke-rose-400";
    textColor = "text-rose-400";
  } else if (score < 90) {
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
            className={`transition-all duration-1000 ease-out fill-none ${strokeColor}`}
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
