import type { Answers, Laptop } from "@/lib/types";
import { kgToLb } from "@/lib/recommend";

export interface DeltaItem {
  label: string;
  from: string;
  to: string;
  /** +1 improvement, -1 regression, 0 neutral. */
  direction: 1 | -1 | 0;
  detail?: string;
}

/**
 * Build an upgrade comparison between the user's current laptop and a
 * recommended pick. Returns null if we don't have enough current-laptop data.
 */
export function buildUpgradeDelta(
  answers: Answers,
  target: Laptop,
): DeltaItem[] | null {
  const cur = answers.current;
  if (!cur.owns || cur.skipped) return null;

  const items: DeltaItem[] = [];
  const has =
    cur.cpuTier != null ||
    cur.ramGB != null ||
    cur.batteryHours != null ||
    cur.weightKg != null ||
    cur.storageGB != null;
  if (!has) return null;

  if (cur.cpuTier != null) {
    const pct = Math.round(((target.cpu.tier - cur.cpuTier) / Math.max(cur.cpuTier, 1)) * 100);
    items.push({
      label: "Performance",
      from: tierWord(cur.cpuTier),
      to: `${target.cpu.name}`,
      direction: sign(target.cpu.tier - cur.cpuTier),
      detail: pct > 0 ? `~${pct}% faster tier` : pct < 0 ? `${pct}% tier` : "similar",
    });
  }
  if (cur.ramGB != null) {
    items.push({
      label: "Memory",
      from: `${cur.ramGB}GB`,
      to: `${target.ramGB}GB`,
      direction: sign(target.ramGB - cur.ramGB),
      detail: diffLabel(target.ramGB - cur.ramGB, "GB"),
    });
  }
  if (cur.storageGB != null) {
    items.push({
      label: "Storage",
      from: `${cur.storageGB}GB`,
      to: `${target.storageGB}GB`,
      direction: sign(target.storageGB - cur.storageGB),
      detail: diffLabel(target.storageGB - cur.storageGB, "GB"),
    });
  }
  if (cur.batteryHours != null) {
    items.push({
      label: "Battery",
      from: `${cur.batteryHours}h`,
      to: `${target.batteryHours}h`,
      direction: sign(target.batteryHours - cur.batteryHours),
      detail: diffLabel(target.batteryHours - cur.batteryHours, "h"),
    });
  }
  if (cur.weightKg != null) {
    const d = cur.weightKg - target.weightKg; // positive = lighter now
    items.push({
      label: "Weight",
      from: `${cur.weightKg.toFixed(2)}kg (${kgToLb(cur.weightKg)}lb)`,
      to: `${target.weightKg.toFixed(2)}kg (${kgToLb(target.weightKg)}lb)`,
      direction: sign(d),
      detail:
        Math.abs(d) < 0.05
          ? "about the same"
          : d > 0
            ? `${d.toFixed(2)}kg lighter`
            : `${Math.abs(d).toFixed(2)}kg heavier`,
    });
  }
  return items;
}

function sign(n: number): 1 | -1 | 0 {
  if (n > 0) return 1;
  if (n < 0) return -1;
  return 0;
}

function diffLabel(diff: number, unit: string): string {
  if (diff === 0) return "no change";
  return `${diff > 0 ? "+" : ""}${diff}${unit}`;
}

function tierWord(tier: number): string {
  if (tier >= 9) return "Top-tier CPU";
  if (tier >= 7) return "Fast CPU";
  if (tier >= 5) return "Mid-range CPU";
  if (tier >= 3) return "Entry CPU";
  return "Older CPU";
}
