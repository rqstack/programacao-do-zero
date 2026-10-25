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
export const BATTLE_LANGS = ["javascript", "typescript", "python", "java", "c", "cpp", "csharp", "go", "rust", "php"] as const;
export type BattleLang = (typeof BATTLE_LANGS)[number];

export interface LangInfo {
  label: string;
  judge0Id: number;
  version: string;
  cpuSeconds: number;
  memoryKb: number;
  /** Opções extras do compilador (campo compiler_options do Judge0). */
  compilerOptions?: string;
}

export const LANG_INFO: Record<BattleLang, LangInfo> = {
  javascript: { label: "JavaScript", judge0Id: 102, version: "Node.js 22", cpuSeconds: 3, memoryKb: 192_000 },
  // O TypeScript do Judge0 leva ~2,5 s só para iniciar o ambiente, por isso o limite é maior.
  typescript: { label: "TypeScript", judge0Id: 101, version: "TypeScript 5.6", cpuSeconds: 8, memoryKb: 256_000, compilerOptions: "--target es2020 --lib es2020,dom" },
  python: { label: "Python", judge0Id: 100, version: "Python 3.12", cpuSeconds: 4, memoryKb: 128_000 },
  java: { label: "Java", judge0Id: 91, version: "JDK 17", cpuSeconds: 4, memoryKb: 256_000 },
  c: { label: "C", judge0Id: 103, version: "GCC 14", cpuSeconds: 2, memoryKb: 128_000 },
  cpp: { label: "C++", judge0Id: 105, version: "GCC 14", cpuSeconds: 2, memoryKb: 128_000, compilerOptions: "-O2" },
  csharp: { label: "C#", judge0Id: 51, version: "Mono 6.6", cpuSeconds: 4, memoryKb: 256_000 },
  // Go 1.22+ estoura o tempo de compilação no Judge0 público; a 1.18 compila rápido.
  go: { label: "Go", judge0Id: 95, version: "Go 1.18", cpuSeconds: 3, memoryKb: 256_000 },
  rust: { label: "Rust", judge0Id: 108, version: "Rust 1.85", cpuSeconds: 3, memoryKb: 256_000, compilerOptions: "--edition 2021 -O" },
  php: { label: "PHP", judge0Id: 98, version: "PHP 8.3", cpuSeconds: 4, memoryKb: 256_000 },
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
  { id: 7, slug: "labirinto-dos-grafos", name: "Labirinto dos Grafos", minTrophies: 2800, tier: 7, durationSec: 420, win: 30, loss: 35, floorProtected: false, topics: "Grades, grafos e buscas", color: "#14b8a6", reward: "Moldura Labirinto" },
  { id: 8, slug: "camara-da-memoria", name: "Câmara da Memória", minTrophies: 3700, tier: 8, durationSec: 480, win: 30, loss: 40, floorProtected: false, topics: "Programação dinâmica", color: "#ec4899", reward: "Moldura Memo" },
  { id: 9, slug: "trono-do-compilador", name: "Trono do Compilador", minTrophies: 4800, tier: 9, durationSec: 540, win: 30, loss: 45, floorProtected: false, topics: "Otimização e algoritmos avançados", color: "#f59e0b", reward: "Moldura Compilador Lendário" },
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
/** "float" só aparece como retorno (média nos desafios de código); a Batalha usa os outros quatro. */
export type ParamType = "int" | "str" | "bool" | "int[]" | "float";
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

const JAVA_TYPE: Record<ParamType, string> = { int: "int", str: "String", bool: "boolean", "int[]": "int[]", float: "double" };

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
  if (sig.returns === "float") ret = "double";
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
  else if (sig.returns === "float") call = `        printf("%.15g\\n", resolver(${args.join(", ")}));`;
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

const TS_TYPE: Record<ParamType, string> = { int: "number", str: "string", bool: "boolean", "int[]": "number[]", float: "number" };

function tsStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${p.name}: ${TS_TYPE[p.type]}`).join(", ");
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
  return `function resolver(${params}): ${TS_TYPE[sig.returns]} {
  // escreva sua solução aqui
  return ${defaultReturn(sig.returns, "typescript")};
}

// ---- ${HARNESS_NOTE}
declare const require: any;
const linhas: string[] = require("fs").readFileSync(0, "utf8").split("\\n");
let pos = 0;
const ler = (): string => (linhas[pos++] ?? "").replace(/\\r$/, "");
const lerLista = (): number[] => {
  const n = Number(ler());
  const l = ler().trim();
  return n === 0 ? [] : l.split(/\\s+/).map(Number);
};
const t = Number(ler());
const saida: string[] = [];
for (let caso = 0; caso < t; caso++) {
${reads}
    const r = resolver(${names});
    saida.push(${fmt});
}
console.log(saida.join("\\n"));
`;
}

const CPP_TYPE: Record<ParamType, string> = { int: "int", str: "string", bool: "bool", "int[]": "vector<int>", float: "double" };

function cppStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${CPP_TYPE[p.type]} ${p.name}`).join(", ");
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `        int ${p.name} = stoi(ler());`
        : p.type === "bool"
          ? `        bool ${p.name} = ler() == "true";`
          : p.type === "str"
            ? `        string ${p.name} = ler();`
            : `        vector<int> ${p.name} = lerLista();`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]"
      ? `        for (size_t i = 0; i < r.size(); i++) { if (i) saida << ' '; saida << r[i]; }`
      : sig.returns === "bool"
        ? `        saida << (r ? "true" : "false");`
        : sig.returns === "float"
          ? `        saida << setprecision(15) << r;`
          : `        saida << r;`;
  return `#include <bits/stdc++.h>
using namespace std;

${CPP_TYPE[sig.returns]} resolver(${params}) {
    // escreva sua solução aqui
    return ${defaultReturn(sig.returns, "cpp")};
}

// ---- ${HARNESS_NOTE}
static string ler() {
    string s;
    if (!getline(cin, s)) return "";
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    return s;
}

static vector<int> lerLista() {
    int n = stoi(ler());
    istringstream in(ler());
    vector<int> v(n);
    for (int i = 0; i < n; i++) in >> v[i];
    return v;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = stoi(ler());
    ostringstream saida;
    for (int caso = 0; caso < t; caso++) {
${reads}
        ${CPP_TYPE[sig.returns]} r = resolver(${names});
${fmt}
        saida << '\\n';
    }
    cout << saida.str();
    return 0;
}
`;
}

