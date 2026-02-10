"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label: string;
  sublabel?: string;
  variant: "viral" | "performance";
  showAnimation?: boolean;
}

const sizeClasses = {
  sm: { container: "w-20 h-20", stroke: 6, textSize: "text-lg", labelSize: "text-[10px]" },
  md: { container: "w-28 h-28", stroke: 8, textSize: "text-2xl", labelSize: "text-xs" },
  lg: { container: "w-36 h-36", stroke: 10, textSize: "text-3xl", labelSize: "text-sm" },
};

const variantGradients = {
  viral: {
    start: "#f43f5e", // rose-500
    end: "#fb923c",   // orange-400
    glow: "rgba(244, 63, 94, 0.4)",
    bg: "rgba(244, 63, 94, 0.1)",
  },
  performance: {
    start: "#06b6d4", // cyan-500
    end: "#8b5cf6",   // violet-500
    glow: "rgba(6, 182, 212, 0.4)",
    bg: "rgba(6, 182, 212, 0.1)",
  },
};

export function ScoreRing({
  score,
  size = "md",
  label,
  sublabel,
  variant,
  showAnimation = true,
}: ScoreRingProps) {
  const { container, stroke, textSize, labelSize } = sizeClasses[size];
  const colors = variantGradients[variant];

  // Calculate circle dimensions
  const radius = 50 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const gradientId = `score-gradient-${variant}-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn("relative flex flex-col items-center", container)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          {/* Glow filter */}
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />

        {/* Progress arc */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={showAnimation ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          filter={`url(#glow-${gradientId})`}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={cn("font-bold tabular-nums", textSize)}
          initial={showAnimation ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            background: `linear-gradient(135deg, ${colors.start}, ${colors.end})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {score.toFixed(0)}
        </motion.span>
        <span className={cn("text-muted-foreground font-medium uppercase tracking-wider", labelSize)}>
          {label}
        </span>
        {sublabel && (
          <span className="text-[9px] text-muted-foreground/60">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
