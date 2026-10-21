import { describe, expect, it } from "vitest";
import { gradeQuiz, isAcceptedAnswer, normalizeShortAnswer } from "@/lib/quiz/grading";
import { evaluateAchievements, levelFromXp, xpForLevel } from "@/lib/gamification/rules";
import { gradeRound, publicPayload, seededShuffle, validateRound, type RoundState } from "@/lib/games/engine";

const questions = [
  { id: "q1", options: ["a", "b", "c"], correctIndex: 1, points: 1, explanation: "b" },
  { id: "q2", options: ["v", "f"], correctIndex: 0, points: 2, explanation: "v" },
];

describe("gradeQuiz", () => {
  it("calcula pontuação, percentual e aprovação no servidor", () => {
    const g = gradeQuiz(questions, { q1: 1, q2: 0 }, 70);
    expect(g).toMatchObject({ score: 3, maxScore: 3, percent: 100, passed: true });
  });
  it("respostas inválidas contam como erradas", () => {
    const g = gradeQuiz(questions, { q1: 99, q2: "0", q3: 1 }, 70);
    expect(g.score).toBe(0);
    expect(g.results.map((r) => r.selectedIndex)).toEqual([null, null]);
  });
  it("aprovação respeita o percentual mínimo", () => {
    expect(gradeQuiz(questions, { q2: 0 }, 70).passed).toBe(false);
    expect(gradeQuiz(questions, { q2: 0 }, 60).passed).toBe(true);
  });
});

describe("respostas curtas", () => {
  it("tolera espaços, aspas e ponto e vírgula final", () => {
    expect(normalizeShortAnswer("  console.log( 'Oi' ); ")).toBe(normalizeShortAnswer('console.log("Oi")'));
    expect(isAcceptedAnswer("Let idade = 18;", ["let idade = 18"])).toBe(true);
    expect(isAcceptedAnswer("", ["x"])).toBe(false);
    expect(isAcceptedAnswer("19", ["18"])).toBe(false);
  });
});

describe("níveis e conquistas", () => {
  it("progressão de níveis", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(250).level).toBe(3);
    expect(levelFromXp(175).progress).toBeCloseTo(0.5);
  });
  it("só concede conquistas ainda não obtidas", () => {
    const stats = { totalXp: 20, lessonsCompleted: 1, exercisesSolved: 0, quizzesPassed: 0, gamesCompleted: 0, projectsCompleted: 0, bestStreak: 0, perfectQuizzes: 0, perfectGames: 0, practiceDays: 0, goalDays: 0, challengesSolved: 0, hardChallenges: 0, challengeLangs: 0 };
    expect(evaluateAchievements(stats, new Set()).map((a) => a.slug)).toEqual(["primeira-aula"]);
    expect(evaluateAchievements(stats, new Set(["primeira-aula"]))).toEqual([]);
  });
});

describe("motor de jogos", () => {

  it("impede responder a mesma rodada duas vezes", () => {
    const rain = { payload: { statement: "x" }, solution: { truth: false }, points: 5, explanation: "" };
    const r = gradeRound("lightning", rain, null, { value: false });
    expect(r.ok && r.pointsDelta).toBe(5);
    if (!r.ok) throw new Error();
    expect(gradeRound("lightning", rain, r.state, { value: false })).toEqual({ ok: false, error: "already_answered" });
  });
  it("pontuação nunca vem do cliente", () => {
    const rain = { payload: { statement: "x" }, solution: { truth: true }, points: 5, explanation: "" };
    const r = gradeRound("lightning", rain, null, { value: false, score: 1000 });
    expect(r.ok && r.pointsDelta).toBe(0);
  });
  it("caça aos bugs por linha", () => {
    const round = { payload: { prompt: "?", language: "js", code: "a\nb\nc" }, solution: { line: 2 }, points: 10, explanation: "" };
    expect(gradeRound("bug_hunt", round, null, { line: 2 }).ok && true).toBe(true);
    expect(gradeRound("bug_hunt", round, null, { line: 4 })).toEqual({ ok: false, error: "invalid_answer" });
  });
  it("monte o código exige permutação válida", () => {
    const round = {
      payload: { prompt: "?", blocks: [{ id: "a", code: "1" }, { id: "b", code: "2" }, { id: "c", code: "3" }] },
      solution: { order: ["a", "b", "c"] },
      points: 10,
      explanation: "",
    };
    const ok = gradeRound("code_order", round, null, { order: ["a", "b", "c"] });
    expect(ok.ok && ok.correctDelta).toBe(1);
    expect(gradeRound("code_order", round, null, { order: ["a", "a", "c"] })).toEqual({ ok: false, error: "invalid_answer" });
    const shuffled = publicPayload("code_order", round.payload, "seed") as { blocks: { id: string }[] };
    expect(shuffled.blocks.map((b) => b.id)).not.toEqual(["a", "b", "c"]);
  });
  it("memória: pares verificados no servidor e pontuação por eficiência", () => {
    const round = {
      payload: { prompt: "?", cards: [{ id: "t1", text: "let" }, { id: "d1", text: "variável" }, { id: "t2", text: "if" }, { id: "d2", text: "condição" }] },
      solution: { pairs: [["t1", "d1"], ["t2", "d2"]] as [string, string][] },
      points: 20,
      explanation: "fim",
    };
    let state: RoundState | null = null;
    const miss = gradeRound("memory", round, state, { a: "t1", b: "d2" });
    if (!miss.ok) throw new Error();
    state = miss.state;
    const hit1 = gradeRound("memory", round, state, { a: "d1", b: "t1" });
    if (!hit1.ok) throw new Error();
    state = hit1.state;
    expect(gradeRound("memory", round, state, { a: "t1", b: "t2" })).toEqual({ ok: false, error: "invalid_answer" });
    const hit2 = gradeRound("memory", round, state, { a: "t2", b: "d2" });
    if (!hit2.ok) throw new Error();
    expect(hit2.state).toEqual({ done: true, correct: true, points: 13 });
  });
  it("valida rodadas cadastradas", () => {
    expect(validateRound("logic", { prompt: "?", options: ["a", "b"] }, { index: 1 }).ok).toBe(false);
    expect(validateRound("memory", { prompt: "?", cards: [{ id: "a", text: "1" }, { id: "b", text: "2" }, { id: "c", text: "3" }, { id: "d", text: "4" }] }, { pairs: [["a", "b"], ["a", "c"]] }).ok).toBe(false);
  });
  it("embaralhamento determinístico", () => {
    expect(seededShuffle([1, 2, 3, 4, 5], "x")).toEqual(seededShuffle([1, 2, 3, 4, 5], "x"));
  });
});
