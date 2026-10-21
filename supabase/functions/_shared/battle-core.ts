/**
 * Batalha de Código — núcleo compartilhado entre o site (Next.js) e a Edge Function (Deno).
 * Sem imports: o mesmo arquivo roda nos dois ambientes.
 *
 * CONFIGURAÇÃO CENTRAL: arenas, troféus, tempos e limites ficam aqui. O banco recebe uma
 * cópia (supabase/battle-config.sql, gerado por `npm run battle:config`) e um teste
 * garante que as duas versões estão iguais.
 */

// ---------------------------------------------------------------------------
// Linguagens (só entram as que o executor isolado roda e valida de verdade)
// ---------------------------------------------------------------------------
export const BATTLE_LANGS = ["javascript", "python", "java", "c"] as const;
export type BattleLang = (typeof BATTLE_LANGS)[number];

export const LANG_INFO: Record<BattleLang, { label: string; judge0Id: number; version: string; cpuSeconds: number; memoryKb: number }> = {
  javascript: { label: "JavaScript", judge0Id: 102, version: "Node.js 22", cpuSeconds: 3, memoryKb: 192_000 },
  python: { label: "Python", judge0Id: 100, version: "Python 3.12", cpuSeconds: 4, memoryKb: 128_000 },
  java: { label: "Java", judge0Id: 91, version: "JDK 17", cpuSeconds: 4, memoryKb: 256_000 },
  c: { label: "C", judge0Id: 103, version: "GCC 14", cpuSeconds: 2, memoryKb: 128_000 },
};

// ---------------------------------------------------------------------------
// Arenas e troféus
// ---------------------------------------------------------------------------
export interface Arena {
  id: number;
  slug: string;
  name: string;
  /** Troféus mínimos para estar nesta arena. */
  minTrophies: number;
  /** Nível dos desafios sorteados (1 = mais fácil). */
  tier: number;
  /** Duração da partida, em segundos. */
  durationSec: number;
  /** Troféus ganhos na vitória e perdidos na derrota (antes do ajuste por diferença). */
  win: number;
  loss: number;
  /** Se verdadeiro, ninguém cai abaixo do piso desta arena ao perder (proteção de iniciantes). */
  floorProtected: boolean;
  topics: string;
  /** Cor de destaque da arena (identidade visual). */
  color: string;
  reward: string;
}

export const ARENAS: readonly Arena[] = [
  { id: 1, slug: "terminal-inicial", name: "Terminal Inicial", minTrophies: 0, tier: 1, durationSec: 180, win: 30, loss: 0, floorProtected: true, topics: "Variáveis, contas e condicionais", color: "#3b82f6", reward: "Moldura Terminal" },
  { id: 2, slug: "vale-dos-lacos", name: "Vale dos Laços", minTrophies: 150, tier: 2, durationSec: 210, win: 30, loss: 10, floorProtected: true, topics: "Laços de repetição e strings", color: "#22c55e", reward: "Moldura Laço Infinito" },
  { id: 3, slug: "biblioteca-das-listas", name: "Biblioteca das Listas", minTrophies: 400, tier: 3, durationSec: 240, win: 30, loss: 15, floorProtected: false, topics: "Arrays, funções e manipulação de dados", color: "#eab308", reward: "Moldura Índice Zero" },
  { id: 4, slug: "fabrica-de-funcoes", name: "Fábrica de Funções", minTrophies: 800, tier: 4, durationSec: 270, win: 30, loss: 20, floorProtected: false, topics: "Lógica elaborada e contagens", color: "#f97316", reward: "Moldura Engrenagem" },
  { id: 5, slug: "torre-dos-algoritmos", name: "Torre dos Algoritmos", minTrophies: 1300, tier: 5, durationSec: 300, win: 30, loss: 25, floorProtected: false, topics: "Algoritmos clássicos e estruturas de dados", color: "#a855f7", reward: "Moldura Pilha" },
  { id: 6, slug: "nucleo-do-kernel", name: "Núcleo do Kernel", minTrophies: 2000, tier: 6, durationSec: 330, win: 30, loss: 30, floorProtected: false, topics: "Eficiência com entradas grandes", color: "#ef4444", reward: "Moldura Kernel" },
];

