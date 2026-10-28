import type { PGlite } from "@electric-sql/pglite";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { arenaFor, ARENAS, trophyDelta, type BattleChallenge } from "@battle/battle-core.ts";
import { battleChallengesSql, battleConfigSql } from "@battle/battle-sql.ts";
import { asRole, createTestDb, createUser } from "./harness";

const ANA = "cccccccc-0000-4000-8000-000000000001";
const BETO = "cccccccc-0000-4000-8000-000000000002";
const CAIO = "cccccccc-0000-4000-8000-000000000003";
const DANI = "cccccccc-0000-4000-8000-000000000004";
const ROOT = path.resolve(__dirname, "../..");

let db: PGlite;

type J = Record<string, unknown>;
const user = <T,>(id: string, sql: string, params: unknown[] = []) => asRole(db, "authenticated", id, async (tx) => (await tx.query<T>(sql, params)).rows);
const service = <T,>(sql: string, params: unknown[] = []) => asRole(db, "service_role", null, async (tx) => (await tx.query<T>(sql, params)).rows);
const join = async (id: string, lang = "python") => (await user<{ r: J }>(id, "select public.battle_join_queue($1) as r", [lang]))[0]!.r;
const state = async (id: string, match: string, activity: string | null = null) => (await user<{ r: J }>(id, "select public.battle_state($1, $2) as r", [match, activity]))[0]!.r;
const register = async (u: string, match: string, code = "print(1)") => (await service<{ r: J }>("select public.battle_register_submission($1, $2, $3) as r", [u, match, code]))[0]!.r;
const complete = async (sub: number, status: string) => (await service<{ r: J }>("select public.battle_complete_submission($1, $2, 3, 3, 'x') as r", [sub, status]))[0]!.r;
const profile = async (u: string) => (await db.query<{ trophies: number; wins: number; losses: number; draws: number; abandons: number; streak: number }>("select trophies, wins, losses, draws, abandons, streak from public.battle_profiles where user_id = $1", [u])).rows[0]!;

/** Começa uma partida já em andamento entre dois jogadores. */
async function startMatch(a: string, b: string): Promise<string> {
  await join(a);
  const r = await join(b);
  expect(r.state).toBe("partida");
  const id = r.match_id as string;
  await db.query("update public.battle_matches set starts_at = now() - interval '1 second', ends_at = now() + interval '3 minutes' where id = $1", [id]);
  return id;
}

beforeAll(async () => {
  db = await createTestDb({ battle: true });
  for (const [id, name] of [[ANA, "Ana"], [BETO, "Beto"], [CAIO, "Caio"], [DANI, "Dani"]] as const) await createUser(db, id, { full_name: name });
});

beforeEach(async () => {
  // Cada teste começa sem partidas ativas nem fila (o perfil competitivo continua).
  await db.exec("update public.battle_participants set active = false; delete from public.battle_queue;");
});

