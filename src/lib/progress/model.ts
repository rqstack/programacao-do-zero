import { z } from "zod";
import type { ChallengeDifficulty } from "@content/challenges";
import type { ChallengeLang } from "@/lib/challenges/langs";
import { CHALLENGE_LANGS } from "@/lib/challenges/langs";
import { DAILY_GOALS, evaluateAchievements, GAME_MIN_ACCURACY, WEEKLY_TYPES, XP_RULES, type AchievementDefinition, type DailyGoal, type LearnerStats } from "@/lib/gamification/rules";
import { LOCAL_MISSIONS, missionStats, type MissionDefinition } from "./missions";

/**
 * Progresso do aluno, guardado só no navegador (sem conta, sem servidor).
 * Tudo aqui é puro e testável; a persistência fica em store.ts.
 */
const iso = z.string().max(40);

/** Limites que mantêm o progresso abaixo do teto de 256 KB da tabela user_progress. */
export const NOTE_MAX_CHARS = 1500;
/** Limites de uso (anotações com texto e favoritos ativos). */
export const NOTES_MAX = 80;
export const FAVORITES_MAX = 300;
/** Teto de chaves guardadas (inclui remoções). Fica bem acima do limite de uso para nunca invalidar um progresso salvo. */
const NOTES_KEYS_CAP = 300;
const FAVORITES_KEYS_CAP = 1000;
const maxKeys = (n: number) => (r: Record<string, unknown>) => Object.keys(r).length <= n;

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
    z.object({
      best: z.number().min(0),
      max: z.number().min(0),
      plays: z.number().int().min(0),
      completed: z.boolean(),
      lastAt: iso,
      /** Partidas concluídas (60% de acertos ou mais); conta para as missões. */
      wins: z.number().int().min(0).default(0),
    }),
  ),
  projects: z.record(
    z.string().max(120),
    z.object({ checked: z.array(z.number().int().min(0).max(50)).max(50), completedAt: iso.nullable(), url: z.string().max(300).nullable() }),
  ),
  achievements: z.record(z.string().max(60), iso),
  /** Dias (AAAA-MM-DD, fuso local) com alguma atividade. */
  days: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(5000),
  /** Preferências (campos novos têm valor padrão para aceitar progressos antigos). */
  settings: z
    .object({
      dailyGoal: z.number().int().refine((n) => (DAILY_GOALS as readonly number[]).includes(n)),
      /** Metas semanais escolhidas pela pessoa (opcional). */
      weekly: z.array(z.object({ type: z.enum(WEEKLY_TYPES), target: z.number().int().min(1).max(30) })).max(5).default([]),
    })
    .default({ dailyGoal: 20, weekly: [] }),
  /** Erros por pergunta (id "aula#indice"): alimenta a revisão do treino diário. */
  mistakes: z.record(z.string().max(160), z.number().int().min(0).max(1000)).default({}),
  /** Desafios de código: resolvido (vale XP) ou solução revelada antes; e em quais linguagens. */
  challenges: z
    .record(z.string().max(120), z.object({ status: z.enum(["solved", "revealed"]), langs: z.array(z.enum(CHALLENGE_LANGS)).max(16), at: iso }))
    .default({}),
  /** Favoritos ("tipo:slug"). on=false guarda a remoção, para a mescla entre aparelhos não trazer de volta. */
  favorites: z.record(z.string().max(160), z.object({ on: z.boolean(), at: iso })).refine(maxKeys(FAVORITES_KEYS_CAP)).default({}),
  /** Anotações por aula. Texto vazio = anotação apagada (mesmo motivo). Privadas: só a própria pessoa lê. */
  notes: z.record(z.string().max(120), z.object({ text: z.string().max(NOTE_MAX_CHARS), at: iso })).refine(maxKeys(NOTES_KEYS_CAP)).default({}),
  /** Perguntas que a pessoa errou e depois acertou até sair da revisão (para mostrar a evolução). */
  resolved: z.record(z.string().max(160), iso).refine(maxKeys(5000)).default({}),
  /** Missões concluídas. */
  missions: z.record(z.string().max(60), iso).default({}),
});

export type ProgressState = z.infer<typeof progressSchema>;

