import { z } from "zod";
import { minimumBlocks, robotAnswer, robotPayload, robotSolution, runRobot, type RobotPayload, type RobotRun } from "./robot";
import { runQuery, sameResult, sqlQuery, sqlTable, toSql, type SqlQuery, type SqlResult, type SqlTable } from "./sql-mini";

/**
 * Motor de jogos: valida os dados de cada rodada e corrige as respostas.
 * Funções puras, usadas pelas páginas de jogos e pelos testes de conteúdo.
 */
export const GAME_KINDS = ["logic", "bug_hunt", "code_order", "lightning", "memory", "sql", "fullstack", "typing", "css"] as const;
export type GameKind = (typeof GAME_KINDS)[number];

const tableSchema = z.object({
  name: z.string().min(1).max(60),
  columns: z.array(z.string().min(1).max(60)).min(1).max(8),
  rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).max(12),
});

const choicePayload = z.object({
  prompt: z.string().min(1).max(2000),
  code: z.string().max(4000).optional(),
  codeLang: z.string().max(20).optional(),
  tables: z.array(tableSchema).max(3).optional(),
  options: z.array(z.string().min(1).max(600)).min(2).max(6),
});
const choiceSolution = z.object({ index: z.number().int().min(0) });
const choiceAnswer = z.object({ index: z.number().int().min(0).max(10) });

/**
 * Caça aos bugs: o código roda de verdade (Web Worker) contra os casos de teste; a pessoa
 * acha a linha, corrige e roda de novo. `expected` é o resultado (JSON) da versão correta.
 */
const bugPayload = z.object({
  prompt: z.string().min(1).max(2000),
  language: z.literal("js"),
  fn: z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]{0,40}$/),
  code: z.string().min(1).max(4000),
  cases: z.array(z.array(z.unknown()).max(6)).min(1).max(8),
  expected: z.array(z.string().max(2000)).min(1).max(8),
  maxRuns: z.number().int().min(1).max(5),
  concept: z.string().max(60),
});
const bugSolution = z.object({ line: z.number().int().min(1), fix: z.string().min(1).max(400) });
const bugAnswer = z.object({ passed: z.boolean(), runs: z.number().int().min(0).max(5) });

const blockId = z.string().regex(/^[a-z0-9-]{1,20}$/);
const orderPayload = z.object({
  prompt: z.string().min(1).max(2000),
  blocks: z.array(z.object({ id: blockId, code: z.string().min(1).max(300) })).min(2).max(12),
});
const orderSolution = z.object({ order: z.array(blockId).min(2).max(12) });
const orderAnswer = z.object({ order: z.array(blockId).min(2).max(12) });

const memoryPayload = z.object({
  prompt: z.string().min(1).max(2000),
  cards: z.array(z.object({ id: blockId, text: z.string().min(1).max(200) })).min(4).max(16),
});
const memorySolution = z.object({ pairs: z.array(z.tuple([blockId, blockId])).min(2).max(8) });
const memoryAnswer = z.object({ a: blockId, b: blockId });

const typingPayload = z.object({
  prompt: z.string().min(1).max(500),
  language: z.string().min(1).max(20),
  text: z.string().min(5).max(400),
});
const typingSolution = z.object({});
const typingAnswer = z.object({ typed: z.string().max(800) });

/**
 * Chuva de código (coletar): expressões caem em 3 pistas; a pessoa move o coletor e pega só
 * as que obedecem à regra. A correção compara o que foi pego com os alvos.
 */
const rainPayload = z.object({
  rule: z.string().min(1).max(120),
  explain: z.string().max(200),
  drops: z.array(z.object({ id: blockId, code: z.string().min(1).max(80), lane: z.number().int().min(0).max(2) })).min(4).max(16),
  tickMs: z.number().int().min(250).max(1500),
});
const rainSolution = z.object({ targets: z.array(blockId).min(2).max(16), values: z.record(z.string(), z.string().max(80)) });
const rainAnswer = z.object({ caught: z.array(blockId).max(16) });

const cssPayload = z.object({
  prompt: z.string().min(1).max(500),
  /** HTML do mini-site; os alvos têm o atributo data-alvo. */
  html: z.string().min(10).max(2000),
});
const cssSolution = z.object({ selector: z.string().min(1).max(120) });
/** A correspondência é calculada no navegador (DOMParser); o motor recebe o resultado. */
const cssAnswer = z.object({ selector: z.string().max(120), hit: z.boolean() });

