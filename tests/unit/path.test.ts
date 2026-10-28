import { describe, expect, it } from "vitest";
import { courses as seedCourses } from "@content/index";
import { codeChallenges, sqlChallenges } from "@content/challenges";
import { GOAL_TRAILS, LANGUAGE_TRAILS, PREREQUISITES } from "@content/paths";
import { adaptiveRecommendations, challengeLevel, type ChallengeInfo } from "@/lib/path/adaptive";
import { buildPath, withPrerequisites, type CourseInfo } from "@/lib/path/recommend";
import { applyProgress, emptyProgress, mergeProgress, parseProgress, type ProgressState } from "@/lib/progress/model";
import { studiedLanguages, verifiedAchievements, type PortfolioCatalog, type PortfolioData } from "@/lib/profiles/portfolio";

const courses: CourseInfo[] = seedCourses.map((c, i) => {
  const lessons = c.modules.flatMap((m) => m.lessons);
  return { slug: c.slug, title: c.title, level: c.level, position: i, totalMinutes: lessons.reduce((s, l) => s + l.minutes, 0), lessons: lessons.map((l) => ({ slug: l.slug, title: l.title })) };
});
const pos = (s: string) => courses.findIndex((c) => c.slug === s);
const slugs = new Set(courses.map((c) => c.slug));

describe("pré-requisitos das trilhas", () => {
  it("cobrem todas as trilhas reais e só citam trilhas que existem", () => {
    expect(new Set(Object.keys(PREREQUISITES))).toEqual(slugs);
    for (const list of [...Object.values(PREREQUISITES), ...Object.values(GOAL_TRAILS), ...Object.values(LANGUAGE_TRAILS).map((l) => l.courses)])
      for (const s of list) expect(slugs.has(s), s).toBe(true);
  });
  it("não têm ciclos e sempre vêm antes", () => {
    const order = withPrerequisites([...slugs], pos);
    expect(order).toHaveLength(slugs.size);
    for (const s of order) for (const p of PREREQUISITES[s]!) expect(order.indexOf(p)).toBeLessThan(order.indexOf(s));
  });
});

describe("trilha personalizada", () => {
  const none = new Set<string>();
  it("quem nunca programou começa pela lógica; nada avançado antes dos pré-requisitos", () => {
    const plan = buildPath({ level: "nunca", goal: "projetos", langs: [], minutes: 20 }, courses, none);
    const order = plan.steps.map((s) => s.slug);
    expect(order[0]).toBe("logica-de-programacao");
    expect(order.indexOf("full-stack")).toBeGreaterThan(order.indexOf("react"));
    expect(order.indexOf("react")).toBeGreaterThan(order.indexOf("javascript"));
    expect(plan.steps.filter((s) => s.status === "proxima")).toHaveLength(1);
    expect(plan.next?.courseTitle).toBe(courses[pos("logica-de-programacao")]!.title);
  });
  it("só usa trilhas e aulas que existem", () => {
    const allLessons = new Set(courses.flatMap((c) => c.lessons.map((l) => l.slug)));
    for (const goal of ["logica", "linguagem", "projetos", "estagio", "hobby"] as const) {
      const plan = buildPath({ level: "basico", goal, langs: ["python", "sql"], minutes: 30 }, courses, none);
      for (const s of plan.steps) expect(slugs.has(s.slug)).toBe(true);
      if (plan.next) expect(allLessons.has(plan.next.lessonSlug)).toBe(true);
    }
  });
  it("muda quando o objetivo muda e respeita o que já foi concluído", () => {
    const a = buildPath({ level: "basico", goal: "hobby", langs: ["python"], minutes: 20 }, courses, none);
    const b = buildPath({ level: "basico", goal: "estagio", langs: ["python"], minutes: 20 }, courses, none);
    expect(a.steps.map((s) => s.slug)).not.toEqual(b.steps.map((s) => s.slug));
    expect(b.steps.some((s) => s.slug === "carreira")).toBe(true);
    const logic = courses[pos("logica-de-programacao")]!;
    const done = new Set(logic.lessons.map((l) => l.slug));
    const c = buildPath({ level: "nunca", goal: "linguagem", langs: ["python"], minutes: 20 }, courses, done);
    expect(c.steps[0]).toMatchObject({ slug: "logica-de-programacao", status: "concluida" });
    expect(c.next?.courseTitle).toBe(courses[pos("python")]!.title);
  });
  it("quem conhece o básico vê a lógica como revisão opcional", () => {
    const plan = buildPath({ level: "basico", goal: "linguagem", langs: ["java"], minutes: 20 }, courses, none);
    expect(plan.steps.find((s) => s.slug === "logica-de-programacao")).toMatchObject({ optional: true });
    expect(plan.next?.courseTitle).toBe(courses[pos("java")]!.title);
  });
  it("a linguagem escolhida vem logo depois dos pré-requisitos dela", () => {
    const plan = buildPath({ level: "nunca", goal: "estagio", langs: ["python"], minutes: 30 }, courses, none);
    const order = plan.steps.map((s) => s.slug);
    expect(order.slice(0, 2)).toEqual(["logica-de-programacao", "python"]);
    expect(plan.steps.find((s) => s.slug === "modelagem-de-dados")!.reason).toMatch(/^Base para SQL/);
  });
  it("mais tempo por dia = menos dias", () => {
    const slow = buildPath({ level: "nunca", goal: "logica", langs: [], minutes: 10 }, courses, none);
    const fast = buildPath({ level: "nunca", goal: "logica", langs: [], minutes: 60 }, courses, none);
    expect(fast.totalDays).toBeLessThan(slow.totalDays);
  });
});

