import { describe, expect, it } from "vitest";
import { buildWave, CATCH_RULES, evaluate, mulberry, RULES_BY_DIFFICULTY } from "@content/games/catch";
import { games } from "@content/games";
import { gradeRound, validateRound, type GameKind } from "@/lib/games/engine";
import { buildPlayRounds } from "@/lib/games/generate";
import { applyProgress, emptyProgress, mergeProgress, parseProgress, totalXp, type ProgressState } from "@/lib/progress/model";

const countBy = (xs: { difficulty: number }[]) => [1, 2, 3].map((d) => xs.filter((x) => x.difficulty === d).length);
const keysOf = (play: { key: string }[]) => play.map((r) => r.key);

/** Joga N partidas seguidas usando (ou não) o histórico, como o site faz. */
function playMany(game: (typeof games)[number], n: number, withHistory: boolean) {
  let state: ProgressState = emptyProgress(new Date("2026-10-01"));
  const plays: string[][] = [];
  for (let i = 0; i < n; i++) {
    const recent = withHistory ? (state.gameSeen[game.slug] ?? []) : [];
    const play = buildPlayRounds(game, `semente-${i}`, { recent });
    plays.push(keysOf(play));
    state = applyProgress(state, { type: "game/seen", slug: game.slug, keys: keysOf(play) }, new Date("2026-10-02")).state;
  }
  return { plays, state };
}

describe("repetição entre partidas", () => {
  it("reproduz o problema antigo: sem histórico, partidas seguidas repetem situações", () => {
    let repeats = 0;
    for (const g of games) {
      const { plays } = playMany(g, 12, false);
      for (let i = 1; i < plays.length; i++) repeats += plays[i]!.filter((k) => plays[i - 1]!.includes(k)).length;
    }
    expect(repeats).toBeGreaterThan(0);
  });

  it.each(games.map((g) => [g.slug, g] as const))("%s: com histórico, a partida seguinte não repete nenhuma situação da anterior", (_slug, g) => {
    const { plays } = playMany(g, 8, true);
    for (let i = 1; i < plays.length; i++) {
      const again = plays[i]!.filter((k) => plays[i - 1]!.includes(k));
      expect(again, `partida ${i + 1}`).toEqual([]);
    }
  });

  it.each(games.map((g) => [g.slug, g] as const))("%s: com histórico, as primeiras partidas usam situações inéditas enquanto houver", (_slug, g) => {
    const { plays } = playMany(g, 2, true);
    expect(new Set([...plays[0]!, ...plays[1]!]).size).toBe(plays[0]!.length + plays[1]!.length);
  });

  it.each(games.map((g) => [g.slug, g] as const))("%s: quando tudo já foi visto, volta pelas mais antigas (continua funcionando)", (_slug, g) => {
    const { plays } = playMany(g, 40, true);
    for (const p of plays) expect(p.length).toBe(g.rounds.length);
  });
});

describe("fases de cada partida", () => {
  it.each(games.map((g) => [g.slug, g] as const))("%s: fases válidas, mesma quantidade e pontuação", (_slug, game) => {
    const maxOriginal = game.rounds.reduce((s, r) => s + (r.points ?? 10), 0);
    for (let i = 0; i < 30; i++) {
      const play = buildPlayRounds(game, `s${i}`);
      expect(countBy(play)).toEqual(countBy(game.rounds));
      expect(play.reduce((s, r) => s + (r.points ?? 10), 0)).toBe(maxOriginal);
      expect(new Set(keysOf(play)).size).toBe(play.length);
      for (const r of play) expect(validateRound(game.kind as GameKind, r.payload, r.solution), r.key).toEqual({ ok: true });
    }
  });

  it("quem domina o jogo recebe uma fase difícil no lugar de uma fácil", () => {
    const g = games.find((x) => x.slug === "caca-aos-bugs")!;
    const normal = countBy(buildPlayRounds(g, "x"));
    const adv = countBy(buildPlayRounds(g, "x", { advanced: true }));
    expect(adv[0]).toBe(normal[0]! - 1);
    expect(adv[2]).toBe(normal[2]! + 1);
  });

  it("a mesma semente e o mesmo histórico reproduzem a mesma partida", () => {
    for (const game of games) expect(buildPlayRounds(game, "x", { recent: ["a"] })).toEqual(buildPlayRounds(game, "x", { recent: ["a"] }));
  });
});

