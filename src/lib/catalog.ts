import "server-only";
import { courses, games, projects } from "@content/index";
import { readLessonBodies, readProjectBody } from "@content/load";
import type { SeedCourse, SeedGame, SeedLesson, SeedProject, SeedQuestion } from "@content/schema";

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
    questions: lessons.map((l) => l.quiz[0]!).filter(Boolean),
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
