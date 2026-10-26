"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Flame, Trophy } from "lucide-react";
import { LANG_INFO, type BattleLang } from "@battle/battle-core.ts";
import { Avatar } from "@/components/profile/avatar";
import { Alert, cx, EmptyState, Spinner } from "@/components/ui/primitives";
import { history, leaderboard, type HistoryRow, type LeaderRow } from "@/lib/battle/api";
import { profileHref } from "@/lib/profiles/api";
import { historyStats } from "@/lib/battle/stats";

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
  const [filter, setFilter] = useState<"todas" | "ranqueada" | "amistosa">("todas");
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
  const shown = filter === "todas" ? rows : rows.filter((r) => r.kind === filter);
  const st = historyStats(shown);
  const line = historyStats(rows).trophyLine;
  const maxAbs = Math.max(1, ...line.map(Math.abs));
  const fmtSec = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div className="space-y-8">
      <div role="group" aria-label="Filtrar partidas" className="flex flex-wrap gap-2 text-sm">
        {(["todas", "ranqueada", "amistosa"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cx("min-h-9 rounded-md border px-3", filter === f ? "border-electric bg-electric/10" : "border-line-strong text-muted hover:text-fg")}
          >
            {f === "todas" ? "Todas" : f === "ranqueada" ? "Ranqueadas" : "Amistosas"} <span className="font-mono text-xs text-subtle">{f === "todas" ? rows.length : rows.filter((r) => r.kind === f).length}</span>
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {[
          ["Vitórias", st.wins, "text-ok"],
          ["Derrotas", st.losses, "text-bad"],
          ["Empates", st.draws, ""],
          ["Taxa de vitória", st.winRate === null ? "—" : `${st.winRate}%`, ""],
          ["Troféus ganhos", `+${st.trophiesWon}`, "text-amber"],
          ["Troféus perdidos", `−${st.trophiesLost}`, "text-bad"],
          ["Desafios resolvidos", `${st.solved}/${st.total}`, ""],
          ["Tempo médio até resolver", st.avgSolveSec === null ? "—" : fmtSec(st.avgSolveSec), ""],
        ].map(([label, value, tone]) => (
          <div key={label as string} className="border-l-2 border-line-strong pl-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className={cx("font-mono text-2xl font-bold", tone as string)}>{value}</dd>
          </div>
        ))}
      </dl>

      {line.length >= 2 && (
        <div>
          <h3 className="text-sm font-semibold">Evolução dos troféus (partidas ranqueadas)</h3>
          <svg viewBox={`0 0 ${Math.max(1, line.length - 1) * 20} 60`} preserveAspectRatio="none" className="mt-2 h-24 w-full" role="img" aria-label={`Saldo de troféus ao longo de ${line.length} partidas: de ${line[0]} a ${line[line.length - 1]}`}>
            <line x1="0" x2={(line.length - 1) * 20} y1="30" y2="30" stroke="var(--color-line-strong)" strokeDasharray="3 3" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <polyline
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              points={line.map((v, i) => `${i * 20},${30 - (v / maxAbs) * 26}`).join(" ")}
            />
          </svg>
          <p className="font-mono text-xs text-subtle">
            Saldo acumulado: {line[line.length - 1]! > 0 ? "+" : ""}
            {line[line.length - 1]} troféus em {line.length} partidas
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {(
          [
            ["Por linguagem", st.byLang.map((g) => ({ ...g, label: LANG_INFO[g.key as BattleLang]?.label ?? g.key }))],
            ["Por arena", st.byArena.map((g) => ({ ...g, label: g.key }))],
          ] as const
        ).map(([title, list]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <ul className="mt-2 divide-y divide-line border-y border-line text-sm">
              {list.map((g) => (
                <li key={g.key} className="flex justify-between gap-3 py-2">
                  <span>{g.label}</span>
                  <span className="font-mono text-xs text-muted">
                    {g.wins}/{g.total} vitórias
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <ul className="divide-y divide-line rounded-[var(--radius-lg)] border border-line">
        {shown.map((h) => (
          <li key={h.match_id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
            <span className={cx("w-20 font-semibold", h.outcome === "vitoria" ? "text-ok" : h.outcome === "derrota" ? "text-bad" : "text-muted")}>
              {h.outcome === "vitoria" ? "Vitória" : h.outcome === "derrota" ? "Derrota" : "Empate"}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">
                {h.challenge_title}
                {h.kind === "amistosa" && <span className="ml-2 rounded border border-line-strong px-1.5 text-[11px] font-normal text-muted">amistosa</span>}
              </span>
              <span className="block truncate text-xs text-muted">
                contra {h.opponent_username ? <Link href={profileHref(h.opponent_username)} className="underline">{h.opponent_name}</Link> : h.opponent_name} ({LANG_INFO[h.opponent_lang]?.label ?? h.opponent_lang}) · você em {LANG_INFO[h.my_lang]?.label ?? h.my_lang} · {h.arena_name}
                {h.result === "abandono" ? " · por abandono" : h.result === "tempo_esgotado" ? " · tempo esgotado" : ""}
                {h.solved ? ` · resolvido${h.solve_sec !== null ? ` em ${fmtSec(h.solve_sec)}` : ""}` : ""} · {h.submissions} envio(s)
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
    </div>
  );
}
