// Edge Function battle-submit — corrige um envio da Batalha de Código.
//
// 1. Confere quem está enviando (token de login do Supabase).
// 2. Registra o envio no banco (que valida partida, prazo, limites e ordem).
// 3. Gera testes ocultos novos, executa o código no Judge0 (sandbox isolado, sem rede,
//    com limite de CPU e memória) e compara com a solução de referência.
// 4. Grava o veredito; o banco decide o vencedor e aplica os troféus.
//
// O código do jogador NUNCA roda aqui: só no Judge0. Testes e soluções nunca saem daqui.
//
// Variáveis (Supabase → Edge Functions → Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (automáticas)
//   JUDGE0_URL       opcional, padrão https://ce.judge0.com
//   JUDGE0_TOKEN     opcional (instância própria: X-Auth-Token; RapidAPI: a chave)
//   JUDGE0_RAPIDAPI_HOST opcional (ex.: judge0-ce.p.rapidapi.com)
//   ALLOWED_ORIGINS  opcional, lista separada por vírgula
import { createClient } from "jsr:@supabase/supabase-js@2";
import { battleBank } from "../_shared/battle-bank.ts";
import { judgeSubmission } from "../_shared/battle-judge.ts";
import type { BattleLang } from "../_shared/battle-core.ts";

const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://rqstack.github.io,http://localhost:3000").split(",").map((s) => s.trim());

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : ORIGINS[0]!,
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

const json = (req: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "método não permitido" });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json(req, 500, { error: "servidor sem configuração" });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json(req, 401, { error: "faça login para jogar" });

  let body: { match_id?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: "corpo inválido" });
  }
  const matchId = typeof body.match_id === "string" && /^[0-9a-f-]{36}$/i.test(body.match_id) ? body.match_id : null;
  const code = typeof body.code === "string" ? body.code : null;
  if (!matchId || code === null) return json(req, 400, { error: "envie match_id e code" });

  const { data: reg, error: regError } = await admin.rpc("battle_register_submission", { p_user: user.id, p_match: matchId, p_code: code });
  if (regError) return json(req, 500, { error: "não foi possível registrar o envio" });
  if (!reg?.ok) return json(req, 409, { error: reg?.error ?? "envio recusado" });

  const challenge = battleBank.find((c) => c.id === reg.challenge_id);
  const seed = crypto.getRandomValues(new Uint32Array(1))[0]!;
  const result = challenge
    ? await judgeSubmission(
        { url: Deno.env.get("JUDGE0_URL") ?? "https://ce.judge0.com", token: Deno.env.get("JUDGE0_TOKEN") ?? undefined, rapidApiHost: Deno.env.get("JUDGE0_RAPIDAPI_HOST") ?? undefined },
        challenge,
        reg.lang as BattleLang,
        code,
        seed,
      )
    : { verdict: "erro_tecnico" as const, passed: 0, total: 0, message: "Desafio indisponível no corretor.", timeMs: null };

  const { data: done, error: doneError } = await admin.rpc("battle_complete_submission", {
    p_submission: reg.submission_id,
    p_status: result.verdict,
    p_passed: result.passed,
    p_total: result.total,
    p_message: result.message,
  });
  if (doneError) return json(req, 500, { error: "não foi possível salvar o resultado" });
  return json(req, 200, { verdict: result.verdict, passed: result.passed, total: result.total, message: result.message, time_ms: result.timeMs, match_status: done?.match_status });
});
