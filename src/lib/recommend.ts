import type {
  Answers,
  Laptop,
  PainPoint,
  Port,
  UseCase,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Hard filtering
// ---------------------------------------------------------------------------

export type FilterReason =
  | "os"
  | "touch"
  | "ports"
  | "weight"
  | "screen"
  | "battery"
  | "budget";

export interface FilterResult {
  passed: boolean;
  reasons: FilterReason[];
}

const REASON_LABEL: Record<FilterReason, string> = {
  os: "Operating system",
  touch: "Touchscreen",
  ports: "Required ports",
  weight: "Max weight",
  screen: "Screen size range",
  battery: "Min battery life",
  budget: "Budget",
};

export function reasonLabel(r: FilterReason): string {
  return REASON_LABEL[r];
}

/** Effective budget cap, accounting for the ±10% flexibility toggle. */
export function effectiveBudget(answers: Answers): number {
  const { max, flexible } = answers.budget;
  return flexible ? Math.round(max * 1.1) : max;
}

/** Evaluate all hard requirements for a single laptop. */
export function evaluateFilters(laptop: Laptop, answers: Answers): FilterResult {
  const reasons: FilterReason[] = [];
  const req = answers.requirements;

  if (req.os !== "any" && laptop.os !== req.os) reasons.push("os");

  if (req.touch === "yes" && !laptop.screen.touch) reasons.push("touch");
  if (req.touch === "no" && laptop.screen.touch) reasons.push("touch");

  if (req.ports.length > 0) {
    const missing = req.ports.some((p) => !hasPort(laptop, p));
    if (missing) reasons.push("ports");
  }

  if (req.maxWeightKg != null && laptop.weightKg > req.maxWeightKg + 0.001) {
    reasons.push("weight");
  }

  if (
    laptop.screen.sizeInch < req.minScreen - 0.05 ||
    laptop.screen.sizeInch > req.maxScreen + 0.05
  ) {
    reasons.push("screen");
  }

  if (req.minBattery > 0 && laptop.batteryHours < req.minBattery) {
    reasons.push("battery");
  }

  if (laptop.price > effectiveBudget(answers)) reasons.push("budget");

  return { passed: reasons.length === 0, reasons };
}

/** Thunderbolt ports are a superset of USB-C for the purpose of matching. */
function hasPort(laptop: Laptop, port: Port): boolean {
  if (laptop.ports.includes(port)) return true;
  if (port === "usb-c" && laptop.ports.includes("thunderbolt")) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Soft scoring
// ---------------------------------------------------------------------------

export type CriterionKey =
  | "performance"
  | "battery"
  | "portability"
  | "graphics"
  | "memory"
  | "storage"
  | "display"
  | "thermals"
  | "connectivity"
  | "modernity"
  | "value";

export interface CriterionResult {
  key: CriterionKey;
  label: string;
  /** 0–1 quality score for this laptop on this criterion. */
  score: number;
  /** Relative importance derived from the user's answers. */
  weight: number;
  /** Whether the laptop clears a "good enough" bar for this criterion. */
  met: boolean;
  /** Whether the user emphasized this criterion (pain point / use case). */
  emphasized: boolean;
}

export interface ScoredLaptop {
  laptop: Laptop;
  /** 0–100 overall match score. */
  score: number;
  criteria: CriterionResult[];
  reasons: string[];
}

const CRITERION_LABEL: Record<CriterionKey, string> = {
  performance: "Performance",
  battery: "Battery life",
  portability: "Portability",
  graphics: "Graphics power",
  memory: "Memory (RAM)",
  storage: "Storage space",
  display: "Display quality",
  thermals: "Cool & quiet",
  connectivity: "Ports & connectivity",
  modernity: "Up-to-date",
  value: "Value for money",
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// Normalized 0–1 quality sub-scores for a laptop on each criterion.
function subScores(laptop: Laptop): Record<CriterionKey, number> {
  const displayQuality =
    0.45 * clamp01((laptop.screen.sizeInch - 11) / (17.3 - 11)) +
    0.35 * clamp01((laptop.screen.brightnessNits - 250) / (1600 - 250)) +
    0.2 *
      (["OLED", "Mini-LED", "AMOLED"].includes(laptop.screen.panel) ? 1 : 0.55);

  return {
    performance: clamp01((laptop.cpu.tier - 3) / (10 - 3)),
    battery: clamp01((laptop.batteryHours - 5) / (18 - 5)),
    // Lighter is better: 0.7kg -> 1, 2.6kg -> 0
    portability: clamp01((2.6 - laptop.weightKg) / (2.6 - 0.7)),
    graphics: clamp01(laptop.gpu.tier / 10),
    memory: clamp01((laptop.ramGB - 8) / (32 - 8)),
    storage: clamp01((laptop.storageGB - 128) / (2048 - 128)),
    display: clamp01(displayQuality),
    // Cooler/quieter: non-gaming form factors and lighter chassis run calmer.
    thermals: clamp01(
      (laptop.formFactor === "gaming" ? 0.45 : 0.9) -
        Math.max(0, laptop.weightKg - 1.6) * 0.1,
    ),
    connectivity: clamp01(laptop.ports.length / 6),
    modernity: clamp01((laptop.releaseYear - 2021) / (2024 - 2021)),
    value: 0, // computed later relative to the candidate set
  };
}

// Base weights before user emphasis is applied.
const BASE_WEIGHTS: Record<CriterionKey, number> = {
  performance: 1,
  battery: 1,
  portability: 0.8,
  graphics: 0.4,
  memory: 0.8,
  storage: 0.6,
  display: 0.8,
  thermals: 0.5,
  connectivity: 0.5,
  modernity: 0.4,
  value: 1,
};

// Pain points boost the weights of related criteria.
const PAIN_WEIGHTS: Record<PainPoint, Partial<Record<CriterionKey, number>>> = {
  "too-slow": { performance: 2.4, memory: 1.4 },
  "poor-battery": { battery: 2.8 },
  "too-heavy": { portability: 2.6 },
  "screen-small-dim": { display: 2.6 },
  "storage-full": { storage: 2.4 },
  "hot-loud": { thermals: 2.4 },
  "missing-ports": { connectivity: 2.4 },
  outdated: { modernity: 2.0, performance: 0.8 },
};

// Use cases boost the weights of related criteria.
const USE_WEIGHTS: Record<UseCase, Partial<Record<CriterionKey, number>>> = {
  "browsing-office": { battery: 0.6, portability: 0.6, value: 0.8 },
  creative: { display: 1.6, performance: 1.4, graphics: 1.2, memory: 1.0 },
  development: { performance: 1.8, memory: 1.6, display: 0.6 },
  gaming: { graphics: 2.6, performance: 1.4, thermals: 0.8 },
  school: { battery: 1.2, portability: 1.0, value: 1.4 },
  travel: { portability: 1.8, battery: 1.6 },
};

/** Criteria the user explicitly emphasized (for "met vs missed" surfacing). */
function emphasizedCriteria(answers: Answers): Set<CriterionKey> {
  const set = new Set<CriterionKey>();
  for (const p of answers.painPoints) {
    for (const k of Object.keys(PAIN_WEIGHTS[p]) as CriterionKey[]) set.add(k);
  }
  for (const u of answers.uses) {
    for (const k of Object.keys(USE_WEIGHTS[u]) as CriterionKey[]) set.add(k);
  }
  return set;
}

function computeWeights(answers: Answers): Record<CriterionKey, number> {
  const weights: Record<CriterionKey, number> = { ...BASE_WEIGHTS };
  for (const p of answers.painPoints) {
    for (const [k, v] of Object.entries(PAIN_WEIGHTS[p])) {
      weights[k as CriterionKey] += v as number;
    }
  }
  for (const u of answers.uses) {
    for (const [k, v] of Object.entries(USE_WEIGHTS[u])) {
      weights[k as CriterionKey] += v as number;
    }
  }
  return weights;
}

// "Good enough" thresholds per criterion for the met/missed indicator.
const MET_THRESHOLD: Record<CriterionKey, number> = {
  performance: 0.55,
  battery: 0.5,
  portability: 0.55,
  graphics: 0.5,
  memory: 0.5,
  storage: 0.4,
  display: 0.55,
  thermals: 0.6,
  connectivity: 0.5,
  modernity: 0.66,
  value: 0.5,
};

export interface RecommendationResult {
  ranked: ScoredLaptop[];
  best?: ScoredLaptop;
  value?: ScoredLaptop;
  premium?: ScoredLaptop;
  totalCandidates: number;
  totalCatalog: number;
}

/**
 * Run the full recommendation pipeline: hard filters, then weighted soft
 * scoring, then pick the Best Match / Best Value / Premium Pick.
 */
export function recommend(
  catalog: Laptop[],
  answers: Answers,
): RecommendationResult {
  const candidates = catalog.filter(
    (l) => evaluateFilters(l, answers).passed,
  );

  const weights = computeWeights(answers);
  const emphasized = emphasizedCriteria(answers);
  const budget = effectiveBudget(answers);

  // Value is relative: best specs-per-dollar within the candidate set.
  const prices = candidates.map((c) => c.price);
  const minPrice = Math.min(...prices, 1);
  const maxPrice = Math.max(...prices, 1);

  const scored: ScoredLaptop[] = candidates.map((laptop) => {
    const subs = subScores(laptop);

    // Raw capability = average of the "power" criteria, used for value.
    const capability =
      (subs.performance +
        subs.graphics +
        subs.memory +
        subs.storage +
        subs.display) /
      5;
    // Value: high capability + comfortably under budget + cheaper is better.
    const priceNorm =
      maxPrice > minPrice
        ? (laptop.price - minPrice) / (maxPrice - minPrice)
        : 0;
    const budgetHeadroom = clamp01((budget - laptop.price) / Math.max(budget, 1));
    subs.value = clamp01(0.6 * capability + 0.25 * (1 - priceNorm) + 0.15 * budgetHeadroom);

    const criteria: CriterionResult[] = (
      Object.keys(CRITERION_LABEL) as CriterionKey[]
    ).map((key) => ({
      key,
      label: CRITERION_LABEL[key],
      score: subs[key],
      weight: weights[key],
      met: subs[key] >= MET_THRESHOLD[key],
      emphasized: emphasized.has(key),
    }));

    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
    const weighted = criteria.reduce((s, c) => s + c.weight * c.score, 0);
    const score = Math.round((weighted / totalWeight) * 100);

    return {
      laptop,
      score,
      criteria,
      reasons: buildReasons(laptop, answers, criteria),
    };
  });

  scored.sort((a, b) => b.score - a.score || b.laptop.rating - a.laptop.rating);

  const result: RecommendationResult = {
    ranked: scored,
    totalCandidates: candidates.length,
    totalCatalog: catalog.length,
  };
  if (scored.length === 0) return result;

  // Best Match: top weighted score.
  const best = scored[0];

  // Best Value: highest value criterion (specs-per-dollar), distinct from best.
  const byValue = [...scored].sort(
    (a, b) =>
      valueOf(b) - valueOf(a) || a.laptop.price - b.laptop.price,
  );
  const value = byValue.find((s) => s.laptop.id !== best.laptop.id) ?? byValue[0];

  // Premium Pick: most capable/high-end, distinct from best & value.
  const byPremium = [...scored].sort(
    (a, b) => premiumOf(b) - premiumOf(a) || b.laptop.price - a.laptop.price,
  );
  const premium =
    byPremium.find(
      (s) => s.laptop.id !== best.laptop.id && s.laptop.id !== value.laptop.id,
    ) ?? undefined;

  result.best = best;
  result.value = value.laptop.id === best.laptop.id ? undefined : value;
  result.premium = premium;
  return result;
}

function valueOf(s: ScoredLaptop): number {
  const v = s.criteria.find((c) => c.key === "value");
  return (v?.score ?? 0) * 100 + s.score * 0.3;
}

function premiumOf(s: ScoredLaptop): number {
  const power = s.criteria
    .filter((c) => ["performance", "graphics", "display", "memory"].includes(c.key))
    .reduce((sum, c) => sum + c.score, 0);
  return power * 100 + s.laptop.price * 0.01 + s.score * 0.2;
}

// ---------------------------------------------------------------------------
// Human-readable "why this fits you" reasons
// ---------------------------------------------------------------------------

function buildReasons(
  laptop: Laptop,
  answers: Answers,
  criteria: CriterionResult[],
): string[] {
  const reasons: string[] = [];
  const by = (k: CriterionKey) => criteria.find((c) => c.key === k)!;

  // Pain-point-driven reasons.
  for (const p of answers.painPoints) {
    switch (p) {
      case "too-slow":
        if (by("performance").score >= 0.55)
          reasons.push(
            `Much faster than what feels slow today — ${laptop.cpu.name} with ${laptop.ramGB}GB RAM.`,
          );
        break;
      case "poor-battery":
        if (laptop.batteryHours >= 12)
          reasons.push(
            `Fixes poor battery with up to ${laptop.batteryHours} hours on a charge.`,
          );
        break;
      case "too-heavy":
        if (laptop.weightKg <= 1.5)
          reasons.push(
            `Noticeably lighter to carry at ${laptop.weightKg.toFixed(2)} kg (${kgToLb(laptop.weightKg)} lb).`,
          );
        break;
      case "screen-small-dim":
        if (by("display").score >= 0.55)
          reasons.push(
            `Brighter, sharper ${laptop.screen.sizeInch}" ${laptop.screen.panel} display at ${laptop.screen.brightnessNits} nits.`,
          );
        break;
      case "storage-full":
        if (laptop.storageGB >= 512)
          reasons.push(`Roomy ${laptop.storageGB}GB SSD so you won't run out of space.`);
        break;
      case "hot-loud":
        if (by("thermals").score >= 0.6)
          reasons.push(`Runs cool and quiet for everyday tasks.`);
        break;
      case "missing-ports":
        reasons.push(
          `Better connectivity: ${laptop.ports.map(portName).join(", ")}.`,
        );
        break;
      case "outdated":
        reasons.push(`A current ${laptop.releaseYear} model with modern internals.`);
        break;
    }
  }

  // Use-case-driven reasons.
  for (const u of answers.uses) {
    switch (u) {
      case "gaming":
        if (laptop.gpu.dedicated)
          reasons.push(`Dedicated ${laptop.gpu.name} handles modern games well.`);
        break;
      case "creative":
        if (by("display").score >= 0.6)
          reasons.push(
            `Color-rich ${laptop.screen.panel} screen suits photo and video work.`,
          );
        break;
      case "development":
        if (laptop.ramGB >= 16)
          reasons.push(`${laptop.ramGB}GB RAM keeps big projects and containers happy.`);
        break;
      case "travel":
        if (laptop.weightKg <= 1.5 && laptop.batteryHours >= 12)
          reasons.push(`Travel-friendly: light and long-lasting away from outlets.`);
        break;
      case "school":
        reasons.push(`A dependable pick for classes, notes, and assignments.`);
        break;
      case "browsing-office":
        reasons.push(`More than enough for browsing, email, and documents.`);
        break;
    }
  }

  // Requirement-driven confirmations.
  const req = answers.requirements;
  if (req.os !== "any") reasons.push(`Runs ${osName(laptop.os)}, as requested.`);
  if (req.touch === "yes" && laptop.screen.touch)
    reasons.push(`Includes the touchscreen you wanted.`);
  if (req.ports.length > 0)
    reasons.push(`Has your must-have ports: ${req.ports.map(portName).join(", ")}.`);
  if (req.backlitKeyboard && laptop.backlitKeyboard)
    reasons.push(`Backlit keyboard for low-light typing.`);

  // Value note.
  reasons.push(
    `Comes in at $${laptop.price.toLocaleString()} — within your budget.`,
  );

  // De-dupe and cap to keep it skimmable.
  return Array.from(new Set(reasons)).slice(0, 6);
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function kgToLb(kg: number): string {
  return (kg * 2.20462).toFixed(1);
}

export function portName(p: Port): string {
  const map: Record<Port, string> = {
    "usb-c": "USB-C",
    thunderbolt: "Thunderbolt",
    hdmi: "HDMI",
    sd: "SD card",
    "usb-a": "USB-A",
    ethernet: "Ethernet",
    headphone: "Headphone",
  };
  return map[p];
}

export function osName(os: Laptop["os"]): string {
  const map: Record<Laptop["os"], string> = {
    windows: "Windows",
    macos: "macOS",
    chromeos: "ChromeOS",
    linux: "Linux",
  };
  return map[os];
}
