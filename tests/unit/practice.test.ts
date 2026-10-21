import { describe, expect, it } from "vitest";
import { selectPractice, type BankQuestion } from "@/lib/practice/select";
import { applyProgress, dailyXp, emptyProgress, parseProgress } from "@/lib/progress/model";

const q = (lesson: string, i: number): BankQuestion => ({
  id: `${lesson}#${i}`,
  lessonSlug: lesson,
  lessonTitle: lesson,
  question: { prompt: "?", options: ["a", "b"], correct: 0, explanation: "" },
});
const bank = ["a", "b", "c", "d", "e"].flatMap((l) => [0, 1, 2].map((i) => q(l, i)));

describe("seleção do treino", () => {
  it("prioriza os erros e não repete perguntas", () => {
    const sel = selectPractice(bank, { completedLessons: new Set(["d", "e"]), mistakes: { "a#1": 3, "b#2": 1, "x#9": 5 }, seed: "s", size: 6 });
    const ids = sel.map((s) => s.id);
    expect(ids).toContain("a#1");
    expect(ids).toContain("b#2");
    expect(ids).not.toContain("x#9");
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(6);
    expect(ids.filter((id) => !["a#1", "b#2"].includes(id)).every((id) => id.startsWith("d#") || id.startsWith("e#"))).toBe(true);
  });

  it("sem aulas concluídas usa as primeiras aulas", () => {
    const sel = selectPractice(bank, { completedLessons: new Set(), mistakes: {}, seed: "s", size: 10 });
    expect(sel.every((s) => ["a", "b", "c"].includes(s.lessonSlug))).toBe(true);
    expect(sel.length).toBe(9);
  });

  it("é determinística para a mesma semente", () => {
    const opts = { completedLessons: new Set(["a", "b", "c", "d", "e"]), mistakes: {}, seed: "x", size: 5 };
    expect(selectPractice(bank, opts)).toEqual(selectPractice(bank, opts));
  });
});

describe("estilo Duolingo no progresso", () => {
  const now = new Date("2026-10-21T15:00:00");
  it("treino com vidas rende XP uma vez por dia; sem vidas, não", () => {
    let s = emptyProgress(now);
    const fail = applyProgress(s, { type: "practice/complete", correct: 3, total: 10, heartsLeft: 0, wrongIds: ["a#0"], rightIds: [] }, now);
    expect(fail.reward.xp).toBe(0);
    s = fail.state;
    expect(s.mistakes["a#0"]).toBe(1);
    const ok = applyProgress(s, { type: "practice/complete", correct: 9, total: 10, heartsLeft: 2, wrongIds: [], rightIds: ["a#0"] }, now);
    expect(ok.reward.xp).toBe(15);
    expect(ok.state.mistakes["a#0"]).toBeUndefined();
    const again = applyProgress(ok.state, { type: "practice/complete", correct: 10, total: 10, heartsLeft: 3, wrongIds: [], rightIds: [] }, now);
    expect(again.reward.xp).toBe(0);
    const tomorrow = applyProgress(again.state, { type: "practice/complete", correct: 10, total: 10, heartsLeft: 3, wrongIds: [], rightIds: [] }, new Date("2026-10-22T10:00:00"));
    expect(tomorrow.reward.xp).toBe(15);
  });

  it("XP do dia soma só as atividades de hoje", () => {
    let s = applyProgress(emptyProgress(now), { type: "lesson/complete", slug: "a", title: "A" }, new Date("2026-10-20T10:00:00")).state;
    s = applyProgress(s, { type: "lesson/complete", slug: "b", title: "B" }, now).state;
    expect(dailyXp(s, now)).toBe(20);
  });

  it("meta diária configurável e progressos antigos continuam válidos", () => {
    const s = applyProgress(emptyProgress(now), { type: "settings/goal", goal: 50 }, now).state;
    expect(s.settings.dailyGoal).toBe(50);
    const old = JSON.parse(JSON.stringify(emptyProgress(now)));
    delete old.settings;
    delete old.mistakes;
    expect(parseProgress(old)?.settings.dailyGoal).toBe(20);
    expect(parseProgress({ ...old, settings: { dailyGoal: 999 } })).toBeNull();
  });
});