describe("começo (onboarding) no progresso", () => {
  it("salva, pula, troca e mescla pela resposta mais recente", () => {
    const t = (iso: string) => new Date(iso);
    let s = applyProgress(emptyProgress(t("2026-10-01")), { type: "onboarding/save", answers: null }, t("2026-10-02T10:00:00")).state;
    expect(s.onboarding).toMatchObject({ skipped: true });
    const later = applyProgress(s, { type: "onboarding/save", answers: { level: "basico", goal: "estagio", langs: ["python", "python"], minutes: 30 } }, t("2026-10-03T10:00:00")).state;
    expect(later.onboarding).toMatchObject({ skipped: false, goal: "estagio", langs: ["python"] });
    expect(mergeProgress(s, later).onboarding?.goal).toBe("estagio");
    expect(mergeProgress(later, s).onboarding?.goal).toBe("estagio");
    s = later;
    expect(parseProgress(JSON.parse(JSON.stringify(s)))).not.toBeNull();
  });
});

describe("dificuldade adaptativa", () => {
  const challenges: ChallengeInfo[] = [...codeChallenges, ...sqlChallenges].map((c) => ({ id: c.id, title: c.title, difficulty: c.difficulty, topics: c.topics }));
  const lessons = courses.flatMap((c) => c.lessons.map((l) => ({ ...l, courseSlug: c.slug, courseTitle: c.title })));
  const courseList = courses.map((c) => ({ slug: c.slug, title: c.title, lessons: c.lessons.map((l) => l.slug) }));
  const solve = (s: ProgressState, ids: string[], status: "solved" | "revealed" = "solved") => {
    const out = structuredClone(s);
    for (const id of ids) out.challenges[id] = { status, langs: status === "solved" ? ["javascript"] : [], at: "2026-10-01T00:00:00.000Z" };
    return out;
  };
  const easy = challenges.filter((c) => c.difficulty === "facil").map((c) => c.id);

  it("sobe de nível só com acertos, não com soluções reveladas", () => {
    let s = emptyProgress(new Date("2026-10-01"));
    expect(challengeLevel(s, challenges)).toBe("facil");
    s = solve(s, easy.slice(0, 3));
    expect(challengeLevel(s, challenges)).toBe("medio");
    s = solve(s, easy.slice(3, 6), "revealed");
    expect(challengeLevel(s, challenges)).toBe("facil");
  });
  it("erros viram reforço com explicação; o desafio sugerido ainda não foi feito", () => {
    const lesson = lessons[0]!.slug;
    let s = applyProgress(emptyProgress(new Date("2026-10-01")), { type: "quiz/result", slug: `revisao-${lesson}`, title: "x", percent: 30, passed: false, wrongIds: [`${lesson}#0`, `${lesson}#1`] }, new Date("2026-10-02")).state;
    s = solve(s, easy.slice(0, 1));
    const recs = adaptiveRecommendations(s, lessons, challenges, courseList);
    expect(recs[0]).toMatchObject({ kind: "reforcar", lesson: { slug: lesson } });
    expect(recs[0]!.kind === "reforcar" && recs[0]!.reason).toContain("30%");
    const d = recs.find((r) => r.kind === "desafio");
    expect(d && d.kind === "desafio" && s.challenges[d.challenge.id]).toBeFalsy();
  });
  it("domínio de uma trilha sugere o próximo assunto", () => {
    const first = courseList[0]!;
    let s = emptyProgress(new Date("2026-10-01"));
    for (const l of first.lessons) {
      s = applyProgress(s, { type: "lesson/complete", slug: l, title: l }, new Date("2026-10-02")).state;
      s = applyProgress(s, { type: "quiz/result", slug: `revisao-${l}`, title: l, percent: 100, passed: true }, new Date("2026-10-02")).state;
    }
    const recs = adaptiveRecommendations(s, lessons, challenges, courseList);
    expect(recs.find((r) => r.kind === "avancar")).toMatchObject({ course: { slug: courseList[1]!.slug } });
  });
});

describe("portfólio", () => {
  const catalog: PortfolioCatalog = {
    courses: courses.map((c) => ({ slug: c.slug, title: c.title, lessons: c.lessons.map((l) => l.slug) })),
    projects: {},
    challenges: { d1: { title: "Difícil", difficulty: "dificil" } },
  };
  const data = (o: Partial<PortfolioData>): PortfolioData => ({
    prefs: { show_xp: true, show_trails: true, show_projects: true, show_achievements: true, show_challenges: true, show_battle: true },
    counts: {},
    xp: 0,
    lessons: [],
    projects: [],
    challenges: [],
    battle: null,
    ...o,
  });
  it("só mostra conquistas conferíveis pelo servidor", () => {
    const a = verifiedAchievements(data({ counts: { lesson: 1, challenge: 1 }, challenges: ["d1"], xp: 30 }), catalog).map((x) => x.slug);
    expect(a).toEqual(expect.arrayContaining(["primeira-aula", "primeiro-desafio", "desafio-dificil"]));
    expect(a).not.toContain("tres-dias");
    expect(a).not.toContain("quiz-perfeito");
  });
  it("linguagens estudadas vêm das aulas registradas", () => {
    const py = courses[pos("python")]!.lessons[0]!.slug;
    expect(studiedLanguages([py], catalog)).toEqual(["Python"]);
  });
});
