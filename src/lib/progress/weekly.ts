import type { ProgressState } from "./model";
import { localDay } from "./model";

/**
 * Metas semanais escolhidas pela pessoa. A semana vai de segunda a domingo, no fuso do
 * aparelho (o mesmo usado na ofensiva). Cada atividade conta uma vez, pois o progresso
 * guarda cada aula, exercício, quiz e desafio por chave única. Perder um dia não tira nada.
 */
import { WEEKLY_TYPES, type WeeklyType } from "@/lib/gamification/rules";

export { WEEKLY_TYPES, type WeeklyType };

export const WEEKLY_INFO: Record<WeeklyType, { label: (n: number) => string; max: number; suggested: number }> = {
  dias: { label: (n) => `Estudar ${n} ${n === 1 ? "dia" : "dias"} na semana`, max: 7, suggested: 3 },
  aulas: { label: (n) => `Concluir ${n} ${n === 1 ? "aula" : "aulas"}`, max: 20, suggested: 2 },
  exercicios: { label: (n) => `Resolver ${n} ${n === 1 ? "exercício" : "exercícios"}`, max: 30, suggested: 5 },
  quizzes: { label: (n) => `Passar em ${n} ${n === 1 ? "quiz" : "quizzes"}`, max: 20, suggested: 2 },
  desafios: { label: (n) => `Resolver ${n} ${n === 1 ? "desafio de código" : "desafios de código"}`, max: 10, suggested: 1 },
};

export interface WeeklyGoal {
  type: WeeklyType;
  target: number;
}

/** Segunda-feira (AAAA-MM-DD) e domingo da semana de `now`, no fuso local. */
export function weekRange(now: Date): { start: string; end: string } {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (d.getDay() + 6) % 7; // segunda = 0
  const start = new Date(d);
  start.setDate(d.getDate() - offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: localDay(start), end: localDay(end) };
}

const inWeek = (iso: string, r: { start: string; end: string }) => {
  const day = localDay(new Date(iso));
  return day >= r.start && day <= r.end;
};

export function weeklyCount(state: ProgressState, type: WeeklyType, now: Date): number {
  const r = weekRange(now);
  const xpWithPrefix = (prefix: string) => Object.entries(state.xp).filter(([k, e]) => k.startsWith(prefix) && inWeek(e.at, r)).length;
  switch (type) {
    case "dias":
      return state.days.filter((d) => d >= r.start && d <= r.end).length;
    case "aulas":
      return Object.values(state.lessons).filter((at) => inWeek(at, r)).length;
    case "exercicios":
      return xpWithPrefix("exercise:");
    case "quizzes":
      return xpWithPrefix("quiz:");
    case "desafios":
      return xpWithPrefix("challenge:");
  }
}

export function weeklyProgress(state: ProgressState, now: Date) {
  return state.settings.weekly.map((g) => {
    const value = weeklyCount(state, g.type, now);
    return { goal: g, value, done: value >= g.target };
  });
}
