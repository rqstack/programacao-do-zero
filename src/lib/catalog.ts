import "server-only";
import { courses, games, projects } from "@content/index";
import { readLessonBodies, readProjectBody } from "@content/load";
import type { SeedCourse, SeedGame, SeedLesson, SeedProject, SeedQuestion } from "@content/schema";
import { CHALLENGE_LABEL, codeChallenges, sqlChallenges } from "@content/challenges";
import { glossary } from "@content/glossario";
import type { SearchEntry } from "@/lib/search/query";

export const CATEGORY_LABEL: Record<SeedCourse["category"], string> = {
  fundamentos: "Fundamentos",
  web: "Desenvolvimento web",
  backend: "Back-end e dados",
  dados: "Dados",
  ia: "Inteligência artificial",
  carreira: "Carreira",
};

export const LEVEL_LABEL: Record<SeedCourse["level"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export interface LessonRef {
  slug: string;
  title: string;
  summary: string;
  objective: string;
  minutes: number;
  courseSlug: string;
  courseTitle: string;
  moduleTitle: string;
  number: number;
}

export interface CourseView {
  slug: string;
  title: string;
  description: string;
  category: SeedCourse["category"];
  level: SeedCourse["level"];
  position: number;
  modules: Array<{ title: string; lessons: LessonRef[] }>;
  lessons: LessonRef[];
  totalMinutes: number;
}

function buildCourse(course: SeedCourse, position: number): CourseView {
  let n = 0;
  const modules = course.modules.map((m) => ({
    title: m.title,
    lessons: m.lessons.map((l) => ({
      slug: l.slug,
      title: l.title,
      summary: l.summary,
      objective: l.objective,
      minutes: l.minutes,
      courseSlug: course.slug,
      courseTitle: course.title,
      moduleTitle: m.title,
      number: ++n,
    })),
  }));
  const lessons = modules.flatMap((m) => m.lessons);
  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    position,
    modules,
    lessons,
    totalMinutes: lessons.reduce((s, l) => s + l.minutes, 0),
  };
}

const COURSES = courses.map(buildCourse);

export function allCourses(): CourseView[] {
  return COURSES;
}

export function getCourse(slug: string): CourseView | null {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export function allLessons(): LessonRef[] {
  return COURSES.flatMap((c) => c.lessons);
}

export interface LessonPage {
  course: CourseView;
  lesson: LessonRef;
  data: SeedLesson;
  body: string;
  previous: LessonRef | null;
  next: LessonRef | null;
  nextCourse: CourseView | null;
}

export function getLessonPage(slug: string): LessonPage | null {
  for (const [ci, seed] of courses.entries()) {
    const data = seed.modules.flatMap((m) => m.lessons).find((l) => l.slug === slug);
    if (!data) continue;
    const course = COURSES[ci]!;
    const index = course.lessons.findIndex((l) => l.slug === slug);
    const body = readLessonBodies(seed).get(slug) ?? "";
    return {
      course,
      lesson: course.lessons[index]!,
      data,
      body,
      previous: course.lessons[index - 1] ?? null,
      next: course.lessons[index + 1] ?? null,
      nextCourse: COURSES[ci + 1] ?? null,
    };
  }
  return null;
}

/* -------------------------------- Quizzes -------------------------------- */

export interface QuizView {
  slug: string;
  title: string;
  description: string;
  kind: "aula" | "trilha";
  courseSlug: string;
  courseTitle: string;
  lessonSlug: string | null;
  questions: SeedQuestion[];
  /** "aula#indice" de cada pergunta (para a revisão do treino). */
  questionIds: string[];
  passPercent: number;
}

const QUIZZES: QuizView[] = courses.flatMap((seed, ci) => {
  const course = COURSES[ci]!;
  const lessons = seed.modules.flatMap((m) => m.lessons);
  const perLesson: QuizView[] = lessons.map((l) => ({
    slug: `revisao-${l.slug}`,
    title: `Revisão: ${l.title}`,
    description: `Perguntas sobre a aula "${l.title}".`,
    kind: "aula",
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonSlug: l.slug,
    questions: l.quiz,
    questionIds: l.quiz.map((_, i) => `${l.slug}#${i}`),
    passPercent: 70,
  }));
  // Desafio final: a primeira pergunta de cada aula da trilha.
  const final: QuizView = {
    slug: `desafio-${course.slug}`,
    title: `Desafio final: ${course.title}`,
    description: `Uma pergunta de cada aula da trilha — ${lessons.length} perguntas para testar o que ficou.`,
    kind: "trilha",
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonSlug: null,
    questions: lessons.map((l) => l.quiz[0]!),
    questionIds: lessons.map((l) => `${l.slug}#0`),
    passPercent: 70,
  };
  return [final, ...perLesson];
});

export function allQuizzes(): QuizView[] {
  return QUIZZES;
}

export function getQuiz(slug: string): QuizView | null {
  return QUIZZES.find((q) => q.slug === slug) ?? null;
}

/** Todas as perguntas, para o treino diário. */
export function questionBank(): Array<{ id: string; lessonSlug: string; lessonTitle: string; question: SeedQuestion }> {
  return courses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons.flatMap((l) => l.quiz.map((question, i) => ({ id: `${l.slug}#${i}`, lessonSlug: l.slug, lessonTitle: l.title, question })))),
  );
}

