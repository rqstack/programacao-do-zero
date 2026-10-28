import { GOAL_TRAILS, LANGUAGE_TRAILS, PREREQUISITES } from "@content/paths";

/**
 * Trilha personalizada: a partir das respostas do começo, monta uma sequência com as
 * trilhas que já existem, na ordem dos pré-requisitos. Não inventa aulas e não bloqueia
 * nada: é uma sugestão que a pessoa pode mudar quando quiser.
 */
export type Level = "nunca" | "basico" | "projetos";
export type Goal = "logica" | "linguagem" | "projetos" | "estagio" | "hobby";
export const MINUTES = [10, 20, 30, 60] as const;

export interface Answers {
  level: Level;
  goal: Goal;
  langs: string[];
  minutes: (typeof MINUTES)[number];
}

export interface CourseInfo {
  slug: string;
  title: string;
  level: "iniciante" | "intermediario" | "avancado";
  position: number;
  totalMinutes: number;
  lessons: Array<{ slug: string; title: string }>;
}

export interface PathStep {
  slug: string;
  title: string;
  /** Por que está na trilha. */
  reason: string;
  /** Revisão opcional (a pessoa já disse que conhece o básico). */
  optional: boolean;
  done: number;
  total: number;
  status: "concluida" | "em_andamento" | "proxima" | "depois";
  /** Trilhas que vêm antes desta e ainda não foram concluídas. */
  waitingFor: string[];
  days: number;
}

export interface PathPlan {
  steps: PathStep[];
  next: { lessonSlug: string; lessonTitle: string; courseTitle: string } | null;
  totalDays: number;
}

/** Fecha a lista com os pré-requisitos, mantendo a prioridade de quem chamou (pré-requisitos sempre antes). */
export function withPrerequisites(slugs: readonly string[], position: (slug: string) => number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const visit = (s: string, stack: Set<string>) => {
    if (seen.has(s) || stack.has(s)) return;
    stack.add(s);
    for (const p of [...(PREREQUISITES[s] ?? [])].sort((a, b) => position(a) - position(b))) visit(p, stack);
    stack.delete(s);
    seen.add(s);
    out.push(s);
  };
  for (const s of new Set(slugs)) visit(s, new Set());
  return out;
}

export function buildPath(answers: Answers, courses: readonly CourseInfo[], completedLessons: ReadonlySet<string>): PathPlan {
  const byId = new Map(courses.map((c) => [c.slug, c]));
  const position = (s: string) => byId.get(s)?.position ?? 999;

  const wanted = new Map<string, string>();
  const add = (slug: string, reason: string) => {
    if (byId.has(slug) && !wanted.has(slug)) wanted.set(slug, reason);
  };
  if (answers.level === "nunca") add("logica-de-programacao", "Começa do zero: o raciocínio que toda linguagem usa.");
  const langs = answers.langs.filter((l) => LANGUAGE_TRAILS[l]);
  for (const l of langs) for (const c of LANGUAGE_TRAILS[l]!.courses) add(c, `Você escolheu ${LANGUAGE_TRAILS[l]!.label}.`);
  const goalReason: Record<Goal, string> = {
    logica: "Seu objetivo é aprender lógica.",
    linguagem: "Seu objetivo é aprender uma linguagem.",
    projetos: "Seu objetivo é criar projetos.",
    estagio: "Ajuda a se preparar para um estágio.",
    hobby: "Para estudar no seu ritmo, por gosto.",
  };
  for (const c of GOAL_TRAILS[answers.goal] ?? []) add(c, goalReason[answers.goal]);
  if (answers.goal === "linguagem" && langs.length === 0) add("javascript", "Sem linguagem escolhida, JavaScript é um bom começo: roda no navegador.");

  const ordered = withPrerequisites([...wanted.keys()], position);
  // Quem já desenvolveu projetos pode pular o básico; quem conhece o básico pode pular a lógica.
  const knows = (c: CourseInfo) =>
    (answers.level === "projetos" && c.level === "iniciante" && (c.slug === "logica-de-programacao" || c.slug === "html" || c.slug === "git-e-github")) ||
    (answers.level === "basico" && c.slug === "logica-de-programacao" && answers.goal !== "logica");

  // Trilha que entrou só como pré-requisito: diz o que ela destrava.
  const baseFor = (slug: string) => {
    const user = ordered.find((o) => wanted.has(o) && (PREREQUISITES[o] ?? []).includes(slug)) ?? ordered.find((o) => (PREREQUISITES[o] ?? []).includes(slug));
    return user ? `Base para ${byId.get(user)!.title}.` : "Base para as próximas trilhas.";
  };
  const doneCourse = (c: CourseInfo) => c.lessons.length > 0 && c.lessons.every((l) => completedLessons.has(l.slug));
  const steps: PathStep[] = [];
  let nextAssigned = false;
  for (const slug of ordered) {
    const c = byId.get(slug)!;
    const done = c.lessons.filter((l) => completedLessons.has(l.slug)).length;
    const optional = knows(c);
    const waitingFor = (PREREQUISITES[slug] ?? []).filter((p) => {
      const pc = byId.get(p);
      return pc && ordered.includes(p) && !doneCourse(pc) && !knows(pc);
    });
    let status: PathStep["status"];
    if (doneCourse(c)) status = "concluida";
    else if (done > 0) status = "em_andamento";
    else if (!optional && !nextAssigned && waitingFor.length === 0) status = "proxima";
    else status = "depois";
    if ((status === "em_andamento" || status === "proxima") && !optional) nextAssigned = true;
    steps.push({
      slug,
      title: c.title,
      reason: optional ? "Revisão opcional: você disse que já conhece este assunto." : (wanted.get(slug) ?? baseFor(slug)),
      optional,
      done,
      total: c.lessons.length,
      status,
      waitingFor,
      days: Math.max(1, Math.ceil(((c.totalMinutes * (c.lessons.length - done)) / Math.max(1, c.lessons.length)) / answers.minutes)),
    });
  }

  const current = steps.find((s) => !s.optional && (s.status === "em_andamento" || s.status === "proxima")) ?? steps.find((s) => s.status !== "concluida");
  let next: PathPlan["next"] = null;
  if (current) {
    const c = byId.get(current.slug)!;
    const lesson = c.lessons.find((l) => !completedLessons.has(l.slug));
    if (lesson) next = { lessonSlug: lesson.slug, lessonTitle: lesson.title, courseTitle: c.title };
  }
  return { steps, next, totalDays: steps.filter((s) => !s.optional && s.status !== "concluida").reduce((t, s) => t + s.days, 0) };
}