const CS_TYPE: Record<ParamType, string> = { int: "int", str: "string", bool: "bool", "int[]": "int[]", float: "double" };

function csStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${CS_TYPE[p.type]} ${p.name}`).join(", ");
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `            int ${p.name} = int.Parse(Ler().Trim());`
        : p.type === "bool"
          ? `            bool ${p.name} = Ler().Trim() == "true";`
          : p.type === "str"
            ? `            string ${p.name} = Ler();`
            : `            int[] ${p.name} = LerLista();`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]"
      ? `            saida.Append(string.Join(" ", r));`
      : sig.returns === "bool"
        ? `            saida.Append(r ? "true" : "false");`
        : sig.returns === "float"
          ? `            saida.Append(r.ToString("R", System.Globalization.CultureInfo.InvariantCulture));`
          : `            saida.Append(r);`;
  return `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public class Program
{
    static ${CS_TYPE[sig.returns]} resolver(${params})
    {
        // escreva sua solução aqui
        return ${defaultReturn(sig.returns, "csharp")};
    }

    // ---- ${HARNESS_NOTE}
    static string Ler()
    {
        string s = Console.In.ReadLine();
        return s == null ? "" : s.TrimEnd('\\r');
    }

    static int[] LerLista()
    {
        int n = int.Parse(Ler().Trim());
        string[] partes = Ler().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = int.Parse(partes[i]);
        return v;
    }

    public static void Main()
    {
        int t = int.Parse(Ler().Trim());
        var saida = new StringBuilder();
        for (int caso = 0; caso < t; caso++)
        {
${reads}
            ${CS_TYPE[sig.returns]} r = resolver(${names});
${fmt}
            saida.Append('\\n');
        }
        Console.Write(saida.ToString());
    }
}
`;
}

const GO_TYPE: Record<ParamType, string> = { int: "int", str: "string", bool: "bool", "int[]": "[]int", float: "float64" };

function goStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${p.name} ${GO_TYPE[p.type]}`).join(", ");
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `\t\t${p.name}, _ := strconv.Atoi(strings.TrimSpace(ler()))`
        : p.type === "bool"
          ? `\t\t${p.name} := strings.TrimSpace(ler()) == "true"`
          : p.type === "str"
            ? `\t\t${p.name} := ler()`
            : `\t\t${p.name} := lerLista()`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]"
      ? `\t\tfor i, x := range r {\n\t\t\tif i > 0 {\n\t\t\t\tsaida.WriteByte(' ')\n\t\t\t}\n\t\t\tsaida.WriteString(strconv.Itoa(x))\n\t\t}`
      : sig.returns === "bool"
        ? `\t\tif r {\n\t\t\tsaida.WriteString("true")\n\t\t} else {\n\t\t\tsaida.WriteString("false")\n\t\t}`
        : sig.returns === "str"
          ? `\t\tsaida.WriteString(r)`
          : sig.returns === "float"
            ? `\t\tsaida.WriteString(strconv.FormatFloat(r, 'g', -1, 64))`
            : `\t\tsaida.WriteString(strconv.Itoa(r))`;
  return `package main

import (
\t"bufio"
\t"math"
\t"os"
\t"sort"
\t"strconv"
\t"strings"
)

func resolver(${params}) ${GO_TYPE[sig.returns]} {
\t// escreva sua solução aqui
\treturn ${defaultReturn(sig.returns, "go")}
}

// ---- ${HARNESS_NOTE}
// (math, sort e strings já estão importados para você usar.)
var _ = math.MaxInt64
var _ = sort.Ints
var leitor = bufio.NewReaderSize(os.Stdin, 1<<20)

func ler() string {
\ts, _ := leitor.ReadString('\\n')
\treturn strings.TrimRight(s, "\\r\\n")
}

func lerLista() []int {
\tn, _ := strconv.Atoi(strings.TrimSpace(ler()))
\tcampos := strings.Fields(ler())
\tv := make([]int, n)
\tfor i := 0; i < n; i++ {
\t\tv[i], _ = strconv.Atoi(campos[i])
\t}
\treturn v
}

func main() {
\tt, _ := strconv.Atoi(strings.TrimSpace(ler()))
\tvar saida strings.Builder
\tfor caso := 0; caso < t; caso++ {
${reads}
\t\tr := resolver(${names})
${fmt}
\t\tsaida.WriteByte('\\n')
\t}
\tos.Stdout.WriteString(saida.String())
}
`;
}

