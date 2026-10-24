import { describe, expect, it } from "vitest";
import {
  createDonation,
  handleWebhook,
  parseAmount,
  publicView,
  refreshDonation,
  SyncpayClient,
  type Donation,
  type DonationStore,
} from "@battle/pix-core.ts";

/** Syncpay simulada: registra chamadas e devolve o que o teste mandar. */
function fakeSyncpay() {
  const state = {
    calls: [] as string[],
    charges: new Map<string, { status: string; amount: number }>(),
    down: false,
    seq: 0,
  };
  const fetcher = async (url: string, init?: RequestInit) => {
    state.calls.push(`${init?.method ?? "GET"} ${url.replace("https://api.test", "")}`);
    if (state.down) throw new Error("rede fora");
    if (url.endsWith("/auth-token")) return Response.json({ access_token: "tok", expires_in: 3600 });
    if (url.endsWith("/cash-in")) {
      const body = JSON.parse(String(init?.body)) as { amount: number };
      const id = `00000000-0000-4000-8000-${String(++state.seq).padStart(12, "0")}`;
      state.charges.set(id, { status: "pending", amount: body.amount });
      return Response.json({ message: "ok", pix_code: `000201PIX${id}`, identifier: id });
    }
    const m = /\/transaction\/(.+)$/.exec(url);
    if (m) {
      const c = state.charges.get(decodeURIComponent(m[1]!));
      return c ? Response.json({ data: { reference_id: m[1], currency: "BRL", amount: c.amount, status: c.status } }) : Response.json({ message: "não encontrada" }, { status: 404 });
    }
    return new Response("?", { status: 500 });
  };
  return { state, client: new SyncpayClient({ baseUrl: "https://api.test", clientId: "id", clientSecret: "secret" }, fetcher as never) };
}

function memoryStore(): DonationStore & { rows: Map<string, Donation> } {
  const rows = new Map<string, Donation>();
  return {
    rows,
    findByKey: async (k) => [...rows.values()].find((d) => d.idempotencyKey === k) ?? null,
    findById: async (id) => rows.get(id) ?? null,
    findByProviderId: async (p) => [...rows.values()].find((d) => d.providerId === p) ?? null,
    countRecentByIp: async (ip, since) => [...rows.values()].filter((d) => d.ipHash === ip && d.createdAt >= since).length,
    insert: async (d) => {
      if ([...rows.values()].some((x) => x.idempotencyKey === d.idempotencyKey)) throw new Error("duplicate");
      rows.set(d.id, { ...d });
      return { ...d };
    },
    update: async (id, patch) => {
      const next = { ...rows.get(id)!, ...patch };
      rows.set(id, next);
      return { ...next };
    },
  };
}

let clock = new Date("2026-10-23T12:00:00Z");
let n = 0;
const key = () => `11111111-1111-4111-8111-${String(++n).padStart(12, "0")}`;
function setup() {
  const sp = fakeSyncpay();
  const store = memoryStore();
  clock = new Date("2026-10-23T12:00:00Z");
  const deps = { store, client: sp.client, now: () => clock, newId: () => crypto.randomUUID(), webhookToken: "segredo-do-webhook" };
  return { sp, store, deps };
}

describe("valor do apoio (validado no servidor)", () => {
  it("aceita valores válidos, inclusive com vírgula", () => {
    expect(parseAmount(5)).toEqual({ ok: true, cents: 500 });
    expect(parseAmount("12,50")).toEqual({ ok: true, cents: 1250 });
    expect(parseAmount("1000000")).toEqual({ ok: true, cents: 100_000_000 });
  });
  it("recusa abaixo de R$ 5,00, negativos, inválidos e manipulados", () => {
    for (const v of [4.99, "4,99", 0, -10, "-5", "abc", "5.001", "1e3", NaN, Infinity, null, undefined, {}, [], "5; drop table", " "]) {
      expect(parseAmount(v).ok, String(v)).toBe(false);
    }
  });
});

