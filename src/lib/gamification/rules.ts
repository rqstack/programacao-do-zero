/** Regras de XP: cada atividade rende XP uma única vez. */
export const XP_RULES = {
  lesson: 20,
  exercise: 10,
  quizPassed: 30,
  gameCompleted: 25,
  project: 100,
} as const;

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

const LEVEL_TITLES = ["Primeiro passo", "Curioso", "Aprendiz", "Praticante", "Construtor", "Desenvolvedor", "Arquiteto", "Mentor"];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1] ?? LEVEL_TITLES[0]!;
}

export interface LearnerStats {
  totalXp: number;
  lessonsCompleted: number;
  exercisesSolved: number;
  quizzesPassed: number;
  gamesCompleted: number;
  projectsCompleted: number;
  bestStreak: number;
}

export interface AchievementDefinition {
  slug: string;
  title: string;
  description: string;
  earned: (s: LearnerStats) => boolean;
}

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  { slug: "primeira-aula", title: "Primeiro passo", description: "Concluiu a primeira aula.", earned: (s) => s.lessonsCompleted >= 1 },
  { slug: "dez-aulas", title: "Ritmo de estudo", description: "Concluiu 10 aulas.", earned: (s) => s.lessonsCompleted >= 10 },
  { slug: "trinta-aulas", title: "Base sólida", description: "Concluiu 30 aulas.", earned: (s) => s.lessonsCompleted >= 30 },
  { slug: "cem-aulas", title: "Maratonista", description: "Concluiu 100 aulas.", earned: (s) => s.lessonsCompleted >= 100 },
  { slug: "primeiro-exercicio", title: "Mão na massa", description: "Resolveu um exercício sem ver a solução.", earned: (s) => s.exercisesSolved >= 1 },
  { slug: "dez-exercicios", title: "Prática constante", description: "Resolveu 10 exercícios sem ver a solução.", earned: (s) => s.exercisesSolved >= 10 },
  { slug: "primeiro-quiz", title: "Revisão em dia", description: "Passou no primeiro quiz.", earned: (s) => s.quizzesPassed >= 1 },
  { slug: "dez-quizzes", title: "Memória afiada", description: "Passou em 10 quizzes.", earned: (s) => s.quizzesPassed >= 10 },
  { slug: "primeiro-jogo", title: "Jogador", description: "Concluiu um jogo com pelo menos 60% de acertos.", earned: (s) => s.gamesCompleted >= 1 },
  { slug: "cinco-jogos", title: "Mestre dos desafios", description: "Concluiu 5 jogos diferentes.", earned: (s) => s.gamesCompleted >= 5 },
  { slug: "primeiro-projeto", title: "Construtor", description: "Concluiu o primeiro projeto guiado.", earned: (s) => s.projectsCompleted >= 1 },
  { slug: "tres-dias", title: "Constância", description: "Estudou 3 dias seguidos.", earned: (s) => s.bestStreak >= 3 },
  { slug: "sete-dias", title: "Hábito formado", description: "Estudou 7 dias seguidos.", earned: (s) => s.bestStreak >= 7 },
  { slug: "nivel-5", title: "Nível 5", description: "Alcançou o nível 5.", earned: (s) => levelFromXp(s.totalXp).level >= 5 },
];

export function evaluateAchievements(stats: LearnerStats, alreadyEarned: ReadonlySet<string>): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((a) => !alreadyEarned.has(a.slug) && a.earned(stats));
}
