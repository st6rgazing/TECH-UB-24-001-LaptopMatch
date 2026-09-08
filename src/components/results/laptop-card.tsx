"use client";

import { motion } from "framer-motion";
import {
  BatteryFull,
  Check,
  Cpu,
  HardDrive,
  MemoryStick,
  Minus,
  Monitor,
  TrendingUp,
  Weight,
  X,
} from "lucide-react";
import type { ScoredLaptop } from "@/lib/recommend";
import { osName } from "@/lib/recommend";
import type { Answers } from "@/lib/types";
import { buildUpgradeDelta } from "@/lib/upgrade";
import { LaptopImage } from "@/components/laptop-image";
import { MatchRing } from "@/components/results/match-ring";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CardLabel = "Best Match" | "Best Value" | "Premium Pick";

const LABEL_STYLES: Record<CardLabel, string> = {
  "Best Match": "bg-primary text-primary-foreground",
  "Best Value": "bg-success text-success-foreground",
  "Premium Pick":
    "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white dark:from-violet-400 dark:to-fuchsia-400",
};

export function LaptopCard({
  scored,
  label,
  answers,
  featured = false,
  index = 0,
}: {
  scored: ScoredLaptop;
  label: CardLabel;
  answers: Answers;
  featured?: boolean;
  index?: number;
}) {
  const { laptop, criteria, reasons } = scored;
  const delta = buildUpgradeDelta(answers, laptop);

  // Surface the criteria the user emphasized, split into met / missed.
  const emphasized = criteria.filter((c) => c.emphasized);
  const met = emphasized.filter((c) => c.met);
  const missed = emphasized.filter((c) => !c.met);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className={cn("h-full", featured && "sm:-mt-2")}
    >
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden p-0 gap-0",
          featured && "ring-2 ring-primary/50 shadow-lg",
        )}
      >
        {/* Header / image */}
        <div className="relative">
          <LaptopImage laptop={laptop} className="h-44 w-full" />
          <div className="absolute left-3 top-3">
            <Badge className={cn("shadow-sm", LABEL_STYLES[label])}>
              {label === "Best Match" && featured ? "★ " : ""}
              {label}
            </Badge>
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-background/85 p-1 shadow-sm backdrop-blur">
            <MatchRing score={scored.score} size={56} />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                {laptop.brand}
              </div>
              <h3 className="text-balance text-lg font-semibold leading-tight">
                {laptop.model}
              </h3>
            </div>
            <div className="text-right">
              <div className="font-mono text-xl font-semibold">
                ${laptop.price.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">{osName(laptop.os)}</div>
            </div>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{laptop.blurb}</p>

          {/* Key specs */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            <Spec icon={Cpu} label="CPU" value={laptop.cpu.name} />
            <Spec icon={MemoryStick} label="RAM" value={`${laptop.ramGB}GB`} />
            <Spec
              icon={Monitor}
              label="Screen"
              value={`${laptop.screen.sizeInch}" ${laptop.screen.panel}`}
            />
            <Spec icon={HardDrive} label="Storage" value={`${laptop.storageGB}GB`} />
            <Spec
              icon={BatteryFull}
              label="Battery"
              value={`${laptop.batteryHours}h`}
            />
            <Spec
              icon={Weight}
              label="Weight"
              value={`${laptop.weightKg.toFixed(2)}kg`}
            />
          </dl>

          {/* Why this fits */}
          <div className="mt-5">
            <h4 className="text-sm font-semibold">Why this fits you</h4>
            <ul className="mt-2 space-y-1.5">
              {reasons.slice(0, featured ? 5 : 4).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} />
                  <span className="text-muted-foreground">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Priorities met / missed */}
          {emphasized.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {met.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                >
                  <Check className="size-3" strokeWidth={3} />
                  {c.label}
                </span>
              ))}
              {missed.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  <X className="size-3" strokeWidth={3} />
                  {c.label}
                </span>
              ))}
            </div>
          ) : null}

          {/* Upgrade delta */}
          {delta && delta.length > 0 ? (
            <div className="mt-5 rounded-xl border bg-muted/30 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <TrendingUp className="size-3.5 text-primary" />
                Upgrade from your current laptop
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {delta.map((d) => (
                  <div key={d.label} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        d.direction === 1 && "text-success",
                        d.direction === -1 && "text-destructive",
                        d.direction === 0 && "text-muted-foreground",
                      )}
                    >
                      {d.direction === 1 ? (
                        <TrendingUp className="size-3" />
                      ) : d.direction === -1 ? (
                        <TrendingUp className="size-3 rotate-180" />
                      ) : (
                        <Minus className="size-3" />
                      )}
                      {d.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="sr-only">{label}</dt>
        <dd className="truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}
