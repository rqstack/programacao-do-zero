import { describe, expect, it } from "vitest";
import { levelFromXp, xpForLevel } from "@/lib/gamification/rules";
import { applyProgress, emptyProgress, historyOf, localDay, parseProgress, streaks, totalXp } from "@/lib/progress/model";

const day = (iso: string) => new Date(iso);
const start = () => emptyProgress(day("2026-10-20T12:00:00"));

describe("progresso local", () => {
  it("concede XP de aula uma única vez", () => {
    let s = start();
    const a = applyProgress(s, { type: "lesson/complete", slug: "x", title: "X" }, day("2026-10-20T12:00:00"));
    s = a.state;
    expect(a.reward.xp).toBe(20);
    expect(a.reward.achievements.map((x) => x.slug)).toEqual(["primeira-aula"]);
    const b = applyProgress(s, { type: "lesson/complete", slug: "x", title: "X" }, day("2026-10-20T13:00:00"));
    expect(b.reward.xp).toBe(0);
    expect(totalXp(b.state)).toBe(20);
  });

  it("não altera o estado original", () => {
    const s = start();
    applyProgress(s, { type: "lesson/complete", slug: "x", title: "X" }, day("2026-10-20T12:00:00"));
    expect(Object.keys(s.lessons)).toEqual([]);
  });

  it("revelar a solução antes de acertar bloqueia o XP do exercício", () => {
    let s = applyProgress(start(), { type: "exercise/reveal", slug: "e" }, day("2026-10-20T12:00:00")).state;
    const r = applyProgress(s, { type: "exercise/solve", slug: "e", title: "E" }, day("2026-10-20T12:01:00"));
    s = r.state;
    expect(r.reward.xp).toBe(0);
    expect(s.exercises.e).toBe("revealed");
  });

  it("quiz guarda a melhor nota e só dá XP quando aprova", () => {
    let s = start();
    const fail = applyProgress(s, { type: "quiz/result", slug: "q", title: "Q", percent: 40, passed: false }, day("2026-10-20T12:00:00"));
    expect(fail.reward.xp).toBe(0);
    s = fail.state;
    const pass = applyProgress(s, { type: "quiz/result", slug: "q", title: "Q", percent: 100, passed: true }, day("2026-10-20T12:05:00"));
    s = applyProgress(pass.state, { type: "quiz/result", slug: "q", title: "Q", percent: 60, passed: false }, day("2026-10-20T12:09:00")).state;
    expect(pass.reward.xp).toBe(30);
    expect(s.quizzes.q).toMatchObject({ best: 100, passed: true, attempts: 3 });
  });

  it("jogo só conta como concluído com 60% de acertos", () => {
    const low = applyProgress(start(), { type: "game/result", slug: "g", title: "G", score: 10, max: 50, accuracy: 0.2 }, day("2026-10-20T12:00:00"));
    expect(low.reward.xp).toBe(0);
    const high = applyProgress(low.state, { type: "game/result", slug: "g", title: "G", score: 40, max: 50, accuracy: 0.8 }, day("2026-10-20T12:10:00"));
    expect(high.reward.xp).toBe(25);
    expect(high.state.games.g).toMatchObject({ best: 40, plays: 2, completed: true });
  });

  it("projeto exige todos os critérios marcados", () => {
    let s = applyProgress(start(), { type: "project/toggle", slug: "p", index: 0 }, day("2026-10-20T12:00:00")).state;
    const early = applyProgress(s, { type: "project/complete", slug: "p", title: "P", totalCriteria: 2, url: null }, day("2026-10-20T12:00:00"));
    expect(early.reward.xp).toBe(0);
    s = applyProgress(s, { type: "project/toggle", slug: "p", index: 1 }, day("2026-10-20T12:00:00")).state;
    const done = applyProgress(s, { type: "project/complete", slug: "p", title: "P", totalCriteria: 2, url: "https://github.com/x" }, day("2026-10-20T12:00:00"));
    expect(done.reward.xp).toBe(100);
    expect(done.state.projects.p?.completedAt).not.toBeNull();
  });

  it("calcula sequência atual e melhor sequência", () => {
    const days = ["2026-10-10", "2026-10-11", "2026-10-12", "2026-10-18", "2026-10-19"];
    expect(streaks(days, day("2026-10-20T09:00:00"))).toEqual({ current: 2, best: 3 });
    expect(streaks(days, day("2026-10-22T09:00:00"))).toEqual({ current: 0, best: 3 });
    expect(streaks([], day("2026-10-22T09:00:00"))).toEqual({ current: 0, best: 0 });
  });

  it("conquista de 3 dias seguidos", () => {
    let s = start();
    for (const d of ["2026-10-18T10:00:00", "2026-10-19T10:00:00", "2026-10-20T10:00:00"]) {
      s = applyProgress(s, { type: "lesson/complete", slug: d, title: d }, day(d)).state;
    }
    expect(s.achievements["tres-dias"]).toBeDefined();
    expect(s.days).toEqual(["2026-10-18", "2026-10-19", "2026-10-20"]);
  });

  it("rejeita dados importados inválidos e aceita dados válidos", () => {
    expect(parseProgress({ version: 2 })).toBeNull();
    expect(parseProgress("lixo")).toBeNull();
    const s = applyProgress(start(), { type: "lesson/complete", slug: "x", title: "X" }, day("2026-10-20T12:00:00")).state;
    expect(parseProgress(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it("histórico em ordem do mais recente", () => {
    let s = applyProgress(start(), { type: "lesson/complete", slug: "a", title: "A" }, day("2026-10-20T12:00:00")).state;
    s = applyProgress(s, { type: "lesson/complete", slug: "b", title: "B" }, day("2026-10-20T13:00:00")).state;
    expect(historyOf(s).map((h) => h.key)).toEqual(["lesson:b", "lesson:a"]);
  });

  it("localDay usa o fuso local", () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("níveis", () => {
  it("progressão", () => {
    expect(xpForLevel(2)).toBe(100);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(250).level).toBe(3);
    expect(levelFromXp(175).progress).toBeCloseTo(0.5);
  });
});

describe("títulos de nível", () => {
  it("começa em Dev Bebê e sobe", async () => {
    const { levelTitle } = await import("@/lib/gamification/rules");
    expect(levelTitle(1)).toBe("Dev Bebê");
    expect(levelTitle(2)).toBe("Dev Engatinhando");
    expect(levelTitle(6)).toBe("Dev Júnior");
    expect(levelTitle(11)).toBe("Dev Lendário");
    expect(levelTitle(13)).toBe("Dev Lendário ★★");
    expect(levelTitle(0)).toBe("Dev Bebê");
  });
});