const sqlPayload = z.object({
  prompt: z.string().min(1).max(500),
  tables: z.array(sqlTable).min(1).max(2),
});
const sqlSolution = z.object({ query: sqlQuery });
const sqlAnswer = z.object({ query: sqlQuery });

export const roundSchemas = {
  choice: { payload: choicePayload, solution: choiceSolution, answer: choiceAnswer },
  bug_hunt: { payload: bugPayload, solution: bugSolution, answer: bugAnswer },
  code_order: { payload: orderPayload, solution: orderSolution, answer: orderAnswer },
  memory: { payload: memoryPayload, solution: memorySolution, answer: memoryAnswer },
  typing: { payload: typingPayload, solution: typingSolution, answer: typingAnswer },
  robot: { payload: robotPayload, solution: robotSolution, answer: robotAnswer },
  rain: { payload: rainPayload, solution: rainSolution, answer: rainAnswer },
  css_live: { payload: cssPayload, solution: cssSolution, answer: cssAnswer },
  sql_builder: { payload: sqlPayload, solution: sqlSolution, answer: sqlAnswer },
} as const;

export type ChoicePayload = z.infer<typeof choicePayload>;
export type BugPayload = z.infer<typeof bugPayload>;
export type OrderPayload = z.infer<typeof orderPayload>;
export type MemoryPayload = z.infer<typeof memoryPayload>;
export type TypingPayload = z.infer<typeof typingPayload>;
export type RainPayload = z.infer<typeof rainPayload>;
export type CssPayload = z.infer<typeof cssPayload>;
export type SqlPayload = z.infer<typeof sqlPayload>;
export type { RobotPayload, SqlQuery, SqlResult, SqlTable };

export type RoundFamily = keyof typeof roundSchemas;

export function familyOf(kind: GameKind): RoundFamily {
  switch (kind) {
    case "bug_hunt":
      return "bug_hunt";
    case "code_order":
      return "code_order";
    case "memory":
      return "memory";
    case "typing":
      return "typing";
    case "logic":
      return "robot";
    case "lightning":
      return "rain";
    case "css":
      return "css_live";
    case "sql":
      return "sql_builder";
    case "fullstack":
      return "code_order";
    default:
      return "choice";
  }
}

/** Verifica se payload e gabarito de uma rodada são coerentes (usado no admin e no seed). */
export function validateRound(kind: GameKind, payload: unknown, solution: unknown): { ok: true } | { ok: false; error: string } {
  const family = familyOf(kind);
  const schema = roundSchemas[family];
  const p = schema.payload.safeParse(payload);
  if (!p.success) return { ok: false, error: `payload inválido: ${p.error.issues[0]?.message ?? ""}` };
  const s = schema.solution.safeParse(solution);
  if (!s.success) return { ok: false, error: `gabarito inválido: ${s.error.issues[0]?.message ?? ""}` };

  if (family === "choice") {
    const pl = p.data as ChoicePayload;
    if ((s.data as { index: number }).index >= pl.options.length) return { ok: false, error: "índice correto fora das opções" };
  } else if (family === "bug_hunt") {
    const pl = p.data as BugPayload;
    if ((s.data as { line: number }).line > pl.code.split("\n").length) return { ok: false, error: "linha do bug fora do código" };
    if (pl.cases.length !== pl.expected.length) return { ok: false, error: "cada caso precisa de um resultado esperado" };
  } else if (family === "code_order") {
    const ids = (p.data as OrderPayload).blocks.map((b) => b.id);
    const order = (s.data as { order: string[] }).order;
    if (!isPermutation(order, ids)) return { ok: false, error: "a ordem correta precisa usar todos os blocos uma vez" };
  } else if (family === "rain") {
    const ids = new Set((p.data as RainPayload).drops.map((d) => d.id));
    const t = (s.data as { targets: string[] }).targets;
    if (!t.every((id) => ids.has(id))) return { ok: false, error: "alvo que não está na onda" };
    if (ids.size - t.length < 2) return { ok: false, error: "a onda precisa de iscas (expressões que não valem)" };
  } else if (family === "typing") {
    return { ok: true };
  } else if (family === "robot") {
    const pl = p.data as RobotPayload;
    const all = pl.grid.join("");
    if (all.split("S").length - 1 !== 1 || all.split("G").length - 1 !== 1) return { ok: false, error: "o labirinto precisa de exatamente um S e um G" };
    if (new Set(pl.grid.map((r) => r.length)).size !== 1) return { ok: false, error: "todas as linhas do labirinto precisam ter o mesmo tamanho" };
    const min = minimumBlocks(pl);
    const par = (s.data as { par: number }).par;
    if (min === null) return { ok: false, error: "o labirinto não tem solução" };
    if (par !== min) return { ok: false, error: `o par deveria ser ${min} (menor solução)` };
    if (min > pl.maxBlocks) return { ok: false, error: "a menor solução usa mais blocos que o permitido" };
  } else if (family === "css_live") {
    const pl = p.data as CssPayload;
    if (!pl.html.includes("data-alvo")) return { ok: false, error: "marque os alvos com data-alvo" };
    if (/data-alvo/.test((s.data as { selector: string }).selector)) return { ok: false, error: "o seletor-gabarito não pode usar data-alvo" };
  } else if (family === "sql_builder") {
    const run = runQuery((p.data as SqlPayload).tables, (s.data as { query: SqlQuery }).query);
    if (!run.ok) return { ok: false, error: `consulta-gabarito inválida: ${run.error}` };
    if (run.result.rows.length === 0) return { ok: false, error: "a consulta-gabarito não devolve linhas" };
  } else {
    const ids = (p.data as MemoryPayload).cards.map((c) => c.id);
    const flat = (s.data as { pairs: [string, string][] }).pairs.flat();
    if (!isPermutation(flat, ids)) return { ok: false, error: "cada carta precisa pertencer a exatamente um par" };
  }
  return { ok: true };
}

