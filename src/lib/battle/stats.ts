import type { HistoryRow } from "./api";

/** Estatísticas do histórico, calculadas só a partir das partidas registradas no banco. */
export interface HistoryStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  /** % de vitórias entre partidas com vencedor (null se não houver). */
  winRate: number | null;
  trophiesWon: number;
  trophiesLost: number;
  solved: number;
  avgSolveSec: number | null;
  byLang: Array<{ key: string; total: number; wins: number }>;
  byArena: Array<{ key: string; total: number; wins: number }>;
  /** Saldo de troféus acumulado, da partida mais antiga à mais recente (só ranqueadas). */
  trophyLine: number[];
}

function group(rows: HistoryRow[], key: (r: HistoryRow) => string) {
  const m = new Map<string, { key: string; total: number; wins: number }>();
  for (const r of rows) {
    const k = key(r);
    const g = m.get(k) ?? { key: k, total: 0, wins: 0 };
    g.total++;
    if (r.outcome === "vitoria") g.wins++;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => b.total - a.total);
}

export function historyStats(rows: HistoryRow[]): HistoryStats {
  const wins = rows.filter((r) => r.outcome === "vitoria").length;
  const losses = rows.filter((r) => r.outcome === "derrota").length;
  const draws = rows.filter((r) => r.outcome === "empate").length;
  const solvedRows = rows.filter((r) => r.solved && r.solve_sec !== null);
  let acc = 0;
  const trophyLine = [...rows]
    .filter((r) => r.kind === "ranqueada")
    .sort((a, b) => (a.finished_at < b.finished_at ? -1 : 1))
    .map((r) => (acc += r.trophy_delta ?? 0));
  return {
    total: rows.length,
    wins,
    losses,
    draws,
    winRate: wins + losses ? Math.round((100 * wins) / (wins + losses)) : null,
    trophiesWon: rows.reduce((s, r) => s + Math.max(0, r.trophy_delta ?? 0), 0),
    trophiesLost: rows.reduce((s, r) => s + Math.max(0, -(r.trophy_delta ?? 0)), 0),
    solved: rows.filter((r) => r.solved).length,
    avgSolveSec: solvedRows.length ? Math.round(solvedRows.reduce((s, r) => s + r.solve_sec!, 0) / solvedRows.length) : null,
    byLang: group(rows, (r) => r.my_lang),
    byArena: group(rows, (r) => r.arena_name),
    trophyLine,
  };
}
