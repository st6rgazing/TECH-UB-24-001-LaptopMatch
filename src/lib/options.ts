import type { PainPoint, UseCase, Port, OSPref } from "@/lib/types";
import {
  Gauge,
  BatteryLow,
  Weight,
  Sun,
  HardDrive,
  Fan,
  Cable,
  CalendarClock,
  Globe,
  Palette,
  Code2,
  Gamepad2,
  GraduationCap,
  Plane,
  type LucideIcon,
} from "lucide-react";

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export const PAIN_OPTIONS: Option<PainPoint>[] = [
  { value: "too-slow", label: "Too slow", description: "Laggy, spinning wheels", icon: Gauge },
  { value: "poor-battery", label: "Poor battery", description: "Dies too quickly", icon: BatteryLow },
  { value: "too-heavy", label: "Too heavy", description: "Hard to carry around", icon: Weight },
  { value: "screen-small-dim", label: "Screen too small / dim", description: "Cramped or hard to see", icon: Sun },
  { value: "storage-full", label: "Storage full", description: "Always out of space", icon: HardDrive },
  { value: "hot-loud", label: "Runs hot / loud", description: "Fans blaring, warm", icon: Fan },
  { value: "missing-ports", label: "Missing ports", description: "Need dongles for everything", icon: Cable },
  { value: "outdated", label: "Outdated", description: "Just feels old", icon: CalendarClock },
];

export const USE_OPTIONS: Option<UseCase>[] = [
  { value: "browsing-office", label: "Browsing & office", description: "Web, email, documents", icon: Globe },
  { value: "creative", label: "Creative work", description: "Photo, video, design", icon: Palette },
  { value: "development", label: "Software development", description: "Coding, VMs, containers", icon: Code2 },
  { value: "gaming", label: "Gaming", description: "Modern titles, high FPS", icon: Gamepad2 },
  { value: "school", label: "School", description: "Notes, research, assignments", icon: GraduationCap },
  { value: "travel", label: "Frequent travel", description: "Light & long battery", icon: Plane },
];

export const OS_OPTIONS: Option<OSPref>[] = [
  { value: "any", label: "No preference" },
  { value: "windows", label: "Windows" },
  { value: "macos", label: "macOS" },
  { value: "chromeos", label: "ChromeOS" },
  { value: "linux", label: "Linux" },
];

export const PORT_OPTIONS: Option<Port>[] = [
  { value: "usb-c", label: "USB-C / Thunderbolt" },
  { value: "hdmi", label: "HDMI" },
  { value: "sd", label: "SD card" },
  { value: "usb-a", label: "USB-A" },
  { value: "ethernet", label: "Ethernet" },
];
