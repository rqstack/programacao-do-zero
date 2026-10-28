import type { SeedGameRound } from "../schema";
import { fixedCode, runBugCode, type BugCase } from "./bugs";
import { buildWave, CATCH_RULES, mulberry, RULES_BY_DIFFICULTY, type CatchRuleId, type Wave } from "./catch";

/** Fase do Caça aos bugs a partir do banco (os resultados esperados vêm da versão corrigida). */
export function bugRound(b: BugCase): SeedGameRound {
  const fixed = fixedCode(b);
  return {
    key: `bug:${b.id}`,
    difficulty: b.difficulty,
    points: 10,
    payload: {
      prompt: b.prompt,
      language: "js",
      fn: b.fn,
      code: b.code.join("\n"),
      cases: b.cases,
      expected: b.cases.map((args) => JSON.stringify(runBugCode(fixed, b.fn, args)) ?? "undefined"),
      maxRuns: 3,
      concept: b.concept,
    },
    solution: { line: b.line, fix: b.fix.trim() },
    explanation: b.explanation,
  };
}

const TICK: Record<1 | 2 | 3, number> = { 1: 900, 2: 750, 3: 620 };

/** Fase da Chuva de código a partir de uma onda gerada. */
export function waveRound(w: Wave, difficulty: 1 | 2 | 3): SeedGameRound {
  return {
    key: `onda:${difficulty}:${w.rule.id}`,
    difficulty,
    points: 10,
    payload: { rule: w.rule.label, explain: w.rule.explain, drops: w.drops, tickMs: TICK[difficulty] },
    solution: { targets: w.targets, values: w.values },
    explanation: w.rule.explain,
  };
}

/** Ondas cadastradas (fixas, com semente conhecida), duas por dificuldade. */
export function fixedWaves(): SeedGameRound[] {
  const out: SeedGameRound[] = [];
  for (const d of [1, 2, 3] as const) {
    RULES_BY_DIFFICULTY[d].slice(0, 2).forEach((rule: CatchRuleId, i) => {
      const w = buildWave(mulberry(1000 * d + i), d, rule);
      if (!w) throw new Error(`onda fixa inválida: ${rule}`);
      out.push(waveRound(w, d));
    });
  }
  return out;
}

export { CATCH_RULES };