export function emptyProgress(now: Date): ProgressState {
  return {
    version: 1,
    createdAt: now.toISOString(),
    xp: {},
    lessons: {},
    exercises: {},
    quizzes: {},
    games: {},
    projects: {},
    achievements: {},
    days: [],
    settings: { dailyGoal: 20, weekly: [] },
    mistakes: {},
    challenges: {},
    favorites: {},
    notes: {},
    resolved: {},
    missions: {},
  };
}

export type ProgressAction =
  | { type: "lesson/complete"; slug: string; title: string }
  | { type: "exercise/solve"; slug: string; title: string }
  | { type: "exercise/reveal"; slug: string }
  | { type: "quiz/result"; slug: string; title: string; percent: number; passed: boolean; wrongIds?: string[]; rightIds?: string[] }
  | { type: "practice/complete"; correct: number; total: number; heartsLeft: number; wrongIds: string[]; rightIds: string[] }
  | { type: "settings/goal"; goal: DailyGoal }
  | { type: "game/result"; slug: string; title: string; score: number; max: number; accuracy: number }
  | { type: "project/toggle"; slug: string; index: number }
  | { type: "project/complete"; slug: string; title: string; totalCriteria: number; url: string | null }
  | { type: "challenge/solve"; id: string; title: string; lang: ChallengeLang; difficulty: ChallengeDifficulty }
  | { type: "challenge/reveal"; id: string }
  | { type: "favorite/set"; key: string; on: boolean }
  | { type: "note/save"; slug: string; text: string }
  | { type: "review/answer"; id: string; correct: boolean }
  | { type: "settings/weekly"; goals: Array<{ type: (typeof WEEKLY_TYPES)[number]; target: number }> };

