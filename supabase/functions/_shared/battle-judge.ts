/**
 * Correção de um envio: gera os testes ocultos, executa o código no Judge0 (sandbox
 * isolado, sem rede, com limite de CPU e memória) e compara a saída com a referência.
 * Roda na Edge Function (Deno) e no script de validação (Node).
 */
import { buildJudgeCases, compareOutput, LANG_INFO, type BattleChallenge, type BattleLang } from "./battle-core.ts";

export type Verdict = "aceito" | "resposta_errada" | "erro_compilacao" | "erro_execucao" | "tempo_excedido" | "erro_tecnico";

export interface JudgeResult {
  verdict: Verdict;
  passed: number;
  total: number;
  /** Mensagem segura para mostrar a quem enviou (nunca revela casos ocultos). */
  message: string;
  timeMs: number | null;
}

export interface JudgeConfig {
  url: string;
  /** Opcional: token do Judge0 (instância própria ou RapidAPI). */
  token?: string;
  rapidApiHost?: string;
}

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};
const unb64 = (s: string | null | undefined) => {
  if (!s) return "";
  const bin = atob(s);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};
const clip = (s: string, n = 600) => (s.length > n ? `${s.slice(0, n)}…` : s);

export async function judgeSubmission(cfg: JudgeConfig, ch: BattleChallenge, lang: BattleLang, code: string, seed: number): Promise<JudgeResult> {
  const info = LANG_INFO[lang];
  const { stdin, expected } = buildJudgeCases(ch, seed);
  const total = expected.length;
  const headers: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "programacao-do-zero-batalha" };
  if (cfg.token && cfg.rapidApiHost) {
    headers["X-RapidAPI-Key"] = cfg.token;
    headers["X-RapidAPI-Host"] = cfg.rapidApiHost;
  } else if (cfg.token) headers["X-Auth-Token"] = cfg.token;

  let data: {
    status?: { id: number; description: string };
    stdout?: string | null;
    stderr?: string | null;
    compile_output?: string | null;
    time?: string | null;
  };
  try {
    const res = await fetch(`${cfg.url.replace(/\/$/, "")}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: info.judge0Id,
        source_code: b64(code),
        stdin: b64(stdin),
        cpu_time_limit: info.cpuSeconds,
        wall_time_limit: info.cpuSeconds * 3,
        memory_limit: info.memoryKb,
        enable_network: false,
        max_file_size: 1024,
        redirect_stderr_to_stdout: false,
      }),
    });
    if (!res.ok) return { verdict: "erro_tecnico", passed: 0, total, message: `O corretor respondeu ${res.status}. Seu envio não conta como erro; tente de novo.`, timeMs: null };
    data = await res.json();
  } catch {
    return { verdict: "erro_tecnico", passed: 0, total, message: "Não foi possível falar com o corretor. Seu envio não conta como erro; tente de novo.", timeMs: null };
  }

  const status = data.status?.id ?? 13;
  const timeMs = data.time ? Math.round(Number(data.time) * 1000) : null;
  if (status === 6) return { verdict: "erro_compilacao", passed: 0, total, message: clip(unb64(data.compile_output) || "Erro de compilação."), timeMs };
  if (status === 5) return { verdict: "tempo_excedido", passed: 0, total, message: `Passou de ${info.cpuSeconds} s de processamento. Laço infinito ou solução lenta demais para entradas grandes?`, timeMs };
  if (status >= 13 || status === 1 || status === 2) return { verdict: "erro_tecnico", passed: 0, total, message: "O corretor teve um problema interno. Seu envio não conta como erro; tente de novo.", timeMs };
  if (status >= 7) {
    const err = unb64(data.stderr);
    const killed = /Killed|MemoryError|OutOfMemory|bad_alloc/i.test(err);
    return { verdict: "erro_execucao", passed: 0, total, message: killed ? "O programa passou do limite de memória." : clip(err || data.status?.description || "Erro durante a execução."), timeMs };
  }

  const out = unb64(data.stdout);
  const cmp = compareOutput(out, expected);
  const got = out.replace(/\r/g, "").split("\n");
  const passed = expected.filter((e, i) => (got[i] ?? "").trimEnd() === e.trimEnd()).length;
  if (cmp.ok) return { verdict: "aceito", passed: total, total, message: "Todos os testes passaram!", timeMs };
  const i = cmp.firstWrong ?? 0;
  const visible = i < ch.examples.length;
  return {
    verdict: "resposta_errada",
    passed,
    total,
    message: visible
      ? `Exemplo ${i + 1}: esperado "${clip(expected[i] ?? "", 120)}", seu programa imprimiu "${clip(got[i] ?? "(nada)", 120)}".`
      : `Passou em ${passed} de ${total} testes. O primeiro erro foi no teste oculto nº ${i + 1 - ch.examples.length}.`,
    timeMs,
  };
}
