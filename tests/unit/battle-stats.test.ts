import { describe, expect, it } from "vitest";
import type { HistoryRow } from "@/lib/battle/api";
import { historyStats } from "@/lib/battle/stats";

const row = (o: Partial<HistoryRow>): HistoryRow => ({
  match_id: Math.random().toString(),
  finished_at: "2026-10-20T10:00:00Z",
  challenge_title: "x",
  arena_name: "Terminal Inicial",
  my_lang: "python",
  opponent_name: "B",
  opponent_username: null,
  opponent_lang: "python",
  outcome: "vitoria",
  result: "vitoria",
  trophy_delta: 30,
  kind: "ranqueada",
  challenge_id: "c",
  tier: 1,
  solved: true,
  submissions: 1,
  solve_sec: 60,
  ...o,
});

describe("estatísticas do histórico da Batalha", () => {
  it("calcula vitórias, taxa, troféus e evolução só com os registros", () => {
    const s = historyStats([
      row({ finished_at: "2026-10-21T10:00:00Z", outcome: "derrota", trophy_delta: -10, solved: false, solve_sec: null, my_lang: "java" }),
      row({ finished_at: "2026-10-20T10:00:00Z" }),
      row({ finished_at: "2026-10-22T10:00:00Z", outcome: "empate", trophy_delta: 0, kind: "amistosa", solve_sec: 120 }),
    ]);
    expect(s).toMatchObject({ total: 3, wins: 1, losses: 1, draws: 1, winRate: 50, trophiesWon: 30, trophiesLost: 10, solved: 2, avgSolveSec: 90 });
    expect(s.trophyLine).toEqual([30, 20]); // amistosa fica fora da linha de troféus
    expect(s.byLang[0]).toMatchObject({ key: "python", total: 2, wins: 1 });
  });
  it("sem partidas com vencedor não inventa taxa", () => {
    expect(historyStats([row({ outcome: "empate", trophy_delta: 0 })]).winRate).toBeNull();
  });
});
