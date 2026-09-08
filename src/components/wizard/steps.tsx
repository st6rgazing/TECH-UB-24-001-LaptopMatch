"use client";

import type { Answers, Laptop, OSPref, Port, TouchPref } from "@/lib/types";
import {
  OS_OPTIONS,
  PAIN_OPTIONS,
  PORT_OPTIONS,
  USE_OPTIONS,
} from "@/lib/options";
import { OptionCard } from "@/components/option-card";
import { ModelCombobox } from "@/components/model-combobox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { effectiveBudget, kgToLb } from "@/lib/recommend";
import { Info, Laptop2, Settings2 } from "lucide-react";

export interface StepProps {
  answers: Answers;
  update: (patch: Partial<Answers>) => void;
}

// Small helper for a11y-friendly section labels.
function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <span className="text-sm font-medium">{children}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

// Lightweight segmented control (single choice).
function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-xl bg-muted p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Current laptop
// ---------------------------------------------------------------------------

const CPU_TIERS = [
  { value: 3, label: "Older / entry (pre-2019)" },
  { value: 5, label: "Mid-range (i5 / Ryzen 5)" },
  { value: 7, label: "Fast (i7 / Ryzen 7 / M1)" },
  { value: 9, label: "Top-tier (i9 / M-series Pro)" },
];