export const BATTLE_RULES = {
  /** Contagem regressiva antes do desafio aparecer, igual para os dois. */
  countdownSec: 5,
  /** Ajuste por diferença de troféus: +1 troféu a cada `diffStep` de diferença, até `diffCap`. */
  diffStep: 25,
  diffCap: 10,
  /** Quem abandona (desiste ou some) perde a derrota normal mais isto. */
  abandonExtraLoss: 5,
  /** Sem sinal do jogador por este tempo durante a partida = abandono. */
  abandonAfterSec: 45,
  /** Envios: limite por partida, intervalo mínimo e tamanho máximo do código. */
  maxSubmissions: 12,
  minSecondsBetweenSubmissions: 5,
  maxCodeBytes: 20_000,
  /** Tempo extra para terminar de corrigir envios feitos antes do fim. */
  judgeGraceSec: 60,
  /** Fila: diferença aceita começa em `windowBase` e cresce `windowPerSec` por segundo de espera. */
  windowBase: 100,
  windowPerSec: 20,
  /** Sem sinal na fila por este tempo = sai da fila. */
  queueStaleSec: 20,
} as const;

export function arenaFor(trophies: number): Arena {
  let found = ARENAS[0]!;
  for (const a of ARENAS) if (trophies >= a.minTrophies) found = a;
  return found;
}

/** Variação de troféus de uma partida decidida (mesma regra do banco: battle_trophy_delta). */
export function trophyDelta(me: number, opponent: number, outcome: "vitoria" | "derrota" | "abandono"): number {
  const arena = arenaFor(me);
  const adj = Math.max(-BATTLE_RULES.diffCap, Math.min(BATTLE_RULES.diffCap, Math.trunc((opponent - me) / BATTLE_RULES.diffStep)));
  if (outcome === "vitoria") return Math.max(5, arena.win + adj);
  const base = arena.loss === 0 ? 0 : Math.max(0, arena.loss - adj) + (outcome === "abandono" ? BATTLE_RULES.abandonExtraLoss : 0);
  const after = me - base;
  const loss = arena.floorProtected && after < arena.minTrophies ? me - arena.minTrophies : Math.min(base, me);
  return loss === 0 ? 0 : -loss;
}

// ---------------------------------------------------------------------------
// Assinatura dos desafios e código inicial (entrada e saída padrão)
// ---------------------------------------------------------------------------
export type ParamType = "int" | "str" | "bool" | "int[]";
export interface Signature {
  params: Array<{ name: string; type: ParamType }>;
  returns: ParamType;
}

/**
 * Formato da entrada: 1ª linha = quantidade de casos (T). Para cada caso, cada parâmetro na
 * ordem: int → uma linha; str → uma linha; bool → "true"/"false"; int[] → uma linha com o
 * tamanho e outra com os números separados por espaço. Saída: uma linha por caso.
 */
export function encodeInput(sig: Signature, cases: unknown[][]): string {
  const out: string[] = [String(cases.length)];
  for (const args of cases) {
    sig.params.forEach((p, i) => {
      const v = args[i];
      if (p.type === "int[]") {
        const arr = v as number[];
        out.push(String(arr.length), arr.join(" "));
      } else if (p.type === "bool") out.push(v ? "true" : "false");
      else out.push(String(v));
    });
  }
  return out.join("\n") + "\n";
}

export function formatValue(type: ParamType, v: unknown): string {
  if (type === "int[]") return (v as number[]).join(" ");
  if (type === "bool") return v ? "true" : "false";
  return String(v);
}

