"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useHydrated, useProgress } from "@/lib/progress/store";
import { cx, ProgressBar } from "@/components/ui/primitives";

interface MapLesson {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  number: number;
}

/** O mapa da trilha: cada aula é um ponto da rota; concluídas acendem em âmbar. */
export function CourseMap({ modules }: { modules: Array<{ title: string; lessons: MapLesson[] }> }) {
  const progress = useProgress();
  const hydrated = useHydrated();
  const all = modules.flatMap((m) => m.lessons);
  const done = hydrated ? all.filter((l) => progress.lessons[l.slug]).length : 0;
  const nextSlug = hydrated ? all.find((l) => !progress.lessons[l.slug])?.slug : all[0]?.slug;

  return (
    <div>
      <div className="mb-8 max-w-md">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-muted">Seu progresso nesta trilha</span>
          <span className="font-mono text-amber">
            {done}/{all.length}
          </span>
        </div>
        <ProgressBar value={all.length ? done / all.length : 0} label="Aulas concluídas nesta trilha" />
      </div>
      <div className="space-y-10">
        {modules.map((m, mi) => (
          <section key={m.title} aria-labelledby={`modulo-${mi}`}>
            <h2 id={`modulo-${mi}`} className="text-sm font-semibold text-muted">
              Módulo {mi + 1} · {m.title}
            </h2>
            <ol className="relative mt-4 space-y-1">
              <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-0.5 bg-line" />
              {m.lessons.map((l) => {
                const isDone = hydrated && Boolean(progress.lessons[l.slug]);
                const isNext = l.slug === nextSlug;
                return (
                  <li key={l.slug}>
                    <Link
                      href={`/aulas/${l.slug}`}
                      className={cx(
                        "group relative flex items-start gap-4 rounded-[var(--radius-md)] p-2 transition-colors hover:bg-panel",
                        isNext && "bg-panel/70",
                      )}
                    >
                      <span
                        className={cx(
                          "relative z-10 mt-0.5 grid size-6 shrink-0 translate-x-[7px] place-items-center rounded-full border-2 font-mono text-[0.65rem] font-bold",
                          isDone ? "border-amber bg-amber text-ink" : isNext ? "border-electric bg-ink text-electric-hi" : "border-line-strong bg-ink text-subtle",
                        )}
                      >
                        {isDone ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : l.number}
                      </span>
                      <span className="min-w-0 flex-1 pl-2">
                        <span className="flex flex-wrap items-baseline gap-x-3">
                          <span className="font-semibold group-hover:text-electric-hi">{l.title}</span>
                          <span className="font-mono text-xs text-subtle">{l.minutes} min</span>
                          {isDone && <span className="text-xs text-amber">concluída</span>}
                          {isNext && !isDone && <span className="text-xs text-electric-hi">próxima</span>}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted">{l.summary}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
