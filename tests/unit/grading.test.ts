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

  const wave = {
    payload: { rule: "Pegue as que dão true", explain: "", tickMs: 700, drops: ["a", "b", "c", "d", "e", "f"].map((id, i) => ({ id, code: `x${i}`, lane: i % 3 })) },
    solution: { targets: ["a", "b", "c"], values: { a: "true", b: "true", c: "true", d: "false", e: "false", f: "false" } },
    points: 10,
    explanation: "",
  };
  it("impede responder a mesma rodada duas vezes", () => {
    const r = gradeRound("lightning", wave, null, { caught: ["a", "b", "c"] });
    expect(r.ok && r.pointsDelta).toBe(10);
    if (!r.ok) throw new Error();
    expect(gradeRound("lightning", wave, r.state, { caught: ["a", "b", "c"] })).toEqual({ ok: false, error: "already_answered" });
  });
  it("pontuação nunca vem do cliente: vem do que foi pego", () => {
    const r = gradeRound("lightning", wave, null, { caught: ["d", "e"], score: 1000 });
    expect(r.ok && r.pointsDelta).toBe(0);
    expect(r.ok && r.correctDelta).toBe(0);
    expect(gradeRound("lightning", wave, null, { caught: ["zz"] })).toEqual({ ok: false, error: "invalid_answer" });
  });
  it("caça aos bugs: corrigir e rodar; mais execuções valem menos; desistir não pontua", () => {
    const round = {
      payload: { prompt: "?", language: "js", fn: "f", code: "function f() {\n  return 1;\n}", cases: [[]], expected: ["2"], maxRuns: 3, concept: "x" },
      solution: { line: 2, fix: "return 2;" },
      points: 10,
      explanation: "",
    };
    const first = gradeRound("bug_hunt", round, null, { passed: true, runs: 1 });
    expect(first.ok && first.pointsDelta).toBe(10);
    const third = gradeRound("bug_hunt", round, null, { passed: true, runs: 3 });
    expect(third.ok && third.pointsDelta).toBe(6);
    const gaveUp = gradeRound("bug_hunt", round, null, { passed: false, runs: 0 });
    expect(gaveUp.ok && gaveUp.pointsDelta).toBe(0);
    expect(gaveUp.ok && gaveUp.feedback.kind === "bug_hunt" && gaveUp.feedback.fix).toBe("return 2;");
    // Mais execuções que o permitido, ou "passou" sem rodar, são recusados.
    expect(gradeRound("bug_hunt", round, null, { passed: true, runs: 4 })).toEqual({ ok: false, error: "invalid_answer" });
    expect(gradeRound("bug_hunt", round, null, { passed: true, runs: 0 })).toEqual({ ok: false, error: "invalid_answer" });
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
