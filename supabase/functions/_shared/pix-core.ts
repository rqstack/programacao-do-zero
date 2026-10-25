/**
 * Apoio voluntário via Pix (Syncpay) — regras puras, sem imports, usadas pela Edge Function
 * support-pix e pelos testes. Nada aqui concede XP, troféus ou vantagens.
 *
 * Fluxo seguro:
 *  1. o navegador manda só o valor e uma chave de idempotência;
 *  2. o servidor valida o valor, limita abusos e cria a cobrança na Syncpay;
 *  3. a confirmação vem SEMPRE de uma consulta do servidor à Syncpay (GET /transaction),
 *     nunca do navegador nem do corpo do webhook (que não tem assinatura HMAC).
 */

export const PIX_MIN_CENTS = 500; // R$ 5,00 — mínimo definido pelo projeto
export const PIX_LOCAL_EXPIRY_MIN = 30; // a Syncpay não documenta expiração; o site considera 30 min
export const PIX_RATE_LIMIT_PER_HOUR = 5; // cobranças novas por pessoa (IP com hash) por hora

export type DonationStatus = "aguardando" | "confirmado" | "expirado" | "falhou" | "estornado";

export interface Donation {
  id: string;
  idempotencyKey: string;
  amountCents: number;
  providerId: string | null;
  pixCode: string | null;
  status: DonationStatus;
  createdAt: string;
  expiresAt: string;
  confirmedAt: string | null;
  lastCheckedAt: string | null;
  ipHash: string;
}

/** Store abstrato: no servidor é o Postgres; nos testes, memória. */
export interface DonationStore {
  findByKey(key: string): Promise<Donation | null>;
  findById(id: string): Promise<Donation | null>;
  findByProviderId(providerId: string): Promise<Donation | null>;
  findByPixCode(pixCode: string): Promise<Donation | null>;
  countRecentByIp(ipHash: string, sinceIso: string): Promise<number>;
  insert(d: Donation): Promise<Donation>; // falha se a chave de idempotência já existir
  update(id: string, patch: Partial<Donation>): Promise<Donation>;
}

export interface SyncpayConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export type ParseAmount = { ok: true; cents: number } | { ok: false; error: string };

/**
 * Valida o valor no servidor. Aceita número ou texto ("10", "10.5", "10,50").
 * Sem teto definido pelo projeto (vale o limite do provedor e do banco de quem paga).
 */
export function parseAmount(input: unknown): ParseAmount {
  let text: string;
  if (typeof input === "number") {
    if (!Number.isFinite(input)) return { ok: false, error: "Valor inválido." };
    text = String(input);
  } else if (typeof input === "string") text = input.trim().replace(",", ".");
  else return { ok: false, error: "Informe um valor." };
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(text)) return { ok: false, error: "Use um valor em reais com até 2 casas decimais, por exemplo 10 ou 12,50." };
  const [reais, centavos = ""] = text.split(".");
  const cents = Number(reais) * 100 + Number(centavos.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return { ok: false, error: "Valor inválido." };
  if (cents < PIX_MIN_CENTS) return { ok: false, error: "O valor mínimo é R$ 5,00." };
  return { ok: true, cents };
}

export const isUuid = (s: unknown): s is string => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

/** Traduz o status da Syncpay. `med` = devolução pelo Mecanismo Especial de Devolução. */
export function mapProviderStatus(s: string): DonationStatus | null {
  if (s === "completed") return "confirmado";
  if (s === "failed") return "falhou";
  if (s === "refunded" || s === "med") return "estornado";
  if (s === "pending") return "aguardando";
  return null;
}

/** Comparação em tempo constante (para o token do webhook). */
export function safeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

/** Visão pública de uma doação (o que o navegador recebe). */
export function publicView(d: Donation) {
  return { id: d.id, amount_cents: d.amountCents, status: d.status, pix_code: d.status === "aguardando" ? d.pixCode : null, expires_at: d.expiresAt, confirmed_at: d.confirmedAt };
}