/** Compara a saída do programa com o esperado, linha a linha (ignora espaços no fim e \r). */
export function compareOutput(stdout: string, expected: string[]): { ok: boolean; firstWrong: number | null } {
  const got = stdout.replace(/\r/g, "").split("\n").map((l) => l.trimEnd());
  for (let i = 0; i < expected.length; i++) {
    if ((got[i] ?? null) !== expected[i]!.trimEnd()) return { ok: false, firstWrong: i };
  }
  // Linhas a mais só são aceitas se forem vazias.
  if (got.slice(expected.length).some((l) => l !== "")) return { ok: false, firstWrong: expected.length };
  return { ok: true, firstWrong: null };
}

const HARNESS_NOTE = "Não precisa mexer daqui para baixo: lê a entrada e imprime a resposta.";

function jsStarter(sig: Signature): string {
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `    const ${p.name} = Number(ler());`
        : p.type === "bool"
          ? `    const ${p.name} = ler().trim() === "true";`
          : p.type === "str"
            ? `    const ${p.name} = ler();`
            : `    const ${p.name} = lerLista();`,
    )
    .join("\n");
  const fmt = sig.returns === "int[]" ? 'r.join(" ")' : "String(r)";
  return `function resolver(${names}) {
  // escreva sua solução aqui
  return ${defaultReturn(sig.returns, "javascript")};
}

// ---- ${HARNESS_NOTE}
const linhas = require("fs").readFileSync(0, "utf8").split("\\n");
let pos = 0;
const ler = () => (linhas[pos++] ?? "").replace(/\\r$/, "");
const lerLista = () => {
  const n = Number(ler());
  const l = ler().trim();
  return n === 0 ? [] : l.split(/\\s+/).map(Number);
};
const t = Number(ler());
const saida = [];
for (let caso = 0; caso < t; caso++) {
${reads}
    const r = resolver(${names});
    saida.push(${fmt});
}
console.log(saida.join("\\n"));
`;
}

function pyStarter(sig: Signature): string {
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `    ${p.name} = int(ler())`
        : p.type === "bool"
          ? `    ${p.name} = ler().strip() == "true"`
          : p.type === "str"
            ? `    ${p.name} = ler()`
            : `    ${p.name} = ler_lista()`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]" ? '" ".join(str(x) for x in r)' : sig.returns === "bool" ? '"true" if r else "false"' : "str(r)";
  return `def resolver(${names}):
    # escreva sua solução aqui
    return ${defaultReturn(sig.returns, "python")}


# ---- ${HARNESS_NOTE}
import sys

linhas = sys.stdin.read().split("\\n")
pos = 0


def ler():
    global pos
    pos += 1
    return linhas[pos - 1].rstrip("\\r") if pos - 1 < len(linhas) else ""


def ler_lista():
    n = int(ler())
    return [int(x) for x in ler().split()][:n]


t = int(ler())
saida = []
for _ in range(t):
${reads}
    r = resolver(${names})
    saida.append(${fmt})
print("\\n".join(saida))
`;
}

const JAVA_TYPE: Record<ParamType, string> = { int: "int", str: "String", bool: "boolean", "int[]": "int[]" };

function javaStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${JAVA_TYPE[p.type]} ${p.name}`).join(", ");
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `            int ${p.name} = Integer.parseInt(ler(in).trim());`
        : p.type === "bool"
          ? `            boolean ${p.name} = ler(in).trim().equals("true");`
          : p.type === "str"
            ? `            String ${p.name} = ler(in);`
            : `            int[] ${p.name} = lerLista(in);`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]"
      ? `            for (int i = 0; i < r.length; i++) { if (i > 0) out.append(' '); out.append(r[i]); }`
      : `            out.append(r);`;
  return `import java.io.*;
import java.util.*;

public class Main {
    static ${JAVA_TYPE[sig.returns]} resolver(${params}) {
        // escreva sua solução aqui
        return ${defaultReturn(sig.returns, "java")};
    }