export function StepCurrent({ answers, update, laptops }: StepProps & { laptops: Laptop[] }) {
  const cur = answers.current;
  const setCur = (patch: Partial<typeof cur>) =>
    update({ current: { ...cur, ...patch } });

  const [mode, ownMode] = [cur.owns && !cur.skipped, cur.skipped];

  return (
    <div className="space-y-6">
      <Segmented
        ariaLabel="Do you own a laptop now?"
        value={cur.skipped ? "skip" : cur.owns ? "yes" : "no"}
        onChange={(v) => {
          if (v === "yes") setCur({ owns: true, skipped: false });
          else if (v === "no")
            update({
              current: { owns: false, skipped: false },
            });
          else update({ current: { owns: false, skipped: true } });
        }}
        options={[
          { value: "yes", label: "Yes, I own one" },
          { value: "no", label: "No, first laptop" },
          { value: "skip", label: "Skip this" },
        ]}
      />

      {mode ? (
        <div className="space-y-6 rounded-2xl border bg-card p-5">
          <div>
            <FieldLabel hint="Optional — helps us show your upgrade">
              Find your current model
            </FieldLabel>
            <ModelCombobox
              laptops={laptops}
              value={cur.matchedId}
              onSelect={(l) =>
                setCur({
                  matchedId: l.id,
                  label: l.name,
                  cpuTier: l.cpu.tier,
                  ramGB: l.ramGB,
                  storageGB: l.storageGB,
                  screenSize: l.screen.sizeInch,
                  batteryHours: l.batteryHours,
                  weightKg: l.weightKg,
                  releaseYear: l.releaseYear,
                })
              }
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
                or enter specs manually
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Processor</FieldLabel>
              <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1">
                {CPU_TIERS.map((t) => {
                  const active = cur.cpuTier === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setCur({ cpuTier: t.value, matchedId: undefined })}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                        active
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cur-ram" className="mb-2 block text-sm font-medium">
                  RAM (GB)
                </Label>
                <Input
                  id="cur-ram"
                  type="number"
                  inputMode="numeric"
                  min={2}
                  placeholder="8"
                  value={cur.ramGB ?? ""}
                  onChange={(e) =>
                    setCur({
                      ramGB: e.target.value ? Number(e.target.value) : undefined,
                      matchedId: undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cur-storage" className="mb-2 block text-sm font-medium">
                  Storage (GB)
                </Label>
                <Input
                  id="cur-storage"
                  type="number"
                  inputMode="numeric"
                  min={32}
                  placeholder="256"
                  value={cur.storageGB ?? ""}
                  onChange={(e) =>
                    setCur({
                      storageGB: e.target.value ? Number(e.target.value) : undefined,
                      matchedId: undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cur-screen" className="mb-2 block text-sm font-medium">
                  Screen (in)
                </Label>
                <Input
                  id="cur-screen"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={10}
                  placeholder="13.3"
                  value={cur.screenSize ?? ""}
                  onChange={(e) =>
                    setCur({
                      screenSize: e.target.value ? Number(e.target.value) : undefined,
                      matchedId: undefined,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cur-year" className="mb-2 block text-sm font-medium">
                  Year
                </Label>
                <Input
                  id="cur-year"
                  type="number"
                  inputMode="numeric"
                  min={2010}
                  max={2026}
                  placeholder="2019"
                  value={cur.releaseYear ?? ""}
                  onChange={(e) =>
                    setCur({
                      releaseYear: e.target.value ? Number(e.target.value) : undefined,
                      matchedId: undefined,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
          {ownMode ? (
            <Laptop2 className="mt-0.5 size-5 shrink-0" />
          ) : (
            <Info className="mt-0.5 size-5 shrink-0" />
          )}
          <p>
            {ownMode
              ? "No problem — we'll skip the current-laptop comparison and focus on finding your best match."
              : "Great, we'll recommend a perfect first laptop based on what you need."}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Pain points
// ---------------------------------------------------------------------------

export function StepPain({ answers, update }: StepProps) {
  const toggle = (v: (typeof PAIN_OPTIONS)[number]["value"]) => {
    const set = new Set(answers.painPoints);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    update({ painPoints: Array.from(set) });
  };
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PAIN_OPTIONS.map((o) => (
        <OptionCard
          key={o.value}
          selected={answers.painPoints.includes(o.value)}
          onToggle={() => toggle(o.value)}
          label={o.label}
          description={o.description}
          icon={o.icon}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Primary uses
// ---------------------------------------------------------------------------

export function StepUses({ answers, update }: StepProps) {
  const toggle = (v: (typeof USE_OPTIONS)[number]["value"]) => {
    const set = new Set(answers.uses);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    update({ uses: Array.from(set) });
  };
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {USE_OPTIONS.map((o) => (
        <OptionCard
          key={o.value}
          selected={answers.uses.includes(o.value)}
          onToggle={() => toggle(o.value)}
          label={o.label}
          description={o.description}
          icon={o.icon}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Requirements
// ---------------------------------------------------------------------------

export function StepRequirements({ answers, update }: StepProps) {
  const req = answers.requirements;
  const setReq = (patch: Partial<typeof req>) =>
    update({ requirements: { ...req, ...patch } });

  const togglePort = (p: Port) => {
    const set = new Set(req.ports);
    if (set.has(p)) set.delete(p);
    else set.add(p);
    setReq({ ports: Array.from(set) });
  };

  const weightLabel =
    req.maxWeightKg == null
      ? "Any weight"
      : `${req.maxWeightKg.toFixed(1)} kg (${kgToLb(req.maxWeightKg)} lb)`;

  return (
    <div className="space-y-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <FieldLabel>Operating system</FieldLabel>
          <Segmented
            ariaLabel="Operating system preference"
            value={req.os}
            onChange={(v: OSPref) => setReq({ os: v })}
            options={OS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
        </div>
        <div>
          <FieldLabel>Touchscreen</FieldLabel>
          <Segmented
            ariaLabel="Touchscreen preference"
            value={req.touch}
            onChange={(v: TouchPref) => setReq({ touch: v })}
            options={[
              { value: "any", label: "Any" },
              { value: "yes", label: "Required" },
              { value: "no", label: "No touch" },
            ]}
          />
        </div>
      </div>

      <div>
        <FieldLabel hint="We'll exclude laptops missing these">
          Required ports
        </FieldLabel>
        <div className="flex flex-wrap gap-2">
          {PORT_OPTIONS.map((o) => {
            const active = req.ports.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                aria-pressed={active}
                onClick={() => togglePort(o.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4">
          <FieldLabel hint={weightLabel}>Max weight</FieldLabel>
          <Slider
            aria-label="Maximum weight"
            min={0.7}
            max={2.6}
            step={0.1}
            value={[req.maxWeightKg ?? 2.6]}
            onValueChange={([v]) =>
              setReq({ maxWeightKg: v >= 2.6 ? undefined : v })
            }
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0.7 kg</span>
            <span>Any</span>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <FieldLabel
            hint={
              req.minBattery > 0 ? `${req.minBattery}+ hours` : "Any battery life"
            }
          >
            Minimum battery life
          </FieldLabel>
          <Slider
            aria-label="Minimum battery life"
            min={0}
            max={18}
            step={1}
            value={[req.minBattery]}
            onValueChange={([v]) => setReq({ minBattery: v })}
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Any</span>
            <span>18 h</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <FieldLabel
          hint={`${req.minScreen}" – ${req.maxScreen}"`}
        >
          Screen size range
        </FieldLabel>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-1 block text-xs text-muted-foreground">
              Minimum: {req.minScreen}&quot;
            </span>
            <Slider
              aria-label="Minimum screen size"
              min={11}
              max={17}
              step={0.5}
              value={[req.minScreen]}
              onValueChange={([v]) =>
                setReq({ minScreen: Math.min(v, req.maxScreen) })
              }
            />
          </div>
          <div>
            <span className="mb-1 block text-xs text-muted-foreground">
              Maximum: {req.maxScreen}&quot;
            </span>
            <Slider
              aria-label="Maximum screen size"
              min={11}
              max={18}
              step={0.5}
              value={[req.maxScreen]}
              onValueChange={([v]) =>
                setReq({ maxScreen: Math.max(v, req.minScreen) })
              }
            />
          </div>
        </div>
      </div>

      <label className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <span className="flex items-center gap-3">
          <Settings2 className="size-5 text-muted-foreground" />
          <span>
            <span className="block font-medium">Backlit keyboard</span>
            <span className="block text-sm text-muted-foreground">
              Helpful for typing in low light
            </span>
          </span>
        </span>
        <Switch
          checked={req.backlitKeyboard}
          onCheckedChange={(c) => setReq({ backlitKeyboard: c })}
          aria-label="Require backlit keyboard"
        />
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Budget
// ---------------------------------------------------------------------------

export function StepBudget({ answers, update }: StepProps) {
  const { budget } = answers;
  const cap = effectiveBudget(answers);
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 text-center">
        <div className="text-sm text-muted-foreground">Your budget</div>
        <div className="mt-1 font-mono text-4xl font-semibold tracking-tight sm:text-5xl">
          ${budget.max.toLocaleString()}
        </div>
        {budget.flexible ? (
          <div className="mt-1 text-sm text-muted-foreground">
            Stretch up to{" "}
            <span className="font-medium text-foreground">
              ${cap.toLocaleString()}
            </span>{" "}
            with flexibility
          </div>
        ) : null}
        <div className="mt-6">
          <Slider
            aria-label="Budget"
            min={300}
            max={3000}
            step={50}
            value={[budget.max]}
            onValueChange={([v]) =>
              update({ budget: { ...budget, max: v } })
            }
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>$300</span>
            <span>$3,000</span>
          </div>
        </div>
      </div>

      <label className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <span>
          <span className="block font-medium">Flexible budget (±10%)</span>
          <span className="block text-sm text-muted-foreground">
            Consider laptops slightly over budget if they&apos;re a great fit
          </span>
        </span>
        <Switch
          checked={budget.flexible}
          onCheckedChange={(c) => update({ budget: { ...budget, flexible: c } })}
          aria-label="Flexible budget"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {[600, 900, 1200, 1800, 2500].map((v) => (
          <Button
            key={v}
            type="button"
            variant={budget.max === v ? "default" : "outline"}
            size="sm"
            onClick={() => update({ budget: { ...budget, max: v } })}
          >
            ${v.toLocaleString()}
          </Button>
        ))}
      </div>
    </div>
  );
}