// ---------------------------------------------------------------------------
// Cliente Syncpay (fetch injetável para testes)
// ---------------------------------------------------------------------------
type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export class SyncpayClient {
  private token: { value: string; until: number } | null = null;
  constructor(
    private readonly cfg: SyncpayConfig,
    private readonly fetcher: Fetch,
    private readonly now: () => number = Date.now,
  ) {}

  private async auth(): Promise<string> {
    if (this.token && this.token.until > this.now() + 60_000) return this.token.value;
    const res = await this.fetcher(`${this.cfg.baseUrl}/auth-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: this.cfg.clientId, client_secret: this.cfg.clientSecret }),
    });
    if (!res.ok) throw new Error(`auth ${res.status}`);
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) throw new Error("auth sem token");
    this.token = { value: data.access_token, until: this.now() + (data.expires_in ?? 3600) * 1000 };
    return data.access_token;
  }

  async createCharge(cents: number): Promise<{ identifier: string; pixCode: string }> {
    const token = await this.auth();
    const res = await this.fetcher(`${this.cfg.baseUrl}/cash-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount: Number((cents / 100).toFixed(2)), description: "Apoio voluntário — Programação do Zero" }),
    });
    if (!res.ok) throw new Error(`cash-in ${res.status}`);
    const data = (await res.json()) as { identifier?: string; pix_code?: string };
    if (!data.identifier || !data.pix_code) throw new Error("cash-in sem pix_code");
    return { identifier: data.identifier, pixCode: data.pix_code };
  }

  async getStatus(identifier: string): Promise<{ status: string; amountCents: number } | null> {
    const token = await this.auth();
    const res = await this.fetcher(`${this.cfg.baseUrl}/transaction/${encodeURIComponent(identifier)}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`transaction ${res.status}`);
    const data = (await res.json()) as { data?: { status?: string; amount?: number } };
    if (!data.data?.status || typeof data.data.amount !== "number") throw new Error("transaction sem status");
    return { status: data.data.status, amountCents: Math.round(data.data.amount * 100) };
  }
}

// ---------------------------------------------------------------------------
// Casos de uso
// ---------------------------------------------------------------------------
export type Result<T> = { ok: true; value: T } | { ok: false; status: number; error: string };

export async function createDonation(
  deps: { store: DonationStore; client: SyncpayClient; now: () => Date; newId: () => string },
  input: { amount: unknown; idempotencyKey: unknown; ipHash: string },
): Promise<Result<Donation>> {
  if (!isUuid(input.idempotencyKey)) return { ok: false, status: 400, error: "Chave de requisição inválida." };
  // Pedido repetido (clique duplo, recarregar a página): devolve a mesma cobrança.
  const existing = await deps.store.findByKey(input.idempotencyKey);
  if (existing) return { ok: true, value: existing };
  const amount = parseAmount(input.amount);
  if (!amount.ok) return { ok: false, status: 400, error: amount.error };
  const since = new Date(deps.now().getTime() - 3_600_000).toISOString();
  if ((await deps.store.countRecentByIp(input.ipHash, since)) >= PIX_RATE_LIMIT_PER_HOUR) {
    return { ok: false, status: 429, error: "Muitas cobranças geradas em pouco tempo. Tente de novo mais tarde." };
  }
  let charge: { identifier: string; pixCode: string };
  try {
    charge = await deps.client.createCharge(amount.cents);
  } catch {
    return { ok: false, status: 502, error: "Não foi possível gerar o Pix agora. Nenhuma cobrança foi criada; tente de novo em instantes." };
  }
  const now = deps.now();
  const d: Donation = {
    id: deps.newId(),
    idempotencyKey: input.idempotencyKey,
    amountCents: amount.cents,
    providerId: charge.identifier,
    pixCode: charge.pixCode,
    status: "aguardando",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PIX_LOCAL_EXPIRY_MIN * 60_000).toISOString(),
    confirmedAt: null,
    lastCheckedAt: null,
    ipHash: input.ipHash,
  };
  try {
    return { ok: true, value: await deps.store.insert(d) };
  } catch {
    // Corrida entre dois pedidos com a mesma chave: vale o que foi gravado primeiro.
    const again = await deps.store.findByKey(input.idempotencyKey);
    if (again) return { ok: true, value: again };
    return { ok: false, status: 500, error: "Falha ao registrar a cobrança." };
  }
}

/**
 * Atualiza a doação consultando a Syncpay. Transições permitidas:
 * aguardando/expirado → confirmado | falhou | estornado; confirmado → estornado.
 * Confirma só se o valor pago bater com o valor cobrado.
 */
export async function refreshDonation(deps: { store: DonationStore; client: SyncpayClient; now: () => Date }, d: Donation, opts: { minIntervalMs?: number } = {}): Promise<Donation> {
  const now = deps.now();
  if (d.status === "falhou" || d.status === "estornado") return d;
  if (opts.minIntervalMs && d.lastCheckedAt && now.getTime() - new Date(d.lastCheckedAt).getTime() < opts.minIntervalMs) {
    return expireIfDue(deps, d, now);
  }
  let remote: { status: string; amountCents: number } | null;
  try {
    remote = d.providerId ? await deps.client.getStatus(d.providerId) : null;
  } catch {
    return expireIfDue(deps, d, now); // falha de comunicação: mantém o estado, tenta depois
  }
  const mapped = remote ? mapProviderStatus(remote.status) : null;
  const patch: Partial<Donation> = { lastCheckedAt: now.toISOString() };
  if (mapped === "confirmado" && remote && remote.amountCents === d.amountCents && d.status !== "confirmado") {
    patch.status = "confirmado";
    patch.confirmedAt = now.toISOString();
  } else if (mapped === "falhou" && d.status !== "confirmado") patch.status = "falhou";
  else if (mapped === "estornado") patch.status = "estornado";
  const updated = await deps.store.update(d.id, patch);
  return expireIfDue(deps, updated, now);
}

async function expireIfDue(deps: { store: DonationStore }, d: Donation, now: Date): Promise<Donation> {
  if (d.status === "aguardando" && now.getTime() > new Date(d.expiresAt).getTime()) {
    return deps.store.update(d.id, { status: "expirado" });
  }
  return d;
}

/**
 * Webhook da Syncpay: confere o token Bearer (tempo constante) e, em vez de confiar no
 * corpo, consulta a transação na Syncpay. Repetições não mudam nada (idempotente).
 *
 * O corpo só serve para achar a doação: pelo `id` (que a Syncpay descreve como
 * "reference_id / UUID" e pode não ser o mesmo `identifier` devolvido na criação) ou, se não
 * achar, pelo `pix_code` (o Copia e Cola, que o site guardou ao criar a cobrança). A
 * confirmação vem sempre da consulta do servidor, com o identificador guardado pelo site.
 * Espaços e quebras de linha em volta do token são ignorados (erro comum ao colar o segredo).
 */
export async function handleWebhook(
  deps: { store: DonationStore; client: SyncpayClient; now: () => Date; webhookToken: string },
  authorization: string | null,
  body: unknown,
): Promise<{ status: number; body: { ok: boolean; message: string } }> {
  const token = (authorization ?? "").trim().replace(/^Bearer\s+/i, "").trim();
  const expected = deps.webhookToken.trim();
  if (!expected || !safeEqual(token, expected)) return { status: 401, body: { ok: false, message: "não autorizado" } };
  const obj = typeof body === "object" && body !== null ? (body as { id?: unknown; pix_code?: unknown; data?: { id?: unknown; pix_code?: unknown } }) : null;
  const id = obj?.id ?? obj?.data?.id;
  const pixCode = obj?.pix_code ?? obj?.data?.pix_code;
  let d: Donation | null = null;
  if (typeof id === "string" && id.length > 0 && id.length <= 100) d = await deps.store.findByProviderId(id);
  if (!d && typeof pixCode === "string" && pixCode.length > 0 && pixCode.length <= 1000) d = await deps.store.findByPixCode(pixCode);
  if (!d) return { status: 200, body: { ok: true, message: "ignorado" } };
  await refreshDonation(deps, d);
  return { status: 200, body: { ok: true, message: "processado" } };
}
