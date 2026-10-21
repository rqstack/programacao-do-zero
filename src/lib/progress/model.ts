import { z } from "zod";
import { evaluateAchievements, GAME_MIN_ACCURACY, XP_RULES, type AchievementDefinition, type LearnerStats } from "@/lib/gamification/rules";

/**
 * Progresso do aluno, guardado só no navegador (sem conta, sem servidor).
 * Tudo aqui é puro e testável; a persistência fica em store.ts.
 */
const iso = z.string().max(40);

export const progressSchema = z.object({
  version: z.literal(1),
  createdAt: iso,
  xp: z.record(z.string().max(160), z.object({ amount: z.number().int().min(0).max(1000), label: z.string().max(200), at: iso })),
  lessons: z.record(z.string().max(120), iso),
  exercises: z.record(z.string().max(120), z.enum(["solved", "revealed"])),
  quizzes: z.record(
    z.string().max(120),
    z.object({ best: z.number().min(0).max(100), passed: z.boolean(), attempts: z.number().int().min(0), lastAt: iso }),
  ),
  games: z.record(
    z.string().max(120),
    z.object({ best: z.number().min(0), max: z.number().min(0), plays: z.number().int().min(0), completed: z.boolean(), lastAt: iso }),
  ),
  projects: z.record(
    z.string().max(120),
    z.object({ checked: z.array(z.number().int().min(0).max(50)).max(50), completedAt: iso.nullable(), url: z.string().max(300).nullable() }),
  ),
  achievements: z.record(z.string().max(60), iso),
  /** Dias (AAAA-MM-DD, fuso local) com alguma atividade. */
  days: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(5000),
});

export type ProgressState = z.infer<typeof progressSchema>;

export function emptyProgress(now: Date): ProgressState {
  return { version: 1, createdAt: now.toISOString(), xp: {}, lessons: {}, exercises: {}, quizzes: {}, games: {}, projects: {}, achievements: {}, days: [] };
}

export type ProgressAction =
  | { type: "lesson/complete"; slug: string; title: string }
  | { type: "exercise/solve"; slug: string; title: string }
  | { type: "exercise/reveal"; slug: string }
  | { type: "quiz/result"; slug: string; title: string; percent: number; passed: boolean }
  | { type: "game/result"; slug: string; title: string; score: number; max: number; accuracy: number }
  | { type: "project/toggle"; slug: string; index: number }
  | { type: "project/complete"; slug: string; title: string; totalCriteria: number; url: string | null };

export interface Reward {
  xp: number;
  label: string;
  achievements: AchievementDefinition[];
}

export function localDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayNumber(day: string): number {
  const [y, m, d] = day.split("-").map(Number) as [number, number, number];
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Sequência atual (termina hoje ou ontem) e melhor sequência de dias seguidos. */
export function streaks(days: readonly string[], now: Date): { current: number; best: number } {
  const nums = [...new Set(days)].map(dayNumber).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i]! - nums[i - 1]! === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const today = dayNumber(localDay(now));
  const last = nums.at(-1);
  const current = last !== undefined && today - last <= 1 ? run : 0;
  return { current, best };
}

export function statsOf(state: ProgressState, now: Date): LearnerStats {
  return {
    totalXp: totalXp(state),
    lessonsCompleted: Object.keys(state.lessons).length,
    exercisesSolved: Object.values(state.exercises).filter((e) => e === "solved").length,
    quizzesPassed: Object.values(state.quizzes).filter((q) => q.passed).length,
    gamesCompleted: Object.values(state.games).filter((g) => g.completed).length,
    projectsCompleted: Object.values(state.projects).filter((p) => p.completedAt).length,
    bestStreak: streaks(state.days, now).best,
  };
}

export function totalXp(state: ProgressState): number {
  return Object.values(state.xp).reduce((s, e) => s + e.amount, 0);
}

/** Concede XP uma única vez por chave. */
function grant(state: ProgressState, key: string, amount: number, label: string, at: string): number {
  if (state.xp[key]) return 0;
  state.xp[key] = { amount, label, at };
  return amount;
}

