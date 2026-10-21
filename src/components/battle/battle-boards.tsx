"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Flame, Trophy } from "lucide-react";
import { LANG_INFO } from "@battle/battle-core.ts";
import { Avatar } from "@/components/profile/avatar";
import { Alert, cx, EmptyState, Spinner } from "@/components/ui/primitives";
import { history, leaderboard, type HistoryRow, type LeaderRow } from "@/lib/battle/api";
import { profileHref } from "@/lib/profiles/api";

/** Ranking exclusivo da Batalha (troféus). Não tem relação com o ranking de XP. */
export function BattleLeaderboard() {
  const [scope, setScope] = useState<"geral" | "temporada">("geral");
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    leaderboard(scope)
      .then((r) => {
        if (!alive) return;
        setRows(r);
        setError(false);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [scope]);

  return (
    <section aria-labelledby="ranking-batalha" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ranking-batalha" className="text-xl font-semibold">
          Ranking da Batalha
        </h2>
        <div role="tablist" aria-label="Período" className="inline-flex rounded-full border border-line-strong p-1 text-sm">
          {(["geral", "temporada"] as const).map((s) => (
            <button key={s} role="tab" type="button" aria-selected={scope === s} onClick={() => { setRows(null); setScope(s); }} className={cx("min-h-8 rounded-full px-3", scope === s ? "bg-electric text-white" : "text-muted")}>
              {s === "geral" ? "Geral" : "Temporada atual"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted">{scope === "geral" ? "Troféus atuais." : "Troféus ganhos (menos os perdidos) nesta temporada."} Separado do ranking de XP.</p>
      {error ? (
        <Alert tone="error" title="Não foi possível carregar o ranking" />
      ) : !rows ? (
        <Spinner label="Carregando ranking" />
      ) : rows.length === 0 ? (
        <EmptyState title="Ninguém batalhou ainda">Seja a primeira pessoa a vencer uma partida.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-panel-2 text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">#</th>
                <th className="px-3 py-2 font-semibold">Jogador</th>
                <th className="px-3 py-2 font-semibold">Troféus</th>
                <th className="px-3 py-2 font-semibold">Arena</th>
                <th className="px-3 py-2 font-semibold">V / D</th>
                <th className="px-3 py-2 font-semibold">Vitórias</th>
                <th className="px-3 py-2 font-semibold">Sequência</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.rank}-${r.display_name}`} className={cx("border-t border-line", r.is_me && "bg-electric/10")}>
                  <td className="px-3 py-2 font-mono">{r.rank === 1 ? <Crown aria-label="1º" className="size-4 text-amber" /> : `${r.rank}º`}</td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <Avatar name={r.display_name} url={r.avatar_url} size={28} />
                      {r.username ? (
                        <Link href={profileHref(r.username)} className="truncate font-medium hover:underline">
                          {r.display_name}
                        </Link>
                      ) : (
                        <span className="truncate font-medium">{r.display_name}</span>
                      )}
                      {r.is_me && <span className="text-xs text-electric-hi">você</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-amber">
                    <Trophy aria-hidden className="mr-1 inline size-3.5" />
                    {r.trophies}
                  </td>
                  <td className="px-3 py-2 text-muted">{r.arena_name}</td>
                  <td className="px-3 py-2 font-mono">
                    <span className="text-ok">{r.wins}</span> / <span className="text-bad">{r.losses}</span>
                  </td>
                  <td className="px-3 py-2 font-mono">{r.win_rate}%</td>
                  <td className="px-3 py-2 font-mono">
                    {r.streak > 0 && <Flame aria-hidden className="mr-1 inline size-3.5 text-amber" />}
                    {r.streak} <span className="text-xs text-subtle">(máx. {r.best_streak})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function BattleHistory() {
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    history()
      .then((r) => alive && setRows(r))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);
  if (error) return <Alert tone="error" title="Não foi possível carregar o histórico" />;
  if (!rows) return <Spinner label="Carregando histórico" />;
  if (rows.length === 0) return <EmptyState title="Nenhuma batalha ainda">Suas partidas aparecem aqui quando terminarem.</EmptyState>;
  return (
    <ul className="divide-y divide-line rounded-[var(--radius-lg)] border border-line">
      {rows.map((h) => (
        <li key={h.match_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
          <span className={cx("w-20 font-semibold", h.outcome === "vitoria" ? "text-ok" : h.outcome === "derrota" ? "text-bad" : "text-muted")}>
            {h.outcome === "vitoria" ? "Vitória" : h.outcome === "derrota" ? "Derrota" : "Empate"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{h.challenge_title}</span>
            <span className="block truncate text-xs text-muted">
              contra {h.opponent_username ? <Link href={profileHref(h.opponent_username)} className="underline">{h.opponent_name}</Link> : h.opponent_name} ({LANG_INFO[h.opponent_lang]?.label ?? h.opponent_lang}) · você em {LANG_INFO[h.my_lang]?.label ?? h.my_lang} · {h.arena_name}
              {h.result === "abandono" ? " · por abandono" : h.result === "tempo_esgotado" ? " · tempo esgotado" : ""}
            </span>
          </span>
          <span className={cx("font-mono", (h.trophy_delta ?? 0) > 0 ? "text-amber" : (h.trophy_delta ?? 0) < 0 ? "text-bad" : "text-muted")}>
            {(h.trophy_delta ?? 0) > 0 ? "+" : ""}
            {h.trophy_delta ?? 0}
          </span>
          <time className="font-mono text-xs text-subtle" dateTime={h.finished_at}>
            {new Date(h.finished_at).toLocaleDateString("pt-BR")}
          </time>
        </li>
      ))}
    </ul>
  );
}
