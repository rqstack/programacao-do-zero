import { ACHIEVEMENTS, type AchievementDefinition, type LearnerStats } from "@/lib/gamification/rules";
import { getSupabase } from "@/lib/supabase/client";

/** Dados públicos do portfólio, já filtrados pelo banco conforme as escolhas da pessoa. */
export interface PortfolioData {
  prefs: Record<PortfolioKey, boolean>;
  counts: Record<string, number> | null;
  xp: number | null;
  lessons: string[] | null;
  projects: Array<{ slug: string; at: string; url: string | null }> | null;
  challenges: string[] | null;
  battle: { trophies: number; best_trophies: number; wins: number } | null;
}

export const PORTFOLIO_KEYS = ["show_xp", "show_trails", "show_projects", "show_achievements", "show_challenges", "show_battle"] as const;
export type PortfolioKey = (typeof PORTFOLIO_KEYS)[number];
export const PORTFOLIO_LABEL: Record<PortfolioKey, string> = {
  show_xp: "Nível e XP",
  show_trails: "Trilhas e linguagens estudadas",
  show_projects: "Projetos concluídos (com link do repositório)",
  show_achievements: "Conquistas",
  show_challenges: "Desafios de código resolvidos",
  show_battle: "Batalha de Código (troféus e vitórias)",
};

/** Catálogo mínimo enviado pela página estática (títulos e a que trilha cada aula pertence). */
export interface PortfolioCatalog {
  courses: Array<{ slug: string; title: string; lessons: string[] }>;
  projects: Record<string, string>;
  challenges: Record<string, { title: string; difficulty: "facil" | "medio" | "dificil" }>;
}

/** Linguagem principal de cada trilha (para "linguagens estudadas"). */
export const COURSE_LANGUAGE: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JavaScript",
  typescript: "TypeScript",
  react: "React",
  "node-e-apis": "Node.js",
  sql: "SQL",
  "modelagem-de-dados": "SQL",
  supabase: "SQL",
  java: "Java",
  python: "Python",
  csharp: "C#",
  "git-e-github": "Git",
};

/**
 * Só conquistas que dá para conferir com o que o servidor registrou (contagens de aulas,
 * exercícios, quizzes, jogos, projetos, treinos e desafios, e o XP). As que dependem de
 * dados só do navegador (sequência de dias, nota perfeita) ficam fora do perfil público.
 */
const VERIFIABLE = new Set([
  "primeira-aula", "dez-aulas", "trinta-aulas", "cem-aulas",
  "primeiro-exercicio", "dez-exercicios", "cinquenta-exercicios",
  "primeiro-quiz", "dez-quizzes",
  "primeiro-jogo", "cinco-jogos", "todos-os-jogos",
  "primeiro-treino", "sete-treinos",
  "primeiro-projeto", "cinco-projetos",
  "primeiro-desafio", "dez-desafios", "desafio-dificil",
  "nivel-3", "nivel-5", "nivel-10",
]);

export function verifiedAchievements(data: PortfolioData, catalog: PortfolioCatalog): AchievementDefinition[] {
  const c = data.counts ?? {};
  const hard = (data.challenges ?? []).filter((id) => catalog.challenges[id]?.difficulty === "dificil").length;
  const stats: LearnerStats = {
    totalXp: data.xp ?? 0,
    lessonsCompleted: c.lesson ?? 0,
    exercisesSolved: c.exercise ?? 0,
    quizzesPassed: c.quiz ?? 0,
    perfectQuizzes: 0,
    gamesCompleted: c.game ?? 0,
    perfectGames: 0,
    projectsCompleted: c.project ?? 0,
    bestStreak: 0,
    practiceDays: c.practice ?? 0,
    goalDays: 0,
    challengesSolved: c.challenge ?? 0,
    hardChallenges: hard,
    challengeLangs: 0,
  };
  return ACHIEVEMENTS.filter((a) => VERIFIABLE.has(a.slug) && (a.slug.startsWith("nivel-") ? data.xp !== null : true) && a.earned(stats));
}

export function trailProgress(lessons: readonly string[], catalog: PortfolioCatalog) {
  const done = new Set(lessons);
  return catalog.courses
    .map((c) => ({ slug: c.slug, title: c.title, done: c.lessons.filter((l) => done.has(l)).length, total: c.lessons.length }))
    .filter((c) => c.done > 0)
    .sort((a, b) => b.done / b.total - a.done / a.total || b.done - a.done);
}

export function studiedLanguages(lessons: readonly string[], catalog: PortfolioCatalog): string[] {
  return [...new Set(trailProgress(lessons, catalog).map((t) => COURSE_LANGUAGE[t.slug]).filter((x): x is string => Boolean(x)))];
}

export async function getPortfolio(username: string): Promise<PortfolioData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_portfolio", { p_username: username });
  if (error) return null;
  return (data as PortfolioData | null) ?? null;
}
