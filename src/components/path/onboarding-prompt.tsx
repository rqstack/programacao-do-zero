"use client";

import Link from "next/link";
import { Compass, X } from "lucide-react";
import { dispatchProgress, useHydrated, useProgress } from "@/lib/progress/store";

/** Convite discreto para montar a trilha. Some quando a pessoa responde ou pula. Nunca bloqueia nada. */
export function OnboardingPrompt() {
  const progress = useProgress();
  const hydrated = useHydrated();
  if (!hydrated || progress.onboarding) return null;
  return (
    <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      <Compass aria-hidden className="size-4 text-amber" />
      Não sabe por onde começar?
      <Link href="/comecar" className="font-semibold text-electric-hi underline-offset-2 hover:underline">
        Responda 4 perguntas
      </Link>
      <button
        type="button"
        onClick={() => dispatchProgress({ type: "onboarding/save", answers: null })}
        className="inline-flex min-h-8 items-center gap-1 rounded px-1 text-xs text-subtle hover:text-fg"
        aria-label="Pular e não mostrar de novo"
      >
        <X aria-hidden className="size-3.5" /> Pular
      </button>
    </p>
  );
}
