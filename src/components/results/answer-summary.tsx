"use client";

import type { Answers } from "@/lib/types";
import { PAIN_OPTIONS, USE_OPTIONS, OS_OPTIONS } from "@/lib/options";
import { effectiveBudget, kgToLb, portName } from "@/lib/recommend";

/** A skimmable recap of the inputs that produced these results. */
export function AnswerSummary({ answers }: { answers: Answers }) {
  const chips: string[] = [];

  chips.push(`Budget up to $${effectiveBudget(answers).toLocaleString()}`);

  const os = OS_OPTIONS.find((o) => o.value === answers.requirements.os);
  if (os && answers.requirements.os !== "any") chips.push(os.label);

  if (answers.requirements.touch === "yes") chips.push("Touchscreen");
  if (answers.requirements.touch === "no") chips.push("No touchscreen");

  if (answers.requirements.maxWeightKg != null)
    chips.push(
      `≤ ${answers.requirements.maxWeightKg.toFixed(1)}kg (${kgToLb(answers.requirements.maxWeightKg)}lb)`,
    );

  if (answers.requirements.minBattery > 0)
    chips.push(`${answers.requirements.minBattery}h+ battery`);

  for (const p of answers.requirements.ports) chips.push(portName(p));

  for (const u of answers.uses) {
    const opt = USE_OPTIONS.find((o) => o.value === u);
    if (opt) chips.push(opt.label);
  }

  for (const p of answers.painPoints) {
    const opt = PAIN_OPTIONS.find((o) => o.value === p);
    if (opt) chips.push(`Fix: ${opt.label.toLowerCase()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">
        Matching for:
      </span>
      {chips.map((c, i) => (
        <span
          key={`${c}-${i}`}
          className="rounded-full border bg-card px-3 py-1 text-xs font-medium"
        >
          {c}
        </span>
      ))}
    </div>
  );
}
