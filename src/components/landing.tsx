"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Gauge,
  Scale,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Gauge,
    title: "Answer, don't research",
    body: "A friendly 5-step wizard — no spec sheets required.",
  },
  {
    icon: Scale,
    title: "Ranked & explained",
    body: "See exactly why each pick fits your needs and budget.",
  },
  {
    icon: BadgeCheck,
    title: "Confident match scores",
    body: "Hard filters plus weighted scoring do the hard part.",
  },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="aurora-bg relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-2xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm font-medium shadow-sm backdrop-blur">
          <Sparkles className="size-4 text-primary" />
          Find your perfect laptop in 2 minutes
        </span>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Stop guessing.{" "}
          <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Get matched.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
          Laptop Match asks about how you actually use a computer — then
          recommends three laptops with clear, confident reasons. No jargon, no
          overwhelm.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={onStart} className="group gap-2 px-7 text-base">
            Start matching
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Free · No sign-up · ~2 minutes
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border bg-card/70 p-5 text-left shadow-sm backdrop-blur"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
