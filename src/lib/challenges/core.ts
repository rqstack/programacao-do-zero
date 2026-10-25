import type { CodeChallenge, Rng, SqlChallenge, ValueType } from "@content/challenges";

import type { ChallengeLang } from "./langs";
import { isRemote, remoteStarter } from "./remote";
export type { ChallengeLang };

export const LANG_LABEL: Record<ChallengeLang, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  sql: "SQL",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
};

/** Linguagens que rodam no navegador (as outras vão para o Judge0). */
type LocalLang = "javascript" | "typescript" | "python";

/** Gerador pseudoaleatório com semente (mulberry32): mesma semente, mesmos casos. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (list) => list[Math.floor(next() * list.length)]!,
    bool: () => next() < 0.5,
  };
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

/** somaLista → soma_lista (nomes em Python). */
export function snake(name: string): string {
  return name.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

const TS_TYPE: Record<ValueType, string> = { number: "number", string: "string", boolean: "boolean", "number[]": "number[]", "string[]": "string[]" };

function signature(ch: CodeChallenge, lang: LocalLang): string {
  if (lang === "python") return `def ${snake(ch.fn)}(${ch.params.map((p) => snake(p.name)).join(", ")}):`;
  if (lang === "typescript") return `function ${ch.fn}(${ch.params.map((p) => `${p.name}: ${TS_TYPE[p.type]}`).join(", ")}): ${TS_TYPE[ch.returns]} {`;
  return `function ${ch.fn}(${ch.params.map((p) => p.name).join(", ")}) {`;
}

/** Código inicial. Nas linguagens compiladas vem o programa completo, como na Batalha. */
export function starterCode(ch: CodeChallenge, lang: Exclude<ChallengeLang, "sql">): string {
  if (isRemote(lang)) return remoteStarter(ch, lang);
  if (lang === "python") return `${signature(ch, lang)}\n    # escreva sua solução aqui\n    pass\n`;
  return `${signature(ch, lang)}\n  // escreva sua solução aqui\n\n}\n`;
}

/** Solução de referência. Nas linguagens compiladas mostramos a de Python (a lógica é a mesma). */
export function solutionCode(ch: CodeChallenge, lang: Exclude<ChallengeLang, "sql">): string {
  if (isRemote(lang)) return `# Solução de referência em Python. A lógica é a mesma em ${LANG_LABEL[lang]}.\n${signature(ch, "python")}\n${ch.py}\n`;
  if (lang === "python") return `${signature(ch, lang)}\n${ch.py}\n`;
  return `${signature(ch, lang)}\n${ch.js}\n}\n`;
}

/** Nome que a função tem na linguagem escolhida. */
export function fnName(ch: CodeChallenge, lang: Exclude<ChallengeLang, "sql">): string {
  return lang === "python" ? snake(ch.fn) : ch.fn;
}

/** Executa a solução de referência (conteúdo nosso, confiável) para obter o esperado. */
export function expectedOf(ch: CodeChallenge, args: readonly unknown[]): unknown {
  const f = new Function(...ch.params.map((p) => p.name), ch.js) as (...a: unknown[]) => unknown;
  return f(...structuredClone(args as unknown[]));
}

export interface TestCase {
  args: unknown[];
  expected: unknown;
  /** Caso escondido: no envio só mostramos a entrada do primeiro que falhar. */
  hidden: boolean;
}

/** Exemplos (visíveis) + casos-limite e casos aleatórios gerados a partir da semente. */
export function buildCases(ch: CodeChallenge, seed: number, mode: "examples" | "submit", randomCount = 12): TestCase[] {
  const visible = ch.examples.map((args) => ({ args, expected: expectedOf(ch, args), hidden: false }));
  if (mode === "examples") return visible;
  const r = makeRng(seed);
  const extra = [...(ch.edge ?? []), ...Array.from({ length: randomCount }, () => ch.generate(r))];
  return [...visible, ...extra.map((args) => ({ args, expected: expectedOf(ch, args), hidden: true }))];
}

/** Igualdade estrutural; números com tolerância (0.1 + 0.2 conta como 0.3). */
export function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    return ka.length === kb.length && ka.every((k, i) => k === kb[i] && sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

/** Mostra um valor como ele seria escrito na linguagem do aluno. */
export function formatValue(v: unknown, lang: ChallengeLang): string {
  if (lang === "python") {
    if (v === true) return "True";
    if (v === false) return "False";
    if (v === null || v === undefined) return "None";
    if (Array.isArray(v)) return `[${v.map((x) => formatValue(x, lang)).join(", ")}]`;
  }
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return `[${v.map((x) => formatValue(x, lang)).join(", ")}]`;
  return JSON.stringify(v);
}

export function formatArgs(args: readonly unknown[], lang: ChallengeLang): string {
  return args.map((a) => formatValue(a, lang)).join(", ");
}

// ---------- SQL ----------
export interface SqlTable {
  columns: string[];
  rows: unknown[][];
}

const norm = (v: unknown) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v);

/**
 * Compara o resultado do aluno com o da referência: mesmos valores e mesma quantidade de
 * colunas (os nomes das colunas não importam). A ordem só conta quando o enunciado pede.
 */
export function sameTable(got: SqlTable, want: SqlTable, ordered: boolean): boolean {
  if (got.columns.length !== want.columns.length || got.rows.length !== want.rows.length) return false;
  const key = (row: unknown[]) => JSON.stringify(row.map(norm));
  const a = got.rows.map(key);
  const b = want.rows.map(key);
  if (!ordered) {
    a.sort();
    b.sort();
  }
  return a.every((k, i) => k === b[i]);
}

/** Sorteia um desafio da dificuldade escolhida, preferindo os ainda não resolvidos. */
export function pickChallenge<T extends CodeChallenge | SqlChallenge>(list: readonly T[], solved: ReadonlySet<string>, exclude?: string): T | null {
  if (list.length === 0) return null;
  const pending = list.filter((c) => !solved.has(c.id) && c.id !== exclude);
  const pool = pending.length > 0 ? pending : list.filter((c) => c.id !== exclude);
  const final = pool.length > 0 ? pool : list;
  return final[Math.floor(Math.random() * final.length)]!;
}
