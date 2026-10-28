"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useHydrated, useProgress } from "@/lib/progress/store";

export interface LessonOrderItem {
  slug: string;
  title: string;
  courseTitle: string;
}

/** Sugere a próxima aula a partir do progresso salvo no navegador. */
export function ContinueCard({ order, fallbackLabel = "Começar pela primeira aula" }: { order: LessonOrderItem[]; fallbackLabel?: string }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const doneCount = Object.keys(progress.lessons).length;
  const next = order.find((l) => !progress.lessons[l.slug]) ?? null;
  const first = order[0];
  if (!first) return null;

  if (!hydrated || doneCount === 0) {
    return (
      <Link
        href={`/aulas/${first.slug}`}
        className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-md)] bg-electric px-6 font-semibold text-white hover:bg-electric-strong"
      >
        {fallbackLabel} <ArrowRight aria-hidden className="size-4" />
      </Link>
    );
  }
  if (!next) {
    return (
      <Link href="/progresso" className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-md)] bg-electric px-6 font-semibold text-white hover:bg-electric-strong">
        Você concluiu todas as aulas — ver progresso <ArrowRight aria-hidden className="size-4" />
      </Link>
    );
  }
  return (
    <Link
      href={`/aulas/${next.slug}`}
      className="inline-flex min-h-12 max-w-full items-center gap-2 rounded-[var(--radius-md)] bg-electric px-6 font-semibold text-white hover:bg-electric-strong"
    >
      <span className="truncate">Continuar: {next.title}</span> <ArrowRight aria-hidden className="size-4 shrink-0" />
    </Link>
  );
}
