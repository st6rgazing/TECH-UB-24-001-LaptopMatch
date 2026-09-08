"use client";

import { useEffect, useState } from "react";
import { Laptop } from "lucide-react";
import { getLaptops } from "@/data/laptops";
import { defaultAnswers, type Answers } from "@/lib/types";
import { decodeAnswers, encodeAnswers } from "@/lib/share";
import { Landing } from "@/components/landing";
import { Wizard } from "@/components/wizard/wizard";
import { Results } from "@/components/results/results";

type Phase = "landing" | "wizard" | "results";

export default function Page() {
  const laptops = getLaptops();
  const [phase, setPhase] = useState<Phase>("landing");
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [shareUrl, setShareUrl] = useState("");

  // Restore shared results from the URL (?r=...) on first load. This
  // synchronizes React state with an external system (the URL), which is a
  // legitimate effect use for this one-time hydration.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("r");
    if (!encoded) return;
    const restored = decodeAnswers(encoded);
    if (!restored) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers(restored);
    setPhase("results");
  }, []);

  const update = (patch: Partial<Answers>) =>
    setAnswers((prev) => ({ ...prev, ...patch }));

  const goToResults = () => {
    const encoded = encodeAnswers(answers);
    const url = `${window.location.origin}${window.location.pathname}?r=${encoded}`;
    setShareUrl(url);
    window.history.replaceState(null, "", url);
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setAnswers(defaultAnswers());
    window.history.replaceState(null, "", window.location.pathname);
    setPhase("landing");
    window.scrollTo({ top: 0 });
  };

  const tweak = () => {
    setPhase("wizard");
    window.scrollTo({ top: 0 });
  };

  return (
    <main className="flex min-h-screen flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Laptop className="size-4" />
            </span>
            Laptop&nbsp;Match
          </button>
          {phase !== "landing" ? (
            <span className="text-sm text-muted-foreground">
              {phase === "wizard" ? "Finding your match…" : "Your recommendations"}
            </span>
          ) : null}
        </div>
      </header>

      {phase === "landing" && <Landing onStart={() => setPhase("wizard")} />}

      {phase === "wizard" && (
        <Wizard
          answers={answers}
          update={update}
          laptops={laptops}
          onFinish={goToResults}
          onBackToStart={() => setPhase("landing")}
        />
      )}

      {phase === "results" && (
        <Results
          answers={answers}
          laptops={laptops}
          onRestart={restart}
          onTweak={tweak}
          shareUrl={shareUrl || (typeof window !== "undefined" ? window.location.href : "")}
        />
      )}

      <footer className="mt-auto border-t py-6 text-center text-xs text-muted-foreground">
        Laptop Match · A demo recommender · Specs & prices are illustrative
      </footer>
    </main>
  );
}
