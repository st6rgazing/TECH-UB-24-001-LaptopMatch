"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  RotateCcw,
  SearchX,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import type { Answers, Laptop } from "@/lib/types";
import {
  effectiveBudget,
  evaluateFilters,
  reasonLabel,
  recommend,
  type FilterReason,
} from "@/lib/recommend";
import { LaptopCard, type CardLabel } from "@/components/results/laptop-card";
import { ComparisonTable } from "@/components/results/comparison-table";
import { Button } from "@/components/ui/button";
import { AnswerSummary } from "@/components/results/answer-summary";

export function Results({
  answers,
  laptops,
  onRestart,
  onTweak,
  shareUrl,
}: {
  answers: Answers;
  laptops: Laptop[];
  onRestart: () => void;
  onTweak: () => void;
  shareUrl: string;
}) {
  const result = useMemo(() => recommend(laptops, answers), [laptops, answers]);
  const [copied, setCopied] = useState(false);

  const picks = [
    result.best && { label: "Best Match" as CardLabel, scored: result.best },
    result.value && { label: "Best Value" as CardLabel, scored: result.value },
    result.premium && { label: "Premium Pick" as CardLabel, scored: result.premium },
  ].filter(Boolean) as { label: CardLabel; scored: NonNullable<typeof result.best> }[];

  const handleShare = async () => {
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: "My Laptop Match results",
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; fall back silently.
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="text-sm font-medium text-primary">Your results</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            {picks.length > 0
              ? "Here are your top matches"
              : "Let's widen the search"}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {picks.length > 0
              ? `We compared ${result.totalCatalog} laptops and found ${result.totalCandidates} that meet your must-haves. These are the best three for how you'll actually use it.`
              : "None of our laptops cleared every hard requirement. Loosen one or two and we'll find great options."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onTweak} className="gap-2">
            <SlidersHorizontal className="size-4" />
            Tweak answers
          </Button>
          <Button variant="outline" onClick={onRestart} className="gap-2">
            <RotateCcw className="size-4" />
            Restart
          </Button>
          {picks.length > 0 ? (
            <Button onClick={handleShare} className="gap-2">
              {copied ? (
                <>
                  <Check className="size-4" /> Copied!
                </>
              ) : (
                <>
                  <Share2 className="size-4" /> Share
                </>
              )}
            </Button>
          ) : null}
        </div>
      </motion.div>

      {picks.length > 0 ? (
        <>
          <AnswerSummary answers={answers} />

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {picks.map((p, i) => (
              <LaptopCard
                key={p.scored.laptop.id}
                scored={p.scored}
                label={p.label}
                answers={answers}
                featured={p.label === "Best Match"}
                index={i}
              />
            ))}
          </div>

          {picks.length > 1 ? (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-semibold tracking-tight">
                Side-by-side comparison
              </h2>
              <ComparisonTable entries={picks} />
            </section>
          ) : null}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={onTweak} className="gap-2">
              <SlidersHorizontal className="size-4" />
              Tweak my answers
            </Button>
            <Button onClick={handleShare} variant="secondary" className="gap-2">
              <Copy className="size-4" />
              {copied ? "Link copied!" : "Copy shareable link"}
            </Button>
            <Button variant="ghost" onClick={onRestart} className="gap-2">
              <RotateCcw className="size-4" />
              Start over
            </Button>
          </div>
        </>
      ) : (
        <NoResults answers={answers} laptops={laptops} onTweak={onTweak} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state — surfaces which hard filters are excluding everything.
// ---------------------------------------------------------------------------

function NoResults({
  answers,
  laptops,
  onTweak,
}: {
  answers: Answers;
  laptops: Laptop[];
  onTweak: () => void;
}) {
  // Count how often each filter reason knocks out a laptop.
  const blockers = useMemo(() => {
    const counts = new Map<FilterReason, number>();
    for (const l of laptops) {
      for (const r of evaluateFilters(l, answers).reasons) {
        counts.set(r, (counts.get(r) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [answers, laptops]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-lg rounded-3xl border bg-card p-8 text-center"
    >
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
        <SearchX className="size-7 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">No laptops matched everything</h2>
      <p className="mt-2 text-muted-foreground">
        These requirements are the biggest reasons we couldn&apos;t find a match:
      </p>
      <ul className="mx-auto mt-4 flex max-w-sm flex-col gap-2 text-left">
        {blockers.map(([reason, count]) => (
          <li
            key={reason}
            className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-2.5 text-sm"
          >
            <span className="font-medium">{reasonLabel(reason)}</span>
            <span className="text-muted-foreground">
              excludes {count} laptop{count === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        Tip: your budget cap is currently ${effectiveBudget(answers).toLocaleString()}.
      </p>
      <Button onClick={onTweak} size="lg" className="mt-6 gap-2">
        <SlidersHorizontal className="size-4" />
        Adjust my answers
      </Button>
    </motion.div>
  );
}