function isPermutation(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return new Set(a).size === a.length && sa.every((v, i) => v === sb[i]);
}

export interface RoundDefinition {
  payload: unknown;
  solution: unknown;
  points: number;
  explanation: string;
}

export type RoundState =
  | { done: true; correct: boolean; points: number }
  | { done: false; matched: [string, string][]; attempts: number };

export type RoundFeedback =
  | { kind: "choice"; correct: boolean; correctIndex: number; explanation: string }
  | { kind: "bug_hunt"; correct: boolean; correctLine: number; fix: string; runs: number; explanation: string }
  | { kind: "code_order"; correct: boolean; correctOrder: string[]; explanation: string }
  | { kind: "typing"; correct: boolean; accuracy: number; errors: number; explanation: string }
  | { kind: "robot"; correct: boolean; run: RobotRun; blocks: number; par: number; explanation: string }
  | {
      kind: "rain";
      correct: boolean;
      hits: number;
      wrong: number;
      missed: number;
      targets: number;
      details: Array<{ code: string; value: string; target: boolean; caught: boolean }>;
      explanation: string;
    }
  | { kind: "css_live"; correct: boolean; reference: string; explanation: string }
  | {
      kind: "sql_builder";
      correct: boolean;
      sql: string;
      expectedSql: string;
      result: SqlResult | null;
      expected: SqlResult;
      error: string | null;
      explanation: string;
    }
  | {
      kind: "memory";
      match: boolean;
      pair: [string, string];
      done: boolean;
      pairsFound: number;
      totalPairs: number;
      attempts: number;
      explanation: string | null;
    };

export type GradeOutcome =
  | { ok: true; state: RoundState; pointsDelta: number; correctDelta: 0 | 1; feedback: RoundFeedback }
  | { ok: false; error: "invalid_answer" | "already_answered" | "invalid_round" };

