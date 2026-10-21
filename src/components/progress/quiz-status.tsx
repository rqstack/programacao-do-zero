"use client";

import { useHydrated, useProgress } from "@/lib/progress/store";

/** Mostra a melhor nota salva para um quiz (ou nada, antes de existir tentativa). */
export function QuizStatus({ slug }: { slug: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const q = hydrated ? progress.quizzes[slug] : undefined;
  if (!q) return <span className="text-xs text-subtle">não feito</span>;
  return <span className={q.passed ? "font-mono text-xs text-amber" : "font-mono text-xs text-muted"}>{q.best}%{q.passed ? " ✓" : ""}</span>;
}