const RUST_TYPE: Record<ParamType, string> = { int: "i64", str: "String", bool: "bool", "int[]": "Vec<i64>", float: "f64" };

function rustStarter(sig: Signature): string {
  const params = sig.params.map((p) => `${p.name}: ${RUST_TYPE[p.type]}`).join(", ");
  const names = sig.params.map((p) => p.name).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `        let ${p.name}: i64 = ler().trim().parse().unwrap();`
        : p.type === "bool"
          ? `        let ${p.name}: bool = ler().trim() == "true";`
          : p.type === "str"
            ? `        let ${p.name}: String = ler();`
            : `        let n_${p.name}: usize = ler().trim().parse().unwrap();\n        let ${p.name}: Vec<i64> = ler().split_whitespace().take(n_${p.name}).map(|x| x.parse().unwrap()).collect();`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]"
      ? `        saida.push_str(&r.iter().map(|x| x.to_string()).collect::<Vec<_>>().join(" "));`
      : sig.returns === "bool"
        ? `        saida.push_str(if r { "true" } else { "false" });`
        : sig.returns === "str"
          ? `        saida.push_str(&r);`
          : `        saida.push_str(&r.to_string());`;
  return `#[allow(unused_imports)]
use std::collections::{BTreeMap, HashMap, HashSet, VecDeque};
use std::io::{self, Read};

#[allow(unused_variables, unused_mut)]
fn resolver(${params}) -> ${RUST_TYPE[sig.returns]} {
    // escreva sua solução aqui
    return ${defaultReturn(sig.returns, "rust")};
}

// ---- ${HARNESS_NOTE}
fn main() {
    let mut entrada = String::new();
    io::stdin().read_to_string(&mut entrada).unwrap();
    let mut linhas = entrada.split('\\n').map(|l| l.trim_end_matches('\\r'));
    let mut ler = move || linhas.next().unwrap_or("").to_string();
    let t: usize = ler().trim().parse().unwrap();
    let mut saida = String::new();
    for _ in 0..t {
${reads}
        let r = resolver(${names});
${fmt}
        saida.push('\\n');
    }
    print!("{}", saida);
}
`;
}

