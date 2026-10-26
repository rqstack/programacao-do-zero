"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Compass } from "lucide-react";
import { cx, ProgressBar } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth/auth-provider";
import { battleMe } from "@/lib/battle/api";
import { missionViews } from "@/lib/progress/missions";
import type { ProgressState } from "@/lib/progress/model";

const LEVEL_LABEL = { iniciante: "Para começar", intermediario: "Próximo passo" } as const;

/** Missões com objetivo, progresso e recompensa. A de batalhas lê as vitórias reais do servidor. */
export function MissionsPanel({ progress }: { progress: ProgressState }) {
  const auth = useAuth();
  const [wins, setWins] = useState<number | null>(null);
  const signedIn = Boolean(auth.session);

  useEffect(() => {
    if (!signedIn) return;
    let alive = true;
    battleMe()
      .then((me) => {
        if (alive) setWins(me?.wins ?? 0);
      })
      .catch(() => {
        /* sem conexão: a missão de batalhas fica sem dados */
      });
    return () => {
      alive = false;
    };
  }, [signedIn]);

  const views = missionViews(progress, new Date(), signedIn ? wins : null);
  const doneCount = views.filter((v) => v.done).length;

  return (
    <section aria-labelledby="missoes">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="missoes" className="flex items-center gap-2 text-xl font-semibold">
          <Compass aria-hidden className="size-5 text-electric-hi" /> Missões
        </h2>
        <span className="font-mono text-xs text-muted">
          {doneCount}/{views.length} concluídas
        </span>
      </div>
      {(["iniciante", "intermediario"] as const).map((level) => (
        <div key={level} className="mt-5">
          <h3 className="font-mono text-xs uppercase tracking-[0.14em] text-subtle">{LEVEL_LABEL[level]}</h3>
          <ul className="mt-2 divide-y divide-line border-y border-line">
            {views
              .filter((v) => v.mission.level === level)
              .map(({ mission: m, value, done }) => (
                <li key={m.slug} className="grid gap-2 py-3 sm:grid-cols-[1fr_12rem] sm:items-center sm:gap-6">
                  <div className="flex items-start gap-3">
                    {done ? (
                      <CheckCircle2 aria-label="Concluída" className="mt-0.5 size-5 shrink-0 text-ok" />
                    ) : (
                      <span aria-hidden className="mt-1 size-4 shrink-0 rounded-full border-2 border-line-strong" />
                    )}
                    <div>
                      <Link href={m.href} className={cx("font-semibold hover:text-electric-hi", done && "text-muted")}>
                        {m.title}
                      </Link>
                      <p className="text-sm text-muted">{m.goal}</p>
                      {m.source === "battle" && !signedIn && <p className="text-xs text-subtle">Entre com o Google para acompanhar esta missão.</p>}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-xs text-muted">
                      <span>
                        {value}/{m.target}
                      </span>
                      <span>{m.xp ? `+${m.xp} XP` : "distintivo"}</span>
                    </div>
                    <ProgressBar value={value / m.target} label={`Progresso: ${m.title}`} className="mt-1.5" />
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
