import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { xpSources } from "@content/xp-sources";
import { asRole, createTestDb, createUser } from "./harness";

/**
 * award_xp não pode deixar ninguém dar a si mesmo todo o XP do site num pedido só
 * (o conteúdo é público e a conferência das respostas acontece no navegador).
 * O banco limita o ritmo: 400 XP a cada 10 minutos e 1.200 XP por dia, por pessoa.
 */
const DAY_CAP = 1200;
const BURST_CAP = 400;

const ANA = "bbbbbbbb-0000-4000-8000-000000000001";
const BETO = "bbbbbbbb-0000-4000-8000-000000000002";
let db: PGlite;

const award = (user: string, keys: string[]) =>
  asRole(db, "authenticated", user, async (tx) => (await tx.query<{ total: number }>("select public.award_xp($1::text[]) as total", [keys])).rows[0]!.total);

const eventsOf = async (user: string) =>
  (await db.query<{ source_key: string; amount: number }>("select source_key, amount from public.xp_events where user_id = $1 order by created_at, source_key", [user])).rows;

/** Empurra o XP já ganho para o passado (simula o tempo passando, só no banco de teste). */
const ageEvents = (user: string, interval: string) => db.query(`update public.xp_events set created_at = created_at - interval '${interval}' where user_id = $1`, [user]);

const allKeys = () => xpSources().map((s) => s.key);

beforeAll(async () => {
  db = await createTestDb({ seed: true });
  await createUser(db, ANA, { full_name: "Ana" });
  await createUser(db, BETO, { full_name: "Beto" });
});

describe("limite de ritmo do XP", () => {
  it("pedir todas as atividades de uma vez rende no máximo 400 XP", async () => {
    const keys = allKeys();
    expect(keys.length).toBeGreaterThan(400);
    const total = await award(ANA, keys);
    expect(total).toBeLessThanOrEqual(BURST_CAP);
    expect(total).toBeGreaterThan(BURST_CAP - 60);
  });

  it("repetir o pedido logo em seguida não rende mais nada", async () => {
    const before = await award(ANA, []);
    expect(await award(ANA, allKeys())).toBe(before);
  });

  it("as atividades entram na ordem em que foram enviadas (a mais antiga primeiro)", async () => {
    const keys = allKeys().slice(0, 30);
    await award(BETO, [...keys].reverse());
    const got = (await eventsOf(BETO)).map((e) => e.source_key);
    const expected = [...keys].reverse().slice(0, got.length);
    expect(new Set(got)).toEqual(new Set(expected));
  });

  it("depois de 10 minutos, mais XP entra, mas o dia não passa de 1.200", async () => {
    for (let round = 0; round < 6; round++) {
      await ageEvents(ANA, "11 minutes");
      await award(ANA, allKeys());
    }
    const today = await db.query<{ xp: number }>(
      "select coalesce(sum(amount), 0)::integer as xp from public.xp_events where user_id = $1 and created_at >= (date_trunc('day', now() at time zone 'America/Sao_Paulo')) at time zone 'America/Sao_Paulo'",
      [ANA],
    );
    // Parte do XP pode ter sido empurrada para o dia anterior pelo teste; o que importa é o dia de hoje.
    expect(today.rows[0]!.xp).toBeLessThanOrEqual(DAY_CAP);
    const total = await award(ANA, []);
    expect(total).toBeGreaterThan(BURST_CAP);
  });

  it("no dia seguinte o limite recomeça e o XP pendente continua entrando", async () => {
    const before = await award(ANA, []);
    await ageEvents(ANA, "2 days");
    const after = await award(ANA, allKeys());
    expect(after).toBeGreaterThan(before);
    expect(after - before).toBeLessThanOrEqual(BURST_CAP);
  });

  it("o XP de uma pessoa não consome o limite de outra", async () => {
    const CAIO = "bbbbbbbb-0000-4000-8000-000000000003";
    await createUser(db, CAIO, { full_name: "Caio" });
    const lesson = xpSources().find((s) => s.key.startsWith("lesson:"))!;
    expect(await award(CAIO, [lesson.key])).toBe(lesson.amount);
  });

  it("continua aceitando só atividades cadastradas, com o valor do banco", async () => {
    const DANI = "bbbbbbbb-0000-4000-8000-000000000004";
    await createUser(db, DANI, { full_name: "Dani" });
    expect(await award(DANI, ["lesson:nao-existe", "xp:9999", "game:hack"])).toBe(0);
  });
});