function phpStarter(sig: Signature): string {
  const params = sig.params.map((p) => `$${p.name}`).join(", ");
  const reads = sig.params
    .map((p) =>
      p.type === "int"
        ? `    $${p.name} = intval(ler());`
        : p.type === "bool"
          ? `    $${p.name} = trim(ler()) === "true";`
          : p.type === "str"
            ? `    $${p.name} = ler();`
            : `    $${p.name} = lerLista();`,
    )
    .join("\n");
  const fmt =
    sig.returns === "int[]"
      ? `implode(" ", $r)`
      : sig.returns === "bool"
        ? `($r ? "true" : "false")`
        : `(string) $r`;
  return `<?php
function resolver(${params}) {
    // escreva sua solução aqui
    return ${defaultReturn(sig.returns, "php")};
}

// ---- ${HARNESS_NOTE}
$linhas = explode("\\n", file_get_contents("php://stdin"));
$pos = 0;

function ler() {
    global $linhas, $pos;
    return rtrim($linhas[$pos++] ?? "", "\\r");
}

function lerLista() {
    $n = intval(ler());
    $l = trim(ler());
    return $n === 0 ? [] : array_map("intval", array_slice(preg_split('/\\s+/', $l), 0, $n));
}

$t = intval(ler());
$saida = [];
for ($caso = 0; $caso < $t; $caso++) {
${reads}
    $r = resolver(${params});
    $saida[] = ${fmt};
}
echo implode("\\n", $saida), "\\n";
`;
}

function defaultReturn(type: ParamType, lang: BattleLang): string {
  if (type === "int") return "0";
  if (type === "float") return lang === "rust" || lang === "python" ? "0.0" : "0";
  if (type === "bool") return lang === "python" ? "False" : "false";
  if (type === "str") {
    if (lang === "python") return '""';
    if (lang === "c") return "";
    if (lang === "rust") return "String::new()";
    return '""';
  }
  switch (lang) {
    case "python":
    case "javascript":
    case "typescript":
    case "php":
      return "[]";
    case "java":
    case "csharp":
      return "new int[0]";
    case "c":
      return "0";
    case "cpp":
      return "{}";
    case "go":
      return "[]int{}";
    case "rust":
      return "Vec::new()";
  }
}

/**
 * Programa completo (função + leitura dos casos) na linguagem pedida. `nome` troca o nome da
 * função: os desafios de código usam o nome do enunciado; a Batalha usa sempre `resolver`.
 */
export function starterCode(sig: Signature, lang: BattleLang, nome = "resolver"): string {
  const code = baseStarter(sig, lang);
  return nome === "resolver" ? code : code.replace(/\bresolver\(/g, `${nome}(`);
}

function baseStarter(sig: Signature, lang: BattleLang): string {
  switch (lang) {
    case "javascript":
      return jsStarter(sig);
    case "typescript":
      return tsStarter(sig);
    case "python":
      return pyStarter(sig);
    case "java":
      return javaStarter(sig);
    case "c":
      return cStarter(sig);
    case "cpp":
      return cppStarter(sig);
    case "csharp":
      return csStarter(sig);
    case "go":
      return goStarter(sig);
    case "rust":
      return rustStarter(sig);
    case "php":
      return phpStarter(sig);
  }
}

/** Solução de referência de um desafio na linguagem pedida (TypeScript reaproveita a de JavaScript). */
export function solutionFor(ch: BattleChallenge, lang: BattleLang): string {
  if (lang === "typescript") return ch.solutions.typescript ?? ch.solutions.javascript;
  return ch.solutions[lang];
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
  /** Soluções em todas as linguagens, só para o teste que valida o banco no executor (TypeScript usa a de JavaScript se faltar). */
  solutions: Record<Exclude<BattleLang, "typescript">, string> & { typescript?: string };
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