    // ---- ${HARNESS_NOTE}
    static String ler(BufferedReader in) throws IOException {
        String s = in.readLine();
        return s == null ? "" : s;
    }

    static int[] lerLista(BufferedReader in) throws IOException {
        int n = Integer.parseInt(ler(in).trim());
        StringTokenizer st = new StringTokenizer(ler(in));
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = Integer.parseInt(st.nextToken());
        return v;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(ler(in).trim());
        StringBuilder out = new StringBuilder();
        for (int caso = 0; caso < t; caso++) {
${reads}
            ${JAVA_TYPE[sig.returns]} r = resolver(${names});
${fmt}
            out.append('\\n');
        }
        System.out.print(out);
    }
}
`;
}

function cStarter(sig: Signature): string {
  const params = sig.params.map((p) => (p.type === "int" ? `int ${p.name}` : p.type === "bool" ? `bool ${p.name}` : p.type === "str" ? `const char *${p.name}` : `int *${p.name}, int n_${p.name}`));
  const args = sig.params.map((p) => (p.type === "int[]" ? `${p.name}, n_${p.name}` : p.name));
  let ret = "int";
  if (sig.returns === "bool") ret = "bool";
  if (sig.returns === "str") {
    ret = "void";
    params.push("char *resposta");
    args.push("resposta");
  }
  if (sig.returns === "int[]") {
    params.push("int *resposta");
    args.push("resposta");
  }
  const doc =
    sig.returns === "str"
      ? "/* Escreva a resposta em `resposta` (já tem espaço reservado). */\n"
      : sig.returns === "int[]"
        ? "/* Escreva os números em `resposta` e devolva quantos são. */\n"
        : "";
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `        int ${p.name} = atoi(ler());`
        : p.type === "bool"
          ? `        bool ${p.name} = strcmp(ler(), "true") == 0;`
          : p.type === "str"
            ? `        char *${p.name} = strdup(ler());`
            : `        int n_${p.name} = atoi(ler());\n        int *${p.name} = malloc(sizeof(int) * (n_${p.name} + 1));\n        char *p_${p.name} = ler();\n        for (int i = 0; i < n_${p.name}; i++) ${p.name}[i] = (int) strtol(p_${p.name}, &p_${p.name}, 10);`,
    )
    .join("\n");
  const frees = sig.params
    .filter((p) => p.type === "str" || p.type === "int[]")
    .map((p) => `        free(${p.name});`)
    .join("\n");
  let call = "";
  if (sig.returns === "int") call = `        printf("%d\\n", resolver(${args.join(", ")}));`;
  else if (sig.returns === "bool") call = `        printf("%s\\n", resolver(${args.join(", ")}) ? "true" : "false");`;
  else if (sig.returns === "str") call = `        resposta[0] = '\\0';\n        resolver(${args.join(", ")});\n        printf("%s\\n", resposta);`;
  else call = `        int tam = resolver(${args.join(", ")});\n        for (int i = 0; i < tam; i++) printf(i ? " %d" : "%d", resposta[i]);\n        printf("\\n");`;
  const body = sig.returns === "str" ? "    // escreva sua solução aqui\n" : `    // escreva sua solução aqui\n    return ${defaultReturn(sig.returns, "c")};\n`;
  const buffer = sig.returns === "str" ? "static char resposta[1 << 20];\n" : sig.returns === "int[]" ? "static int resposta[1 << 18];\n" : "";
  return `#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${doc}${ret} resolver(${params.join(", ")}) {
${body}}

/* ---- ${HARNESS_NOTE} */
static char linha[1 << 21];
${buffer}
static char *ler(void) {
    if (!fgets(linha, sizeof linha, stdin)) linha[0] = '\\0';
    linha[strcspn(linha, "\\r\\n")] = '\\0';
    return linha;
}

int main(void) {
    int t = atoi(ler());
    for (int caso = 0; caso < t; caso++) {
${reads}
${call}
${frees}
    }
    return 0;
}
`;
}

