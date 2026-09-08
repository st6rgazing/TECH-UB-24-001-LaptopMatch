"use client";

import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  selected: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
  icon?: LucideIcon;
  /** "check" shows a checkmark (multi-select); "radio" shows a dot. */
  indicator?: "check" | "radio";
}

/**
 * A large, tap-friendly selectable card used for multi-select chips and
 * single-select choices throughout the wizard. Fully keyboard accessible.
 */
export function OptionCard({
  selected,
  onToggle,
  label,
  description,
  icon: Icon,
  indicator = "check",
}: OptionCardProps) {
  return (
    <button
      type="button"
      role={indicator === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "hover:border-primary/50 hover:bg-accent/40 active:scale-[0.99]",
        selected
          ? "border-primary bg-accent/60 shadow-sm ring-1 ring-primary/40"
          : "border-border bg-card",
      )}
    >
      {Icon ? (
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:text-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
      ) : null}
      <span className="flex-1">
        <span className="block font-medium leading-tight">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all",
          indicator === "radio" && "rounded-full",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 bg-transparent",
        )}
      >
        {selected ? (
          indicator === "check" ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <span className="size-2 rounded-full bg-primary-foreground" />
          )
        ) : null}
      </span>
    </button>
  );
}
