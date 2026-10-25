/**
 * Desafios de código em linguagens compiladas (Java, C, C++, C#, Go, Rust e PHP).
 * O navegador monta o programa completo (a função do aluno + a leitura dos casos, o mesmo
 * modelo da Batalha de Código), envia para o Judge0 público, que executa isolado, sem rede
 * e com limite de tempo e memória, e confere cada linha da saída com o esperado.
 */
import { encodeInput, LANG_INFO, starterCode as programTemplate, type ParamType, type Signature } from "@battle/battle-core.ts";
import type { CodeChallenge, ValueType } from "@content/challenges";
import type { RunOutcome } from "./sandbox";

export const REMOTE_LANGS = ["java", "c", "cpp", "csharp", "go", "rust", "php"] as const;
export type RemoteLang = (typeof REMOTE_LANGS)[number];

export const isRemote = (lang: string): lang is RemoteLang => (REMOTE_LANGS as readonly string[]).includes(lang);

const JUDGE0 = "https://ce.judge0.com";

const TYPE: Record<ValueType, ParamType | null> = { number: "int", string: "str", boolean: "bool", "number[]": "int[]", "string[]": null };

/** Assinatura no formato dos executores; `null` se o desafio usa um tipo que eles não leem. */
export function remoteSignature(ch: CodeChallenge): Signature | null {
  const params = ch.params.map((p) => ({ name: p.name, type: TYPE[p.type] }));
  const returns = ch.returns === "number" && ch.decimal ? "float" : TYPE[ch.returns];
  if (!returns || params.some((p) => p.type === null)) return null;
  return { params: params as Signature["params"], returns };
}

export const supportsRemote = (ch: CodeChallenge) => remoteSignature(ch) !== null;

export function remoteStarter(ch: CodeChallenge, lang: RemoteLang): string {
  return programTemplate(remoteSignature(ch)!, lang, ch.fn);
}

const b64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const x of bytes) bin += String.fromCharCode(x);
  return btoa(bin);
};
const unb64 = (s: string | null | undefined) => (s ? new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0))) : "");
const clip = (s: string, n = 1500) => (s.length > n ? `${s.slice(0, n)}…` : s);

function parseLine(type: ParamType, line: string): unknown {
  const t = line.trim();
  if (type === "str") return line;
  if (type === "bool") return t === "true" ? true : t === "false" ? false : line;
  if (type === "int[]") return t === "" ? [] : t.split(/\s+/).map((x) => (Number.isNaN(Number(x)) ? x : Number(x)));
  return t !== "" && !Number.isNaN(Number(t)) ? Number(t) : line;
}

export async function runRemote(ch: CodeChallenge, lang: RemoteLang, code: string, cases: unknown[][]): Promise<RunOutcome> {
  const sig = remoteSignature(ch);
  if (!sig) return { ok: false, error: "Este desafio ainda não está disponível nesta linguagem.", logs: [] };
  const info = LANG_INFO[lang];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);
  let data: { status?: { id: number; description: string }; stdout?: string | null; stderr?: string | null; compile_output?: string | null };
  try {
    const res = await fetch(`${JUDGE0}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        language_id: info.judge0Id,
        source_code: b64(code),
        stdin: b64(encodeInput(sig, cases)),
        ...(info.compilerOptions ? { compiler_options: info.compilerOptions } : {}),
        cpu_time_limit: info.cpuSeconds,
        wall_time_limit: Math.min(info.cpuSeconds * 3, 20),
        memory_limit: info.memoryKb,
        enable_network: false,
      }),
    });
    if (res.status === 429) return { ok: false, error: "O servidor de execução está recebendo muitos pedidos agora. Espere alguns segundos e tente de novo.", logs: [] };
    if (!res.ok) return { ok: false, error: `O servidor de execução respondeu ${res.status}. Tente de novo em instantes.`, logs: [] };
    data = await res.json();
  } catch {
    return { ok: false, error: "Não foi possível falar com o servidor de execução (Judge0). Confira sua internet e tente de novo.", logs: [] };
  } finally {
    clearTimeout(timer);
  }

  const status = data.status?.id ?? 13;
  const stderr = unb64(data.stderr);
  const logs = stderr ? stderr.replace(/\r/g, "").split("\n").filter(Boolean).slice(0, 200) : [];
  if (status === 6) return { ok: false, error: `Erro de compilação:\n${clip(unb64(data.compile_output))}`, logs };
  if (status === 5) return { ok: false, error: `Tempo esgotado: passou de ${info.cpuSeconds} s de processamento (laço infinito?).`, logs };
  if (status >= 13 || status === 1 || status === 2) return { ok: false, error: "O servidor de execução teve um problema interno. Tente de novo.", logs };
  if (status >= 7) return { ok: false, error: clip(stderr || data.status?.description || "Erro durante a execução."), logs };

  const lines = unb64(data.stdout).replace(/\r/g, "").split("\n");
  return {
    ok: true,
    logs,
    results: cases.map((_, i) => (i < lines.length && !(i === lines.length - 1 && lines[i] === "") ? { ok: true as const, value: parseLine(sig.returns, lines[i]!) } : { ok: false as const, error: "o programa não imprimiu resposta para este caso" })),
  };
}
