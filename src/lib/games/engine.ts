import { z } from "zod";

/**
 * Motor de jogos: valida os dados de cada rodada e corrige respostas NO SERVIDOR.
 * O cliente recebe apenas o `payload` (sem gabarito) e envia respostas; a pontuação
 * é sempre calculada aqui.
 */
export const GAME_KINDS = ["logic", "bug_hunt", "code_order", "lightning", "memory", "sql", "fullstack"] as const;
export type GameKind = (typeof GAME_KINDS)[number];

const tableSchema = z.object({
  name: z.string().min(1).max(60),
  columns: z.array(z.string().min(1).max(60)).min(1).max(8),
  rows: z.array(z.array(z.union([z.string(), z.number(), z.null()]))).max(12),
});

const choicePayload = z.object({
  prompt: z.string().min(1).max(2000),
  code: z.string().max(4000).optional(),
  tables: z.array(tableSchema).max(3).optional(),
  options: z.array(z.string().min(1).max(600)).min(2).max(6),
});
const choiceSolution = z.object({ index: z.number().int().min(0) });
const choiceAnswer = z.object({ index: z.number().int().min(0).max(10) });

const bugPayload = z.object({
  prompt: z.string().min(1).max(2000),
  language: z.string().min(1).max(20),
  code: z.string().min(1).max(4000),
});
const bugSolution = z.object({ line: z.number().int().min(1) });
const bugAnswer = z.object({ line: z.number().int().min(1).max(200) });

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

export const roundSchemas = {
  choice: { payload: choicePayload, solution: choiceSolution, answer: choiceAnswer },
  bug_hunt: { payload: bugPayload, solution: bugSolution, answer: bugAnswer },
  code_order: { payload: orderPayload, solution: orderSolution, answer: orderAnswer },
  memory: { payload: memoryPayload, solution: memorySolution, answer: memoryAnswer },
} as const;

export type ChoicePayload = z.infer<typeof choicePayload>;
export type BugPayload = z.infer<typeof bugPayload>;
export type OrderPayload = z.infer<typeof orderPayload>;
export type MemoryPayload = z.infer<typeof memoryPayload>;

export type RoundFamily = keyof typeof roundSchemas;

export function familyOf(kind: GameKind): RoundFamily {
  switch (kind) {
    case "bug_hunt":
      return "bug_hunt";
    case "code_order":
      return "code_order";
    case "memory":
      return "memory";
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
    const lines = (p.data as BugPayload).code.split("\n").length;
    if ((s.data as { line: number }).line > lines) return { ok: false, error: "linha do bug fora do código" };
  } else if (family === "code_order") {
    const ids = (p.data as OrderPayload).blocks.map((b) => b.id);
    const order = (s.data as { order: string[] }).order;
    if (!isPermutation(order, ids)) return { ok: false, error: "a ordem correta precisa usar todos os blocos uma vez" };
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
  | { kind: "bug_hunt"; correct: boolean; correctLine: number; explanation: string }
  | { kind: "code_order"; correct: boolean; correctOrder: string[]; explanation: string }
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
    const lines = (round.payload as BugPayload).code.split("\n").length;
    if (!parsed.success || parsed.data.line > lines) return { ok: false, error: "invalid_answer" };
    const correctLine = (round.solution as { line: number }).line;
    const correct = parsed.data.line === correctLine;
    return finish(round, correct, { kind: "bug_hunt", correct, correctLine, explanation: round.explanation });
  }

  const parsed = orderAnswer.safeParse(answer);
  const ids = (round.payload as OrderPayload).blocks.map((b) => b.id);
  if (!parsed.success || !isPermutation(parsed.data.order, ids)) return { ok: false, error: "invalid_answer" };
  const correctOrder = (round.solution as { order: string[] }).order;
  const correct = parsed.data.order.every((id, i) => id === correctOrder[i]);
  return finish(round, correct, { kind: "code_order", correct, correctOrder, explanation: round.explanation });
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