function defaultReturn(type: ParamType, lang: BattleLang): string {
  if (type === "int") return "0";
  if (type === "bool") return lang === "python" ? "False" : "false";
  if (type === "str") return lang === "python" ? '""' : lang === "c" ? "" : '""';
  return lang === "python" ? "[]" : lang === "java" ? "new int[0]" : lang === "c" ? "0" : "[]";
}

export function starterCode(sig: Signature, lang: BattleLang): string {
  if (lang === "javascript") return jsStarter(sig);
  if (lang === "python") return pyStarter(sig);
  if (lang === "java") return javaStarter(sig);
  return cStarter(sig);
}

/** Substitui o corpo de `resolver` no código inicial por outro (usado para validar o banco). */
export function withSolution(sig: Signature, lang: BattleLang, body: string): string {
  const lines = starterCode(sig, lang).split("\n");
  const i = lines.findIndex((l) => l.includes("escreva sua solução aqui"));
  if (i < 0) throw new Error("marcador não encontrado");
  // Troca o marcador (e o "return" padrão logo abaixo, se houver) pelo corpo da solução.
  const skip = /^\s*return\b/.test(lines[i + 1] ?? "") ? 2 : 1;
  lines.splice(i, skip, ...body.replace(/\n$/, "").split("\n"));
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Banco de desafios (o conteúdo fica em um arquivo privado; aqui só o formato)
// ---------------------------------------------------------------------------
export interface Rng {
  int: (min: number, max: number) => number;
  pick: <T>(list: readonly T[]) => T;
  bool: () => boolean;
}

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { int: (min, max) => min + Math.floor(next() * (max - min + 1)), pick: (l) => l[Math.floor(next() * l.length)]!, bool: () => next() < 0.5 };
}

export interface BattleChallenge {
  id: string;
  tier: number;
  title: string;
  /** Parágrafos separados por linha em branco; aceita `código` e **negrito**. */
  statement: string;
  constraints: string[];
  signature: Signature;
  /** Exemplos públicos (só argumentos; a saída vem da referência). */
  examples: unknown[][];
  /** Casos ocultos fixos (limites) + gerador de casos aleatórios. Nunca vão ao navegador. */
  edge: unknown[][];
  generate: (r: Rng) => unknown[];
  /** Quantos casos aleatórios gerar a cada envio. */
  randomCases: number;
  /** Solução de referência (JS). Nunca vai ao navegador. */
  reference: (...args: never[]) => unknown;
  /** Soluções nas 4 linguagens, só para o teste que valida o banco no executor. */
  solutions: Record<BattleLang, string>;
}

/** Parte pública de um desafio (o que o navegador recebe no início da partida). */
export function publicPart(ch: BattleChallenge) {
  return {
    id: ch.id,
    tier: ch.tier,
    title: ch.title,
    statement: ch.statement,
    constraints: ch.constraints,
    signature: ch.signature,
    examples: ch.examples.map((args) => ({ input: args, output: formatValue(ch.signature.returns, (ch.reference as (...a: unknown[]) => unknown)(...structuredClone(args))) })),
  };
}

/** Monta a entrada e as saídas esperadas de um envio (exemplos + limites + aleatórios). */
export function buildJudgeCases(ch: BattleChallenge, seed: number): { stdin: string; expected: string[]; cases: unknown[][] } {
  const r = makeRng(seed);
  const cases = [...ch.examples, ...ch.edge, ...Array.from({ length: ch.randomCases }, () => ch.generate(r))];
  const ref = ch.reference as (...a: unknown[]) => unknown;
  const expected = cases.map((args) => formatValue(ch.signature.returns, ref(...structuredClone(args))));
  return { stdin: encodeInput(ch.signature, cases), expected, cases };
}
