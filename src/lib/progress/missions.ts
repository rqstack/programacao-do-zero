import type { ProgressState } from "./model";
import { streaks } from "./model";

/**
 * Missões: objetivos com progresso visível. Cada missão concluída rende XP uma única vez
 * (chave "mission:<slug>", cadastrada no banco em xp_sources). A de batalhas usa os dados
 * do servidor e não dá XP pelo navegador: só aparece como concluída.
 */
export type MissionLevel = "iniciante" | "intermediario";

export interface MissionStats {
  lessons: number;
  quizzesPassed: number;
  gamesTried: number;
  bugHuntWins: number;
  challengesSolved: number;
  projects: number;
  bestStreak: number;
  resolvedMistakes: number;
  /** Vitórias na Batalha de Código (vem do servidor; null = desconhecido/sem login). */
  battleWins: number | null;
}

export interface MissionDefinition {
  slug: string;
  title: string;
  goal: string;
  level: MissionLevel;
  /** XP da missão (0 = sem XP pelo navegador). */
  xp: number;
  target: number;
  /** Fonte dos dados: "local" (progresso) ou "battle" (servidor). */
  source: "local" | "battle";
  value: (s: MissionStats) => number;
  href: string;
}

export const MISSIONS: readonly MissionDefinition[] = [
  { slug: "primeiros-passos", title: "Primeiros passos", goal: "Concluir a primeira aula e passar no primeiro quiz.", level: "iniciante", xp: 30, target: 2, source: "local", value: (s) => Math.min(s.lessons, 1) + Math.min(s.quizzesPassed, 1), href: "/trilhas" },
  { slug: "explorador", title: "Explorador", goal: "Jogar 4 jogos diferentes.", level: "iniciante", xp: 30, target: 4, source: "local", value: (s) => s.gamesTried, href: "/jogos" },
  { slug: "estudante-dedicado", title: "Estudante dedicado", goal: "Estudar 3 dias seguidos.", level: "iniciante", xp: 30, target: 3, source: "local", value: (s) => s.bestStreak, href: "/treino" },
  { slug: "cacador-de-bugs", title: "Caçador de bugs", goal: "Concluir 5 partidas do Caça aos bugs (60% de acertos ou mais).", level: "iniciante", xp: 40, target: 5, source: "local", value: (s) => s.bugHuntWins, href: "/jogos/caca-aos-bugs" },
  { slug: "desafiante", title: "Desafiante", goal: "Resolver 3 desafios de código.", level: "intermediario", xp: 50, target: 3, source: "local", value: (s) => s.challengesSolved, href: "/desafios" },
  { slug: "construtor", title: "Construtor", goal: "Concluir o primeiro projeto guiado.", level: "intermediario", xp: 50, target: 1, source: "local", value: (s) => s.projects, href: "/projetos" },
  { slug: "revisor", title: "Revisor", goal: "Corrigir 10 perguntas que você tinha errado.", level: "intermediario", xp: 50, target: 10, source: "local", value: (s) => s.resolvedMistakes, href: "/revisao" },
  { slug: "semana-de-estudo", title: "Semana de estudo", goal: "Estudar 7 dias seguidos.", level: "intermediario", xp: 50, target: 7, source: "local", value: (s) => s.bestStreak, href: "/treino" },
  { slug: "programador-competitivo", title: "Programador competitivo", goal: "Vencer 3 partidas na Batalha de Código.", level: "intermediario", xp: 0, target: 3, source: "battle", value: (s) => s.battleWins ?? 0, href: "/batalha" },
];

export const LOCAL_MISSIONS = MISSIONS.filter((m) => m.source === "local");

export function missionStats(state: ProgressState, now: Date, battleWins: number | null = null): MissionStats {
  return {
    lessons: Object.keys(state.lessons).length,
    quizzesPassed: Object.values(state.quizzes).filter((q) => q.passed).length,
    gamesTried: Object.values(state.games).filter((g) => g.plays > 0).length,
    bugHuntWins: state.games["caca-aos-bugs"]?.wins ?? 0,
    challengesSolved: Object.values(state.challenges).filter((c) => c.status === "solved" && c.langs.length > 0).length,
    projects: Object.values(state.projects).filter((p) => p.completedAt).length,
    bestStreak: streaks(state.days, now).best,
    resolvedMistakes: Object.keys(state.resolved).length,
    battleWins,
  };
}

export interface MissionView {
  mission: MissionDefinition;
  value: number;
  done: boolean;
  /** Quando foi concluída (missões locais registradas no progresso). */
  at: string | null;
}

export function missionViews(state: ProgressState, now: Date, battleWins: number | null): MissionView[] {
  const stats = missionStats(state, now, battleWins);
  return MISSIONS.map((m) => {
    const value = Math.min(m.target, m.value(stats));
    const at = state.missions[m.slug] ?? null;
    return { mission: m, value, done: Boolean(at) || value >= m.target, at };
  });
}
