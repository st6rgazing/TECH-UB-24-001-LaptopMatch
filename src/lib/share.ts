import type { Answers } from "@/lib/types";
import { defaultAnswers } from "@/lib/types";

/**
 * Encode/decode wizard answers to a compact, URL-safe string so results can be
 * shared or bookmarked without a backend.
 */
export function encodeAnswers(answers: Answers): string {
  const json = JSON.stringify(answers);
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(json).toString("base64")
      : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAnswers(encoded: string): Answers | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf-8")
        : decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    // Merge over defaults to tolerate schema drift.
    const base = defaultAnswers();
    return {
      ...base,
      ...parsed,
      current: { ...base.current, ...parsed.current },
      requirements: { ...base.requirements, ...parsed.requirements },
      budget: { ...base.budget, ...parsed.budget },
      painPoints: parsed.painPoints ?? [],
      uses: parsed.uses ?? [],
    };
  } catch {
    return null;
  }
}