export function gradeRound(
  kind: GameKind,
  round: RoundDefinition,
  previous: RoundState | null,
  answer: unknown,
): GradeOutcome {
  const family = familyOf(kind);
  if (!validateRound(kind, round.payload, round.solution).ok) return { ok: false, error: "invalid_round" };
  if (previous && previous.done) return { ok: false, error: "already_answered" };

  if (family === "memory") {
    const parsed = memoryAnswer.safeParse(answer);
    if (!parsed.success) return { ok: false, error: "invalid_answer" };
    const { a, b } = parsed.data;
    const payload = round.payload as MemoryPayload;
    const pairs = (round.solution as { pairs: [string, string][] }).pairs;
    const ids = new Set(payload.cards.map((c) => c.id));
    const prev = previous && !previous.done ? previous : { done: false as const, matched: [] as [string, string][], attempts: 0 };
    const matchedIds = new Set(prev.matched.flat());
    if (a === b || !ids.has(a) || !ids.has(b) || matchedIds.has(a) || matchedIds.has(b)) {
      return { ok: false, error: "invalid_answer" };
    }
    const attempts = prev.attempts + 1;
    const match = pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    const matched: [string, string][] = match ? [...prev.matched, [a, b]] : prev.matched;
    const done = matched.length === pairs.length;
    if (!done) {
      return {
        ok: true,
        state: { done: false, matched, attempts },
        pointsDelta: 0,
        correctDelta: 0,
        feedback: { kind: "memory", match, pair: [a, b], done, pairsFound: matched.length, totalPairs: pairs.length, attempts, explanation: null },
      };
    }
    // Pontuação proporcional à eficiência: tentativas mínimas = número de pares.
    const efficiency = Math.min(1, pairs.length / attempts);
    const points = Math.max(1, Math.round(round.points * efficiency));
    const correct = attempts <= pairs.length * 2;
    return {
      ok: true,
      state: { done: true, correct, points },
      pointsDelta: points,
      correctDelta: correct ? 1 : 0,
      feedback: { kind: "memory", match, pair: [a, b], done, pairsFound: matched.length, totalPairs: pairs.length, attempts, explanation: round.explanation },
    };
  }

  if (family === "typing") {
    const parsed = typingAnswer.safeParse(answer);
    if (!parsed.success) return { ok: false, error: "invalid_answer" };
    const accuracy = typingAccuracy((round.payload as TypingPayload).text, parsed.data.typed);
    const correct = accuracy >= TYPING_MIN_ACCURACY;
    const points = Math.round(round.points * accuracy);
    const errors = Math.round((1 - accuracy) * (round.payload as TypingPayload).text.length);
    return {
      ok: true,
      state: { done: true, correct, points },
      pointsDelta: points,
      correctDelta: correct ? 1 : 0,
      feedback: { kind: "typing", correct, accuracy, errors, explanation: round.explanation },
    };
  }

  if (family === "robot") {
    const parsed = robotAnswer.safeParse(answer);
    const pl = round.payload as RobotPayload;
    if (!parsed.success || parsed.data.program.length > pl.maxBlocks) return { ok: false, error: "invalid_answer" };
    const run = runRobot(pl, parsed.data.program);
    const par = (round.solution as { par: number }).par;
    const blocks = parsed.data.program.length;
    const correct = run.outcome === "goal";
    // Chegar com o menor número de blocos vale tudo; com blocos a mais, 70%.
    const points = correct ? (blocks <= par ? round.points : Math.round(round.points * 0.7)) : 0;
    return {
      ok: true,
      state: { done: true, correct, points },
      pointsDelta: points,
      correctDelta: correct ? 1 : 0,
      feedback: { kind: "robot", correct, run, blocks, par, explanation: round.explanation },
    };
  }

  if (family === "rain") {
    const parsed = rainAnswer.safeParse(answer);
    const pl = round.payload as RainPayload;
    const ids = new Set(pl.drops.map((d) => d.id));
    if (!parsed.success || !parsed.data.caught.every((id) => ids.has(id))) return { ok: false, error: "invalid_answer" };
    const sol = round.solution as { targets: string[]; values: Record<string, string> };
    const targets = new Set(sol.targets);
    const caught = new Set(parsed.data.caught);
    const hits = [...caught].filter((id) => targets.has(id)).length;
    const wrong = caught.size - hits;
    const missed = targets.size - hits;
    // Acerto: pegou pelo menos 70% dos alvos e no máximo 1 isca.
    const correct = hits >= Math.ceil(targets.size * 0.7) && wrong <= 1;
    const points = Math.max(0, Math.round((round.points * (hits - wrong)) / targets.size));
    const details = pl.drops.map((d) => ({ code: d.code, value: sol.values[d.id] ?? "?", target: targets.has(d.id), caught: caught.has(d.id) }));
    return {
      ok: true,
      state: { done: true, correct, points },
      pointsDelta: points,
      correctDelta: correct ? 1 : 0,
      feedback: { kind: "rain", correct, hits, wrong, missed, targets: targets.size, details, explanation: round.explanation },
    };
  }

  if (family === "css_live") {
    const parsed = cssAnswer.safeParse(answer);
    if (!parsed.success || /data-alvo/.test(parsed.data.selector)) return { ok: false, error: "invalid_answer" };
    const reference = (round.solution as { selector: string }).selector;
    return finish(round, parsed.data.hit, { kind: "css_live", correct: parsed.data.hit, reference, explanation: round.explanation });
  }

  if (family === "sql_builder") {
    const parsed = sqlAnswer.safeParse(answer);
    if (!parsed.success) return { ok: false, error: "invalid_answer" };
    const tables = (round.payload as SqlPayload).tables;
    const ref = (round.solution as { query: SqlQuery }).query;
    const expected = runQuery(tables, ref);
    if (!expected.ok) return { ok: false, error: "invalid_round" };
    const mine = runQuery(tables, parsed.data.query);
    const correct = mine.ok && sameResult(mine.result, expected.result, ref.orderBy !== null || ref.limit !== null);
    return finish(round, correct, {
      kind: "sql_builder",
      correct,
      sql: toSql(parsed.data.query),
      expectedSql: toSql(ref),
      result: mine.ok ? mine.result : null,
      expected: expected.result,
      error: mine.ok ? null : mine.error,
      explanation: round.explanation,
    });
  }

  if (family === "choice") {
    const parsed = choiceAnswer.safeParse(answer);
    const options = (round.payload as ChoicePayload).options;
    if (!parsed.success || parsed.data.index >= options.length) return { ok: false, error: "invalid_answer" };
    const correctIndex = (round.solution as { index: number }).index;
    const correct = parsed.data.index === correctIndex;
    return finish(round, correct, { kind: "choice", correct, correctIndex, explanation: round.explanation });
  }

  if (family === "bug_hunt") {
    const parsed = bugAnswer.safeParse(answer);
    const pl = round.payload as BugPayload;
    if (!parsed.success || parsed.data.runs > pl.maxRuns || (parsed.data.passed && parsed.data.runs < 1)) return { ok: false, error: "invalid_answer" };
    const sol = round.solution as { line: number; fix: string };
    const correct = parsed.data.passed;
    // Corrigir na primeira execução vale tudo; cada execução a mais vale um pouco menos.
    const factor = [1, 1, 0.8, 0.6, 0.5, 0.4][parsed.data.runs] ?? 0.4;
    const points = correct ? Math.round(round.points * factor) : 0;
    return {
      ok: true,
      state: { done: true, correct, points },
      pointsDelta: points,
      correctDelta: correct ? 1 : 0,
      feedback: { kind: "bug_hunt", correct, correctLine: sol.line, fix: sol.fix, runs: parsed.data.runs, explanation: round.explanation },
    };
  }

  const parsed = orderAnswer.safeParse(answer);
  const ids = (round.payload as OrderPayload).blocks.map((b) => b.id);
  if (!parsed.success || !isPermutation(parsed.data.order, ids)) return { ok: false, error: "invalid_answer" };
  const correctOrder = (round.solution as { order: string[] }).order;
  const correct = parsed.data.order.every((id, i) => id === correctOrder[i]);
  return finish(round, correct, { kind: "code_order", correct, correctOrder, explanation: round.explanation });
}