/** Aplica uma ação e devolve o novo estado (sem mutar o original) e a recompensa obtida. */
export function applyProgress(prev: ProgressState, action: ProgressAction, now: Date): { state: ProgressState; reward: Reward } {
  const state: ProgressState = structuredClone(prev);
  const at = now.toISOString();
  let xp = 0;
  let label = "";
  let activity = true;

  switch (action.type) {
    case "lesson/complete":
      state.lessons[action.slug] ??= at;
      xp = grant(state, `lesson:${action.slug}`, XP_RULES.lesson, `Aula concluída: ${action.title}`, at);
      label = "Aula concluída";
      break;
    case "exercise/solve":
      // Quem revelou a solução antes não ganha XP pelo exercício.
      if (state.exercises[action.slug] === undefined) {
        state.exercises[action.slug] = "solved";
        xp = grant(state, `exercise:${action.slug}`, XP_RULES.exercise, `Exercício resolvido: ${action.title}`, at);
      }
      label = "Exercício resolvido";
      break;
    case "exercise/reveal":
      state.exercises[action.slug] ??= "revealed";
      activity = false;
      break;
    case "quiz/result": {
      const q = state.quizzes[action.slug];
      const percent = Math.max(0, Math.min(100, Math.round(action.percent)));
      state.quizzes[action.slug] = {
        best: Math.max(q?.best ?? 0, percent),
        passed: Boolean(q?.passed) || action.passed,
        attempts: (q?.attempts ?? 0) + 1,
        lastAt: at,
      };
      if (action.passed) xp = grant(state, `quiz:${action.slug}`, XP_RULES.quizPassed, `Quiz aprovado: ${action.title}`, at);
      label = action.passed ? "Quiz aprovado" : "Tentativa registrada";
      break;
    }
    case "game/result": {
      const g = state.games[action.slug];
      const completed = action.accuracy >= GAME_MIN_ACCURACY;
      const better = !g || action.score > g.best;
      state.games[action.slug] = {
        best: better ? action.score : g!.best,
        max: better ? action.max : g!.max,
        plays: (g?.plays ?? 0) + 1,
        completed: Boolean(g?.completed) || completed,
        lastAt: at,
      };
      if (completed) xp = grant(state, `game:${action.slug}`, XP_RULES.gameCompleted, `Jogo concluído: ${action.title}`, at);
      label = completed ? "Jogo concluído" : "Partida registrada";
      break;
    }
    case "project/toggle": {
      const p = state.projects[action.slug] ?? { checked: [], completedAt: null, url: null };
      const set = new Set(p.checked);
      if (set.has(action.index)) set.delete(action.index);
      else set.add(action.index);
      state.projects[action.slug] = { ...p, checked: [...set].sort((a, b) => a - b) };
      activity = false;
      break;
    }
    case "project/complete": {
      const p = state.projects[action.slug] ?? { checked: [], completedAt: null, url: null };
      if (p.checked.length < action.totalCriteria) {
        return { state: prev, reward: { xp: 0, label: "", achievements: [] } };
      }
      state.projects[action.slug] = { ...p, completedAt: p.completedAt ?? at, url: action.url };
      xp = grant(state, `project:${action.slug}`, XP_RULES.project, `Projeto concluído: ${action.title}`, at);
      label = "Projeto concluído";
      break;
    }
  }

  if (activity) {
    const today = localDay(now);
    if (!state.days.includes(today)) state.days.push(today);
  }

  const fresh = evaluateAchievements(statsOf(state, now), new Set(Object.keys(state.achievements)));
  for (const a of fresh) state.achievements[a.slug] = at;

  return { state, reward: { xp, label, achievements: fresh } };
}

/** Lê dados salvos (ou importados) com validação. Dados inválidos são rejeitados. */
export function parseProgress(raw: unknown): ProgressState | null {
  const r = progressSchema.safeParse(raw);
  return r.success ? r.data : null;
}

export interface HistoryItem {
  key: string;
  kind: string;
  label: string;
  amount: number;
  at: string;
}

export function historyOf(state: ProgressState): HistoryItem[] {
  return Object.entries(state.xp)
    .map(([key, e]) => ({ key, kind: key.split(":")[0] ?? "", label: e.label, amount: e.amount, at: e.at }))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}