export interface Reward {
  xp: number;
  label: string;
  achievements: AchievementDefinition[];
  missions?: MissionDefinition[];
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
  // XP por dia (fuso local) para contar os dias em que a meta foi cumprida.
  const perDay = new Map<string, number>();
  for (const e of Object.values(state.xp)) {
    const d = localDay(new Date(e.at));
    perDay.set(d, (perDay.get(d) ?? 0) + e.amount);
  }
  return {
    totalXp: totalXp(state),
    lessonsCompleted: Object.keys(state.lessons).length,
    exercisesSolved: Object.values(state.exercises).filter((e) => e === "solved").length,
    quizzesPassed: Object.values(state.quizzes).filter((q) => q.passed).length,
    perfectQuizzes: Object.values(state.quizzes).filter((q) => q.best >= 100).length,
    gamesCompleted: Object.values(state.games).filter((g) => g.completed).length,
    perfectGames: Object.values(state.games).filter((g) => g.max > 0 && g.best >= g.max).length,
    projectsCompleted: Object.values(state.projects).filter((p) => p.completedAt).length,
    bestStreak: streaks(state.days, now).best,
    practiceDays: Object.keys(state.xp).filter((k) => k.startsWith("practice:")).length,
    goalDays: [...perDay.values()].filter((xp) => xp >= state.settings.dailyGoal).length,
    challengesSolved: Object.values(state.challenges).filter((c) => c.langs.length > 0).length,
    hardChallenges: Object.keys(state.xp).filter((k) => k.startsWith("challenge:") && state.xp[k]!.amount >= XP_RULES.challenge.dificil).length,
    challengeLangs: new Set(Object.values(state.challenges).flatMap((c) => c.langs)).size,
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
      trackMistakes(state, action.wrongIds ?? [], action.rightIds ?? [], at);
      break;
    }
    case "practice/complete": {
      trackMistakes(state, action.wrongIds, action.rightIds, at);
      if (action.heartsLeft > 0 && action.total > 0) {
        const today = localDay(now);
        xp = grant(state, `practice:${today}`, XP_RULES.practice, "Treino diário", at);
        label = "Treino concluído";
      } else {
        label = "Treino sem vidas";
      }
      break;
    }
    case "settings/goal":
      state.settings = { ...state.settings, dailyGoal: action.goal };
      activity = false;
      break;
    case "settings/weekly": {
      // Uma meta por tipo, com o alvo dentro do permitido.
      const seen = new Set<string>();
      const goals = action.goals.filter((g) => (WEEKLY_TYPES as readonly string[]).includes(g.type) && !seen.has(g.type) && seen.add(g.type));
      state.settings = { ...state.settings, weekly: goals.slice(0, 5).map((g) => ({ type: g.type, target: Math.max(1, Math.min(30, Math.round(g.target))) })) };
      activity = false;
      break;
    }
    case "favorite/set": {
      if (!/^[a-z]+:[a-z0-9-]{1,120}$/.test(action.key)) return { state: prev, reward: { xp: 0, label: "", achievements: [] } };
      const active = Object.values(state.favorites).filter((f) => f.on).length;
      const isNewKey = state.favorites[action.key] === undefined;
      if (action.on && !state.favorites[action.key]?.on && active >= FAVORITES_MAX) return { state: prev, reward: { xp: 0, label: "", achievements: [] } };
      if (isNewKey && Object.keys(state.favorites).length >= FAVORITES_KEYS_CAP) return { state: prev, reward: { xp: 0, label: "", achievements: [] } };
      state.favorites[action.key] = { on: action.on, at };
      activity = false;
      break;
    }
    case "note/save": {
      const text = action.text.slice(0, NOTE_MAX_CHARS);
      const exists = state.notes[action.slug] !== undefined;
      const hasText = Boolean(state.notes[action.slug]?.text);
      const active = Object.values(state.notes).filter((n) => n.text).length;
      const refuse = { state: prev, reward: { xp: 0, label: "", achievements: [] } };
      if (!exists && !text.trim()) return refuse;
      if (text.trim() && !hasText && active >= NOTES_MAX) return refuse;
      if (!exists && Object.keys(state.notes).length >= NOTES_KEYS_CAP) return refuse;
      state.notes[action.slug] = { text: text.trim() ? text : "", at };
      activity = false;
      break;
    }
    case "review/answer":
      // Refazer uma pergunta na revisão não dá XP, só atualiza o que falta revisar.
      if (action.correct) trackMistakes(state, [], [action.id], at);
      else trackMistakes(state, [action.id], [], at);
      break;
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
        wins: (g?.wins ?? 0) + (completed ? 1 : 0),
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
    case "challenge/solve": {
      const c = state.challenges[action.id];
      const langs = [...new Set([...(c?.langs ?? []), action.lang])].sort() as ChallengeLang[];
      state.challenges[action.id] = { status: c?.status ?? "solved", langs, at: c?.at ?? at };
      // Quem revelou a solução antes de resolver não ganha XP por este desafio.
      if (state.challenges[action.id]!.status === "solved") {
        xp = grant(state, `challenge:${action.id}`, XP_RULES.challenge[action.difficulty], `Desafio resolvido: ${action.title}`, at);
      }
      label = "Desafio resolvido";
      break;
    }
    case "challenge/reveal": {
      state.challenges[action.id] ??= { status: "revealed", langs: [], at };
      activity = false;
      break;
    }
  }

  if (activity) {
    const today = localDay(now);
    if (!state.days.includes(today)) state.days.push(today);
  }

  const fresh = evaluateAchievements(statsOf(state, now), new Set(Object.keys(state.achievements)));
  for (const a of fresh) state.achievements[a.slug] = at;

  // Missões locais: concluídas uma vez, com XP por chave única ("mission:<slug>").
  const ms = missionStats(state, now);
  const missions: MissionDefinition[] = [];
  for (const m of LOCAL_MISSIONS) {
    if (state.missions[m.slug] || m.value(ms) < m.target) continue;
    state.missions[m.slug] = at;
    xp += grant(state, `mission:${m.slug}`, m.xp, `Missão concluída: ${m.title}`, at);
    missions.push(m);
  }

  return { state, reward: { xp, label: label || (missions.length ? "Missão concluída" : ""), achievements: fresh, missions } };
}

/** Erro soma 1; acerto posterior reduz 1 (a pergunta sai da revisão quando chega a zero). */
function trackMistakes(state: ProgressState, wrong: readonly string[], right: readonly string[], at: string) {
  for (const id of wrong) state.mistakes[id] = Math.min(1000, (state.mistakes[id] ?? 0) + 1);
  for (const id of right) {
    const before = state.mistakes[id] ?? 0;
    const n = before - 1;
    if (n > 0) state.mistakes[id] = n;
    else {
      delete state.mistakes[id];
      if (before > 0) state.resolved[id] ??= at;
    }
  }
}

