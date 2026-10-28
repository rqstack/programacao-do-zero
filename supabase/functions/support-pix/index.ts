// Edge Function support-pix — apoio voluntário via Pix (Syncpay).
// Desligada até existirem os secrets SYNCPAY_CLIENT_ID e SYNCPAY_CLIENT_SECRET.
//   GET                                                → { enabled, min_cents }
//   POST { action: "create", amount, idempotency_key } → cobrança (Copia e Cola)
//   POST { action: "status", id }                      → estado conferido na Syncpay
//   POST ?webhook=1 (Authorization: Bearer SYNCPAY_WEBHOOK_TOKEN) → aviso da Syncpay
// Credenciais só nos secrets do Supabase; nunca no site nem no repositório.
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  createDonation,
  handleWebhook,
  isUuid,
  PIX_MIN_CENTS,
  publicView,
  refreshDonation,
  SyncpayClient,
  type Donation,
  type DonationStore,
} from "../_shared/pix-core.ts";

const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://rqstack.github.io,http://localhost:3000").split(",").map((s) => s.trim());
function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(origin) ? origin : ORIGINS[0]!,
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}
const json = (req: Request, status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json" } });

const clientId = Deno.env.get("SYNCPAY_CLIENT_ID") ?? "";
const clientSecret = Deno.env.get("SYNCPAY_CLIENT_SECRET") ?? "";
const enabled = clientId.length > 0 && clientSecret.length > 0;
const syncpay = new SyncpayClient(
  { baseUrl: Deno.env.get("SYNCPAY_BASE_URL") ?? "https://api.syncpayments.com.br/api/partner/v1", clientId, clientSecret },
  fetch,
);
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

// Diagnóstico sem expor nada: registra nos logs PRIVADOS da função só se cada segredo existe
// (verdadeiro/falso), nunca o valor. Ajuda a separar "token ausente" de "token diferente".
console.log(
  JSON.stringify({
    config: {
      syncpay_api: enabled,
      webhook_token_configurado: (Deno.env.get("SYNCPAY_WEBHOOK_TOKEN") ?? "").trim().length > 0,
      ip_salt_configurado: (Deno.env.get("PIX_IP_SALT") ?? "").length > 0,
    },
  }),
);

interface Row {
  id: string;
  idempotency_key: string;
  amount_cents: number;
  provider_id: string | null;
  pix_code: string | null;
  status: Donation["status"];
  created_at: string;
  expires_at: string;
  confirmed_at: string | null;
  last_checked_at: string | null;
  ip_hash: string;
}
const fromRow = (r: Row): Donation => ({
  id: r.id,
  idempotencyKey: r.idempotency_key,
  amountCents: Number(r.amount_cents),
  providerId: r.provider_id,
  pixCode: r.pix_code,
  status: r.status,
  createdAt: r.created_at,
  expiresAt: r.expires_at,
  confirmedAt: r.confirmed_at,
  lastCheckedAt: r.last_checked_at,
  ipHash: r.ip_hash,
});
const COLUMN: Record<string, string> = {
  id: "id",
  idempotencyKey: "idempotency_key",
  amountCents: "amount_cents",
  providerId: "provider_id",
  pixCode: "pix_code",
  status: "status",
  createdAt: "created_at",
  expiresAt: "expires_at",
  confirmedAt: "confirmed_at",
  lastCheckedAt: "last_checked_at",
  ipHash: "ip_hash",
};
const toRow = (d: Partial<Donation>) => Object.fromEntries(Object.entries(d).filter(([k]) => COLUMN[k]).map(([k, v]) => [COLUMN[k]!, v]));
const table = () => admin.from("support_donations");
async function one(q: PromiseLike<{ data: unknown; error: unknown }>): Promise<Donation | null> {
  const { data, error } = await q;
  if (error) throw error;
  return data ? fromRow(data as Row) : null;
}

const store: DonationStore = {
  findByKey: (k) => one(table().select("*").eq("idempotency_key", k).maybeSingle()),
  findById: (id) => one(table().select("*").eq("id", id).maybeSingle()),
  findByProviderId: (p) => one(table().select("*").eq("provider_id", p).maybeSingle()),
  findByPixCode: (c) => one(table().select("*").eq("pix_code", c).limit(1).maybeSingle()),
  countRecentByIp: async (ip, since) => {
    const { count, error } = await table().select("id", { count: "exact", head: true }).eq("ip_hash", ip).gte("created_at", since);
    if (error) throw error;
    return count ?? 0;
  },
  insert: async (d) => (await one(table().insert(toRow(d)).select("*").single()))!,
  update: async (id, patch) => (await one(table().update(toRow(patch)).eq("id", id).select("*").single()))!,
};

async function ipHash(req: Request): Promise<string> {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || "desconhecido";
  // Sem PIX_IP_SALT, usa um valor derivado de um segredo que a função já tem (nunca um padrão público).
  const salt = Deno.env.get("PIX_IP_SALT") || `derivado:${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  const url = new URL(req.url);
  if (req.method === "GET") return json(req, 200, { enabled, min_cents: PIX_MIN_CENTS });
  if (req.method !== "POST") return json(req, 405, { error: "método não permitido" });

  if (url.searchParams.get("webhook") === "1") {
    if (!enabled) return json(req, 503, { error: "apoio desativado" });
    let payload: unknown = null;
    try {
      payload = await req.json();
    } catch {
      // corpo inválido: tratado como aviso ignorado
    }
    const r = await handleWebhook(
      { store, client: syncpay, now: () => new Date(), webhookToken: Deno.env.get("SYNCPAY_WEBHOOK_TOKEN") ?? "" },
      req.headers.get("Authorization"),
      payload,
    );
    return json(req, r.status, r.body);
  }

  if (!enabled) return json(req, 503, { error: "O apoio via Pix ainda não foi ativado." });
  let body: { action?: unknown; amount?: unknown; idempotency_key?: unknown; id?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(req, 400, { error: "corpo inválido" });
  }
  const deps = { store, client: syncpay, now: () => new Date(), newId: () => crypto.randomUUID() };
  try {
    if (body.action === "create") {
      const r = await createDonation(deps, { amount: body.amount, idempotencyKey: body.idempotency_key, ipHash: await ipHash(req) });
      return r.ok ? json(req, 200, publicView(r.value)) : json(req, r.status, { error: r.error });
    }
    if (body.action === "status") {
      if (!isUuid(body.id)) return json(req, 400, { error: "id inválido" });
      const d = await store.findById(body.id);
      if (!d) return json(req, 404, { error: "cobrança não encontrada" });
      return json(req, 200, publicView(await refreshDonation(deps, d, { minIntervalMs: 4000 })));
    }
  } catch {
    return json(req, 500, { error: "Falha interna. Tente de novo em instantes." });
  }
  return json(req, 400, { error: "ação inválida" });
});
