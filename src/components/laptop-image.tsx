import type { Laptop } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A clean, brand-accented illustrated laptop rendered as inline SVG. Using an
 * illustration keeps the prototype fully offline and deterministic while still
 * looking polished. Swap for real product photography by adding an `image`
 * field to the Laptop model and rendering an <img> here instead.
 */
export function LaptopImage({
  laptop,
  className,
}: {
  laptop: Laptop;
  className?: string;
}) {
  const accent = laptop.accent;
  const gradId = `g-${laptop.id}`;
  const screenId = `s-${laptop.id}`;
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
        className,
      )}
      role="img"
      aria-label={`Illustration of the ${laptop.name}`}
      style={{
        background: `radial-gradient(120% 120% at 50% 0%, ${accent}22, transparent 70%)`,
      }}
    >
      <svg
        viewBox="0 0 320 200"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id={screenId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Lid / screen */}
        <rect
          x="70"
          y="34"
          width="180"
          height="118"
          rx="10"
          fill={`url(#${gradId})`}
        />
        <rect
          x="78"
          y="42"
          width="164"
          height="102"
          rx="6"
          fill="#0b1020"
        />
        <rect
          x="78"
          y="42"
          width="164"
          height="102"
          rx="6"
          fill={`url(#${screenId})`}
        />
        {/* Screen content hint */}
        <rect x="90" y="56" width="70" height="8" rx="4" fill="#ffffff" opacity="0.35" />
        <rect x="90" y="72" width="120" height="6" rx="3" fill="#ffffff" opacity="0.18" />
        <rect x="90" y="86" width="104" height="6" rx="3" fill="#ffffff" opacity="0.18" />
        <rect x="90" y="100" width="130" height="6" rx="3" fill="#ffffff" opacity="0.12" />
        <rect x="90" y="118" width="46" height="16" rx="8" fill={accent} opacity="0.9" />

        {/* Base / keyboard deck */}
        <path
          d="M40 152 h240 a6 6 0 0 1 6 6 v2 a10 10 0 0 1 -10 10 H44 a10 10 0 0 1 -10 -10 v-2 a6 6 0 0 1 6 -6 Z"
          fill={accent}
          opacity="0.9"
        />
        <rect x="132" y="152" width="56" height="6" rx="3" fill="#000000" opacity="0.25" />
      </svg>
    </div>
  );
}
