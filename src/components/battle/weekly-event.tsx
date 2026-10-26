"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Medal } from "lucide-react";
import { ARENAS } from "@battle/battle-core.ts";
import { EVENTS, type BattleEvent } from "@battle/battle-sql.ts";
import { cx } from "@/components/ui/primitives";
import { eventSummary, type EventSummary } from "@/lib/battle/api";

const METRIC: Record<BattleEvent["metric"], { rule: string; unit: (n: number) => string }> = {
  vitorias: { rule: "Placar: número de vitórias.", unit: (n) => `${n} ${n === 1 ? "vitória" : "vitórias"}` },
  resolvidos: { rule: "Placar: partidas em que você teve uma solução aceita.", unit: (n) => `${n} ${n === 1 ? "resolvida" : "resolvidas"}` },
  velocidade: { rule: "Placar: seu menor tempo até a primeira solução aceita (menor é melhor).", unit: (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}` },
};
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });

/** Evento da semana: período, regras, sua posição e o placar, calculados das partidas ranqueadas. */
export function WeeklyEvent({ signedIn }: { signedIn: boolean }) {
  const [now] = useState(() => Date.now());
  const current = EVENTS.find((e) => new Date(e.starts).getTime() <= now && now < new Date(e.ends).getTime()) ?? null;
  const upcoming = EVENTS.find((e) => new Date(e.starts).getTime() > now) ?? null;
  const past = [...EVENTS].reverse().find((e) => new Date(e.ends).getTime() <= now) ?? null;
  const shown = current ?? upcoming;
  const [summary, setSummary] = useState<EventSummary | null>(null);
  const [lastResult, setLastResult] = useState<EventSummary | null>(null);

  useEffect(() => {
    let alive = true;
    if (current) eventSummary(current.id).then((s) => alive && setSummary(s)).catch(() => undefined);
    if (past) eventSummary(past.id).then((s) => alive && setLastResult(s)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [current, past, signedIn]);

  if (!shown) return null;
  const arenas = shown.tiers.length >= ARENAS.length ? "todas as arenas" : ARENAS.filter((a) => shown.tiers.includes(a.tier)).map((a) => a.name).join(", ");

  return (
    <section aria-labelledby="evento" className="rounded-[var(--radius-lg)] border border-line p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-amber">
            <CalendarRange aria-hidden className="size-4" /> {current ? "Evento da semana" : "Próximo evento"} · {day(shown.starts)} a {day(new Date(new Date(shown.ends).getTime() - 1).toISOString())}
          </p>
          <h2 id="evento" className="mt-2 text-xl font-bold">
            {shown.name}
          </h2>
          <p className="mt-1 text-sm text-muted">{shown.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-muted">
            <li>{METRIC[shown.metric].rule}</li>
            <li>Vale só para partidas ranqueadas (pela fila) em {arenas}. Amistosas não contam.</li>
            <li>Sem prêmios em dinheiro: o evento é pelo placar e pela prática.</li>
          </ul>
        </div>
        {current && summary?.me && (
          <p className="rounded-[var(--radius-md)] border border-amber/40 px-4 py-3 text-center">
            <span className="block font-mono text-2xl font-bold text-amber">{summary.me.rank}º</span>
            <span className="text-xs text-muted">{METRIC[current.metric].unit(summary.me.score)}</span>
          </p>
        )}
      </div>

      {current && summary && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold">
            Placar <span className="font-mono text-xs font-normal text-subtle">· {summary.participants} participante(s)</span>
          </h3>
          {summary.leaders.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{signedIn ? "Ninguém pontuou ainda. Entre na fila e seja o primeiro!" : "Ninguém pontuou ainda."}</p>
          ) : (
            <ol className="mt-2 divide-y divide-line border-y border-line text-sm">
              {summary.leaders.map((l) => (
                <li key={`${l.rank}-${l.name}`} className={cx("flex items-center justify-between gap-3 py-2", l.is_me && "text-amber")}>
                  <span className="flex items-center gap-2">
                    <span className="w-6 font-mono text-xs text-subtle">{l.rank}º</span>
                    {l.rank === 1 && <Medal aria-hidden className="size-4 text-amber" />}
                    {l.name}
                    {l.is_me && " (você)"}
                  </span>
                  <span className="font-mono text-xs">{METRIC[current.metric].unit(l.score)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {past && lastResult && lastResult.leaders.length > 0 && (
        <p className="mt-4 text-xs text-muted">
          Último evento, {past.name}: {lastResult.leaders[0]!.name} ficou em 1º ({METRIC[past.metric].unit(lastResult.leaders[0]!.score)}).
        </p>
      )}
    </section>
  );
}