describe("cobrança Pix", () => {
  it("gera cobrança com Copia e Cola e estado aguardando, sem dados pessoais", async () => {
    const { sp, deps } = setup();
    const r = await createDonation(deps, { amount: "10", idempotencyKey: key(), ipHash: "ip1" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("aguardando");
    expect(publicView(r.value).pix_code).toMatch(/^000201PIX/);
    const body = sp.state.calls.find((c) => c.includes("/cash-in"));
    expect(body).toBeDefined();
  });

  it("não duplica: mesma chave de idempotência devolve a mesma cobrança", async () => {
    const { sp, deps } = setup();
    const k = key();
    const a = await createDonation(deps, { amount: 10, idempotencyKey: k, ipHash: "ip1" });
    const b = await createDonation(deps, { amount: 10, idempotencyKey: k, ipHash: "ip1" });
    expect(a.ok && b.ok && a.value.id === b.value.id).toBe(true);
    expect(sp.state.calls.filter((c) => c.includes("/cash-in"))).toHaveLength(1);
  });

  it("recusa valor inválido sem chamar a Syncpay", async () => {
    const { sp, deps } = setup();
    const r = await createDonation(deps, { amount: "3", idempotencyKey: key(), ipHash: "ip1" });
    expect(r).toMatchObject({ ok: false, status: 400 });
    expect(sp.state.calls).toEqual([]);
  });

  it("limita abuso: no máximo 5 cobranças por hora por pessoa", async () => {
    const { deps } = setup();
    for (let i = 0; i < 5; i++) expect((await createDonation(deps, { amount: 5, idempotencyKey: key(), ipHash: "ip9" })).ok).toBe(true);
    expect(await createDonation(deps, { amount: 5, idempotencyKey: key(), ipHash: "ip9" })).toMatchObject({ ok: false, status: 429 });
    expect((await createDonation(deps, { amount: 5, idempotencyKey: key(), ipHash: "outro" })).ok).toBe(true);
  });

  it("falha de comunicação ao gerar: erro claro e nada gravado", async () => {
    const { sp, store, deps } = setup();
    sp.state.down = true;
    expect(await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip1" })).toMatchObject({ ok: false, status: 502 });
    expect(store.rows.size).toBe(0);
  });
});

describe("status e confirmação", () => {
  it("pendente continua aguardando; depois de 30 min vira expirado", async () => {
    const { deps } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip1" });
    if (!r.ok) throw new Error();
    expect((await refreshDonation(deps, r.value)).status).toBe("aguardando");
    clock = new Date(clock.getTime() + 31 * 60_000);
    expect((await refreshDonation(deps, r.value)).status).toBe("expirado");
  });

  it("confirma só quando a Syncpay diz completed e o valor bate", async () => {
    const { sp, deps } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip1" });
    if (!r.ok) throw new Error();
    sp.state.charges.get(r.value.providerId!)!.amount = 1; // valor adulterado
    sp.state.charges.get(r.value.providerId!)!.status = "completed";
    expect((await refreshDonation(deps, r.value)).status).toBe("aguardando");
    sp.state.charges.get(r.value.providerId!)!.amount = 10;
    expect((await refreshDonation(deps, r.value)).status).toBe("confirmado");
  });

  it("falha de comunicação na consulta mantém o estado", async () => {
    const { sp, deps } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip1" });
    if (!r.ok) throw new Error();
    sp.state.down = true;
    expect((await refreshDonation(deps, r.value)).status).toBe("aguardando");
  });

  it("pagamento que chega depois da expiração local ainda é confirmado", async () => {
    const { sp, deps, store } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip1" });
    if (!r.ok) throw new Error();
    clock = new Date(clock.getTime() + 40 * 60_000);
    await refreshDonation(deps, r.value);
    sp.state.charges.get(r.value.providerId!)!.status = "completed";
    const res = await handleWebhook(deps, "Bearer segredo-do-webhook", { id: r.value.providerId });
    expect(res.status).toBe(200);
    expect(store.rows.get(r.value.id)!.status).toBe("confirmado");
  });
});

describe("webhook", () => {
  it("recusa token ausente ou errado", async () => {
    const { deps } = setup();
    expect((await handleWebhook(deps, null, { id: "x" })).status).toBe(401);
    expect((await handleWebhook(deps, "Bearer errado", { id: "x" })).status).toBe(401);
  });

  it("não confia no corpo: status falso no webhook não confirma nada", async () => {
    const { deps, store } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip1" });
    if (!r.ok) throw new Error();
    await handleWebhook(deps, "Bearer segredo-do-webhook", { id: r.value.providerId, status: "completed", amount: 10 });
    expect(store.rows.get(r.value.id)!.status).toBe("aguardando");
  });

  it("repetido é idempotente: confirma uma vez e mantém a data", async () => {
    const { sp, deps, store } = setup();
    const r = await createDonation(deps, { amount: 25, idempotencyKey: key(), ipHash: "ip1" });
    if (!r.ok) throw new Error();
    sp.state.charges.get(r.value.providerId!)!.status = "completed";
    await handleWebhook(deps, "Bearer segredo-do-webhook", { id: r.value.providerId });
    const first = store.rows.get(r.value.id)!.confirmedAt;
    clock = new Date(clock.getTime() + 60_000);
    await handleWebhook(deps, "Bearer segredo-do-webhook", { id: r.value.providerId });
    expect(store.rows.get(r.value.id)!).toMatchObject({ status: "confirmado", confirmedAt: first });
  });

  it("transação desconhecida é ignorada sem erro", async () => {
    const { deps } = setup();
    expect(await handleWebhook(deps, "Bearer segredo-do-webhook", { id: "nao-existe" })).toEqual({ status: 200, body: { ok: true, message: "ignorado" } });
  });
});