/** XP ganho no dia (fuso local) — usado na meta diária. */
export function dailyXp(state: ProgressState, now: Date): number {
  const today = localDay(now);
  return Object.values(state.xp)
    .filter((e) => localDay(new Date(e.at)) === today)
    .reduce((s, e) => s + e.amount, 0);
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

const earliest = (a: string | undefined, b: string | undefined) => (!a ? b : !b ? a : a < b ? a : b);
const latest = (a: string, b: string) => (a > b ? a : b);

/**
 * Combina dois progressos (ex.: este aparelho + a conta). Nada se perde e nada conta em
 * dobro: aplicar várias vezes dá o mesmo resultado (idempotente) e a ordem não importa.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const out = emptyProgress(new Date(0));
  out.createdAt = earliest(a.createdAt, b.createdAt)!;

  for (const src of [a, b]) {
    for (const [k, v] of Object.entries(src.xp)) {
      const cur = out.xp[k];
      out.xp[k] = cur ? { ...cur, at: earliest(cur.at, v.at)! } : { ...v };
    }
    for (const [k, v] of Object.entries(src.lessons)) out.lessons[k] = earliest(out.lessons[k], v)!;
    for (const [k, v] of Object.entries(src.exercises)) out.exercises[k] = out.exercises[k] === "solved" || v === "solved" ? "solved" : "revealed";
    for (const [k, v] of Object.entries(src.quizzes)) {
      const cur = out.quizzes[k];
      out.quizzes[k] = cur
        ? { best: Math.max(cur.best, v.best), passed: cur.passed || v.passed, attempts: Math.max(cur.attempts, v.attempts), lastAt: latest(cur.lastAt, v.lastAt) }
        : { ...v };
    }
    for (const [k, v] of Object.entries(src.games)) {
      const cur = out.games[k];
      if (!cur) {
        out.games[k] = { ...v };
        continue;
      }
      const better = v.best > cur.best ? v : cur;
      out.games[k] = {
        best: better.best,
        max: better.max,
        plays: Math.max(cur.plays, v.plays),
        completed: cur.completed || v.completed,
        lastAt: latest(cur.lastAt, v.lastAt),
        wins: Math.max(cur.wins, v.wins),
      };
    }
    for (const [k, v] of Object.entries(src.projects)) {
      const cur = out.projects[k];
      out.projects[k] = cur
        ? {
            checked: [...new Set([...cur.checked, ...v.checked])].sort((x, y) => x - y),
            completedAt: earliest(cur.completedAt ?? undefined, v.completedAt ?? undefined) ?? null,
            url: cur.url ?? v.url,
          }
        : { ...v, checked: [...v.checked] };
    }
    for (const [k, v] of Object.entries(src.achievements)) out.achievements[k] = earliest(out.achievements[k], v)!;
  }
  out.days = [...new Set([...a.days, ...b.days])].sort();
  out.settings = { dailyGoal: a.settings.dailyGoal, weekly: a.settings.weekly.length ? a.settings.weekly : b.settings.weekly };
  for (const src of [a, b]) {
    for (const [k, v] of Object.entries(src.mistakes)) out.mistakes[k] = Math.max(out.mistakes[k] ?? 0, v);
    for (const [k, v] of Object.entries(src.challenges)) {
      const cur = out.challenges[k];
      out.challenges[k] = cur
        ? {
            status: cur.status === "solved" || v.status === "solved" ? "solved" : "revealed",
            langs: [...new Set([...cur.langs, ...v.langs])].sort(),
            at: earliest(cur.at, v.at)!,
          }
        : { ...v, langs: [...v.langs] };
    }
    // Favoritos e anotações: vale a alteração mais recente (inclusive remoções).
    for (const [k, v] of Object.entries(src.favorites)) {
      const cur = out.favorites[k];
      if (!cur || v.at > cur.at) out.favorites[k] = { ...v };
    }
    for (const [k, v] of Object.entries(src.notes)) {
      const cur = out.notes[k];
      if (!cur || v.at > cur.at) out.notes[k] = { ...v };
    }
    for (const [k, v] of Object.entries(src.resolved)) out.resolved[k] = earliest(out.resolved[k], v)!;
    for (const [k, v] of Object.entries(src.missions)) out.missions[k] = earliest(out.missions[k], v)!;
  }
  return out;
}
