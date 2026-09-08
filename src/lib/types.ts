// Core domain types for Laptop Match.
// The dataset is intentionally shaped so a real API/DB could replace the local
// mock later without changing the recommendation engine or UI.

export type OS = "windows" | "macos" | "chromeos" | "linux";

export type Port =
  | "usb-c"
  | "thunderbolt"
  | "hdmi"
  | "sd"
  | "usb-a"
  | "ethernet"
  | "headphone";

export type FormFactor =
  | "ultrabook"
  | "laptop"
  | "gaming"
  | "2-in-1"
  | "workstation"
  | "budget";

export interface Cpu {
  name: string;
  /** Relative single/multi-core performance, 1 (weak) – 10 (top tier). */
  tier: number;
}

export interface Gpu {
  name: string;
  /** Relative graphics performance, 0 (integrated basic) – 10 (top tier). */
  tier: number;
  dedicated: boolean;
}

export interface Screen {
  sizeInch: number;
  resolution: string;
  panel: string;
  touch: boolean;
  /** Peak brightness in nits. */
  brightnessNits: number;
}

export interface Laptop {
  id: string;
  brand: string;
  model: string;
  name: string;
  /** USD */
  price: number;
  os: OS;
  cpu: Cpu;
  gpu: Gpu;
  ramGB: number;
  storageGB: number;
  storageType: "SSD" | "eMMC";
  screen: Screen;
  /** Weight in kilograms (display converts to lbs too). */
  weightKg: number;
  /** Rated battery life in hours (mixed use). */
  batteryHours: number;
  ports: Port[];
  backlitKeyboard: boolean;
  formFactor: FormFactor;
  releaseYear: number;
  /** 0–5 aggregate reviewer rating (mock). */
  rating: number;
  /** Short marketing-friendly tagline. */
  blurb: string;
  /** Hex accent color used for the illustrated product image. */
  accent: string;
}

// ---------------------------------------------------------------------------
// Wizard answer model
// ---------------------------------------------------------------------------

export type PainPoint =
  | "too-slow"
  | "poor-battery"
  | "too-heavy"
  | "screen-small-dim"
  | "storage-full"
  | "hot-loud"
  | "missing-ports"
  | "outdated";

export type UseCase =
  | "browsing-office"
  | "creative"
  | "development"
  | "gaming"
  | "school"
  | "travel";

export type TouchPref = "yes" | "no" | "any";
export type OSPref = OS | "any";

/** Specs of the user's current laptop, used for the upgrade delta. */
export interface CurrentLaptop {
  owns: boolean;
  skipped: boolean;
  /** id of a matched laptop from the dataset, if chosen from the dropdown. */
  matchedId?: string;
  label?: string;
  cpuTier?: number;
  ramGB?: number;
  storageGB?: number;
  screenSize?: number;
  batteryHours?: number;
  weightKg?: number;
  releaseYear?: number;
}

export interface Requirements {
  os: OSPref;
  touch: TouchPref;
  ports: Port[];
  backlitKeyboard: boolean;
  /** Max acceptable weight in kg. undefined = no limit. */
  maxWeightKg?: number;
  minScreen: number;
  maxScreen: number;
  /** Minimum battery life in hours. */
  minBattery: number;
}

export interface Budget {
  max: number;
  /** Allow ±10% flexibility on the budget cap. */
  flexible: boolean;
}

export interface Answers {
  current: CurrentLaptop;
  painPoints: PainPoint[];
  uses: UseCase[];
  requirements: Requirements;
  budget: Budget;
}

export function defaultAnswers(): Answers {
  return {
    current: { owns: false, skipped: false },
    painPoints: [],
    uses: [],
    requirements: {
      os: "any",
      touch: "any",
      ports: [],
      backlitKeyboard: false,
      maxWeightKg: undefined,
      minScreen: 11,
      maxScreen: 18,
      minBattery: 0,
    },
    budget: { max: 1200, flexible: true },
  };
}