describe("configuração da Batalha", () => {
  it("o SQL de configuração e o de desafios estão atualizados com o código", async () => {
    expect(readFileSync(path.join(ROOT, "supabase/battle-config.sql"), "utf8")).toBe(battleConfigSql());
    if (existsSync(path.join(ROOT, "supabase/functions/_shared/battle-bank.ts"))) {
      // Caminho montado em tempo de execução: o banco é privado (fora do Git) e o CI não o tem.
      const bankModule = "@battle/" + "battle-bank.ts";
      const { battleBank } = (await import(/* @vite-ignore */ bankModule)) as { battleBank: BattleChallenge[] };
      expect(readFileSync(path.join(ROOT, "supabase/battle-challenges.sql"), "utf8")).toBe(battleChallengesSql(battleBank));
      for (const a of ARENAS) expect(battleBank.some((c) => c.tier === a.tier), `nível ${a.tier}`).toBe(true);
      const { BATTLE_REVIEWS } = await import("@battle/battle-review.ts");
      for (const c of battleBank) expect(BATTLE_REVIEWS[c.id]?.idea, `revisão de ${c.id}`).toBeTruthy();
    }
  });

  it("a regra de troféus do banco é igual à do código", async () => {
    const samples: Array<[number, number, string]> = [];
    for (const me of [0, 10, 149, 150, 155, 399, 400, 420, 800, 1300, 2000, 2600])
      for (const opp of [0, 100, 400, 900, 2500]) for (const o of ["vitoria", "derrota", "abandono"]) samples.push([me, opp, o]);
    for (const [me, opp, o] of samples) {
      const [row] = (await db.query<{ d: number }>("select public.battle_trophy_delta($1, $2, $3) as d", [me, opp, o])).rows;
      expect(row!.d, `${me} vs ${opp} ${o}`).toBe(trophyDelta(me, opp, o as "vitoria"));
      expect(me + row!.d).toBeGreaterThanOrEqual(0);
    }
  });

  it("arena inicial protege iniciantes: derrota não tira troféus", () => {
    expect(trophyDelta(0, 0, "derrota")).toBe(0);
    expect(trophyDelta(160, 160, "derrota")).toBe(-10);
    expect(trophyDelta(155, 155, "derrota")).toBe(-5); // não cai abaixo do piso do Vale dos Laços (150)
    expect(arenaFor(0).name).toBe("Terminal Inicial");
  });
});

describe("segurança das tabelas", () => {
  it("o navegador não lê nem escreve as tabelas da Batalha", async () => {
    for (const t of ["battle_matches", "battle_participants", "battle_submissions", "battle_profiles", "battle_queue", "battle_challenges"]) {
      await expect(user(ANA, `select * from public.${t}`)).rejects.toThrow(/permission denied/);
    }
    await expect(user(ANA, "insert into public.battle_profiles (user_id, trophies) values ($1, 9999)", [ANA])).rejects.toThrow(/permission denied/);
  });

  it("o navegador não registra envios nem resultados (só a Edge Function)", async () => {
    await expect(user(ANA, "select public.battle_register_submission($1, gen_random_uuid(), 'x')", [ANA])).rejects.toThrow(/permission denied/);
    await expect(user(ANA, "select public.battle_complete_submission(1, 'aceito', 1, 1, 'x')")).rejects.toThrow(/permission denied/);
  });
});

describe("matchmaking", () => {
  it("sem adversário fica na fila; com dois jogadores, os dois recebem a mesma partida", async () => {
    expect((await join(ANA, "java")).state).toBe("fila");
    expect((await join(ANA, "java")).state).toBe("fila"); // pedido repetido não duplica
    const b = await join(BETO, "c");
    expect(b.state).toBe("partida");
    const a = await join(ANA, "java");
    expect(a).toEqual({ state: "partida", match_id: b.match_id });
    const parts = (await db.query<{ user_id: string; lang: string }>("select user_id, lang from public.battle_participants where match_id = $1 order by user_id", [b.match_id])).rows;
    expect(parts).toEqual([{ user_id: ANA, lang: "java" }, { user_id: BETO, lang: "c" }]);
    expect((await db.query("select * from public.battle_queue")).rows).toEqual([]);
  });

  it("quem já está em partida não entra em outra", async () => {
    const id = await startMatch(ANA, BETO);
    expect(await join(CAIO)).toMatchObject({ state: "fila" });
    expect(await join(ANA)).toEqual({ state: "partida", match_id: id });
    expect((await db.query("select count(*)::int as n from public.battle_participants where active and user_id = $1", [ANA])).rows[0]).toEqual({ n: 1 });
  });

  it("diferença grande de troféus espera; a janela cresce com o tempo", async () => {
    await db.query("insert into public.battle_profiles (user_id, trophies) values ($1, 1500) on conflict (user_id) do update set trophies = 1500", [DANI]);
    expect((await join(CAIO)).state).toBe("fila");
    expect((await join(DANI)).state).toBe("fila");
    await db.query("update public.battle_queue set joined_at = now() - interval '2 minutes'");
    expect((await join(DANI)).state).toBe("partida");
    await db.query("update public.battle_profiles set trophies = 0 where user_id = $1", [DANI]);
  });
});

