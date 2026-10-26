import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { asRole, createTestDb, createUser } from "./harness";

/** Convites, revanche, histórico, revisão, sorteio sem repetição e eventos — com dois jogadores reais. */
const ANA = "dddddddd-0000-4000-8000-000000000001";
const BETO = "dddddddd-0000-4000-8000-000000000002";
const CAIO = "dddddddd-0000-4000-8000-000000000003";
let db: PGlite;

type J = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const user = <T,>(id: string, sql: string, params: unknown[] = []) => asRole(db, "authenticated", id, async (tx) => (await tx.query<T>(sql, params)).rows);
const one = async (id: string, sql: string, params: unknown[] = []) => (await user<{ r: J }>(id, sql, params))[0]!.r;
const service = <T,>(sql: string, params: unknown[] = []) => asRole(db, "service_role", null, async (tx) => (await tx.query<T>(sql, params)).rows);

const invite = (id: string, lang = "python") => one(id, "select public.battle_invite_create($1) as r", [lang]);
const accept = (id: string, code: string, lang = "javascript") => one(id, "select public.battle_invite_accept($1, $2) as r", [code, lang]);
const state = (id: string, match: string) => one(id, "select public.battle_state($1, null) as r", [match]);
const rematch = (id: string, match: string, action = "pedir") => one(id, "select public.battle_rematch($1, $2) as r", [match, action]);
const profile = async (u: string) => (await db.query<{ trophies: number; wins: number; losses: number }>("select trophies, wins, losses from public.battle_profiles where user_id = $1", [u])).rows[0];

/** Faz a partida começar e termina com vitória de `winner` (envio aceito pelo corretor). */
async function win(match: string, winner: string) {
  await db.query("update public.battle_matches set starts_at = now() - interval '1 second' where id = $1", [match]);
  const reg = (await service<{ r: J }>("select public.battle_register_submission($1, $2, 'x') as r", [winner, match]))[0]!.r;
  expect(reg.ok).toBe(true);
  await service("select public.battle_complete_submission($1, 'aceito', 3, 3, null)", [reg.submission_id]);
}

beforeAll(async () => {
  db = await createTestDb({ battle: true });
  for (const [id, name] of [[ANA, "Ana"], [BETO, "Beto"], [CAIO, "Caio"]] as const) await createUser(db, id, { full_name: name });
});

beforeEach(async () => {
  await db.exec("update public.battle_participants set active = false; delete from public.battle_queue; delete from public.battle_invites;");
});

