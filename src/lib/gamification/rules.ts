/** Regras de XP: cada atividade rende XP uma única vez. */
/** Limite de ritmo do XP no banco (supabase/migrations/20261026000008_xp_limites.sql). */
export const XP_LIMITS = { perDay: 1200, perTenMinutes: 400 } as const;

export const XP_RULES = {
  lesson: 20,
  exercise: 10,
  quizPassed: 30,
  gameCompleted: 25,
  project: 100,
  practice: 15,
  /** Desafios de código, por dificuldade. */
  challenge: { facil: 15, medio: 25, dificil: 40 },
} as const;

/** Metas diárias de XP que a pessoa pode escolher (como no Duolingo). */
export const DAILY_GOALS = [10, 20, 30, 50] as const;
export type DailyGoal = (typeof DAILY_GOALS)[number];

/** Vidas por treino: cada erro tira uma; sem vidas, o treino termina sem XP. */
export const PRACTICE_HEARTS = 3;
export const PRACTICE_SIZE = 10;

/** Precisão mínima numa partida para o jogo contar como concluído. */
export const GAME_MIN_ACCURACY = 0.6;

/** XP acumulado necessário para alcançar o nível n (nível 1 = 0 XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  // 100, 250, 450, 700, 1000... cada nível pede 50 XP a mais que o anterior
  return 25 * (level - 1) * (level + 2);
}

export interface LevelInfo {
  level: number;
  totalXp: number;
  levelStartXp: number;
  nextLevelXp: number;
  /** 0..1 dentro do nível atual */
  progress: number;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const levelStartXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return { level, totalXp: xp, levelStartXp, nextLevelXp, progress: (xp - levelStartXp) / (nextLevelXp - levelStartXp) };
}

/** Título de cada nível: do "Dev Bebê" ao "Dev Lendário". */
export const LEVEL_TITLES = [
  "Dev Bebê",
  "Dev Engatinhando",
  "Dev Curioso",
  "Dev Aprendiz",
  "Dev Estagiário",
  "Dev Júnior",
  "Dev Pleno",
  "Dev Sênior",
  "Dev Tech Lead",
  "Dev Arquiteto",
  "Dev Lendário",
] as const;

/** Do nível 11 em diante o título é "Dev Lendário", com uma estrela a mais a cada nível. */
export function levelTitle(level: number): string {
  const n = Math.max(1, Math.floor(level));
  if (n <= LEVEL_TITLES.length) return LEVEL_TITLES[n - 1]!;
  return `Dev Lendário ${"★".repeat(Math.min(n - LEVEL_TITLES.length, 10))}`;
}

export interface LearnerStats {
  totalXp: number;
  lessonsCompleted: number;
  exercisesSolved: number;
  quizzesPassed: number;
  /** Quizzes com 100% em alguma tentativa. */
  perfectQuizzes: number;
  gamesCompleted: number;
  /** Jogos com pontuação máxima em alguma partida. */
  perfectGames: number;
  projectsCompleted: number;
  bestStreak: number;
  /** Dias com treino diário concluído. */
  practiceDays: number;
  /** Dias em que a meta diária de XP foi cumprida. */
  goalDays: number;
  /** Desafios de código resolvidos (em qualquer linguagem). */
  challengesSolved: number;
  /** Desafios difíceis resolvidos. */
  hardChallenges: number;
  /** Linguagens diferentes usadas para resolver desafios. */
  challengeLangs: number;
}

/** Raridade, como os troféus de videogame: bronze → prata → ouro → platina. */
export type Rarity = "bronze" | "prata" | "ouro" | "platina";

export interface AchievementDefinition {
  slug: string;
  title: string;
  description: string;
  /** Nome do ícone (mapeado para um ícone Lucide na interface). */
  icon: string;
  rarity: Rarity;
  earned: (s: LearnerStats) => boolean;
}

const lvl = (s: LearnerStats) => levelFromXp(s.totalXp).level;

