import { describe, expect, it } from "vitest";
import { applyProgress, emptyProgress, mergeProgress, NOTE_MAX_CHARS, NOTES_MAX, parseProgress, totalXp, type ProgressAction, type ProgressState } from "@/lib/progress/model";
import { missionViews } from "@/lib/progress/missions";
import { weekRange, weeklyCount, weeklyProgress } from "@/lib/progress/weekly";

const t = (iso: string) => new Date(iso);
const run = (s: ProgressState, actions: ProgressAction[], at = "2026-10-21T12:00:00") => actions.reduce((st, a) => applyProgress(st, a, t(at)).state, s);

describe("progresso antigo continua válido", () => {
  it("aceita dados salvos antes dos campos novos", () => {
    const old = { ...emptyProgress(t("2026-10-01T10:00:00")) } as Record<string, unknown>;
    for (const k of ["favorites", "notes", "resolved", "missions"]) delete old[k];
    old.settings = { dailyGoal: 30 };
    old.games = { g: { best: 1, max: 2, plays: 1, completed: false, lastAt: "2026-10-01T10:00:00.000Z" } };
    const parsed = parseProgress(JSON.parse(JSON.stringify(old)));
    expect(parsed).not.toBeNull();
    expect(parsed!.settings).toEqual({ dailyGoal: 30, weekly: [] });
    expect(parsed!.games.g!.wins).toBe(0);
    expect(parsed!.notes).toEqual({});
  });
});

describe("favoritos", () => {
  it("marca, desmarca e a remoção vence na mescla quando é mais recente", () => {
    const a = run(emptyProgress(t("2026-10-01")), [{ type: "favorite/set", key: "lesson:variaveis", on: true }], "2026-10-02T10:00:00");
    const b = run(a, [{ type: "favorite/set", key: "lesson:variaveis", on: false }], "2026-10-03T10:00:00");
    expect(mergeProgress(a, b).favorites["lesson:variaveis"]?.on).toBe(false);
    expect(mergeProgress(b, a).favorites["lesson:variaveis"]?.on).toBe(false);
  });
  it("recusa chaves fora do formato", () => {
    const s = run(emptyProgress(t("2026-10-01")), [{ type: "favorite/set", key: "javascript:alert(1)", on: true }]);
    expect(s.favorites).toEqual({});
  });
  it("não dá XP", () => {
    const s = run(emptyProgress(t("2026-10-01")), [{ type: "favorite/set", key: "game:caca-aos-bugs", on: true }]);
    expect(totalXp(s)).toBe(0);
  });
});

describe("anotações", () => {
  it("salva, edita, apaga (sem ressuscitar na mescla) e respeita o tamanho máximo", () => {
    const a = run(emptyProgress(t("2026-10-01")), [{ type: "note/save", slug: "variaveis", text: "let muda, const não" }], "2026-10-02T10:00:00");
    expect(a.notes.variaveis?.text).toBe("let muda, const não");
    const b = run(a, [{ type: "note/save", slug: "variaveis", text: "" }], "2026-10-03T10:00:00");
    expect(b.notes.variaveis?.text).toBe("");
    expect(mergeProgress(a, b).notes.variaveis?.text).toBe("");
    const long = run(emptyProgress(t("2026-10-01")), [{ type: "note/save", slug: "x", text: "a".repeat(NOTE_MAX_CHARS + 50) }]);
    expect(long.notes.x?.text.length).toBe(NOTE_MAX_CHARS);
    expect(parseProgress(JSON.parse(JSON.stringify(long)))).not.toBeNull();
  });
  it("não cria anotação vazia nem passa do limite de aulas", () => {
    let s = run(emptyProgress(t("2026-10-01")), [{ type: "note/save", slug: "vazia", text: "   " }]);
    expect(s.notes).toEqual({});
    for (let i = 0; i < NOTES_MAX + 5; i++) s = run(s, [{ type: "note/save", slug: `aula-${i}`, text: "nota" }]);
    expect(Object.values(s.notes).filter((n) => n.text)).toHaveLength(NOTES_MAX);
    // Apagar uma libera espaço para outra.
    s = run(s, [{ type: "note/save", slug: "aula-0", text: "" }, { type: "note/save", slug: "nova", text: "nota" }]);
    expect(s.notes.nova?.text).toBe("nota");
  });
});

