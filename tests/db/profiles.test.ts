import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { xpSources } from "@content/xp-sources";
import { asRole, createTestDb, createUser } from "./harness";

const ANA = "bbbbbbbb-0000-4000-8000-000000000001";
const BETO = "bbbbbbbb-0000-4000-8000-000000000002";
const CAIO = "bbbbbbbb-0000-4000-8000-000000000003";

let db: PGlite;

const as = <T,>(user: string | null, sql: string, params: unknown[] = []) =>
  asRole(db, user ? "authenticated" : "anon", user, async (tx) => (await tx.query<T>(sql, params)).rows);

beforeAll(async () => {
  db = await createTestDb({ seed: true });
  await createUser(db, ANA, { full_name: "Ana Souza" });
  await createUser(db, BETO, { name: "Beto" });
  await createUser(db, CAIO, { name: "Caio" });
  const lesson = xpSources().find((s) => s.key.startsWith("lesson:"))!.key;
  const challenge = xpSources().find((s) => s.key.startsWith("challenge:"))!.key;
  await as(ANA, "select public.award_xp($1::text[])", [[lesson, challenge]]);
  await as(BETO, "select public.award_xp($1::text[])", [[lesson]]);
});

describe("perfil público", () => {
  it("todo perfil nasce com um usuário válido e único", async () => {
    const rows = await db.query<{ username: string }>("select username from public.profiles");
    expect(rows.rows).toHaveLength(3);
    for (const r of rows.rows) expect(r.username).toMatch(/^dev_[a-f0-9]{8}$/);
  });

  it("a pessoa edita o próprio perfil, com validação de usuário, GitHub, LinkedIn e site", async () => {
    // Perfis nascem privados (20261028000011_portfolio.sql): Ana e Beto escolhem publicar.
    expect((await db.query<{ n: number }>("select count(*)::int as n from public.profiles where is_public")).rows[0]!.n).toBe(0);
    await as(ANA, "update public.profiles set username = 'ana_dev', headline = 'Estudando React', github = 'ana-souza', linkedin = 'ana-souza-123', website = 'https://ana.dev', is_public = true where id = $1", [ANA]);
    await as(BETO, "update public.profiles set username = 'beto', is_public = true where id = $1", [BETO]);
    await as(CAIO, "update public.profiles set username = 'caio', is_public = false where id = $1", [CAIO]);
    await expect(as(BETO, "update public.profiles set username = 'ana_dev' where id = $1", [BETO])).rejects.toThrow(/unique|duplicate/);
    await expect(as(BETO, "update public.profiles set username = 'Com Espaço' where id = $1", [BETO])).rejects.toThrow(/check/);
    await expect(as(BETO, "update public.profiles set website = 'javascript:alert(1)' where id = $1", [BETO])).rejects.toThrow(/check/);
    await expect(as(BETO, "update public.profiles set github = 'x/../../y' where id = $1", [BETO])).rejects.toThrow(/check/);
    await expect(as(BETO, "update public.profiles set show_in_ranking = true, avatar_url = 'https://x.test/a.png' where id = $1", [BETO])).rejects.toThrow(/permission denied/);
  });

  it("qualquer visitante vê o perfil público, sem e-mail nem id", async () => {
    const [p] = await as<Record<string, unknown>>(null, "select * from public.get_public_profile('ANA_DEV')");
    expect(p).toMatchObject({ username: "ana_dev", display_name: "Ana Souza", github: "ana-souza", lessons: 1, challenges: 1, is_me: false });
    expect(Number(p!.xp)).toBeGreaterThan(0);
    expect(Object.keys(p!)).not.toContain("id");
    expect(Object.keys(p!)).not.toContain("email");
  });

  it("perfil privado só aparece para o dono", async () => {
    expect(await as(null, "select * from public.get_public_profile('caio')")).toEqual([]);
    expect(await as(ANA, "select * from public.get_public_profile('caio')")).toEqual([]);
    expect(await as<{ is_me: boolean }>(CAIO, "select is_me from public.get_public_profile('caio')")).toEqual([{ is_me: true }]);
  });

  it("a busca acha perfis públicos e trata % e _ como texto", async () => {
    const r = await as<{ username: string }>(null, "select username from public.search_profiles('ana')");
    expect(r.map((x) => x.username)).toEqual(["ana_dev"]);
    expect(await as(null, "select * from public.search_profiles('caio')")).toEqual([]);
    expect(await as(null, "select * from public.search_profiles('%%')")).toEqual([]);
    expect(await as(null, "select * from public.search_profiles('a')")).toEqual([]);
  });
});

describe("adicionar pessoas (seguir)", () => {
  it("a tabela de seguidores é fechada para leitura e escrita direta", async () => {
    await expect(as(ANA, "insert into public.follows values ($1, $2)", [ANA, BETO])).rejects.toThrow(/permission denied/);
    await expect(as(ANA, "select * from public.follows")).rejects.toThrow(/permission denied/);
  });

  it("segue, conta seguidores e desfaz", async () => {
    expect(await as<{ ok: boolean }>(ANA, "select public.follow_user('beto') as ok")).toEqual([{ ok: true }]);
    expect(await as<{ ok: boolean }>(ANA, "select public.follow_user('beto') as ok")).toEqual([{ ok: true }]);
    expect(await as<{ ok: boolean }>(BETO, "select public.follow_user('ana_dev') as ok")).toEqual([{ ok: true }]);
    const [b] = await as<{ followers: number; i_follow: boolean; follows_me: boolean }>(ANA, "select followers, i_follow, follows_me from public.get_public_profile('beto')");
    expect({ ...b, followers: Number(b!.followers) }).toEqual({ followers: 1, i_follow: true, follows_me: true });
    const list = await as<{ username: string }>(null, "select username from public.get_follow_list('ana_dev', 'seguidores')");
    expect(list.map((x) => x.username)).toEqual(["beto"]);
    await as(BETO, "select public.unfollow_user('ana_dev')");
    expect(await as(null, "select * from public.get_follow_list('ana_dev', 'seguidores')")).toEqual([]);
  });

  it("não segue a si mesmo, perfis privados nem sem login", async () => {
    expect(await as<{ ok: boolean }>(ANA, "select public.follow_user('ana_dev') as ok")).toEqual([{ ok: false }]);
    expect(await as<{ ok: boolean }>(ANA, "select public.follow_user('caio') as ok")).toEqual([{ ok: false }]);
    await expect(as(null, "select public.follow_user('beto')")).rejects.toThrow(/permission denied/);
  });

  it("liga dos amigos mostra você e quem você segue", async () => {
    const rows = await as<{ username: string; is_me: boolean }>(ANA, "select username, is_me from public.get_friends_leaderboard()");
    expect(rows.map((r) => r.username).sort()).toEqual(["ana_dev", "beto"]);
    expect(rows.find((r) => r.is_me)?.username).toBe("ana_dev");
  });

  it("o ranking devolve o usuário só de perfis públicos", async () => {
    await as(CAIO, "select public.award_xp($1::text[])", [[xpSources()[0]!.key]]);
    const rows = await as<{ username: string | null; display_name: string }>(null, "select username, display_name from public.get_leaderboard(50)");
    expect(rows.find((r) => r.display_name === "Caio")?.username).toBeNull();
    expect(rows.find((r) => r.display_name === "Ana Souza")?.username).toBe("ana_dev");
  });
});
