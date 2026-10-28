"use client";

import Link from "next/link";
import { ArrowRight, Code2, RotateCcw } from "lucide-react";
import { CHALLENGE_LABEL } from "@content/challenges";
import { adaptiveRecommendations, type ChallengeInfo, type LessonInfo } from "@/lib/path/adaptive";
import { useHydrated, useProgress } from "@/lib/progress/store";

export interface AdaptiveData {
  lessons: LessonInfo[];
  challenges: ChallengeInfo[];
  courses: Array<{ slug: string; title: string; lessons: string[] }>;
}

/** "Recomendado para você": reforço, um desafio do tamanho certo e o próximo assunto. */
export function AdaptivePanel({ data }: { data: AdaptiveData }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const recs = adaptiveRecommendations(progress, data.lessons, data.challenges, data.courses);
  if (recs.length === 0) return null;
  return (
    <section aria-labelledby="recomendado">
      <h2 id="recomendado" className="text-xl font-bold">
        Recomendado para você
      </h2>
      <p className="mt-1 text-sm text-muted">Com base nos seus acertos e erros. O tempo que você leva não conta: estude com calma.</p>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {recs.map((r, i) => (
          <li key={i} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                {r.kind === "reforcar" ? "Reforçar" : r.kind === "desafio" ? `Desafio ${CHALLENGE_LABEL[r.challenge.difficulty].toLowerCase()}` : "Próximo assunto"}
              </p>
              <p className="font-semibold">{r.kind === "reforcar" ? r.lesson.title : r.kind === "desafio" ? r.challenge.title : r.course.title}</p>
              <p className="text-sm text-muted">{r.reason}</p>
            </div>
            {r.kind === "reforcar" ? (
              <span className="flex flex-wrap gap-2 text-sm">
                <Link href="/revisao" className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-strong px-3 hover:border-muted">
                  <RotateCcw aria-hidden className="size-4" /> Refazer as erradas
                </Link>
                <Link href={`/aulas/${r.lesson.slug}`} className="inline-flex min-h-9 items-center rounded-md px-3 text-muted hover:text-fg">
                  Rever a aula
                </Link>
              </span>
            ) : r.kind === "desafio" ? (
              <Link href={`/desafios?id=${r.challenge.id}`} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-strong px-3 text-sm hover:border-muted">
                <Code2 aria-hidden className="size-4" /> Resolver
              </Link>
            ) : (
              <Link href={`/trilhas/${r.course.slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-strong px-3 text-sm hover:border-muted">
                Abrir trilha <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
