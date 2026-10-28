/**
 * "Chuva de código" (jogo de coletar): expressões JavaScript caem em 3 pistas e a pessoa move
 * o coletor para pegar só as que obedecem à regra da onda. O valor de cada expressão é
 * calculado executando a própria expressão (não escrito à mão), então não há gabarito errado.
 */
export type CatchRuleId = "par" | "maior-que-10" | "multiplo-de-3" | "menor-que-5" | "verdadeiro" | "texto" | "numero" | "falso" | "igual-a-12";

export interface CatchRule {
  id: CatchRuleId;
  label: string;
  /** Tipo de expressão que a regra usa. */
  pool: "numero" | "booleano" | "misto";
  test: (v: unknown) => boolean;
  explain: string;
}

export const CATCH_RULES: Record<CatchRuleId, CatchRule> = {
  par: { id: "par", label: "Pegue as que dão número PAR", pool: "numero", test: (v) => typeof v === "number" && v % 2 === 0, explain: "Par é o número com resto 0 na divisão por 2." },
  "maior-que-10": { id: "maior-que-10", label: "Pegue as que dão MAIS que 10", pool: "numero", test: (v) => typeof v === "number" && v > 10, explain: "Calcule o valor antes de comparar com 10." },
  "multiplo-de-3": { id: "multiplo-de-3", label: "Pegue as que dão múltiplo de 3", pool: "numero", test: (v) => typeof v === "number" && v % 3 === 0, explain: "Múltiplo de 3 tem resto 0 na divisão por 3 (0, 3, 6, 9...)." },
  "menor-que-5": { id: "menor-que-5", label: "Pegue as que dão MENOS que 5", pool: "numero", test: (v) => typeof v === "number" && v < 5, explain: "Resultados negativos também são menores que 5." },
  numero: { id: "numero", label: "Pegue as que resultam em NÚMERO", pool: "misto", test: (v) => typeof v === "number", explain: "* converte texto em número (\"3\" * 2 é 6); + com texto junta (\"3\" + 2 é \"32\")." },
  "igual-a-12": { id: "igual-a-12", label: "Pegue as que dão exatamente 12", pool: "numero", test: (v) => v === 12, explain: "Lembre da precedência: * e / vêm antes de + e -." },
  verdadeiro: { id: "verdadeiro", label: "Pegue as que dão true", pool: "booleano", test: (v) => v === true, explain: "&& só é true se os dois lados forem; || basta um; ! inverte." },
  falso: { id: "falso", label: "Pegue as que dão false", pool: "booleano", test: (v) => v === false, explain: "=== compara valor E tipo: 5 === \"5\" é false." },
  texto: { id: "texto", label: "Pegue as que resultam em TEXTO (string)", pool: "misto", test: (v) => typeof v === "string", explain: "Se um dos lados do + é texto, o resultado é texto." },
};

/** Regras de cada dificuldade (da mais simples para a mais traiçoeira). */
export const RULES_BY_DIFFICULTY: Record<1 | 2 | 3, CatchRuleId[]> = {
  1: ["par", "maior-que-10", "multiplo-de-3", "menor-que-5"],
  2: ["verdadeiro", "texto", "igual-a-12", "numero"],
  3: ["falso", "texto", "igual-a-12", "verdadeiro"],
};

