/**
 * Auditoria final (30/10/2026): cenários de corrida, quedas e respostas inesperadas no
 * fluxo do Pix. Cada teste roda o código real de pix-core.ts; só a Syncpay e o banco são
 * simulados (o banco simulado aplica a mesma regra de atualização condicional do Postgres).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDonation,
  handleWebhook,
  PIX_GLOBAL_LIMIT_PER_HOUR,
  refreshDonation,
  SyncpayClient,
  type Donation,
  type DonationStore,
} from "@battle/pix-core.ts";
import { judgeSubmission } from "@battle/battle-judge.ts";
import { battleBank } from "@battle/battle-bank.example.ts";
import { pollDelay } from "@/lib/support/poll";

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

function syncpay(opts: { amount?: unknown; status?: string } = {}) {
  const state = { calls: [] as string[], status: opts.status ?? "pending", amount: opts.amount as unknown, hang: false, authFails: 0, txUnauthorized: 0, seq: 0 };
  const fetcher: Fetcher = async (url, init) => {
    state.calls.push(url.replace("https://api.test", ""));
    if (state.hang) {
      // Nunca responde por conta própria: só termina se o cliente abortar (timeout).
      return new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("timeout", "TimeoutError"))));
    }
    if (url.endsWith("/auth-token")) return Response.json({ access_token: `tok${state.calls.length}`, expires_in: 3600 });
    if (url.endsWith("/cash-in")) {
      const body = JSON.parse(String(init?.body)) as { amount: number };
      state.amount ??= body.amount;
      const id = `00000000-0000-4000-8000-${String(++state.seq).padStart(12, "0")}`;
      return Response.json({ identifier: id, pix_code: `000201PIX${id}` });
    }
    if (url.includes("/transaction/")) {
      if (state.txUnauthorized > 0) {
        state.txUnauthorized--;
        return Response.json({ message: "token expirado" }, { status: 401 });
      }
      return Response.json({ data: { status: state.status, amount: state.amount } });
    }
    return new Response("?", { status: 500 });
  };
  return { state, fetcher };
}

function memoryStore(): DonationStore & { rows: Map<string, Donation>; down: boolean } {
  const rows = new Map<string, Donation>();
  const s = {
    rows,
    down: false,
    guard() {
      if (s.down) throw new Error("banco fora do ar");
    },
    findByKey: async (k: string) => (s.guard(), [...rows.values()].find((d) => d.idempotencyKey === k) ?? null),
    findById: async (id: string) => (s.guard(), rows.get(id) ? { ...rows.get(id)! } : null),
    findByProviderId: async (p: string) => (s.guard(), [...rows.values()].find((d) => d.providerId === p) ?? null),
    findByPixCode: async (c: string) => (s.guard(), [...rows.values()].find((d) => d.pixCode === c) ?? null),
    countRecentByIp: async (ip: string, since: string) => (s.guard(), [...rows.values()].filter((d) => d.ipHash === ip && d.createdAt >= since).length),
    countRecent: async (since: string) => (s.guard(), [...rows.values()].filter((d) => d.createdAt >= since).length),
    insert: async (d: Donation) => {
      s.guard();
      rows.set(d.id, { ...d });
      return { ...d };
    },
    update: async (id: string, patch: Partial<Donation>, onlyIf?: Donation["status"][]) => {
      s.guard();
      const cur = rows.get(id);
      if (!cur || (onlyIf && !onlyIf.includes(cur.status))) return null;
      const next = { ...cur, ...patch };
      rows.set(id, next);
      return { ...next };
    },
  };
  return s;
}

let seq = 0;
const key = () => `22222222-2222-4222-8222-${String(++seq).padStart(12, "0")}`;
function setup(opts: { amount?: unknown; status?: string; timeoutMs?: number } = {}) {
  const sp = syncpay(opts);
  const store = memoryStore();
  let clock = new Date("2026-10-30T12:00:00Z");
  const client = new SyncpayClient({ baseUrl: "https://api.test", clientId: "id", clientSecret: "s" }, sp.fetcher as never, () => clock.getTime(), opts.timeoutMs ?? 10_000);
  const deps = { store, client, now: () => clock, newId: () => crypto.randomUUID(), webhookToken: "tok-webhook" };
  const advance = (ms: number) => (clock = new Date(clock.getTime() + ms));
  return { sp, store, deps, advance };
}

describe("corrida entre consultas paralelas", () => {
  it("uma leitura antiga (com a rede falhando) não desfaz uma confirmação feita em paralelo", async () => {
    const { sp, store, deps, advance } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!r.ok) throw new Error(r.error);
    const stale = { ...r.value }; // pedido B leu a doação ainda "aguardando"
    advance(31 * 60_000); // já passou da expiração local
    sp.state.status = "completed";
    expect((await refreshDonation(deps, r.value)).status).toBe("confirmado"); // pedido A confirma
    sp.state.hang = true; // pedido B: Syncpay não responde
    const fromB = await refreshDonation({ ...deps, client: new SyncpayClient({ baseUrl: "https://api.test", clientId: "id", clientSecret: "s" }, sp.fetcher as never, Date.now, 5) }, stale);
    expect(fromB.status).toBe("confirmado");
    expect(store.rows.get(r.value.id)!.status).toBe("confirmado");
  });

  it("o atalho de 4 s com leitura antiga também não desfaz a confirmação", async () => {
    const { sp, store, deps, advance } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!r.ok) throw new Error(r.error);
    advance(31 * 60_000);
    const stale = { ...r.value, lastCheckedAt: deps.now().toISOString() };
    sp.state.status = "completed";
    await refreshDonation(deps, r.value);
    expect((await refreshDonation(deps, stale, { minIntervalMs: 4000 })).status).toBe("confirmado");
    expect(store.rows.get(r.value.id)!.status).toBe("confirmado");
  });

  it("aviso de falha atrasado não sobrescreve doação já confirmada", async () => {
    const { sp, store, deps } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!r.ok) throw new Error(r.error);
    const stale = { ...r.value };
    sp.state.status = "completed";
    await refreshDonation(deps, r.value);
    sp.state.status = "failed";
    expect((await refreshDonation(deps, stale)).status).toBe("confirmado");
    expect(store.rows.get(r.value.id)!.status).toBe("confirmado");
  });
});

describe("limites contra abuso", () => {
  it(`teto geral de ${PIX_GLOBAL_LIMIT_PER_HOUR} cobranças por hora, mesmo trocando o IP a cada pedido`, async () => {
    const { sp, deps } = setup();
    for (let i = 0; i < PIX_GLOBAL_LIMIT_PER_HOUR; i++) {
      expect((await createDonation(deps, { amount: 5, idempotencyKey: key(), ipHash: `ip-forjado-${i}` })).ok).toBe(true);
    }
    const before = sp.state.calls.filter((c) => c === "/cash-in").length;
    expect(await createDonation(deps, { amount: 5, idempotencyKey: key(), ipHash: "ip-novo" })).toMatchObject({ ok: false, status: 429 });
    expect(sp.state.calls.filter((c) => c === "/cash-in").length).toBe(before); // nem chegou na Syncpay
  });
});

describe("Syncpay lenta, fora do ar ou com respostas estranhas", () => {
  it("Syncpay travada: a criação desiste no tempo limite, responde 502 e não grava nada", async () => {
    const { sp, store, deps } = setup({ timeoutMs: 20 });
    sp.state.hang = true;
    const t0 = Date.now();
    expect(await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" })).toMatchObject({ ok: false, status: 502 });
    expect(Date.now() - t0).toBeLessThan(2000);
    expect(store.rows.size).toBe(0);
  });

  it("token da Syncpay recusado (401): descarta o token guardado e pede outro na próxima vez", async () => {
    const { sp, deps } = setup();
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!r.ok) throw new Error(r.error);
    sp.state.txUnauthorized = 1;
    expect((await refreshDonation(deps, r.value)).status).toBe("aguardando");
    const authsBefore = sp.state.calls.filter((c) => c === "/auth-token").length;
    sp.state.status = "completed";
    expect((await refreshDonation(deps, r.value)).status).toBe("confirmado");
    expect(sp.state.calls.filter((c) => c === "/auth-token").length).toBe(authsBefore + 1);
  });

  it("valor como texto numérico ('10.00') confirma; texto inválido nunca confirma", async () => {
    const ok = setup({ amount: "10.00", status: "completed" });
    const a = await createDonation(ok.deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!a.ok) throw new Error(a.error);
    expect((await refreshDonation(ok.deps, a.value)).status).toBe("confirmado");

    for (const bad of ["10abc", "", "1e3", null, { v: 10 }, true]) {
      const t = setup({ status: "completed" });
      const b = await createDonation(t.deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
      if (!b.ok) throw new Error(b.error);
      t.sp.state.amount = bad;
      expect((await refreshDonation(t.deps, b.value)).status, String(bad)).toBe("aguardando");
    }
  });

  it("status desconhecido da Syncpay não muda nada", async () => {
    const { deps } = setup({ status: "processing_weird" });
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!r.ok) throw new Error(r.error);
    expect((await refreshDonation(deps, r.value)).status).toBe("aguardando");
  });
});

describe("banco (Supabase) fora do ar", () => {
  it("antes de cobrar: falha sem criar cobrança na Syncpay", async () => {
    const { sp, store, deps } = setup();
    store.down = true;
    await expect(createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" })).rejects.toThrow();
    expect(sp.state.calls).toEqual([]);
  });

  it("depois de cobrar: não devolve o Copia e Cola (ninguém paga uma cobrança sem registro)", async () => {
    const { store, deps } = setup();
    const insert = store.insert;
    store.insert = async () => {
      store.down = true;
      throw new Error("falhou ao gravar");
    };
    await expect(createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" })).rejects.toThrow();
    store.insert = insert;
    expect(store.rows.size).toBe(0);
  });

  it("webhook com o banco fora: lança erro (a função responde 500) e nada muda", async () => {
    const { sp, store, deps } = setup({ status: "completed" });
    const r = await createDonation(deps, { amount: 10, idempotencyKey: key(), ipHash: "ip" });
    if (!r.ok) throw new Error(r.error);
    store.down = true;
    await expect(handleWebhook(deps, "Bearer tok-webhook", { id: r.value.providerId })).rejects.toThrow();
    store.down = false;
    expect(store.rows.get(r.value.id)!.status).toBe("aguardando");
    expect(sp.state.calls.filter((c) => c.startsWith("/transaction/"))).toHaveLength(0);
  });

  it("webhook sem token continua 401 mesmo com o banco fora (não toca no banco)", async () => {
    const { store, deps } = setup();
    store.down = true;
    expect((await handleWebhook(deps, null, { id: "x" })).status).toBe(401);
  });
});

describe("tela de doação: acompanhamento do pagamento", () => {
  it("depois de falhas continua consultando, espaçando até 30 s (nunca para)", () => {
    expect(pollDelay(0)).toBe(5_000);
    expect(pollDelay(1)).toBe(10_000);
    expect(pollDelay(2)).toBe(20_000);
    expect(pollDelay(3)).toBe(30_000);
    expect(pollDelay(1000)).toBe(30_000);
    expect(pollDelay(-1)).toBe(5_000);
    expect(pollDelay(Number.NaN)).toBe(5_000);
  });
});

describe("Batalha: Judge0 travado", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("a chamada ao Judge0 tem tempo limite e, se estourar, vira erro técnico (não erro do jogador)", async () => {
    let signal: AbortSignal | null | undefined;
    vi.stubGlobal("fetch", (_url: string, init?: RequestInit) => {
      signal = init?.signal;
      return Promise.reject(new DOMException("timeout", "TimeoutError"));
    });
    const r = await judgeSubmission({ url: "https://judge.test" }, battleBank[0]!, "python", "def resolver(a, b):\n    return a", 1);
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(r.verdict).toBe("erro_tecnico");
  });
});