describe("partida", () => {
  it("o desafio só aparece quando a contagem termina, igual para os dois", async () => {
    await join(ANA);
    const id = (await join(BETO)).match_id as string;
    const before = await state(ANA, id);
    expect(before.status).toBe("pronta");
    expect(before.challenge).toBeNull();
    await db.query("update public.battle_matches set starts_at = now() - interval '1 second' where id = $1", [id]);
    const a = await state(ANA, id);
    const b = await state(BETO, id);
    expect(a.status).toBe("em_andamento");
    expect(a.challenge).toEqual(b.challenge);
    expect(a.ends_at).toBe(b.ends_at);
    expect(JSON.stringify(a.challenge)).not.toMatch(/reference|solutions|edge|generate/);
  });

  it("solução errada não vence; a primeira correta vence e os troféus são aplicados", async () => {
    const id = await startMatch(ANA, BETO);
    const before = { ana: await profile(ANA), beto: await profile(BETO) };
    const s1 = await register(ANA, id);
    expect(s1.ok).toBe(true);
    expect((await register(ANA, id)).error).toMatch(/espere a correção/);
    await complete(s1.submission_id as number, "resposta_errada");
    expect((await state(BETO, id)).status).toBe("em_andamento");
    expect((await register(ANA, id)).error).toMatch(/espere 5 segundos/);

    const s2 = await register(BETO, id);
    await complete(s2.submission_id as number, "aceito");
    const a = await state(ANA, id);
    const b = await state(BETO, id);
    expect(b).toMatchObject({ status: "finalizada", result: "vitoria", winner: "eu" });
    expect(a).toMatchObject({ status: "finalizada", winner: "adversario" });
    const after = { ana: await profile(ANA), beto: await profile(BETO) };
    expect(after.beto.trophies - before.beto.trophies).toBe((b.me as J).trophy_delta);
    expect(after.beto.wins).toBe(before.beto.wins + 1);
    expect(after.ana.losses).toBe(before.ana.losses + 1);
    expect(after.ana.trophies).toBeGreaterThanOrEqual(0);
    expect((await register(ANA, id)).error).toMatch(/já terminou/);
  });

  it("o código do adversário só é revelado depois do fim", async () => {
    const id = await startMatch(ANA, BETO);
    const s = await register(BETO, id, "segredo = 42");
    await complete(s.submission_id as number, "resposta_errada");
    expect(((await state(ANA, id)).opponent as J).final_code).toBeNull();
    await user(BETO, "select public.battle_forfeit($1)", [id]);
    expect(((await state(ANA, id)).opponent as J).final_code).toBe("segredo = 42");
  });

  it("envios quase simultâneos: vence o enviado primeiro, mesmo se corrigido depois", async () => {
    const id = await startMatch(ANA, BETO);
    const sa = await register(ANA, id);
    const sb = await register(BETO, id);
    await complete(sb.submission_id as number, "aceito"); // Beto corrigido antes...
    expect((await state(ANA, id)).status).toBe("em_andamento"); // ...mas o envio da Ana é anterior e ainda está em correção
    await complete(sa.submission_id as number, "aceito");
    expect(await state(ANA, id)).toMatchObject({ status: "finalizada", winner: "eu" });
  });

  it("se o envio anterior estiver errado, o seguinte correto vence", async () => {
    const id = await startMatch(ANA, BETO);
    const sa = await register(ANA, id);
    const sb = await register(BETO, id);
    await complete(sb.submission_id as number, "aceito");
    await complete(sa.submission_id as number, "resposta_errada");
    expect(await state(BETO, id)).toMatchObject({ status: "finalizada", winner: "eu" });
  });

  it("tempo esgotado sem solução correta: sem vencedor e sem troféus", async () => {
    const id = await startMatch(ANA, BETO);
    const before = await profile(ANA);
    await db.query("update public.battle_matches set ends_at = now() - interval '1 second' where id = $1", [id]);
    expect((await register(ANA, id)).error).toMatch(/terminou|tempo acabou/);
    const s = await state(ANA, id);
    expect(s).toMatchObject({ status: "finalizada", result: "tempo_esgotado", winner: null });
    expect((s.me as J).trophy_delta).toBe(0);
    expect((await profile(ANA)).draws).toBe(before.draws + 1);
  });

  it("envio feito dentro do prazo ainda é corrigido depois do fim", async () => {
    const id = await startMatch(ANA, BETO);
    const s = await register(ANA, id);
    await db.query("update public.battle_matches set ends_at = now() - interval '1 second' where id = $1", [id]);
    expect((await state(BETO, id)).status).toBe("em_andamento");
    await complete(s.submission_id as number, "aceito");
    expect(await state(ANA, id)).toMatchObject({ status: "finalizada", winner: "eu" });
  });

  it("desistência e desconexão contam como abandono", async () => {
    const id = await startMatch(ANA, BETO);
    const r = (await user<{ r: J }>(ANA, "select public.battle_forfeit($1) as r", [id]))[0]!.r;
    expect(r).toMatchObject({ status: "finalizada", result: "abandono", winner: "adversario" });

    const id2 = await startMatch(CAIO, DANI);
    await db.query("update public.battle_participants set last_seen = now() - interval '2 minutes' where match_id = $1 and user_id = $2", [id2, CAIO]);
    expect(await state(DANI, id2)).toMatchObject({ result: "abandono", winner: "eu" });
    expect((await profile(CAIO)).abandons).toBeGreaterThan(0);
  });

  it("reconexão: a pessoa recupera a partida ativa", async () => {
    const id = await startMatch(ANA, BETO);
    expect((await user<{ id: string }>(ANA, "select public.battle_my_active() as id"))[0]!.id).toBe(id);
    expect(((await user<{ r: J }>(ANA, "select public.battle_me() as r"))[0]!.r).active_match).toBe(id);
  });

  it("a varredura automática fecha partidas abandonadas pelos dois", async () => {
    const id = await startMatch(ANA, BETO);
    await db.query("update public.battle_matches set starts_at = now() - interval '10 minutes', ends_at = now() - interval '5 minutes' where id = $1", [id]);
    await service("select public.battle_sweep()");
    expect((await db.query<{ status: string }>("select status from public.battle_matches where id = $1", [id])).rows[0]!.status).toBe("finalizada");
  });
});