/** Precisão mínima para uma rodada de digitação contar como acerto. */
export const TYPING_MIN_ACCURACY = 0.95;

/** Fração de caracteres digitados corretamente, na posição certa (sobras contam como erro). */
export function typingAccuracy(expected: string, typed: string): number {
  const total = Math.max(expected.length, typed.length);
  if (total === 0) return 1;
  let right = 0;
  for (let i = 0; i < Math.min(expected.length, typed.length); i++) if (expected[i] === typed[i]) right++;
  return right / total;
}

function finish(round: RoundDefinition, correct: boolean, feedback: RoundFeedback): GradeOutcome {
  const points = correct ? round.points : 0;
  return { ok: true, state: { done: true, correct, points }, pointsDelta: points, correctDelta: correct ? 1 : 0, feedback };
}

/** Embaralhamento determinístico (mesma sessão → mesma ordem ao recarregar). */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Remove o gabarito e embaralha o que precisa ser embaralhado antes de enviar ao aluno. */
export function publicPayload(kind: GameKind, payload: unknown, seed: string): unknown {
  const family = familyOf(kind);
  if (family === "code_order") {
    const p = payload as OrderPayload;
    let blocks = seededShuffle(p.blocks, seed);
    // Nunca entrega os blocos na ordem em que foram cadastrados.
    if (blocks.every((b, i) => b.id === p.blocks[i]!.id)) blocks = [...blocks.slice(1), blocks[0]!];
    return { ...p, blocks };
  }
  if (family === "memory") {
    const p = payload as MemoryPayload;
    return { ...p, cards: seededShuffle(p.cards, seed) };
  }
  return payload;
}
