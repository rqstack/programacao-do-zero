/**
 * Formato do conteúdo da plataforma. Cada trilha tem:
 *   content/courses/<slug>/course.ts  → metadados, exercícios e quizzes
 *   content/courses/<slug>/aulas.md   → corpo das aulas, separado por "<!-- aula: slug -->"
 * Jogos ficam em content/games/, projetos em content/projects.ts + content/projetos/<slug>.md.
 * Os testes (tests/unit/content.test.ts) validam todo o conteúdo.
 */

export interface SeedQuestion {
  kind?: "multiple_choice" | "true_false" | "code_reading" | "find_bug" | "logic";
  prompt: string;
  code?: string;
  /** Linguagem do código da pergunta (padrão: js). */
  lang?: "js" | "html" | "css" | "sql" | "bash" | "jsx" | "ts" | "texto";
  options: string[];
  correct: number;
  explanation: string;
}

export interface SeedExercise {
  prompt: string;
  hint: string;
  accepted: string[];
  explanation: string;
}

export interface SeedLesson {
  slug: string;
  title: string;
  objective: string;
  summary: string;
  minutes: number;
  exercise: SeedExercise;
  quiz: SeedQuestion[];
}

export interface SeedModule {
  title: string;
  lessons: SeedLesson[];
}

export interface SeedCourse {
  slug: string;
  title: string;
  description: string;
  category: "fundamentos" | "web" | "backend" | "dados" | "ia" | "carreira";
  level: "iniciante" | "intermediario" | "avancado";
  modules: SeedModule[];
}

export interface SeedGameRound {
  difficulty: 1 | 2 | 3;
  points?: number;
  payload: Record<string, unknown>;
  solution: Record<string, unknown>;
  explanation: string;
}

export interface SeedGame {
  slug: string;
  kind: "logic" | "bug_hunt" | "code_order" | "lightning" | "memory" | "sql" | "fullstack" | "typing" | "css";
  title: string;
  description: string;
  rules: string;
  timeLimitSeconds?: number;
  /** Vidas da partida (erros custam uma); sem vidas a partida termina. */
  lives?: number;
  rounds: SeedGameRound[];
}

export interface SeedProject {
  slug: string;
  title: string;
  summary: string;
  level: "iniciante" | "intermediario" | "avancado";
  skills: string[];
  criteria: string[];
  /** Projeto pensado para portfólio e vagas (tem a seção "Como apresentar no currículo"). */
  portfolio?: boolean;
  /** Corpo em content/projetos/<slug>.md */
}