describe("ranking da Batalha", () => {
  it("é separado do XP: nenhuma partida cria XP", async () => {
    expect((await db.query("select count(*)::int as n from public.xp_events")).rows[0]).toEqual({ n: 0 });
  });

  it("mostra troféus, arena, vitórias, derrotas e taxa de vitória, sem expor ids", async () => {
    const rows = await asRole(db, "anon", null, async (tx) => (await tx.query<J>("select * from public.battle_leaderboard('geral', 50)")).rows);
    expect(rows.length).toBeGreaterThan(0);
    const first = rows[0]!;
    expect(Object.keys(first).sort()).toEqual(["arena_name", "avatar_url", "best_streak", "display_name", "is_me", "losses", "rank", "streak", "trophies", "username", "win_rate", "wins"]);
    const totals = (await db.query<{ trophies: number }>("select trophies from public.battle_profiles order by trophies desc limit 1")).rows[0]!;
    expect(first.trophies).toBe(totals.trophies);
    const season = await asRole(db, "anon", null, async (tx) => (await tx.query<J>("select * from public.battle_leaderboard('temporada', 50)")).rows);
    expect(Array.isArray(season)).toBe(true);
  });

  it("histórico mostra as partidas da pessoa", async () => {
    const h = await user<J>(ANA, "select * from public.battle_history(50)");
    expect(h.length).toBeGreaterThan(3);
    expect(h[0]).toHaveProperty("outcome");
  });
});