/* ------------------------------ Jogos e projetos ----------------------------- */

export function allGames(): SeedGame[] {
  return games;
}

export function getGame(slug: string): SeedGame | null {
  return games.find((g) => g.slug === slug) ?? null;
}

export function allProjects(): SeedProject[] {
  return projects;
}

export function getProject(slug: string): { project: SeedProject; body: string } | null {
  const project = projects.find((p) => p.slug === slug);
  return project ? { project, body: readProjectBody(project.slug) } : null;
}

/* --------------------------------- Busca --------------------------------- */

let SEARCH: SearchEntry[] | null = null;

/** Índice da busca global (gerado no build, enviado ao navegador como dado estático). */
export function searchIndex(): SearchEntry[] {
  if (SEARCH) return SEARCH;
  const out: SearchEntry[] = [];
  for (const [ci, seed] of courses.entries()) {
    const course = COURSES[ci]!;
    out.push({ kind: "trilha", title: course.title, text: course.description, href: `/trilhas/${course.slug}`, context: CATEGORY_LABEL[course.category], fav: `course:${course.slug}` });
    const bodies = readLessonBodies(seed);
    for (const l of course.lessons) {
      const headings = (bodies.get(l.slug) ?? "")
        .split("\n")
        .filter((line) => line.startsWith("## ") || line.startsWith("### "))
        .map((line) => line.replace(/^#+\s*/, ""))
        .join(" · ");
      out.push({ kind: "aula", title: l.title, text: l.summary, href: `/aulas/${l.slug}`, context: course.title, extra: `${l.objective} ${headings}`, fav: `lesson:${l.slug}` });
    }
  }
  for (const q of QUIZZES) {
    out.push({ kind: "quiz", title: q.title, text: q.description, href: `/quizzes/${q.slug}`, context: q.courseTitle, fav: `quiz:${q.slug}` });
  }
  for (const g of games) out.push({ kind: "jogo", title: g.title, text: g.description, href: `/jogos/${g.slug}`, fav: `game:${g.slug}` });
  for (const p of projects) out.push({ kind: "projeto", title: p.title, text: p.summary, href: `/projetos/${p.slug}`, extra: p.skills.join(" "), fav: `project:${p.slug}` });
  for (const c of [...codeChallenges, ...sqlChallenges]) {
    const isSql = sqlChallenges.some((s) => s.id === c.id);
    out.push({
      kind: "desafio",
      title: c.title,
      text: `${isSql ? "SQL" : "Lógica"} · ${CHALLENGE_LABEL[c.difficulty]} · ${c.topics.join(", ")}`,
      href: `/desafios?id=${c.id}`,
      extra: c.statement.slice(0, 300),
      fav: `challenge:${c.id}`,
    });
  }
  for (const t of glossary) out.push({ kind: "glossario", title: t.term, text: t.definition, href: "/glossario", context: t.area });
  SEARCH = out;
  return out;
}

/** Catálogo mínimo para o portfólio público (títulos e aulas de cada trilha). */
export function portfolioCatalog() {
  return {
    courses: COURSES.map((c) => ({ slug: c.slug, title: c.title, lessons: c.lessons.map((l) => l.slug) })),
    projects: Object.fromEntries(projects.map((p) => [p.slug, p.title])),
    challenges: Object.fromEntries([...codeChallenges, ...sqlChallenges].map((c) => [c.id, { title: c.title, difficulty: c.difficulty }])),
  };
}

/** Dados da trilha personalizada e das recomendações (só o necessário, para o navegador). */
export function pathData() {
  const courses = COURSES.map((c) => ({
    slug: c.slug,
    title: c.title,
    level: c.level,
    position: c.position,
    totalMinutes: c.totalMinutes,
    lessons: c.lessons.map((l) => ({ slug: l.slug, title: l.title })),
  }));
  const adaptive = {
    lessons: COURSES.flatMap((c) => c.lessons.map((l) => ({ slug: l.slug, title: l.title, courseSlug: c.slug, courseTitle: c.title }))),
    challenges: [...codeChallenges, ...sqlChallenges].map((c) => ({ id: c.id, title: c.title, difficulty: c.difficulty, topics: c.topics })),
    courses: COURSES.map((c) => ({ slug: c.slug, title: c.title, lessons: c.lessons.map((l) => l.slug) })),
  };
  return { courses, adaptive };
}