describe("revisão dos erros", () => {
  it("erro entra na revisão; acertos tiram e registram a correção, sem XP", () => {
    let s = run(emptyProgress(t("2026-10-01")), [{ type: "quiz/result", slug: "q", title: "Q", percent: 0, passed: false, wrongIds: ["aula#0", "aula#1"] }]);
    expect(s.mistakes).toEqual({ "aula#0": 1, "aula#1": 1 });
    s = run(s, [{ type: "review/answer", id: "aula#0", correct: false }]);
    expect(s.mistakes["aula#0"]).toBe(2);
    s = run(s, [{ type: "review/answer", id: "aula#0", correct: true }, { type: "review/answer", id: "aula#0", correct: true }]);
    expect(s.mistakes["aula#0"]).toBeUndefined();
    expect(s.resolved["aula#0"]).toBeDefined();
    expect(totalXp(s)).toBe(0);
  });
  it("acertar uma pergunta que nunca foi errada não conta como correção", () => {
    const s = run(emptyProgress(t("2026-10-01")), [{ type: "review/answer", id: "nova#0", correct: true }]);
    expect(s.resolved).toEqual({});
  });
});

describe("metas semanais", () => {
  it("a semana vai de segunda a domingo", () => {
    expect(weekRange(t("2026-10-21T12:00:00"))).toEqual({ start: "2026-10-19", end: "2026-10-25" }); // quarta
    expect(weekRange(t("2026-10-25T23:00:00"))).toEqual({ start: "2026-10-19", end: "2026-10-25" }); // domingo
    expect(weekRange(t("2026-10-26T00:30:00"))).toEqual({ start: "2026-10-26", end: "2026-11-01" }); // segunda
  });
  it("conta cada atividade uma vez e só na semana certa", () => {
    let s = emptyProgress(t("2026-10-01"));
    s = run(s, [{ type: "lesson/complete", slug: "a", title: "A" }], "2026-10-17T10:00:00"); // semana anterior
    s = run(s, [{ type: "lesson/complete", slug: "b", title: "B" }, { type: "lesson/complete", slug: "b", title: "B" }], "2026-10-20T10:00:00");
    s = run(s, [{ type: "exercise/solve", slug: "b", title: "B" }], "2026-10-22T10:00:00");
    const now = t("2026-10-23T10:00:00");
    expect(weeklyCount(s, "aulas", now)).toBe(1);
    expect(weeklyCount(s, "exercicios", now)).toBe(1);
    expect(weeklyCount(s, "dias", now)).toBe(2);
  });
  it("guarda uma meta por tipo e limita o alvo", () => {
    const s = run(emptyProgress(t("2026-10-01")), [
      { type: "settings/weekly", goals: [{ type: "dias", target: 3 }, { type: "dias", target: 5 }, { type: "aulas", target: 999 }] },
    ]);
    expect(s.settings.weekly).toEqual([{ type: "dias", target: 3 }, { type: "aulas", target: 30 }]);
    expect(weeklyProgress(s, t("2026-10-21T12:00:00")).map((g) => g.done)).toEqual([false, false]);
  });
});

describe("missões", () => {
  it("concluem uma vez, com XP uma vez só, mesmo repetindo a ação", () => {
    let s = emptyProgress(t("2026-10-01"));
    const first = applyProgress(s, { type: "lesson/complete", slug: "a", title: "A" }, t("2026-10-02T10:00:00"));
    expect(first.reward.missions).toEqual([]);
    const second = applyProgress(first.state, { type: "quiz/result", slug: "q", title: "Q", percent: 100, passed: true }, t("2026-10-02T11:00:00"));
    expect(second.reward.missions?.map((m) => m.slug)).toEqual(["primeiros-passos"]);
    s = run(second.state, [{ type: "quiz/result", slug: "q", title: "Q", percent: 100, passed: true }]);
    expect(Object.keys(s.xp).filter((k) => k.startsWith("mission:"))).toEqual(["mission:primeiros-passos"]);
  });
  it("Caçador de bugs conta partidas concluídas do Caça aos bugs", () => {
    let s = emptyProgress(t("2026-10-01"));
    for (let i = 0; i < 5; i++) s = run(s, [{ type: "game/result", slug: "caca-aos-bugs", title: "Caça", score: 50, max: 90, accuracy: i === 2 ? 0.3 : 0.7 }]);
    expect(s.games["caca-aos-bugs"]!.wins).toBe(4);
    expect(s.missions["cacador-de-bugs"]).toBeUndefined();
    s = run(s, [{ type: "game/result", slug: "caca-aos-bugs", title: "Caça", score: 50, max: 90, accuracy: 0.9 }]);
    expect(s.missions["cacador-de-bugs"]).toBeDefined();
  });
  it("a missão de batalhas usa só os dados do servidor e não dá XP pelo navegador", () => {
    const s = emptyProgress(t("2026-10-01"));
    const view = (wins: number | null) => missionViews(s, t("2026-10-02"), wins).find((v) => v.mission.slug === "programador-competitivo")!;
    expect(view(null).done).toBe(false);
    expect(view(3).done).toBe(true);
    expect(view(3).mission.xp).toBe(0);
  });
});