describe("desafiar um amigo", () => {
  it("cria um código, o amigo vê quem convidou e entra; os dois recebem a mesma partida amistosa", async () => {
    const inv = await invite(ANA);
    expect(inv.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
    const peek = await one(BETO, "select public.battle_invite_peek($1) as r", [inv.code.toLowerCase()]);
    expect(peek).toMatchObject({ status: "aberto", host_name: "Ana", mine: false });
    expect(JSON.stringify(peek)).not.toContain(ANA);

    const r = await accept(BETO, inv.code);
    expect(r.ok).toBe(true);
    const mine = await one(ANA, "select public.battle_invite_mine() as r");
    expect(mine).toMatchObject({ status: "aceito", match_id: r.match_id });
    const sa = await state(ANA, r.match_id);
    const sb = await state(BETO, r.match_id);
    expect(sa.kind).toBe("amistosa");
    expect(sa.opponent.name).toBe("Beto");
    expect(sb.opponent.name).toBe("Ana");
    expect(sb.me.lang).toBe("javascript");
  });

  it("partida amistosa não mexe em troféus nem nas vitórias do perfil", async () => {
    const before = { a: await profile(ANA), b: await profile(BETO) };
    const r = await accept(BETO, (await invite(ANA)).code);
    await win(r.match_id, ANA);
    const s = await state(ANA, r.match_id);
    expect(s.winner).toBe("eu");
    expect(s.me.trophy_delta).toBe(0);
    expect(await profile(ANA)).toEqual(before.a);
    expect(await profile(BETO)).toEqual(before.b);
  });

  it("recusa convite próprio, usado, cancelado, expirado ou com código errado", async () => {
    const inv = await invite(ANA);
    expect((await accept(ANA, inv.code)).ok).toBe(false);
    expect((await accept(BETO, "ZZZZZZZZ")).error).toMatch(/não encontrado/);
    const r = await accept(BETO, inv.code);
    expect(r.ok).toBe(true);
    await db.exec("update public.battle_participants set active = false");
    expect((await accept(CAIO, inv.code)).error).toMatch(/já foi usado/);

    const inv2 = await invite(ANA);
    await user(ANA, "select public.battle_invite_cancel()");
    expect((await accept(BETO, inv2.code)).error).toMatch(/cancelado/);

    const inv3 = await invite(ANA);
    await db.query("update public.battle_invites set created_at = now() - interval '20 minutes', expires_at = now() - interval '1 minute' where code = $1", [inv3.code]);
    expect((await accept(BETO, inv3.code)).error).toMatch(/expirou/);
  });

  it("ninguém entra se um dos dois já está em outra partida", async () => {
    const inv = await invite(ANA);
    const other = await accept(CAIO, (await invite(BETO)).code);
    expect(other.ok).toBe(true);
    expect((await accept(BETO, inv.code)).error).toMatch(/partida atual/);
  });

  it("um terceiro não consegue ver nem mexer na partida privada", async () => {
    const r = await accept(BETO, (await invite(ANA)).code);
    await expect(state(CAIO, r.match_id)).rejects.toThrow(/partida não encontrada/);
    await expect(user(CAIO, "select * from public.battle_invites")).rejects.toThrow(/permission denied/);
    await expect(user(CAIO, "update public.battle_matches set winner_id = $1", [CAIO])).rejects.toThrow(/permission denied/);
  });

  it("sem login não dá para criar, ver ou aceitar convites", async () => {
    await expect(asRole(db, "anon", null, (tx) => tx.query("select public.battle_invite_create('python')"))).rejects.toThrow(/permission denied/);
    await expect(asRole(db, "anon", null, (tx) => tx.query("select public.battle_invite_peek('ABCDEFGH')"))).rejects.toThrow(/permission denied/);
  });
});

describe("revanche", () => {
  async function finishedMatch() {
    const r = await accept(BETO, (await invite(ANA)).code);
    await win(r.match_id, BETO);
    await state(ANA, r.match_id);
    await state(BETO, r.match_id);
    return r.match_id as string;
  }

  it("um pede, o outro aceita: nasce uma partida nova e a anterior continua registrada", async () => {
    const old = await finishedMatch();
    expect((await rematch(ANA, old)).status).toBe("pedido_por_mim");
    expect((await state(BETO, old)).rematch.status).toBe("pedido_pelo_adversario");
    const acc = await rematch(BETO, old, "aceitar");
    expect(acc.status).toBe("aceito");
    expect(acc.match_id).not.toBe(old);
    const fresh = await state(ANA, acc.match_id);
    expect(fresh.status).toBe("pronta");
    expect(fresh.kind).toBe("amistosa");
    const prev = await state(ANA, old);
    expect(prev.winner).toBe("adversario");
    // Pedir de novo não cria uma terceira partida.
    expect((await rematch(BETO, old)).match_id).toBe(acc.match_id);
    expect((await db.query<{ n: number }>("select count(*)::int as n from public.battle_matches where rematch_of = $1", [old])).rows[0]!.n).toBe(1);
  });

  it("recusar encerra o pedido; só o convidado pode aceitar ou recusar", async () => {
    const old = await finishedMatch();
    await rematch(ANA, old);
    expect((await rematch(ANA, old, "aceitar")).status).toBe("pedido_por_mim");
    expect((await rematch(BETO, old, "recusar")).status).toBe("recusado");
    expect((await rematch(ANA, old)).status).toBe("recusado");
    await expect(rematch(CAIO, old)).rejects.toThrow(/partida não encontrada/);
  });

  it("explica quando o adversário não está mais disponível", async () => {
    const old = await finishedMatch();
    await db.query("update public.battle_participants set last_seen = now() - interval '5 minutes' where match_id = $1 and user_id = $2", [old, BETO]);
    const r = await rematch(ANA, old);
    expect(r.status).toBe("nenhum");
    expect(r.error).toMatch(/saiu da tela/);
  });

  it("não dá revanche de partida em andamento", async () => {
    const r = await accept(BETO, (await invite(ANA)).code);
    await expect(rematch(ANA, r.match_id)).rejects.toThrow(/ainda não terminou/);
  });
});

describe("histórico, revisão e sorteio", () => {
  it("o histórico traz tipo, desafio, envios e tempo; a revisão só aparece no fim", async () => {
    const r = await accept(BETO, (await invite(ANA)).code);
    await db.query("update public.battle_matches set starts_at = now() - interval '1 second' where id = $1", [r.match_id]);
    const during = await state(ANA, r.match_id);
    expect(during.review).toBeNull();
    expect(during.me.final_code).toBeNull();
    await win(r.match_id, ANA);
    const after = await state(ANA, r.match_id);
    expect(after.review?.idea).toBeTruthy();
    expect(after.me.final_code).toBe("x");
    const [h] = await user<J>(ANA, "select * from public.battle_history(5)");
    expect(h).toMatchObject({ match_id: r.match_id, kind: "amistosa", solved: true, submissions: 1, outcome: "vitoria" });
    expect(typeof h!.solve_sec).toBe("number");
  });

  it("o sorteio evita repetir o desafio que um dos dois acabou de jogar", async () => {
    await db.exec("delete from public.battle_invites; delete from public.battle_matches;"); // começa sem histórico
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const r = await accept(BETO, (await invite(ANA)).code);
      const [m] = (await db.query<{ challenge_id: string }>("select challenge_id from public.battle_matches where id = $1", [r.match_id])).rows;
      seen.add(m!.challenge_id);
      await win(r.match_id, ANA);
    }
    const tier1 = (await db.query<{ n: number }>("select count(*)::int as n from public.battle_challenges where enabled and tier = 1")).rows[0]!.n;
    expect(seen.size).toBe(Math.min(3, tier1));
  });
});

