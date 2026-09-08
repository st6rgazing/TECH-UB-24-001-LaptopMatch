"use client";

import { motion } from "framer-motion";

/** Circular match-score indicator (0–100). */
export function MatchRing({
  score,
  size = 64,
  label = "match",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 80
      ? "var(--color-success)"
      : score >= 60
        ? "var(--color-primary)"
        : "var(--color-warning)";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${score}% ${label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-base font-semibold leading-none">
          {score}
          <span className="text-xs">%</span>
        </span>
      </div>
    </div>
  );
}
