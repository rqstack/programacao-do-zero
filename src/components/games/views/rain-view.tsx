"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { InlineMd } from "@/components/content/inline-md";
import { cx } from "@/components/ui/primitives";
import type { RainPayload, RoundFeedback } from "@/lib/games/engine";

/** Tempo de queda por dificuldade, em ms. */
const FALL_MS: Record<number, number> = { 1: 7000, 2: 5500, 3: 4200 };

export function RainView({
  payload,
  difficulty,
  onAnswer,
  onAutoNext,
}: {
  payload: RainPayload;
  difficulty: number;
  onAnswer: (v: unknown) => RoundFeedback | null;
  onAutoNext: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<RoundFeedback | null>(null);
  const answered = useRef(false);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = FALL_MS[difficulty] ?? 5500;

  function answer(value: boolean | null) {
    if (answered.current) return;
    answered.current = true;
    const fb = onAnswer({ value });
    setResult(fb);
    window.setTimeout(onAutoNext, fb && fb.kind === "rain" && fb.correct ? 1100 : 2400);
  }

  // Queda controlada por requestAnimationFrame: a posição e o tempo esgotado vêm do mesmo relógio.
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      if (answered.current) return;
      const p = Math.min(1, (t - t0) / duration);
      setProgress(p);
      if (p >= 1) answer(null);
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // A rodada é montada de novo (key) a cada afirmação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "v" || e.key === "ArrowLeft") answer(true);
      if (k === "f" || e.key === "ArrowRight") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const correct = result?.kind === "rain" ? result.correct : null;
  const timedOut = result?.kind === "rain" && result.timedOut;
  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-[var(--radius-md)] border border-line bg-gradient-to-b from-[#071226] to-[#040a17]">
        <div aria-hidden className="grid-paper absolute inset-0 opacity-60" />
        {reduced && !result && (
          <div className="absolute inset-x-0 top-0 h-1.5 bg-line">
            <div className="h-full bg-amber" style={{ width: `${(1 - progress) * 100}%` }} />
          </div>
        )}
        <div
          className={cx(
            "absolute left-1/2 w-[min(22rem,88%)] -translate-x-1/2 rounded-[var(--radius-md)] border-2 bg-navy p-4 text-center shadow-xl",
            correct === null && "border-electric/60",
            correct === true && "border-ok bg-[#062a1e]",
            correct === false && "border-bad bg-[#2e0c10]",
          )}
          style={{ top: reduced ? "35%" : `calc(${progress * 100}% * 0.78)` }}
          aria-live="polite"
        >
          <p className="font-semibold">{payload.statement}</p>
          {payload.code && <code className="mt-2 inline-block rounded bg-black/40 px-2 py-1 font-mono text-sm text-[#cfe0ff]">{payload.code}</code>}
          {result?.kind === "rain" && (
            <p className={cx("mt-2 text-sm font-bold", result.correct ? "text-ok" : "text-bad")}>
              {timedOut ? "Caiu! " : result.correct ? "Isso! " : "Ops! "}
              <span className="font-normal text-muted">
                {result.truth ? "É verdadeiro." : "É falso."} <InlineMd text={result.explanation} />
              </span>
            </p>
          )}
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-bad/30" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={result !== null}
          className="flex min-h-14 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-b-4 border-ok/70 bg-ok/10 text-lg font-bold text-ok disabled:opacity-40"
        >
          <Check aria-hidden className="size-6" /> Verdadeiro <kbd className="hidden rounded border border-ok/40 px-1.5 font-mono text-xs sm:inline">V</kbd>
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={result !== null}
          className="flex min-h-14 items-center justify-center gap-2 rounded-[var(--radius-md)] border-2 border-b-4 border-bad/70 bg-bad/10 text-lg font-bold text-bad disabled:opacity-40"
        >
          <X aria-hidden className="size-6" /> Falso <kbd className="hidden rounded border border-bad/40 px-1.5 font-mono text-xs sm:inline">F</kbd>
        </button>
      </div>
    </div>
  );
}
