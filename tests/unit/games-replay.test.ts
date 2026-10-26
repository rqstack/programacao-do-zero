import { describe, expect, it } from "vitest";
import { games } from "@content/games";
import { gradeRound, validateRound, type GameKind } from "@/lib/games/engine";
import { buildPlayRounds } from "@/lib/games/generate";
import { runQuery } from "@/lib/games/sql-mini";

const SEEDS = Array.from({ length: 60 }, (_, i) => `semente-${i}`);
const countBy = (xs: { difficulty: number }[]) => [1, 2, 3].map((d) => xs.filter((x) => x.difficulty === d).length);

describe("jogar de novo traz conteúdo novo", () => {
  it.each(games.map((g) => [g.slug, g] as const))("%s: fases válidas, mesma quantidade e pontuação", (_slug, game) => {
    const maxOriginal = game.rounds.reduce((s, r) => s + (r.points ?? 10), 0);
    for (const seed of SEEDS) {
      const play = buildPlayRounds(game, seed);
      expect(countBy(play)).toEqual(countBy(game.rounds));
      expect(play.reduce((s, r) => s + (r.points ?? 10), 0)).toBe(maxOriginal);
      for (const r of play) {
        const v = validateRound(game.kind as GameKind, r.payload, r.solution);
        expect(v, JSON.stringify(r)).toEqual({ ok: true });
      }
    }
  });

  it.each(games.map((g) => [g.slug, g] as const))("%s: partidas seguidas não repetem a mesma sequência", (_slug, game) => {
    const plays = new Set(SEEDS.slice(0, 10).map((s) => JSON.stringify(buildPlayRounds(game, s).map((r) => r.payload))));
    expect(plays.size).toBeGreaterThanOrEqual(8);
  });

  it("a mesma semente reproduz a mesma partida (recarregar não muda as fases no meio do jogo)", () => {
    for (const game of games) expect(buildPlayRounds(game, "x")).toEqual(buildPlayRounds(game, "x"));
  });

  it("as fases geradas de SQL e do robô acertam o próprio gabarito", () => {
    const sql = games.find((g) => g.kind === "sql")!;
    const robo = games.find((g) => g.kind === "logic")!;
    for (const seed of SEEDS) {
      for (const r of buildPlayRounds(sql, seed)) {
        const p = r.payload as { tables: Parameters<typeof runQuery>[0] };
        const q = (r.solution as { query: Parameters<typeof runQuery>[1] }).query;
        const out = gradeRound("sql", { payload: r.payload, solution: r.solution, points: 10, explanation: "" }, null, { query: q });
        expect(out.ok && out.feedback.kind === "sql_builder" && out.feedback.correct).toBe(true);
        expect(runQuery(p.tables, q).ok).toBe(true);
      }
      for (const r of buildPlayRounds(robo, seed)) {
        const p = r.payload as { maxBlocks: number };
        expect((r.solution as { par: number }).par).toBeLessThanOrEqual(p.maxBlocks);
      }
    }
  });

  it("a digitação sorteia trechos diferentes entre partidas", () => {
    const game = games.find((g) => g.kind === "typing")!;
    const texts = new Set(SEEDS.flatMap((s) => buildPlayRounds(game, s).map((r) => (r.payload as { text: string }).text)));
    expect(texts.size).toBeGreaterThan(60);
  });
});