const BASE_ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { slug: "primeira-aula", title: "Primeiro passo", description: "Concluiu a primeira aula.", icon: "footprints", rarity: "bronze", earned: (s) => s.lessonsCompleted >= 1 },
  { slug: "dez-aulas", title: "Ritmo de estudo", description: "Concluiu 10 aulas.", icon: "book-open", rarity: "prata", earned: (s) => s.lessonsCompleted >= 10 },
  { slug: "trinta-aulas", title: "Base sólida", description: "Concluiu 30 aulas.", icon: "library", rarity: "ouro", earned: (s) => s.lessonsCompleted >= 30 },
  { slug: "cem-aulas", title: "Maratonista", description: "Concluiu 100 aulas.", icon: "medal", rarity: "ouro", earned: (s) => s.lessonsCompleted >= 100 },
  { slug: "primeiro-exercicio", title: "Mão na massa", description: "Resolveu um exercício sem ver a solução.", icon: "hammer", rarity: "bronze", earned: (s) => s.exercisesSolved >= 1 },
  { slug: "dez-exercicios", title: "Prática constante", description: "Resolveu 10 exercícios sem ver a solução.", icon: "wrench", rarity: "prata", earned: (s) => s.exercisesSolved >= 10 },
  { slug: "cinquenta-exercicios", title: "Mestre da prática", description: "Resolveu 50 exercícios sem ver a solução.", icon: "cog", rarity: "ouro", earned: (s) => s.exercisesSolved >= 50 },
  { slug: "primeiro-quiz", title: "Revisão em dia", description: "Passou no primeiro quiz.", icon: "clipboard-check", rarity: "bronze", earned: (s) => s.quizzesPassed >= 1 },
  { slug: "dez-quizzes", title: "Memória afiada", description: "Passou em 10 quizzes.", icon: "brain", rarity: "prata", earned: (s) => s.quizzesPassed >= 10 },
  { slug: "quiz-perfeito", title: "Gabaritou", description: "Acertou 100% de um quiz.", icon: "target", rarity: "prata", earned: (s) => s.perfectQuizzes >= 1 },
  { slug: "dez-perfeitos", title: "Perfeccionista", description: "Acertou 100% em 10 quizzes.", icon: "crosshair", rarity: "ouro", earned: (s) => s.perfectQuizzes >= 10 },
  { slug: "primeiro-jogo", title: "Jogador", description: "Concluiu um jogo com pelo menos 60% de acertos.", icon: "gamepad", rarity: "bronze", earned: (s) => s.gamesCompleted >= 1 },
  { slug: "cinco-jogos", title: "Mestre dos desafios", description: "Concluiu 5 jogos diferentes.", icon: "joystick", rarity: "prata", earned: (s) => s.gamesCompleted >= 5 },
  { slug: "todos-os-jogos", title: "Zerou!", description: "Concluiu os 9 jogos.", icon: "trophy", rarity: "ouro", earned: (s) => s.gamesCompleted >= 9 },
  { slug: "jogo-perfeito", title: "Sem errar nada", description: "Fez a pontuação máxima em um jogo.", icon: "sparkles", rarity: "prata", earned: (s) => s.perfectGames >= 1 },
  { slug: "primeiro-treino", title: "Aquecimento", description: "Concluiu o primeiro treino diário.", icon: "dumbbell", rarity: "bronze", earned: (s) => s.practiceDays >= 1 },
  { slug: "sete-treinos", title: "Treino em dia", description: "Concluiu o treino diário em 7 dias.", icon: "activity", rarity: "prata", earned: (s) => s.practiceDays >= 7 },
  { slug: "meta-cumprida", title: "Meta batida", description: "Cumpriu a meta diária de XP.", icon: "circle-check", rarity: "bronze", earned: (s) => s.goalDays >= 1 },
  { slug: "sete-metas", title: "Disciplina", description: "Cumpriu a meta diária em 7 dias.", icon: "calendar-check", rarity: "ouro", earned: (s) => s.goalDays >= 7 },
  { slug: "tres-dias", title: "Constância", description: "Estudou 3 dias seguidos.", icon: "flame", rarity: "bronze", earned: (s) => s.bestStreak >= 3 },
  { slug: "sete-dias", title: "Hábito formado", description: "Estudou 7 dias seguidos.", icon: "flame", rarity: "prata", earned: (s) => s.bestStreak >= 7 },
  { slug: "trinta-dias", title: "Imparável", description: "Estudou 30 dias seguidos.", icon: "zap", rarity: "ouro", earned: (s) => s.bestStreak >= 30 },
  { slug: "primeiro-projeto", title: "Construtor", description: "Concluiu o primeiro projeto guiado.", icon: "rocket", rarity: "prata", earned: (s) => s.projectsCompleted >= 1 },
  { slug: "cinco-projetos", title: "Portfólio em construção", description: "Concluiu 5 projetos guiados.", icon: "briefcase", rarity: "ouro", earned: (s) => s.projectsCompleted >= 5 },
  { slug: "primeiro-desafio", title: "Hello, problema", description: "Resolveu o primeiro desafio de código.", icon: "code", rarity: "bronze", earned: (s) => s.challengesSolved >= 1 },
  { slug: "dez-desafios", title: "Resolvedor de problemas", description: "Resolveu 10 desafios de código.", icon: "terminal", rarity: "prata", earned: (s) => s.challengesSolved >= 10 },
  { slug: "desafio-dificil", title: "Chefão derrotado", description: "Resolveu um desafio difícil.", icon: "swords", rarity: "prata", earned: (s) => s.hardChallenges >= 1 },
  { slug: "poliglota", title: "Poliglota", description: "Resolveu desafios em JavaScript, TypeScript, Python e SQL.", icon: "languages", rarity: "ouro", earned: (s) => s.challengeLangs >= 4 },
  { slug: "nivel-3", title: "Dev Curioso", description: "Alcançou o nível 3.", icon: "star", rarity: "bronze", earned: (s) => lvl(s) >= 3 },
  { slug: "nivel-5", title: "Dev Estagiário", description: "Alcançou o nível 5.", icon: "award", rarity: "prata", earned: (s) => lvl(s) >= 5 },
  { slug: "nivel-10", title: "Dev Arquiteto", description: "Alcançou o nível 10.", icon: "crown", rarity: "ouro", earned: (s) => lvl(s) >= 10 },
];

/** A platina é concedida quando todos os outros troféus foram conquistados. */
export const PLATINUM: AchievementDefinition = {
  slug: "platina",
  title: "Programação do Zero",
  description: "Conquistou todos os outros troféus.",
  icon: "gem",
  rarity: "platina",
  earned: () => false,
};

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [...BASE_ACHIEVEMENTS, PLATINUM];

export function evaluateAchievements(stats: LearnerStats, alreadyEarned: ReadonlySet<string>): AchievementDefinition[] {
  const fresh = BASE_ACHIEVEMENTS.filter((a) => !alreadyEarned.has(a.slug) && a.earned(stats));
  const all = new Set([...alreadyEarned, ...fresh.map((a) => a.slug)]);
  if (!alreadyEarned.has(PLATINUM.slug) && BASE_ACHIEVEMENTS.every((a) => all.has(a.slug))) fresh.push(PLATINUM);
  return fresh;
}