describe("ondas da Chuva de código", () => {
  it("todas as regras geram ondas válidas, com alvos calculados executando a expressão", () => {
    for (const d of [1, 2, 3] as const)
      for (const rule of RULES_BY_DIFFICULTY[d])
        for (let s = 0; s < 40; s++) {
          const w = buildWave(mulberry(s * 31 + d), d, rule);
          expect(w, `${rule} ${d} ${s}`).not.toBeNull();
          for (const drop of w!.drops) expect(CATCH_RULES[rule].test(evaluate(drop.code))).toBe(w!.targets.includes(drop.id));
          expect(w!.targets.length).toBeGreaterThanOrEqual(3);
          expect(w!.drops.length - w!.targets.length).toBeGreaterThanOrEqual(3);
        }
  });
});

describe("ciclo vitória, derrota e nova partida", () => {
  const t = new Date("2026-10-05T12:00:00");
  it("vitória dá XP uma vez; derrota registra a partida; jogar de novo não duplica XP", () => {
    let s = emptyProgress(t);
    s = applyProgress(s, { type: "game/result", slug: "chuva-de-codigo", title: "Chuva", score: 10, max: 60, accuracy: 0.2 }, t).state;
    expect(s.games["chuva-de-codigo"]).toMatchObject({ plays: 1, completed: false, wins: 0 });
    expect(totalXp(s)).toBe(0);
    const win = applyProgress(s, { type: "game/result", slug: "chuva-de-codigo", title: "Chuva", score: 50, max: 60, accuracy: 0.9 }, t);
    expect(win.reward.xp).toBeGreaterThan(0);
    const again = applyProgress(win.state, { type: "game/result", slug: "chuva-de-codigo", title: "Chuva", score: 60, max: 60, accuracy: 1 }, t);
    expect(again.reward.xp).toBe(0);
    expect(again.state.games["chuva-de-codigo"]).toMatchObject({ plays: 3, completed: true, wins: 2, best: 60 });
  });

  it("o histórico sobrevive a recarregar a página e à mescla com a conta, sem duplicar", () => {
    const g = games.find((x) => x.slug === "memoria-de-programacao")!;
    const { state } = playMany(g, 3, true);
    const reloaded = parseProgress(JSON.parse(JSON.stringify(state)))!;
    expect(reloaded.gameSeen[g.slug]).toEqual(state.gameSeen[g.slug]);
    const merged = mergeProgress(reloaded, state);
    expect(merged.gameSeen[g.slug]).toEqual(state.gameSeen[g.slug]);
    // Depois de recarregar, a próxima partida ainda evita a anterior.
    const last = state.gameSeen[g.slug]!.slice(-g.rounds.length);
    const next = keysOf(buildPlayRounds(g, "depois", { recent: reloaded.gameSeen[g.slug] }));
    expect(next.filter((k) => last.includes(k))).toEqual([]);
  });

  it("uma fase respondida não aceita segunda resposta (sem pontos duplicados)", () => {
    const g = games.find((x) => x.slug === "chuva-de-codigo")!;
    const r = buildPlayRounds(g, "z")[0]!;
    const round = { payload: r.payload, solution: r.solution, points: 10, explanation: r.explanation };
    const sol = r.solution as { targets: string[] };
    const first = gradeRound("lightning", round, null, { caught: sol.targets });
    if (!first.ok) throw new Error();
    expect(gradeRound("lightning", round, first.state, { caught: sol.targets })).toEqual({ ok: false, error: "already_answered" });
  });
});
