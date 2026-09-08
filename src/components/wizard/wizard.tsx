"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Answers, Laptop } from "@/lib/types";
import {
  StepBudget,
  StepCurrent,
  StepPain,
  StepRequirements,
  StepUses,
} from "@/components/wizard/steps";

interface StepDef {
  id: string;
  title: string;
  subtitle: string;
  eyebrow: string;
}

const STEPS: StepDef[] = [
  {
    id: "current",
    eyebrow: "Step 1 of 5",
    title: "Tell us about your current laptop",
    subtitle:
      "This is optional, but it lets us show exactly how much you'd upgrade.",
  },
  {
    id: "pain",
    eyebrow: "Step 2 of 5",
    title: "What frustrates you most?",
    subtitle: "Pick anything that sounds familiar — or nothing at all.",
  },
  {
    id: "uses",
    eyebrow: "Step 3 of 5",
    title: "What will you mainly use it for?",
    subtitle: "Choose all that apply so we can weigh the right specs.",
  },
  {
    id: "requirements",
    eyebrow: "Step 4 of 5",
    title: "Any must-haves?",
    subtitle: "These act as hard filters — we won't show anything that misses them.",
  },
  {
    id: "budget",
    eyebrow: "Step 5 of 5",
    title: "What's your budget?",
    subtitle: "We'll find the best value within your range.",
  },
];

export function Wizard({
  answers,
  update,
  laptops,
  onFinish,
  onBackToStart,
}: {
  answers: Answers;
  update: (patch: Partial<Answers>) => void;
  laptops: Laptop[];
  onFinish: () => void;
  onBackToStart: () => void;
}) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const progress = useMemo(
    () => ((step + 1) / STEPS.length) * 100,
    [step],
  );

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDir(1);
      setStep((s) => s + 1);
    } else {
      onFinish();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDir(-1);
      setStep((s) => s - 1);
    } else {
      onBackToStart();
    }
  };

  const def = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">{def.eyebrow}</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="mt-3 hidden justify-between sm:flex">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (i <= step) {
                  setDir(i < step ? -1 : 1);
                  setStep(i);
                }
              }}
              disabled={i > step}
              className={`text-xs transition-colors ${
                i === step
                  ? "font-semibold text-foreground"
                  : i < step
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/40"
              }`}
            >
              {stepShort(s.id)}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {def.title}
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">{def.subtitle}</p>
      </div>

      {/* Step body */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={def.id}
            custom={dir}
            initial={{ opacity: 0, x: dir * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === 0 && (
              <StepCurrent answers={answers} update={update} laptops={laptops} />
            )}
            {step === 1 && <StepPain answers={answers} update={update} />}
            {step === 2 && <StepUses answers={answers} update={update} />}
            {step === 3 && (
              <StepRequirements answers={answers} update={update} />
            )}
            {step === 4 && <StepBudget answers={answers} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={goBack} className="gap-2">
          <ArrowLeft className="size-4" />
          {step === 0 ? "Home" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          {!isLast ? (
            <Button variant="ghost" onClick={goNext} className="text-muted-foreground">
              Skip
            </Button>
          ) : null}
          <Button onClick={goNext} size="lg" className="gap-2">
            {isLast ? (
              <>
                <Sparkles className="size-4" />
                See my matches
              </>
            ) : (
              <>
                Next
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function stepShort(id: string): string {
  const map: Record<string, string> = {
    current: "Current",
    pain: "Frustrations",
    uses: "Uses",
    requirements: "Must-haves",
    budget: "Budget",
  };
  return map[id] ?? id;
}