type Rand = () => number;
const int = (r: Rand, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const pick = <T,>(r: Rand, xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;

const NUM: Record<1 | 2 | 3, Array<(r: Rand) => string>> = {
  1: [(r) => `${int(r, 1, 15)} + ${int(r, 1, 15)}`, (r) => `${int(r, 2, 9)} * ${int(r, 1, 4)}`, (r) => `${int(r, 10, 30)} - ${int(r, 1, 15)}`],
  2: [(r) => `${int(r, 10, 40)} % ${int(r, 3, 7)}`, (r) => `Math.max(${int(r, 1, 20)}, ${int(r, 1, 20)})`, (r) => `[${Array.from({ length: int(r, 2, 6) }, () => int(r, 1, 9)).join(", ")}].length * ${int(r, 1, 4)}`, (r) => `${int(r, 2, 6)} + ${int(r, 2, 5)} * ${int(r, 1, 3)}`],
  3: [(r) => `(${int(r, 1, 6)} + ${int(r, 1, 6)}) * ${int(r, 1, 3)}`, (r) => `${int(r, 1, 6)} + ${int(r, 1, 6)} * ${int(r, 1, 3)}`, (r) => `Math.floor(${int(r, 10, 50)} / ${int(r, 2, 6)})`, (r) => `${int(r, 20, 40)} - ${int(r, 2, 9)} * 2`, (r) => `${int(r, 2, 4)} ** 2 + ${int(r, 0, 3)}`],
};
const BOOL: Record<1 | 2 | 3, Array<(r: Rand) => string>> = {
  1: [(r) => `${int(r, 1, 20)} > ${int(r, 1, 20)}`, (r) => `${int(r, 1, 9)} === ${int(r, 1, 9)}`],
  2: [(r) => `${int(r, 1, 20)} > ${int(r, 1, 20)} && ${int(r, 1, 20)} < ${int(r, 1, 20)}`, (r) => { const n = int(r, 1, 9); return `${n} === "${r() < 0.5 ? n : n + 1}"`; }, (r) => `${int(r, 1, 9)} !== ${int(r, 1, 9)}`, (r) => `!(${int(r, 1, 9)} > ${int(r, 1, 9)})`],
  3: [(r) => { const n = int(r, 1, 9); return `${n} == "${n}"`; }, (r) => `${int(r, 1, 9)} > ${int(r, 1, 9)} || ${int(r, 10, 20)} < ${int(r, 1, 9)}`, () => `"" === 0`, () => `[] === []`, (r) => `${int(r, 1, 9)} % 2 === 0 && ${int(r, 1, 9)} > 4`, () => `null == undefined`, () => `NaN === NaN`],
};
const MIXED: Array<(r: Rand) => string> = [
  (r) => `"${int(r, 1, 9)}" + ${int(r, 1, 9)}`,
  (r) => `${int(r, 1, 9)} + ${int(r, 1, 9)}`,
  (r) => `${int(r, 1, 9)} + ${int(r, 1, 9)} + "${int(r, 0, 9)}"`,
  (r) => `"${pick(r, ["a", "oi", "js"])}".length`,
  (r) => `String(${int(r, 1, 99)})`,
  (r) => `Number("${int(r, 1, 99)}")`,
  (r) => `${int(r, 1, 9)} * "${int(r, 1, 9)}"`,
  (r) => `"${pick(r, ["ab", "x", "Oi"])}".toUpperCase()`,
  (r) => `typeof ${int(r, 1, 9)}`,
];

/** Valor real da expressão (executada). Só recebe expressões geradas aqui. */
export function evaluate(code: string): unknown {
  return new Function(`return (${code});`)();
}

export function formatValue(v: unknown): string {
  return typeof v === "string" ? JSON.stringify(v) : String(v);
}

export interface Wave {
  rule: CatchRule;
  drops: Array<{ id: string; code: string; lane: number }>;
  targets: string[];
  values: Record<string, string>;
}

const WAVE_SIZE: Record<1 | 2 | 3, number> = { 1: 8, 2: 10, 3: 12 };

/** Monta uma onda válida: pelo menos 3 alvos e 3 iscas, sem expressões repetidas. */
export function buildWave(r: Rand, difficulty: 1 | 2 | 3, ruleId: CatchRuleId): Wave | null {
  const rule = CATCH_RULES[ruleId];
  const size = WAVE_SIZE[difficulty];
  const gens = rule.pool === "numero" ? [...NUM[1], ...(difficulty > 1 ? NUM[2] : []), ...(difficulty > 2 ? NUM[3] : [])] : rule.pool === "booleano" ? [...BOOL[1], ...(difficulty > 1 ? BOOL[2] : []), ...(difficulty > 2 ? BOOL[3] : [])] : MIXED;
  const seen = new Set<string>();
  const yes: string[] = [];
  const no: string[] = [];
  for (let tries = 0; tries < 400 && (yes.length < size / 2 || no.length < size / 2); tries++) {
    const code = pick(r, gens)(r);
    if (seen.has(code)) continue;
    seen.add(code);
    const ok = rule.test(evaluate(code));
    if (ok && yes.length < Math.ceil(size / 2)) yes.push(code);
    else if (!ok && no.length < Math.floor(size / 2)) no.push(code);
  }
  if (yes.length < 3 || no.length < 3) return null;
  const all = [...yes, ...no];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  const drops = all.map((code, i) => ({ id: `e${i + 1}`, code, lane: int(r, 0, 2) }));
  const values = Object.fromEntries(drops.map((d) => [d.id, formatValue(evaluate(d.code))]));
  return { rule, drops, targets: drops.filter((d) => yes.includes(d.code)).map((d) => d.id), values };
}

/** Gerador simples e determinístico (para as ondas cadastradas). */
export function mulberry(seed: number): Rand {
  let h = seed >>> 0;
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