describe("eventos semanais", () => {
  it("o placar conta só partidas ranqueadas do período e dos níveis do evento", async () => {
    await db.exec(`insert into public.battle_events (id, slug, name, description, metric, tiers, starts_at, ends_at)
      values (99, 'teste', 'Teste', 'x', 'vitorias', '{1,2,3,4,5,6,7,8,9}', now() - interval '1 day', now() + interval '1 day')
      on conflict (id) do update set starts_at = excluded.starts_at, ends_at = excluded.ends_at`);
    // Amistosa não conta.
    const f = await accept(BETO, (await invite(ANA)).code);
    await win(f.match_id, ANA);
    let s = await one(ANA, "select public.battle_event_summary(99) as r");
    expect(s.me).toBeNull();
    // Ranqueada conta.
    await one(ANA, "select public.battle_join_queue('python') as r");
    const q = await one(BETO, "select public.battle_join_queue('python') as r");
    expect(q.state).toBe("partida");
    await win(q.match_id, ANA);
    s = await one(ANA, "select public.battle_event_summary(99) as r");
    expect(s.me).toMatchObject({ rank: 1, score: 1 });
    expect(s.leaders[0]).toMatchObject({ name: "Ana", score: 1, is_me: true });
    expect(JSON.stringify(s)).not.toContain(ANA);
  });

  it("os eventos configurados existem e não se sobrepõem", async () => {
    const rows = (await db.query<{ id: number; starts_at: string; ends_at: string }>("select id, starts_at, ends_at from public.battle_events where id < 99 order by starts_at")).rows;
    expect(rows.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < rows.length; i++) expect(new Date(rows[i]!.starts_at) >= new Date(rows[i - 1]!.ends_at)).toBe(true);
  });
});
