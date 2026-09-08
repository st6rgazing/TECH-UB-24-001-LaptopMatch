"use client";

import type { ScoredLaptop } from "@/lib/recommend";
import { kgToLb, osName, portName } from "@/lib/recommend";
import type { CardLabel } from "@/components/results/laptop-card";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

interface Entry {
  label: CardLabel;
  scored: ScoredLaptop;
}

type RowValue = string | number | boolean;

interface Row {
  label: string;
  get: (s: ScoredLaptop) => RowValue;
  /** Higher is better -> highlight the max; for weight, lower is better. */
  best?: "max" | "min";
  format?: (v: RowValue) => string;
}

const ROWS: Row[] = [
  { label: "Match score", get: (s) => s.score, best: "max", format: (v) => `${v}%` },
  { label: "Price", get: (s) => s.laptop.price, best: "min", format: (v) => `$${Number(v).toLocaleString()}` },
  { label: "OS", get: (s) => osName(s.laptop.os) },
  { label: "Processor", get: (s) => s.laptop.cpu.name },
  { label: "RAM", get: (s) => s.laptop.ramGB, best: "max", format: (v) => `${v}GB` },
  { label: "Storage", get: (s) => s.laptop.storageGB, best: "max", format: (v) => `${v}GB` },
  { label: "Graphics", get: (s) => s.laptop.gpu.name },
  {
    label: "Display",
    get: (s) => `${s.laptop.screen.sizeInch}" ${s.laptop.screen.panel}`,
  },
  {
    label: "Brightness",
    get: (s) => s.laptop.screen.brightnessNits,
    best: "max",
    format: (v) => `${v} nits`,
  },
  { label: "Touchscreen", get: (s) => s.laptop.screen.touch },
  {
    label: "Battery",
    get: (s) => s.laptop.batteryHours,
    best: "max",
    format: (v) => `${v}h`,
  },
  {
    label: "Weight",
    get: (s) => s.laptop.weightKg,
    best: "min",
    format: (v) => `${Number(v).toFixed(2)}kg (${kgToLb(Number(v))}lb)`,
  },
  {
    label: "Ports",
    get: (s) => s.laptop.ports.map(portName).join(", "),
  },
  { label: "Backlit keyboard", get: (s) => s.laptop.backlitKeyboard },
];

export function ComparisonTable({ entries }: { entries: Entry[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b">
            <th className="sticky left-0 z-10 bg-card p-4 text-left font-medium text-muted-foreground">
              Spec
            </th>
            {entries.map((e) => (
              <th key={e.scored.laptop.id} className="p-4 text-left align-bottom">
                <div className="text-xs font-medium text-primary">{e.label}</div>
                <div className="font-semibold leading-tight">
                  {e.scored.laptop.model}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  ${e.scored.laptop.price.toLocaleString()}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const values = entries.map((e) => row.get(e.scored));
            const bestIdx = row.best
              ? bestIndex(values, row.best)
              : -1;
            return (
              <tr key={row.label} className="border-b last:border-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card p-4 text-left font-medium text-muted-foreground"
                >
                  {row.label}
                </th>
                {values.map((v, i) => (
                  <td
                    key={i}
                    className={cn(
                      "p-4 align-top",
                      i === bestIdx && "font-semibold text-foreground",
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {typeof v === "boolean" ? (
                        v ? (
                          <Check className="size-4 text-success" strokeWidth={2.5} />
                        ) : (
                          <Minus className="size-4 text-muted-foreground/60" />
                        )
                      ) : (
                        (row.format ? row.format(v) : String(v))
                      )}
                      {i === bestIdx && row.best ? (
                        <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                          Best
                        </span>
                      ) : null}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function bestIndex(values: RowValue[], mode: "max" | "min"): number {
  let idx = -1;
  let bestVal = mode === "max" ? -Infinity : Infinity;
  values.forEach((v, i) => {
    if (typeof v !== "number") return;
    if ((mode === "max" && v > bestVal) || (mode === "min" && v < bestVal)) {
      bestVal = v;
      idx = i;
    }
  });
  // Only highlight if there's a unique best.
  const count = values.filter((v) => v === bestVal).length;
  return count === 1 ? idx : -1;
}
